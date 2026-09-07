import { world } from "@minecraft/server";
import { SCRIPT_BLOCK_TYPE_ID } from "../constants.js";
import { ScriptBlockStorage } from "../script-storage.js";

export function registerExplosionHandler() {
  world.afterEvents.explosion.subscribe(function (event) {
    const impactedBlocks = event.getImpactedBlocks();

    for (const block of impactedBlocks) {
      if (!block.isValid || block.typeId !== SCRIPT_BLOCK_TYPE_ID) continue;
      ScriptBlockStorage.fromBlock(block).remove();
    }
  });
}
