import { EntityComponentTypes, EquipmentSlot, system, world } from "@minecraft/server";
import { inventoryEntries, movable, selectSlot } from "./inventory";
import {
  ATTACK_TARGET_RANGE, blockPosition, cloneSlot, CLONE_COUNT, distanceSquared, matchesAttackTarget, offset
} from "./model";
import { clearTarget } from "./targets";
import { safeFeet, safeNearby } from "./terrain";
import {
  pursueTarget, reach, setSneaking, setSprinting, setStatus, stopPlayerMovement, SPRINT_JUMP_COOLDOWN
} from "./movement";
import { durabilityScore, enchantmentLevel } from "./equipment";

const COMBAT_STRAFE_SPEED = 0.55;
const COMBAT_STRAFE_TICKS = 3;
const COMBAT_STRAFE_COOLDOWN = 8;
const CRITICAL_JUMP_COOLDOWN = 32;
const JUMP_RESET_COOLDOWN = 12;
const MACE_SMASH_FALL_DISTANCE = 1.5;
const COMBAT_ANGLES = [[2, 0], [1, 1], [0, 2], [-1, 1], [-2, 0], [-1, -1], [0, -2], [1, -1]];
const MELEE_WEAPON_SCORE = new Map([
  ["minecraft:wooden_sword", 10], ["minecraft:golden_sword", 10], ["minecraft:stone_sword", 20],
  ["minecraft:iron_sword", 30], ["minecraft:diamond_sword", 40], ["minecraft:netherite_sword", 50],
  ["minecraft:wooden_axe", 9], ["minecraft:golden_axe", 9], ["minecraft:stone_axe", 19],
  ["minecraft:iron_axe", 29], ["minecraft:diamond_axe", 39], ["minecraft:netherite_axe", 49],
  ["minecraft:mace", 18]
]);

function weaponScore(item) {
  const base = MELEE_WEAPON_SCORE.get(item.typeId);
  if (base === undefined) return -Infinity;
  return base + enchantmentLevel(item, "minecraft:sharpness") * 4 +
    enchantmentLevel(item, "minecraft:fire_aspect") * 1.5 +
    enchantmentLevel(item, "minecraft:knockback") * 0.5 + durabilityScore(item);
}

function selectCombatWeapon(player, inventory, preferMace = false) {
  const weapons = inventoryEntries(inventory)
    .filter(({ item }) => movable(item) && MELEE_WEAPON_SCORE.has(item.typeId))
    .map(entry => ({ ...entry, score: weaponScore(entry.item) }));
  const weapon = (preferMace ? weapons.find(({ item }) => item.typeId === "minecraft:mace") : undefined) ??
    weapons.sort((a, b) => b.score - a.score)[0];
  if (weapon) selectSlot(player, inventory, weapon.slot);
}

function trackFallDistance(player, brain) {
  if (player.isOnGround || player.isInWater) {
    brain.macePeakY = undefined;
    return 0;
  }
  const y = player.location.y;
  brain.macePeakY = brain.macePeakY === undefined ? y : Math.max(brain.macePeakY, y);
  return Math.max(0, brain.macePeakY - y);
}

function approachCombatAngle(player, brain, target) {
  const now = system.currentTick;
  if (brain.combatAngleTargetId !== target.id) {
    brain.combatAngleTargetId = target.id;
    brain.combatAngleIndex = ((cloneSlot(player.name) ?? 1) - 1) % COMBAT_ANGLES.length;
    brain.nextCombatAngleAt = now + 35;
  } else if (now >= brain.nextCombatAngleAt) {
    brain.combatAngleIndex = (brain.combatAngleIndex + 1) % COMBAT_ANGLES.length;
    brain.nextCombatAngleAt = now + 35;
  }
  for (let step = 0; step < COMBAT_ANGLES.length; step++) {
    const index = (brain.combatAngleIndex + step) % COMBAT_ANGLES.length;
    const [x, z] = COMBAT_ANGLES[index];
    const preferred = offset(target.location, x, 0, z);
    if (!safeFeet(player.dimension, blockPosition(preferred))) continue;
    brain.combatAngleIndex = index;
    return reach(player, brain, preferred, 0.75);
  }
  const nearby = safeNearby(player.dimension, target.location, candidate =>
    distanceSquared(candidate, target.location) < 1.75 ** 2, 3);
  if (nearby) return reach(player, brain, nearby, 0.75);
  return pursueTarget(player, brain, target);
}

