import { system } from "@minecraft/server";
import { blockPosition, CLONE_COUNT, CLONE_TAG, cloneSlot, distanceSquared, offset, positionKey } from "./model";
import { blockAt, entityCrowding, safeFeet, safeNearby } from "./terrain";

const SPACE_STEP_DISTANCE = 0.8;
const SPACE_STEP_TICKS = 6;
const SPACE_STEP_CLEARANCE = 0.85;
const SPACE_STEP_MIN_GAIN = 0.08;
const SPRINT_DISTANCE = 6;
const SPRINT_JUMP_DISTANCE = 8;
export const SPRINT_JUMP_COOLDOWN = 16;

export function newBrain() {
  return { rejected: new Set(), status: "Waiting" };
}

export function setSprinting(player, sprinting) {
  try {
    player.isSprinting = sprinting;
    return player.isSprinting === sprinting;
  } catch {
    return false;
  }
}

export function setSneaking(player, sneaking) {
  try {
    player.isSneaking = sneaking;
    return player.isSneaking === sneaking;
  } catch {
    return false;
  }
}

export function stopPlayerMovement(player) {
  player.stopMoving();
  setSprinting(player, false);
}

export function stopActions(player, brain) {
  if (player?.isValid) {
    stopPlayerMovement(player);
    setSneaking(player, false);
    player.stopBreakingBlock();
    player.stopBuild();
    player.stopUsingItem();
  }
  brain.combatMovementToken = (brain.combatMovementToken ?? 0) + 1;
  brain.combatMovementMode = undefined;
  brain.combatMovementTargetId = undefined;
  brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
  brain.critJumpPending = undefined;
  brain.macePeakY = undefined;
  brain.shieldBlockUntil = undefined;
  brain.route = undefined;
  brain.eatingUntil = undefined;
  if (brain.target) brain.target.breakingSince = undefined;
}

export function setStatus(brain, text) {
  brain.status = text;
}

function sprintJump(player, brain, destination) {
  if (!player.isOnGround || !player.isSprinting || brain.nextSprintJumpAt > system.currentTick) return;
  const dx = destination.x - player.location.x;
  const dz = destination.z - player.location.z;
  const horizontalDistanceSquared = dx * dx + dz * dz;
  if (horizontalDistanceSquared < 3.5 ** 2 || Math.abs(destination.y - player.location.y) > 0.75) return;

  const length = Math.hypot(dx, dz);
  const forwardX = dx / length;
  const forwardZ = dz / length;
  const near = blockPosition({
    x: player.location.x + forwardX * 0.8,
    y: player.location.y,
    z: player.location.z + forwardZ * 0.8
  });
  const landing = blockPosition({
    x: player.location.x + forwardX * 1.6,
    y: player.location.y,
    z: player.location.z + forwardZ * 1.6
  });
  if (!safeFeet(player.dimension, blockPosition(player.location)) || !safeFeet(player.dimension, landing)) return;
  const nearFeet = blockAt(player.dimension, near);
  const nearHead = blockAt(player.dimension, offset(near, 0, 1, 0));
  const nearTop = blockAt(player.dimension, offset(near, 0, 2, 0));
  const nearFloor = blockAt(player.dimension, offset(near, 0, -1, 0));
  const clearLane = safeFeet(player.dimension, near);
  const stepObstacle = nearFeet && !nearFeet.isAir && !nearFeet.isLiquid && nearHead?.isAir && nearTop?.isAir;
  const shortGap = nearFeet?.isAir && nearFloor?.isAir;
  const longSprintJump = horizontalDistanceSquared >= SPRINT_JUMP_DISTANCE ** 2 && clearLane;
  if (!longSprintJump && !stepObstacle && !shortGap) return;
  try {
    if (player.getVelocity().y > 0.08) return;
  } catch {
  }
  try {
    if (player.jump()) brain.nextSprintJumpAt = system.currentTick + SPRINT_JUMP_COOLDOWN;
  } catch {
    brain.nextSprintJumpAt = system.currentTick + SPRINT_JUMP_COOLDOWN;
  }
}

export function reach(player, brain, position, radius = 0.9) {
  const distance = distanceSquared(player.location, position);
  if (distance <= radius ** 2) {
    setSprinting(player, false);
    return "arrived";
  }
  const sprinting = distance > SPRINT_DISTANCE ** 2;
  setSprinting(player, sprinting);
  const key = positionKey(blockPosition(position));
  const now = system.currentTick;
  if (brain.route?.key !== key) {
    brain.route = { key, distance, progress: now, issued: -Infinity };
  }
  const route = brain.route;
  if (distance + 0.5 < route.distance) {
    route.distance = distance;
    route.progress = now;
  }
  if (now - route.progress >= 100) {
    brain.route = undefined;
    setSprinting(player, false);
    return "blocked";
  }
  if (now - route.issued >= 40) {
    route.issued = now;
    if (player.isInWater && typeof player.swim === "function") {
      setSprinting(player, false);
      player.swim();
      player.moveToLocation(position);
      return "moving";
    }
    if (!player.isOnGround) return "moving";
    const path = player.navigateToLocation(position, 1);
    if (path?.isFullPath === false && path.getPath?.().length === 0) {
      brain.route = undefined;
      setSprinting(player, false);
      return "blocked";
    }
  }
  if (sprinting) sprintJump(player, brain, position);
  return "moving";
}

