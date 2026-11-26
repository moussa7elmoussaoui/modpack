import { EntityComponentTypes, EquipmentSlot, system, world } from "@minecraft/server";
import { inventoryEntries, movable, selectSlot } from "./inventory";
import {
  ATTACK_TARGET_RANGE, blockPosition, cloneSlot, CLONE_COUNT, distanceSquared, matchesAttackTarget, offset
} from "./model";
import { clearTarget } from "./targets";
import { recentlyDangerous, safeFeet, safeNearby } from "./terrain";
import {
  pursueTarget, reach, setSneaking, setSprinting, setStatus, stopPlayerMovement, SPRINT_JUMP_COOLDOWN
} from "./movement";
import { durabilityScore, enchantmentLevel } from "./equipment";
import { clonePersonality } from "./personality";

const COMBAT_STRAFE_SPEED = 0.55;
const COMBAT_STRAFE_TICKS = 3;
const COMBAT_STRAFE_COOLDOWN = 8;
const COMBO_HIT_WINDOW = 24;
const COMBO_HIT_COUNT = 3;
const COMBO_LAUNCH_IMPULSE = 0.2;
const COMBO_FOLLOW_SPEED = 0.68;
const COMBO_FOLLOW_TICKS = 2;
const COMBO_FOLLOW_COOLDOWN = 4;
const BOW_MAX_RANGE = 24;
const BOW_MIN_RANGE = 4.25;
const BOW_DRAW_TICKS = 20;
const BOW_RETRY_TICKS = 4;
const AIM_WAIT_LIMIT = 8;
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

function weaponScore(item, preferKnockback = false) {
  const base = MELEE_WEAPON_SCORE.get(item.typeId);
  if (base === undefined) return -Infinity;
  return base + enchantmentLevel(item, "minecraft:sharpness") * 4 +
    enchantmentLevel(item, "minecraft:fire_aspect") * 1.5 +
    enchantmentLevel(item, "minecraft:knockback") * (preferKnockback ? 6 : 0.5) + durabilityScore(item);
}

function selectCombatWeapon(player, inventory, preferMace = false, preferKnockback = false) {
  const weapons = inventoryEntries(inventory)
    .filter(({ item }) => movable(item) && MELEE_WEAPON_SCORE.has(item.typeId))
    .map(entry => ({ ...entry, score: weaponScore(entry.item, preferKnockback) }));
  const weapon = (preferMace ? weapons.find(({ item }) => item.typeId === "minecraft:mace") : undefined) ??
    weapons.sort((a, b) => b.score - a.score)[0];
  if (weapon) selectSlot(player, inventory, weapon.slot);
}