export function defend(player, brain, inventory, protect) {
  const hostiles = player.dimension.getEntities({
    families: ["monster"], excludeTypes: ["minecraft:player"], location: player.location, maxDistance: protect ? 10 : 5, closest: 8
  });
  const target = hostiles.find(entity => !protect || distanceSquared(entity.location, protect.location) <= 75 ||
    distanceSquared(entity.location, player.location) <= 16);
  if (!target) return false;
  if (!protect && distanceSquared(player.location, target.location) > 3 ** 2) return false;
  const health = player.getComponent(EntityComponentTypes.Health);
  if (target.typeId === "minecraft:creeper" || (health && health.currentValue < health.effectiveMax * 0.35)) {
    const feet = blockPosition(player.location);
    const away = offset(feet, Math.sign(feet.x - target.location.x) * 5, 0, Math.sign(feet.z - target.location.z) * 5);
    const safe = safeNearby(player.dimension, away, position => distanceSquared(position, target.location) < 25);
    if (safe) {
      setStatus(brain, "Taking cover");
      player.stopBreakingBlock();
      clearTarget(brain);
      reach(player, brain, safe);
      return true;
    }
  }
  setStatus(brain, "Defending");
  player.stopBreakingBlock();
  clearTarget(brain);
  if (distanceSquared(player.location, target.location) > 3 ** 2) {
    if (!protect) return false;
    pursueTarget(player, brain, target);
    return true;
  }
  if (!attackRayHitsTarget(player, target)) {
    approachCombatAngle(player, brain, target);
    return true;
  }
  selectCombatWeapon(player, inventory);
  player.lookAtEntity(target, "Instant");
  setSprinting(player, true);
  const attacked = attackSpecificTarget(player, target);
  setSprinting(player, false);
  if (attacked) combatStrafe(player, brain, target);
  return true;
}

function findAttackTarget(player, brain, order) {
  const targets = new Map();
  const targetIds = order.targetIds ?? (order.targetId ? [order.targetId] : []);
  for (const targetId of targetIds) {
    try {
      const target = world.getEntity(targetId);
      if (target?.dimension.id === player.dimension.id && matchesAttackTarget(target, order)) {
        targets.set(target.id, target);
      }
    } catch {}
  }
  for (const target of player.dimension.getEntities({ location: player.location, maxDistance: ATTACK_TARGET_RANGE })) {
    if (matchesAttackTarget(target, order)) targets.set(target.id, target);
  }

  const nearby = [...targets.values()].sort((a, b) =>
    distanceSquared(a.location, player.location) - distanceSquared(b.location, player.location));
  const blocked = brain.attackBlockedUntil ??= new Map();
  for (const [id, until] of blocked) if (until <= system.currentTick) blocked.delete(id);
  const available = nearby.filter(target => !blocked.has(target.id));
  const candidates = available.length ? available : nearby;
  return candidates.find(target => target.id === brain.attackTargetId) ?? candidates[0];
}

