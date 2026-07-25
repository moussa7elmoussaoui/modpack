import { system, world } from "@minecraft/server";
import { morphEntityTypes } from "../../data/morphs";

const ENTITY_TYPES = [
  "minecraft:spider",
  "minecraft:cave_spider"
];

const BOX_EDGE = 1;
const RAYCAST_DENSITY = 4;
const RAYCAST_DIRECTION = { x: 0, y: 1, z: 0 };
const MARGIN = 0.01;

function isTouchingWall(dimension, AABB) {
  const { center, extent } = AABB;

  for (let x = -BOX_EDGE; x <= BOX_EDGE; x += BOX_EDGE / RAYCAST_DENSITY) {
    for (let z = -BOX_EDGE; z <= BOX_EDGE; z += BOX_EDGE / RAYCAST_DENSITY) {
      const isEdgeX = Math.abs(x) === BOX_EDGE;
      const isEdgeZ = Math.abs(z) === BOX_EDGE;
      if (!isEdgeX && !isEdgeZ) continue;
      
      const isTouchingBlock = dimension.getBlockFromRay(
        {
          x: center.x + (extent.x * x) + (isEdgeX ? MARGIN * Math.sign(x) : 0),
          y: center.y - extent.y + MARGIN,
          z: center.z + (extent.z * z) + (isEdgeZ ? MARGIN * Math.sign(z) : 0)
        },
        RAYCAST_DIRECTION,
        {
          includeLiquidBlocks: false,
          includePassableBlocks: false,
          maxDistance: Math.ceil(extent.y * 2)
        }
      ) !== undefined;

      if (isTouchingBlock) return true;
    }
  }

  return false;
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const entityType = morphEntityTypes[player.getProperty("morphing_bracelet:entity")];
    if (!ENTITY_TYPES.includes(entityType)) continue;

    if (!isTouchingWall(player.dimension, player.getAABB())) continue;

    const movementVector = player.inputInfo.getMovementVector();
    if (!player.isJumping && movementVector.x === 0 && movementVector.y === 0) continue;

    player.applyImpulse({ x: 0, y: 0.3 - player.getVelocity().y, z: 0 });
  }
});