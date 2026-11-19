import { Direction } from "@minecraft/server";
import { blockPosition, distanceSquared, offset, positionKey } from "./model";

export const MAX_REACH = 4.4;
const ENTITY_CLEARANCE = 0.55;
const IGNORED_ENTITIES = ["minecraft:item", "minecraft:xp_orb", "dark7mc:morph_transform_vfx", "dark7mc:clone_storage"];
const SIDES = [
  [0, -1, 0, Direction.Up], [0, 0, -1, Direction.South], [0, 0, 1, Direction.North],
  [-1, 0, 0, Direction.East], [1, 0, 0, Direction.West], [0, 1, 0, Direction.Down]
];
const UNSAFE = new Set([
  "minecraft:lava", "minecraft:flowing_lava", "minecraft:fire", "minecraft:soul_fire",
  "minecraft:magma", "minecraft:cactus", "minecraft:campfire", "minecraft:soul_campfire",
  "minecraft:powder_snow", "minecraft:sweet_berry_bush", "minecraft:wither_rose",
  "minecraft:water", "minecraft:flowing_water"
]);
const STAND_OFFSETS = [];
for (let radius = 0; radius <= 5; radius++) {
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      if (Math.max(Math.abs(x), Math.abs(z)) !== radius) continue;
      for (const y of [0, -1, 1, -2, 2, -3]) STAND_OFFSETS.push([x, y, z]);
    }
  }
}
const WORK_OFFSETS = STAND_OFFSETS.filter(([x, , z]) => Math.max(Math.abs(x), Math.abs(z)) <= 3);

export function blockAt(dimension, position) {
  try {
    return dimension.getBlock(position);
  } catch {
    return undefined;
  }
}

export function safeFeet(dimension, position) {
  const feet = blockAt(dimension, position);
  const head = blockAt(dimension, offset(position, 0, 1, 0));
  const floor = blockAt(dimension, offset(position, 0, -1, 0));
  if (!feet?.isAir || !head?.isAir || !floor || floor.isAir || floor.isLiquid || UNSAFE.has(floor.typeId)) return false;
  return !SIDES.slice(1, 5).some(([x, , z]) => {
    const neighbor = blockAt(dimension, offset(position, x, 0, z));
    return neighbor?.typeId === "minecraft:lava" || neighbor?.typeId === "minecraft:flowing_lava";
  });
}

function feetCenter(position) {
  return offset(position, 0.5, 0, 0.5);
}

export function safeNearby(dimension, location, exclude = () => false, radius = 3) {
  const base = blockPosition(location);
  for (const [x, y, z] of STAND_OFFSETS) {
    if (Math.max(Math.abs(x), Math.abs(z)) > radius) break;
    const position = offset(base, x, y, z);
    if (!exclude(position) && safeFeet(dimension, position)) return feetCenter(position);
  }
}

export function entityCrowding(dimension, origin, player, maxDistance = 8, includeEntity = () => true) {
  const location = player?.location;
  const bounds = player?.getAABB();
  const halfSize = bounds?.extent ?? { x: 0.3, y: 0.9, z: 0.3 };
  const shift = bounds ? offset(bounds.center, -location.x, -location.y, -location.z) : { x: 0, y: 0.9, z: 0 };
  const neighbors = dimension.getEntities({ location: origin, maxDistance, closest: 32, excludeTypes: IGNORED_ENTITIES })
    .filter(entity => entity.isValid && entity.id !== player?.id && !entity.hasComponent("minecraft:projectile") && includeEntity(entity))
    .map(entity => ({ entity, ...entity.getAABB() }))
    .filter(({ extent }) => extent.x > 0 && extent.y > 0 && extent.z > 0);

  function separation(position) {
    const center = offset(position, shift.x, shift.y, shift.z);
    let nearestGap = Infinity;
    let nearestEntity;
    for (const { entity, center: other, extent } of neighbors) {
      if (Math.abs(center.y - other.y) >= halfSize.y + extent.y) continue;
      const xGap = Math.max(0, Math.abs(center.x - other.x) - halfSize.x - extent.x);
      const zGap = Math.max(0, Math.abs(center.z - other.z) - halfSize.z - extent.z);
      const gap = Math.hypot(xGap, zGap);
      if (gap < nearestGap) {
        nearestGap = gap;
        nearestEntity = entity;
      }
    }
    return { gap: nearestGap, entity: nearestEntity };
  }

  const crowded = (position, clearance = ENTITY_CLEARANCE) => separation(position).gap < clearance;
  crowded.separation = position => separation(position).gap;
  crowded.nearestEntity = position => separation(position).entity;
  return crowded;
}

