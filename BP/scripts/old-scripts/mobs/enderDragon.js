import { world, system, BlockVolume } from "@minecraft/server";

const dragonImmune = [
  "minecraft:air",
  "minecraft:allow",
  "minecraft:barrier",
  "minecraft:bedrock",
  "minecraft:border_block",
  "minecraft:chain_command_block",
  "minecraft:command_block",
  "minecraft:crying_obsidian",
  "minecraft:deny",
  "minecraft:end_gateway",
  "minecraft:end_portal",
  "minecraft:end_portal_frame",
  "minecraft:end_stone",
  "minecraft:fire",
  "minecraft:iron_bars",
  "minecraft:jigsaw",
  "minecraft:light_block",
  "minecraft:obsidian",
  "minecraft:reinforced_deepslate",
  "minecraft:repeating_command_block",
  "minecraft:respawn_anchor",
  "minecraft:soul_fire",
  "minecraft:structure_block",
  "minecraft:structure_void"
];

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (player.getProperty("dark7mc:entity") == 77 && world.gameRules.mobGriefing) {
      let blocksDestroyed = player.dimension.fillBlocks(new BlockVolume({ x: player.location.x - 5, y: player.location.y - 1, z: player.location.z - 5 }, { x: player.location.x + 5, y: player.location.y + 3, z: player.location.z + 5 }), "minecraft:air", { blockFilter: { excludeTypes: dragonImmune } }).getCapacity();
      for (let i = 0; i < ((blocksDestroyed / 121) * 16); i++) {
        player.dimension.spawnParticle("minecraft:dragon_destroy_block", { x: player.location.x + ((Math.random() * 8) - 4), y: player.location.y + (Math.random() * 2), z: player.location.z + ((Math.random() * 8) - 4) });
      };
    };
  };
});