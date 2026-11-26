import { system } from "@minecraft/server";
import { blockPosition, CLONE_COUNT, CLONE_TAG, cloneSlot, distanceSquared, offset, positionKey } from "./model";
import { blockAt, entityCrowding, safeFeet, safeNearby } from "./terrain";

const SPACE_STEP_DISTANCE = 0.8;
const SPACE_STEP_TICKS = 6;
const SPACE_STEP_CLEARANCE = 0.85;
const SPACE_STEP_MIN_GAIN = 0.08;
const SPRINT_DISTANCE = 6;
const NAVIGATION_LEG_DISTANCE = 16;
const NAVIGATION_REISSUE_TICKS = 40;
const ROUTE_STUCK_TICKS = 100;
const STEP_HOP_COOLDOWN = 6;
const SPRINT_HOP_INTERVAL = 24;
export const SPRINT_JUMP_COOLDOWN = 16;

export function newBrain() {
  return {
    rejected: new Set(),
    status: "Waiting",
    nextSprintHopAt: system.currentTick + SPRINT_HOP_INTERVAL,
    lastSprintStepHopAt: -100
  };
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
  brain.bowActionToken = (brain.bowActionToken ?? 0) + 1;
  brain.bowTargetId = undefined;
  brain.bowReleaseAt = undefined;
  brain.nextBowShotAt = undefined;
  brain.combatRetreatTarget = undefined;
  brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
  brain.critJumpPending = undefined;
  brain.macePeakY = undefined;
  brain.shieldBlockUntil = undefined;
  brain.route = undefined;
  brain.aimTargetId = undefined;
  brain.aimReadyAt = undefined;
  brain.eatingUntil = undefined;
  if (brain.target) brain.target.breakingSince = undefined;
}

export function setStatus(brain, text) {
  brain.status = text;
}

function sprintJump(player, brain, destination) {
  const now = system.currentTick;
  if (!player.isOnGround || player.isInWater || !player.isSprinting || brain.nextSprintJumpAt > now) return;
  const dx = destination.x - player.location.x;
  const dz = destination.z - player.location.z;
  const length = Math.hypot(dx, dz);
  if (length < 0.2) return;
  const forwardX = dx / length;
  const forwardZ = dz / length;
  const near = blockPosition({
    x: player.location.x + forwardX * 0.9,
    y: player.location.y,
    z: player.location.z + forwardZ * 0.9
  });
  if (!safeFeet(player.dimension, blockPosition(player.location))) return;
  const nearFeet = blockAt(player.dimension, near);
  const nearHead = blockAt(player.dimension, offset(near, 0, 1, 0));
  const nearTop = blockAt(player.dimension, offset(near, 0, 2, 0));
  const clearLane = safeFeet(player.dimension, near);
  const stepUp = nearFeet && !nearFeet.isAir && !nearFeet.isLiquid && nearHead?.isAir && nearTop?.isAir;
  if (brain.nextSprintHopAt === undefined) brain.nextSprintHopAt = now + SPRINT_HOP_INTERVAL;
  try {
    if (player.getVelocity().y > 0.08) return;
  } catch {
  }
  if (stepUp) {
    if (now - (brain.lastSprintStepHopAt ?? -100) < STEP_HOP_COOLDOWN) return;
    brain.lastSprintStepHopAt = now;
    brain.nextSprintHopAt = now + SPRINT_HOP_INTERVAL;
    try {
      player.jump();
    } catch {
    }
    return;
  }
  if (!clearLane || now < brain.nextSprintHopAt) return;
  brain.nextSprintHopAt = now + SPRINT_HOP_INTERVAL;
  try {
    player.jump();
  } catch {
  }
}

function routeFor(player, brain, key) {
  const now = system.currentTick;
  if (brain.route?.key !== key) {
    brain.route = {
      key,
      progress: now,
      issued: -Infinity,
      lastPosition: { ...player.location },
      waypoint: undefined
    };
  }
  const route = brain.route;
  if (distanceSquared(player.location, route.lastPosition) >= 0.12 ** 2) {
    route.lastPosition = { ...player.location };
    route.progress = now;
  }
  if (now - route.progress >= ROUTE_STUCK_TICKS) {
    brain.route = undefined;
    setSprinting(player, false);
    return undefined;
  }
  return route;
}

function navigationLeg(player, destination, maxDistance = NAVIGATION_LEG_DISTANCE) {
  const start = player.location;
  const dx = destination.x - start.x;
  const dy = destination.y - start.y;
  const dz = destination.z - start.z;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (length <= maxDistance) return destination;
  const scale = maxDistance / length;
  const estimate = {
    x: start.x + dx * scale,
    y: start.y + dy * scale,
    z: start.z + dz * scale
  };
  return safeNearby(player.dimension, estimate, undefined, 2) ?? estimate;
}