export function uncrowdedSpot(dimension, origin, crowded, { exclude = () => false, radius = 3 } = {}) {
  return safeNearby(dimension, origin, position => {
    const center = feetCenter(position);
    return exclude(center) || crowded(center);
  }, radius);
}

export function rayTo(dimension, eye, aim) {
  const length = Math.sqrt(distanceSquared(eye, aim));
  if (length > MAX_REACH || length < 0.01) return;
  try {
    return dimension.getBlockFromRay(eye, {
      x: (aim.x - eye.x) / length, y: (aim.y - eye.y) / length, z: (aim.z - eye.z) / length
    }, { maxDistance: length + 0.02, includeLiquidBlocks: true });
  } catch {
    return undefined;
  }
}

function isSameBlock(hit, position) {
  return hit && positionKey(hit.block.location) === positionKey(position);
}

function visibleMiningFace(dimension, eye, position) {
  const aim = offset(position, 0.5, 0.5, 0.5);
  const hit = rayTo(dimension, eye, aim);
  if (isSameBlock(hit, position)) return { hit, aim };
}

function placementFace(dimension, eye, position) {
  for (const [x, y, z, face] of SIDES) {
    const support = offset(position, x, y, z);
    const block = blockAt(dimension, support);
    if (!block || block.isAir || block.isLiquid || UNSAFE.has(block.typeId)) continue;
    const aim = offset(support, 0.5 - x * 0.499, 0.5 - y * 0.499, 0.5 - z * 0.499);
    const hit = rayTo(dimension, eye, aim);
    if (isSameBlock(hit, support) && hit.face === face) return { hit, aim };
  }
}

export function actionFromHere(player, position, placing) {
  const choose = placing ? placementFace : visibleMiningFace;
  return choose(player.dimension, player.getHeadLocation(), position);
}

export function approach(player, position, placing, rejected, crowded) {
  const choose = placing ? placementFace : visibleMiningFace;
  const { dimension, location } = player;
  const options = WORK_OFFSETS
    .map(([x, y, z]) => offset(position, x, y, z))
    .filter(candidate => !rejected.has(positionKey(candidate)) && positionKey(candidate) !== positionKey(position) &&
      (candidate.x !== position.x || candidate.z !== position.z || candidate.y > position.y))
    .sort((a, b) => distanceSquared(a, location) - distanceSquared(b, location));
  let occupied = false;
  for (const candidate of options) {
    if (!safeFeet(dimension, candidate)) continue;
    const center = feetCenter(candidate);
    if (!choose(dimension, offset(center, 0, 1.62, 0), position)) continue;
    if (!crowded(center)) return center;
    occupied = true;
  }
  if (occupied) return "crowded";
}

export function isExposed(dimension, position) {
  return SIDES.some(([x, y, z]) => blockAt(dimension, offset(position, x, y, z))?.isAir);
}

export function onDangerousGround(player) {
  const feet = blockPosition(player.location);
  return UNSAFE.has(blockAt(player.dimension, feet)?.typeId) ||
    UNSAFE.has(blockAt(player.dimension, offset(feet, 0, -1, 0))?.typeId);
}

export function findStructuresSite(player) {
  const hit = player.getBlockFromViewDirection({ maxDistance: 24 });
  return hit?.face === Direction.Up ? offset(hit.block.location, 0, 1, 0) : undefined;
}
