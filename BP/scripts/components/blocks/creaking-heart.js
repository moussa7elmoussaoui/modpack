import { BlockPermutation, world } from "@minecraft/server";

export default {
  id: "creaking_heart",
  onTick: ({ block, dimension }) => {
    const data = JSON.parse(world.getDynamicProperty("linkedCreakingMorphs"));
    let isBlockValid = false;

    for (const blockLocation of Object.values(data)) {
      if (
        blockLocation.dimension !== dimension.id ||
        blockLocation.x !== block.location.x ||
        blockLocation.y !== block.location.y ||
        blockLocation.z !== block.location.z
      ) continue;

      isBlockValid = true;
    }

    if (isBlockValid) return;

    const blockStates = block.permutation.getAllStates();
    block.setPermutation(BlockPermutation.resolve("minecraft:creaking_heart", {
      natural: blockStates["dark7mc:natural"],
      pillar_axis: blockStates["dark7mc:pillar_axis"]
    }));
  }
};