export function pursueTarget(player, brain, target) {
  const distance = distanceSquared(player.location, target.location);
  if (distance <= 1.5 ** 2) {
    setSprinting(player, false);
    return "arrived";
  }
  const sprinting = distance > 3.5 ** 2;
  setSprinting(player, sprinting);
  const now = system.currentTick;
  if (brain.route?.targetId !== target.id) {
    brain.route = { targetId: target.id, distance, progress: now, issued: -Infinity };
  }
  const route = brain.route;
  if (distance + 0.5 < route.distance) {
    route.distance = distance;
    route.progress = now;
  }
  if (now - route.progress >= 100) {
    brain.route = undefined;
    setSprinting(player, false);
    return "blocked";
  }
  if (now - route.issued >= 20) {
    route.issued = now;
    try {
      if (player.isInWater && typeof player.swim === "function") {
        setSprinting(player, false);
        player.swim();
        player.moveToLocation(target.location);
      } else if (player.isOnGround) {
        const path = player.navigateToEntity(target, 1);
        if (path?.isFullPath === false && path.getPath?.().length === 0) {
          brain.route = undefined;
          setSprinting(player, false);
          return "blocked";
        }
      }
    } catch {
      try {
        if (player.isOnGround) {
          const fallback = player.navigateToLocation(target.location, 1);
          if (fallback?.isFullPath === false && fallback.getPath?.().length === 0) {
            brain.route = undefined;
            setSprinting(player, false);
            return "blocked";
          }
        }
      } catch {
        brain.route = undefined;
        setSprinting(player, false);
        return "blocked";
      }
    }
  }
  if (sprinting) sprintJump(player, brain, target.location);
  return "moving";
}

export function makeSpace(player, brain, owner) {
  if (!player.isOnGround) return false;
  const { dimension, location } = player;
  const crowded = entityCrowding(dimension, location, player, 8, entity =>
    entity.typeId !== "minecraft:player" || entity.id === owner?.id || entity.hasTag(CLONE_TAG)
  );
  if (!crowded(location)) {
    brain.spacingCooldownUntil = undefined;
    return false;
  }
  if (brain.spacingCooldownUntil > system.currentTick) return true;

  const threat = crowded.nearestEntity(location);
  if (!threat) return false;
  const yaw = player.getRotation().y * Math.PI / 180;
  const forward = { x: -Math.sin(yaw), z: Math.cos(yaw) };
  const right = { x: Math.cos(yaw), z: Math.sin(yaw) };
  let awayX = location.x - threat.location.x;
  let awayZ = location.z - threat.location.z;
  const awayLength = Math.hypot(awayX, awayZ);
  if (awayLength > 0.001) {
    awayX /= awayLength;
    awayZ /= awayLength;
  } else {
    awayX = -forward.x;
    awayZ = -forward.z;
  }

  const currentGap = crowded.separation(location);
  const directions = [
    { left: 0, forward: -1, preference: 0.12 },
    { left: -1, forward: 0, preference: 0.03 },
    { left: 1, forward: 0, preference: 0.03 },
    { left: -1, forward: -1, preference: 0.06 },
    { left: 1, forward: -1, preference: 0.06 },
    { left: 0, forward: 1, preference: -0.08 },
    { left: -1, forward: 1, preference: -0.04 },
    { left: 1, forward: 1, preference: -0.04 }
  ];
  const step = directions.map(({ left, forward: forwardInput, preference }) => {
    const inputLength = Math.hypot(left, forwardInput);
    const leftInput = left / inputLength;
    const forwardInputNormalized = forwardInput / inputLength;
    const x = right.x * leftInput + forward.x * forwardInputNormalized;
    const z = right.z * leftInput + forward.z * forwardInputNormalized;
    const destination = offset(location, x * SPACE_STEP_DISTANCE, 0, z * SPACE_STEP_DISTANCE);
    if (!safeFeet(dimension, blockPosition(destination))) return undefined;
    const gap = crowded.separation(destination);
    if (gap < currentGap + SPACE_STEP_MIN_GAIN) return undefined;
    const alignment = x * awayX + z * awayZ;
    const score = Math.min(gap, SPACE_STEP_CLEARANCE + 0.25) + alignment * 0.2 + preference;
    return { left: leftInput, forward: forwardInputNormalized, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score)[0];

  if (!step) {
    stopActions(player, brain);
    setStatus(brain, "Waiting for room");
    brain.spacingCooldownUntil = system.currentTick + SPACE_STEP_TICKS + 8;
    return true;
  }

  stopActions(player, brain);
  setStatus(brain, "Making room");
  player.moveRelative(step.left, step.forward, 0.6);
  brain.spacingCooldownUntil = system.currentTick + SPACE_STEP_TICKS + 6;
  system.runTimeout(() => {
    if (player.isValid) stopPlayerMovement(player);
  }, SPACE_STEP_TICKS);
  return true;
}

export function positionBeside(player, origin, radius) {
  const angle = ((cloneSlot(player.name) ?? 1) - 1) * (2 * Math.PI / CLONE_COUNT);
  return offset(origin, Math.round(radius * Math.cos(angle)), 0, Math.round(radius * Math.sin(angle)));
}
