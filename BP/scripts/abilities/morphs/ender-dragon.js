import { BlockVolume, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../../data/morphs";
import dragonImmune from "../../data/block-groups/dragon-immune";

system.runInterval(() => {
  if (!world.gameRules.mobGriefing) return;

  for (const player of world.getPlayers()) {
    if (!player.isValid || morphEntityTypes[player.getProperty("dark7mc:entity")] !== "minecraft:ender_dragon") continue;

    const { dimension } = player;
    const { center, extent } = player.getAABB();
    const minY = Math.max(dimension.heightRange.min, Math.floor(center.y - extent.y - 0.5));
    const maxY = Math.min(dimension.heightRange.max - 1, Math.floor(center.y + extent.y + 0.5));
    if (minY > maxY) continue;

    const volume = new BlockVolume(
      { x: Math.floor(center.x - extent.x - 0.25), y: minY, z: Math.floor(center.z - extent.z - 0.25) },
      { x: Math.floor(center.x + extent.x + 0.25), y: maxY, z: Math.floor(center.z + extent.z + 0.25) }
    );
    const destroyed = dimension.fillBlocks(volume, "minecraft:air", {
      blockFilter: { excludeTypes: dragonImmune },
      ignoreChunkBoundErrors: true
    });
    if (destroyed.getCapacity() <= 0) continue;

    dimension.spawnParticle("minecraft:dragon_destroy_block", {
      x: center.x - extent.x + Math.random() * extent.x * 2,
      y: Math.min(maxY + 0.5, Math.max(minY + 0.5, center.y - extent.y + Math.random() * extent.y * 2)),
      z: center.z - extent.z + Math.random() * extent.z * 2
    });
  }
}, 1);
