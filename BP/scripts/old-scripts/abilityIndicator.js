import { world, system } from "@minecraft/server";
import { getFlowers } from "old-scripts/mobs/bee.js";

const duration = {};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (duration[player.id] == undefined) { duration[player.id] = 0; };
    if (player.getProperty("dark7mc:entity") == 36) {
      if (player.isSneaking && player.isOnGround) {
        duration[player.id] += 1/20;
        progressBar(player, duration[player.id]);
      } else if (duration[player.id] >= 1) {
        duration[player.id] = 0;
        system.runTimeout(() => {
          progressBar(player, duration[player.id]);
        }, 10);
      } else if (duration[player.id] > 0) {
        duration[player.id] = 0;
        progressBar(player, duration[player.id]);
      };
    } else if (player.getProperty("dark7mc:entity") == 40 && player.location.y >= player.dimension.heightRange.min && player.location.y <= player.dimension.heightRange.max) {
      if (!player.getProperty("minecraft:has_nectar") && player.isSneaking && (getFlowers().includes(player.dimension.getBlock(player.location).typeId))) {
        duration[player.id] += 1/200;
        progressBar(player, duration[player.id], 10);
      } else if (duration[player.id] > 0) {
        duration[player.id] = 0;
        if (!player.getProperty("minecraft:has_nectar")) { progressBar(player, duration[player.id], 10); };
      };
    } else if (player.getProperty("dark7mc:entity") == 56) {
      if (player.isSneaking && player.isOnGround) {
        duration[player.id] += 1/10;
        progressBar(player, duration[player.id]);
      } else if (duration[player.id] >= 1) {
        duration[player.id] = 0;
        system.runTimeout(() => {
          progressBar(player, duration[player.id]);
        }, 10);
      } else if (duration[player.id] > 0) {
        duration[player.id] = 0;
        progressBar(player, duration[player.id]);
      };
    } else if (duration[player.id] > 0) {
      duration[player.id] = 0;
      progressBar(player, duration[player.id]);
    };
  };
});

function progressBar(entity, value, count = 5) {
  let bars = "";
  for (let i = 0; i < count; i++) {
    if (Math.floor(count * value) == i) { bars += "§8█"; }
    else { bars += "█"; };
  };
  entity.onScreenDisplay.setActionBar(`${Math.floor(count * value) >= count ? "§a" : "§e"}${bars}§r`);
};