function wrapDegrees(angle) {
  let result = angle % 360;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function humanLookAt(player, brain, target) {
  if (!player?.isValid || !target?.isValid) return false;
  const now = system.currentTick;
  const personality = clonePersonality(cloneSlot(player.name) ?? 1);
  if (brain.aimTargetId !== target.id) {
    brain.aimTargetId = target.id;
    brain.aimReadyAt = now + personality.reactionTicks + Math.floor(Math.random() * 3);
  }
  if (now < brain.aimReadyAt) return false;

  try {
    const head = player.getHeadLocation();
    const aim = target.getAABB().center;
    const dx = aim.x - head.x;
    const dy = aim.y - head.y;
    const dz = aim.z - head.z;
    const horizontal = Math.hypot(dx, dz);
    const desiredYaw = -Math.atan2(dx, dz) * 180 / Math.PI;
    const desiredPitch = clamp(-Math.atan2(dy, horizontal) * 180 / Math.PI, -89, 89);
    const rotation = player.getRotation();
    const yawDelta = wrapDegrees(desiredYaw - rotation.y);
    const pitchDelta = desiredPitch - rotation.x;
    const turnFactor = 0.42;
    const maxTurn = personality.turnSpeed;
    player.setRotation({
      x: clamp(rotation.x + clamp(pitchDelta * turnFactor, -maxTurn * 0.7, maxTurn * 0.7), -89, 89),
      y: wrapDegrees(rotation.y + clamp(yawDelta * turnFactor, -maxTurn, maxTurn))
    });
    return Math.abs(yawDelta) <= personality.aimTolerance && Math.abs(pitchDelta) <= personality.aimTolerance;
  } catch {
    try {
      player.lookAtEntity(target);
      return true;
    } catch {
      return false;
    }
  }
}

function aimReadyForAttack(player, brain, target) {
  const aimed = humanLookAt(player, brain, target);
  return aimed || (brain.aimReadyAt !== undefined && system.currentTick >= brain.aimReadyAt + AIM_WAIT_LIMIT);
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

function retreatFromTarget(player, brain, target) {
  const health = player.getComponent(EntityComponentTypes.Health);
  const lowHealth = health && health.currentValue < health.effectiveMax * 0.3;
  const creeper = target.typeId === "minecraft:creeper";
  if ((!lowHealth && !creeper) || distanceSquared(player.location, target.location) > 8 ** 2) {
    brain.combatRetreatTarget = undefined;
    return false;
  }

  const minClearance = creeper ? 7 : 5;
  const stored = brain.combatRetreatTarget;
  let safe = stored?.targetId === target.id && stored.untilTick > system.currentTick &&
    distanceSquared(stored.position, target.location) >= minClearance ** 2 &&
    safeFeet(player.dimension, blockPosition(stored.position)) &&
    !recentlyDangerous(brain, player.dimension.id, stored.position) ? stored.position : undefined;
  if (!safe) {
    let dx = player.location.x - target.location.x;
    let dz = player.location.z - target.location.z;
    let length = Math.hypot(dx, dz);
    if (length < 0.01) {
      const yaw = player.getRotation().y * Math.PI / 180;
      dx = Math.sin(yaw);
      dz = -Math.cos(yaw);
      length = 1;
    }

    const away = offset(blockPosition(player.location), Math.round(dx / length * 6), 0,
      Math.round(dz / length * 6));
    safe = safeNearby(player.dimension, away, position =>
      distanceSquared(position, target.location) < minClearance ** 2 ||
        recentlyDangerous(brain, player.dimension.id, position), 4) ??
      safeNearby(player.dimension, away, position =>
        distanceSquared(position, target.location) < minClearance ** 2, 4);
  }
  if (!safe) return false;

  brain.combatRetreatTarget = { targetId: target.id, position: safe, untilTick: system.currentTick + 20 };
  brain.combatMovementToken = (brain.combatMovementToken ?? 0) + 1;
  brain.combatMovementMode = undefined;
  brain.combatMovementTargetId = undefined;
  if (brain.critJumpPending) {
    brain.combatActionToken = (brain.combatActionToken ?? 0) + 1;
    brain.critJumpPending = undefined;
  }
  clearCombo(brain);
  player.stopBreakingBlock();
  setStatus(brain, creeper ? "Backing away from creeper" : "Recovering before re-engaging");
  if (reach(player, brain, safe) === "blocked") return "blocked";
  return true;
}

export function defend(player, brain, inventory, protect) {
  const hostiles = player.dimension.getEntities({
    families: ["monster"], excludeTypes: ["minecraft:player"], location: player.location, maxDistance: protect ? 10 : 5, closest: 8
  });
  const candidates = hostiles.filter(entity => !protect || distanceSquared(entity.location, protect.location) <= 75 ||
    distanceSquared(entity.location, player.location) <= 16);
  const target = candidates.sort((a, b) => {
    const score = entity => distanceSquared(entity.location, player.location) -
      (entity.id === brain.lastThreatId && system.currentTick - brain.lastThreatAt < 100 ? 1000 : 0) -
      (entity.typeId === "minecraft:creeper" ? 250 : 0);
    return score(a) - score(b);
  })[0];
  if (!target) return false;
  const health = player.getComponent(EntityComponentTypes.Health);
  const nearbyThreats = candidates.filter(entity => distanceSquared(entity.location, player.location) <= 8 ** 2);
  const lowHealth = health && health.currentValue < health.effectiveMax * 0.35;
  const surrounded = nearbyThreats.length >= 3 && health && health.currentValue < health.effectiveMax * 0.7;
  const shouldRetreat = target.typeId === "minecraft:creeper" || lowHealth || surrounded;
  if (shouldRetreat) {
    const threats = nearbyThreats.length ? nearbyThreats : [target];
    const center = threats.reduce((sum, entity) => ({
      x: sum.x + entity.location.x / threats.length,
      y: sum.y + entity.location.y / threats.length,
      z: sum.z + entity.location.z / threats.length
    }), { x: 0, y: 0, z: 0 });
    let dx = player.location.x - center.x;
    let dz = player.location.z - center.z;
    let length = Math.hypot(dx, dz);
    if (length < 0.01) {
      dx = player.location.x - target.location.x;
      dz = player.location.z - target.location.z;
      length = Math.hypot(dx, dz) || 1;
    }
    const away = offset(blockPosition(player.location), Math.round(dx / length * 6), 0, Math.round(dz / length * 6));
    const keepClear = position => threats.some(entity => distanceSquared(position, entity.location) < 5 ** 2);
    const unsafeMemory = position => recentlyDangerous(brain, player.dimension.id, position);
    const safe = safeNearby(player.dimension, away, position => keepClear(position) || unsafeMemory(position), 4) ??
      safeNearby(player.dimension, away, keepClear, 4);
    if (safe) {
      setStatus(brain, surrounded ? "Escaping a group of enemies" : "Taking cover");
      player.stopBreakingBlock();
      clearTarget(brain);
      return reach(player, brain, safe) === "blocked" ? "blocked" : true;
    }
  }
  if (!protect && distanceSquared(player.location, target.location) > 3 ** 2) return false;
  setStatus(brain, "Defending");
  player.stopBreakingBlock();
  clearTarget(brain);
  if (distanceSquared(player.location, target.location) > 3 ** 2) {
    if (!protect) return false;
    return pursueTarget(player, brain, target) === "blocked" ? "blocked" : true;
  }
  if (!attackLineClear(player, target)) {
    approachCombatAngle(player, brain, target);
    return true;
  }
  selectCombatWeapon(player, inventory);
  if (!aimReadyForAttack(player, brain, target)) {
    setStatus(brain, `Facing ${target.nameTag || "enemy"}`);
    return true;
  }
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

function attackRayHitsTarget(player, target, maxDistance = 3.5) {
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
      if (length < 0.01 || length > maxDistance) continue;
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

function attackLineClear(player, target, maxDistance = 3.5) {
  try {
    const origin = player.getHeadLocation();
    const bounds = target.getAABB();
    const center = bounds.center;
    const verticalOffset = (bounds.extent?.y ?? 0.45) * 0.5;
    for (const aim of [
      center,
      { x: center.x, y: center.y + verticalOffset, z: center.z },
      { x: center.x, y: center.y - verticalOffset, z: center.z }
    ]) {
      const dx = aim.x - origin.x;
      const dy = aim.y - origin.y;
      const dz = aim.z - origin.z;
      const length = Math.hypot(dx, dy, dz);
      if (length < 0.01 || length > maxDistance) continue;
      const blockHit = player.dimension.getBlockFromRay(origin, {
        x: dx / length, y: dy / length, z: dz / length
      }, { maxDistance: length, includeLiquidBlocks: false, includePassableBlocks: false });
      if (!blockHit) return true;
    }
  } catch {
  }
  return false;
}

function combatBow(player, brain, inventory, target, order) {
  if (brain.bowTargetId !== undefined) {
    humanLookAt(player, brain, target);
    setStatus(brain, brain.bowReleaseAt > system.currentTick
      ? `Drawing bow on ${order.targetName}`
      : `Releasing bow at ${order.targetName}`);
    return true;
  }
  const distance = Math.sqrt(distanceSquared(player.location, target.location));
  if (distance > BOW_MAX_RANGE || (distance < BOW_MIN_RANGE &&
    Math.abs(target.location.y - player.location.y) < 2.5)) return false;

  const entries = inventoryEntries(inventory).filter(({ item }) => movable(item));
  const bow = entries.find(({ item }) => item.typeId === "minecraft:bow");
  const hasArrow = entries.some(({ item }) => item.typeId.endsWith("arrow"));
  if (!bow || !hasArrow) return false;

  if (brain.nextBowShotAt > system.currentTick) {
    setStatus(brain, `Readying bow for ${order.targetName}`);
    return true;
  }
  if (!attackRayHitsTarget(player, target, BOW_MAX_RANGE)) return false;
  if (!aimReadyForAttack(player, brain, target)) {
    setStatus(brain, `Taking aim at ${order.targetName}`);
    return true;
  }

  const selected = selectSlot(player, inventory, bow.slot);
  if (selected === undefined) return false;
  setSprinting(player, false);
  stopPlayerMovement(player);
  try {
    if (!player.useItemInSlot(selected)) {
      brain.nextBowShotAt = system.currentTick + BOW_RETRY_TICKS;
      setStatus(brain, `Readying bow for ${order.targetName}`);
      return true;
    }
  } catch {
    return false;
  }

  const token = brain.bowActionToken = (brain.bowActionToken ?? 0) + 1;
  brain.bowTargetId = target.id;
  brain.bowReleaseAt = system.currentTick + BOW_DRAW_TICKS;
  setStatus(brain, `Drawing bow on ${order.targetName}`);
  system.runTimeout(() => {
    if (!player.isValid || brain.bowActionToken !== token) return;
    if (brain.eatingUntil > system.currentTick) {
      brain.bowTargetId = undefined;
      brain.bowReleaseAt = undefined;
      return;
    }
    try {
      player.stopUsingItem();
    } catch {
    }
    brain.bowTargetId = undefined;
    brain.bowReleaseAt = undefined;
    brain.nextBowShotAt = system.currentTick + BOW_RETRY_TICKS;
  }, BOW_DRAW_TICKS);
  return true;
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

function clearCombo(brain) {
  brain.comboTargetId = undefined;
  brain.comboHitCount = 0;
  brain.lastComboHitAt = undefined;
}

function comboHitsFor(brain, target) {
  if (target.typeId !== "minecraft:player" || brain.comboTargetId !== target.id ||
    system.currentTick - (brain.lastComboHitAt ?? -Infinity) > COMBO_HIT_WINDOW) {
    clearCombo(brain);
    return 0;
  }
  return brain.comboHitCount ?? 0;
}

function recordComboHit(brain, target) {
  let hitCount = comboHitsFor(brain, target);
  if (hitCount >= COMBO_HIT_COUNT) hitCount = 0;
  brain.comboTargetId = target.id;
  brain.comboHitCount = hitCount + 1;
  brain.lastComboHitAt = system.currentTick;
  if (brain.comboHitCount === 2 && target.typeId === "minecraft:player" && !target.isInWater) {
    try {
      if (target.getVelocity().y <= 0.08) target.applyImpulse({ x: 0, y: COMBO_LAUNCH_IMPULSE, z: 0 });
    } catch {
    }
  }
  return brain.comboHitCount;
}

function combatStrafe(player, brain, target, comboHitCount = 0) {
  if (target.typeId !== "minecraft:player" || brain.nextCombatStrafeAt > system.currentTick) return;
  if (brain.combatMovementMode) return;
  const comboFollowUp = comboHitCount > 0 && comboHitCount < COMBO_HIT_COUNT;
  const direction = brain.combatStrafeDirection ?? 1;
  const yaw = player.getRotation().y * Math.PI / 180;
  const side = { x: Math.cos(yaw) * direction, z: Math.sin(yaw) * direction };
  const forward = { x: -Math.sin(yaw), z: Math.cos(yaw) };
  const mode = comboFollowUp ? "w" : brain.nextCombatResetMode ?? "w";
  const forwardInput = mode === "w" ? 1 : -1;
  const movementTicks = comboFollowUp ? COMBO_FOLLOW_TICKS : COMBAT_STRAFE_TICKS;
  const movementSpeed = comboFollowUp ? COMBO_FOLLOW_SPEED : COMBAT_STRAFE_SPEED;
  const destination = offset(player.location,
    side.x * 0.7 + forward.x * forwardInput * 0.7, 0,
    side.z * 0.7 + forward.z * forwardInput * 0.7);
  if (!safeFeet(player.dimension, blockPosition(destination))) return;
  try {
    setSprinting(player, false);
    player.stopMoving();
    brain.combatStrafeDirection = -direction;
    brain.nextCombatStrafeAt = system.currentTick +
      (comboFollowUp ? COMBO_FOLLOW_COOLDOWN : COMBAT_STRAFE_COOLDOWN);
    if (!comboFollowUp) brain.nextCombatResetMode = mode === "w" ? "s" : "w";
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
        player.moveRelative(direction, forwardInput, movementSpeed);
        system.runTimeout(finish, movementTicks);
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
    humanLookAt(player, brain, target);
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
      const aimed = aimReadyForAttack(player, brain, target);
      if (distanceSquared(player.location, target.location) <= 3 ** 2 && aimed && attackLineClear(player, target)) {
        if (attackSpecificTarget(player, target)) {
          const hits = recordComboHit(brain, target);
          if (hits > 1) setStatus(brain, `Combo ${hits}/${COMBO_HIT_COUNT} on ${order.targetName}`);
          combatStrafe(player, brain, target, hits);
        }
      }
      if (system.currentTick < expiresAt) {
        system.runTimeout(attempt, 1);
        return;
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
    clearCombo(brain);
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
    clearCombo(brain);
    brain.route = undefined;
    brain.lastCombatHealth = undefined;
    brain.shieldBlockUntil = undefined;
  }
  if (blockWithShield(player, brain, target)) {
    setStatus(brain, `Blocking ${order.targetName}`);
    return {};
  }
  const retreat = retreatFromTarget(player, brain, target);
  if (retreat === "blocked") return { problem: "Can't find a safe route away from the target" };
  if (retreat) return {};
  if (brain.critJumpPending?.targetId === target.id) {
    setStatus(brain, `Timing a critical hit on ${order.targetName}`);
    return {};
  }
  if (brain.combatMovementMode && brain.combatMovementTargetId === target.id) return {};
  if (combatBow(player, brain, inventory, target, order)) return {};
  const inAttackRange = distanceSquared(player.location, target.location) <= 3 ** 2;
  const visible = inAttackRange && attackLineClear(player, target);
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
      return { problem: `Can't find a path to ${order.targetName}` };
    } else {
      brain.attackBlockedUntil?.delete(target.id);
    }
    return {};
  }

  brain.attackBlockedUntil?.delete(target.id);
  const aimed = aimReadyForAttack(player, brain, target);
  if (!aimed) {
    setStatus(brain, `Aiming at ${order.targetName}`);
    return {};
  }
  setStatus(brain, `Attacking ${order.targetName}`);
  let verticalSpeed = 0;
  try {
    verticalSpeed = player.getVelocity().y;
  } catch {
  }
  const maceSmashReady = fallDistance >= MACE_SMASH_FALL_DISTANCE && verticalSpeed < -0.03;
  selectCombatWeapon(player, inventory, maceSmashReady, target.typeId === "minecraft:player");
  humanLookAt(player, brain, target);
  const comboHitCount = comboHitsFor(brain, target);
  if (comboHitCount > 0 && target.isOnGround === false && tryCriticalJump(player, brain, target, order)) return {};
  setSprinting(player, true);
  const attacked = attackSpecificTarget(player, target);
  setSprinting(player, false);
  if (attacked) {
    const hits = recordComboHit(brain, target);
    if (hits > 1) setStatus(brain, `Combo ${hits}/${COMBO_HIT_COUNT} on ${order.targetName}`);
    combatStrafe(player, brain, target, hits);
  }
  return {};
}