function attackRayHitsTarget(player, target) {
  try {
    const origin = player.getHeadLocation();
    const bounds = target.getAABB();
    const center = bounds.center;
    const verticalOffset = (bounds.extent?.y ?? 0.45) * 0.5;
    const aims = [
      center,
      { x: center.x, y: center.y + verticalOffset, z: center.z },
      { x: center.x, y: center.y - verticalOffset, z: center.z }
    ];
    for (const aim of aims) {
      const direction = { x: aim.x - origin.x, y: aim.y - origin.y, z: aim.z - origin.z };
      const length = Math.hypot(direction.x, direction.y, direction.z);
      if (length < 0.01 || length > 3.5) continue;
      direction.x /= length;
      direction.y /= length;
      direction.z /= length;
      const blockHit = player.dimension.getBlockFromRay(origin, direction, {
        maxDistance: length, includeLiquidBlocks: false, includePassableBlocks: false
      });
      if (blockHit) continue;
      const hits = player.dimension.getEntitiesFromRay(origin, direction, { maxDistance: length + 0.05 })
        .filter(hit => hit.entity.id !== player.id && hit.entity.isValid)
        .sort((a, b) => a.distance - b.distance);
      if (hits[0]?.entity.id === target.id) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function attackSpecificTarget(player, target) {
  if (typeof player.attackEntity === "function") {
    try {
      return player.attackEntity(target);
    } catch {}
  }
  try {
    return player.getEntitiesFromViewDirection({ maxDistance: 3.5 }).some(hit => hit.entity.id === target.id) && player.attack();
  } catch {
    return false;
  }
}

function combatStrafe(player, brain, target) {
  if (target.typeId !== "minecraft:player" || brain.nextCombatStrafeAt > system.currentTick) return;
  if (brain.combatMovementMode) return;
  const direction = brain.combatStrafeDirection ?? 1;
  const yaw = player.getRotation().y * Math.PI / 180;
  const side = { x: Math.cos(yaw) * direction, z: Math.sin(yaw) * direction };
  const forward = { x: -Math.sin(yaw), z: Math.cos(yaw) };
  const mode = brain.nextCombatResetMode ?? "w";
  const forwardInput = mode === "w" ? 1 : -1;
  const destination = offset(player.location,
    side.x * 0.7 + forward.x * forwardInput * 0.7, 0,
    side.z * 0.7 + forward.z * forwardInput * 0.7);
  if (!safeFeet(player.dimension, blockPosition(destination))) return;
  try {
    setSprinting(player, false);
    player.stopMoving();
    brain.combatStrafeDirection = -direction;
    brain.nextCombatStrafeAt = system.currentTick + COMBAT_STRAFE_COOLDOWN;
    brain.nextCombatResetMode = mode === "w" ? "s" : "w";
    const token = brain.combatMovementToken = (brain.combatMovementToken ?? 0) + 1;
    brain.combatMovementMode = mode;
    brain.combatMovementTargetId = target.id;
    const finish = () => {
      if (!player.isValid || brain.combatMovementToken !== token || brain.attackTargetId !== target.id) return;
      try {
        player.stopMoving();
      } catch {
      }
      setSprinting(player, false);
      brain.combatMovementMode = undefined;
      brain.combatMovementTargetId = undefined;
    };
    const move = () => {
      if (!player.isValid || brain.combatMovementToken !== token || brain.attackTargetId !== target.id) return;
      try {
        setSprinting(player, mode === "w");
        player.moveRelative(direction, forwardInput, COMBAT_STRAFE_SPEED);
        system.runTimeout(finish, COMBAT_STRAFE_TICKS);
      } catch {
        brain.combatMovementMode = undefined;
        brain.combatMovementTargetId = undefined;
        setSprinting(player, false);
      }
    };
    if (mode === "w") system.runTimeout(move, 1);
    else move();
  } catch {
    brain.combatMovementMode = undefined;
    brain.combatMovementTargetId = undefined;
  }
}

export function tryJumpReset(player, brain) {
  if (!player?.isValid || !player.isOnGround || player.isInWater ||
    brain.nextJumpResetAt > system.currentTick) return false;
  let offhand;
  try {
    offhand = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Offhand);
  } catch {
    return false;
  }
  if (offhand?.typeId === "minecraft:shield") return false;
  try {
    if (!player.jump()) return false;
  } catch {
    return false;
  }
  brain.nextJumpResetAt = system.currentTick + JUMP_RESET_COOLDOWN;
  brain.nextCriticalJumpAt = Math.max(brain.nextCriticalJumpAt ?? 0, system.currentTick + CRITICAL_JUMP_COOLDOWN);
  brain.nextSprintJumpAt = system.currentTick + SPRINT_JUMP_COOLDOWN;
  return true;
}

function blockWithShield(player, brain, target) {
  if (target.typeId !== "minecraft:player") {
    brain.shieldBlockUntil = undefined;
    setSneaking(player, false);
    return false;
  }
  const offhand = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Offhand);
  if (offhand?.typeId !== "minecraft:shield") {
    brain.shieldBlockUntil = undefined;
    setSneaking(player, false);
    return false;
  }
  const health = player.getComponent(EntityComponentTypes.Health);
  if (health && brain.lastCombatHealth !== undefined && health.currentValue < brain.lastCombatHealth) {
    brain.shieldBlockUntil = system.currentTick + 8;
    brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
    brain.critJumpPending = undefined;
  }
  brain.lastCombatHealth = health?.currentValue;
  if (brain.shieldBlockUntil > system.currentTick) {
    player.lookAtEntity(target, "Instant");
    setSprinting(player, false);
    return setSneaking(player, true);
  }
  brain.shieldBlockUntil = undefined;
  setSneaking(player, false);
  return false;
}

function tryCriticalJump(player, brain, target, order) {
  if (target.typeId !== "minecraft:player" || !player.isOnGround || player.isInWater ||
    brain.nextCriticalJumpAt > system.currentTick || brain.critJumpPending) return false;
  setSprinting(player, false);
  try {
    if (!player.jump()) return false;
  } catch {
    return false;
  }

  const token = brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
  const expiresAt = system.currentTick + 14;
  brain.nextCriticalJumpAt = system.currentTick + CRITICAL_JUMP_COOLDOWN;
  brain.critJumpPending = { targetId: target.id, token };
  const attempt = () => {
    if (!player.isValid || !target.isValid || target.dimension.id !== player.dimension.id ||
      !matchesAttackTarget(target, order) || brain.combatActionToken !== token ||
      brain.attackTargetId !== target.id || system.currentTick > expiresAt) {
      if (brain.critJumpPending?.token === token) brain.critJumpPending = undefined;
      return;
    }
    let verticalSpeed = 0;
    try {
      verticalSpeed = player.getVelocity().y;
    } catch {
      brain.critJumpPending = undefined;
      return;
    }
    if (!player.isOnGround && verticalSpeed < -0.03) {
      if (distanceSquared(player.location, target.location) <= 3 ** 2 && attackRayHitsTarget(player, target)) {
        player.lookAtEntity(target, "Instant");
        if (attackSpecificTarget(player, target)) combatStrafe(player, brain, target);
      }
      brain.critJumpPending = undefined;
      return;
    }
    system.runTimeout(attempt, 1);
  };
  system.runTimeout(attempt, 1);
  return true;
}

export function attackNamedTarget(player, brain, inventory, order) {
  const fallDistance = trackFallDistance(player, brain);
  const target = findAttackTarget(player, brain, order);
  if (!target) {
    stopPlayerMovement(player);
    player.stopBreakingBlock();
    brain.route = undefined;
    brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
    brain.critJumpPending = undefined;
    brain.shieldBlockUntil = undefined;
    setSneaking(player, false);
    brain.attackTargetId = undefined;
    brain.attackBlockedUntil = undefined;
    setStatus(brain, `Looking for ${order.targetName}`);
    return {};
  }

  player.stopBreakingBlock();
  if (brain.attackTargetId !== target.id) {
    brain.combatMovementToken = (brain.combatMovementToken ?? 0) + 1;
    brain.combatMovementMode = undefined;
    brain.combatMovementTargetId = undefined;
    if (brain.critJumpPending) {
      brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
      brain.critJumpPending = undefined;
    }
    brain.attackTargetId = target.id;
    brain.route = undefined;
    brain.lastCombatHealth = undefined;
    brain.shieldBlockUntil = undefined;
  }
  if (blockWithShield(player, brain, target)) {
    setStatus(brain, `Blocking ${order.targetName}`);
    return {};
  }
  if (brain.critJumpPending?.targetId === target.id) {
    setStatus(brain, `Timing a critical hit on ${order.targetName}`);
    return {};
  }
  if (brain.combatMovementMode && brain.combatMovementTargetId === target.id) return {};
  const inAttackRange = distanceSquared(player.location, target.location) <= 3 ** 2;
  if (inAttackRange) player.lookAtEntity(target, "Instant");
  const visible = inAttackRange && attackRayHitsTarget(player, target);
  if (!inAttackRange || !visible) {
    if (brain.attackBlockedUntil?.get(target.id) > system.currentTick) {
      stopPlayerMovement(player);
      setStatus(brain, `Finding a path to ${order.targetName}`);
      return {};
    }
    setStatus(brain, inAttackRange ? `Closing in on ${order.targetName}` : `Approaching ${order.targetName}`);
    const movement = inAttackRange
      ? approachCombatAngle(player, brain, target)
      : pursueTarget(player, brain, target);
    if (movement === "blocked") {
      brain.attackBlockedUntil ??= new Map();
      brain.attackBlockedUntil.set(target.id, system.currentTick + 40);
    } else {
      brain.attackBlockedUntil?.delete(target.id);
    }
    return {};
  }

  brain.attackBlockedUntil?.delete(target.id);
  setStatus(brain, `Attacking ${order.targetName}`);
  let verticalSpeed = 0;
  try {
    verticalSpeed = player.getVelocity().y;
  } catch {
  }
  const maceSmashReady = fallDistance >= MACE_SMASH_FALL_DISTANCE && verticalSpeed < -0.03;
  selectCombatWeapon(player, inventory, maceSmashReady);
  player.lookAtEntity(target, "Instant");
  if (tryCriticalJump(player, brain, target, order)) return {};
  setSprinting(player, true);
  const attacked = attackSpecificTarget(player, target);
  setSprinting(player, false);
  if (attacked) combatStrafe(player, brain, target);
  return {};
}
