import { world, system } from "@minecraft/server";

const duration = {};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (duration[player.id] == undefined) { duration[player.id] = 0; };
    if (player.getProperty("morphing_bracelet:entity") == 80 && player.isSneaking && player.isOnGround) {
      if (duration[player.id] == 10) {
        player.applyKnockback({ x: player.getViewDirection().x * 6, z: player.getViewDirection().z * 6 }, 1);
      };
      duration[player.id]++;
    } else { duration[player.id] = 0; };
  };
});