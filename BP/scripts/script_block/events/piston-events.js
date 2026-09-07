import { world } from "@minecraft/server";
import { PistonFacing } from "../blocks/facing-directions.js";
import { Vec3 } from "../math/vec3.js";
import { ScriptBlockStorage } from "../script-storage.js";

function getPistonPushDirection(facing, isExpanding) {
  if (
    (facing === PistonFacing.Up && isExpanding) ||
    (facing === PistonFacing.Down && !isExpanding)
  ) {
    return Vec3.up;
  }
  if (
    (facing === PistonFacing.Down && isExpanding) ||
    (facing === PistonFacing.Up && !isExpanding)
  ) {
    return Vec3.down;
  }
  if (
    (facing === PistonFacing.Left && isExpanding) ||
    (facing === PistonFacing.Right && !isExpanding)
  ) {
    return Vec3.left;
  }
  if (
    (facing === PistonFacing.Right && isExpanding) ||
    (facing === PistonFacing.Left && !isExpanding)
  ) {
    return Vec3.right;
  }
  if (
    (facing === PistonFacing.Forward && isExpanding) ||
    (facing === PistonFacing.Back && !isExpanding)
  ) {
    return Vec3.forward;
  }
  if (
    (facing === PistonFacing.Back && isExpanding) ||
    (facing === PistonFacing.Forward && !isExpanding)
  ) {
    return Vec3.back;
  }
  return undefined;
}

export function registerPistonHandler() {
  world.afterEvents.pistonActivate.subscribe(function ({ block, piston, isExpanding, dimension }) {
    const facing = block.permutation.getState("facing_direction");

    const pushDirection = getPistonPushDirection(facing, isExpanding);
    if (!pushDirection) return;

    const moves = [];
    for (const location of piston.getAttachedBlocksLocations()) {
      const sourceBlock = dimension.getBlock(location);
      const destinationBlock = dimension.getBlock(Vec3.add(Vec3.from(location), pushDirection));
      if (!sourceBlock || !destinationBlock) continue;

      const sourceStorage = ScriptBlockStorage.fromBlock(sourceBlock);
      if (!sourceStorage.code) continue;
      moves.push({
        sourceStorage,
        destinationStorage: ScriptBlockStorage.fromBlock(destinationBlock),
        code: sourceStorage.code,
      });
    }

    for (const { sourceStorage } of moves) sourceStorage.remove();
    for (const { destinationStorage, code } of moves) destinationStorage.write(code);
  });
}