function navigationOutcome(result) {
  try {
    if (result?.isFullPath !== false) return { started: true };
    const path = result.getPath?.() ?? [];
    return path.length ? { started: true, partial: path[path.length - 1] } : { started: false, noPath: true };
  } catch {
    return { started: false, noPath: true };
  }
}

function startLocationNavigation(player, destination) {
  try {
    return navigationOutcome(player.navigateToLocation(destination, 1));
  } catch (error) {
    try {
      player.moveToLocation(destination);
      return { started: true, fallback: true };
    } catch {
      return { started: false, error };
    }
  }
}

export function reach(player, brain, position, radius = 0.9) {
  const distance = distanceSquared(player.location, position);
  if (distance <= radius ** 2) {
    brain.route = undefined;
    stopPlayerMovement(player);
    return "arrived";
  }
  const sprinting = distance > SPRINT_DISTANCE ** 2;
  setSprinting(player, sprinting);
  const key = positionKey(blockPosition(position));
  const now = system.currentTick;
  const route = routeFor(player, brain, `location:${key}`);
  if (!route) return "blocked";
  if (!route.waypoint || distanceSquared(player.location, route.waypoint) <= 2.5 ** 2) {
    route.waypoint = navigationLeg(player, position);
    route.issued = -Infinity;
  }
  if (player.isInWater && typeof player.swim === "function") {
    if (now - route.issued < NAVIGATION_REISSUE_TICKS) return "moving";
    try {
      setSprinting(player, false);
      player.swim();
      player.moveToLocation(route.waypoint);
      route.issued = now;
      return "moving";
    } catch {
      brain.route = undefined;
      return "blocked";
    }
  }
  if (!player.isOnGround) return "moving";
  if (now - route.issued >= NAVIGATION_REISSUE_TICKS) {
    let result = startLocationNavigation(player, route.waypoint);
    if (!result.started && result.noPath) {
      const shorter = navigationLeg(player, route.waypoint, 6);
      if (distanceSquared(shorter, route.waypoint) > 0.5 ** 2) {
        route.waypoint = shorter;
        result = startLocationNavigation(player, route.waypoint);
      }
      if (!result.started) {
        try {
          player.moveToLocation(route.waypoint);
          result = { started: true, fallback: true };
        } catch {
        }
      }
    }
    if (result.partial) route.waypoint = result.partial;
    if (!result.started) {
      brain.route = undefined;
      setSprinting(player, false);
      return "blocked";
    }
    route.issued = now;
  }
  if (sprinting) sprintJump(player, brain, route.waypoint);
  return "moving";
}

export function followEntity(player, brain, target, radius = 2, sprintDistance = SPRINT_DISTANCE) {
  if (!target?.isValid || target.dimension.id !== player.dimension.id) return "blocked";
  const distance = distanceSquared(player.location, target.location);
  if (distance <= radius ** 2) {
    brain.route = undefined;
    stopPlayerMovement(player);
    return "arrived";
  }

  const route = routeFor(player, brain, `entity:${target.id}`);
  if (!route) return "blocked";
  const sprinting = distance > sprintDistance ** 2;
  setSprinting(player, sprinting);
  const now = system.currentTick;
  if (player.isInWater && typeof player.swim === "function") {
    if (now - route.issued < NAVIGATION_REISSUE_TICKS) return "moving";
    try {
      setSprinting(player, false);
      player.swim();
      player.moveToLocation(navigationLeg(player, target.location));
      route.issued = now;
      return "moving";
    } catch {
      brain.route = undefined;
      return "blocked";
    }
  }
  if (!player.isOnGround) return "moving";
  if (now - route.issued >= NAVIGATION_REISSUE_TICKS) {
    let result;
    try {
      result = player.navigateToEntity(target, 1);
    } catch {
      result = undefined;
    }
    if (!result || result.isFullPath === false) {
      const fallback = positionBeside(player, target.location, 3);
      route.waypoint = navigationLeg(player, fallback);
      result = startLocationNavigation(player, route.waypoint);
      if (!result.started && result.noPath) {
        route.waypoint = navigationLeg(player, route.waypoint, 6);
        result = startLocationNavigation(player, route.waypoint);
      }
      if (!result.started) {
        try {
          player.moveToLocation(route.waypoint);
          result = { started: true, fallback: true };
        } catch {
        }
      }
      if (result.partial) route.waypoint = result.partial;
      if (!result.started) {
        brain.route = undefined;
        setSprinting(player, false);
        return "blocked";
      }
    }
    route.issued = now;
  }
  if (sprinting) sprintJump(player, brain, target.location);
  return "moving";
}

export function pursueTarget(player, brain, target) {
  return followEntity(player, brain, target, 1.5, 3.5);
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
