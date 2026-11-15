import { world, system } from "@minecraft/server";
import pollinatableFlowers from "../../data/block-groups/pollinatable-flowers";

const duration = {};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (duration[player.id] == undefined) { duration[player.id] = { nectarCollection: 0, noStinger: 200 }; };
    if (player.getProperty("dark7mc:entity") == 40 && player.location.y >= player.dimension.heightRange.min && player.location.y < player.dimension.heightRange.max) {
      const block = player.dimension.getBlock(player.location);
      if (!player.getProperty("minecraft:has_nectar") && player.isSneaking && pollinatableFlowers.includes(block?.typeId)) {
        if (duration[player.id].nectarCollection >= 1) {
          player.triggerEvent("morph:bee_has_nectar");
          player.dimension.playSound("block.beehive.drip", player.location);
          player.addEffect("saturation", 1, { amplifier: 1, showParticles: false });
        } else { duration[player.id].nectarCollection += 1/200; };
      } else if (duration[player.id].nectarCollection > 0) { duration[player.id].nectarCollection = 0; };
    } else if (duration[player.id].nectarCollection > 0) { duration[player.id].nectarCollection = 0; };
    if (player.getProperty("dark7mc:entity") == 40 && player.getComponent("minecraft:mark_variant")?.value == 1) {
      if (player.getGameMode() == "Creative") { player.triggerEvent("morph:bee_has_stinger"); }
      else {
        if (duration[player.id].noStinger > 0) {
          duration[player.id].noStinger--;
          player.onScreenDisplay.setActionBar({ translate: "morph.bee.dying", with: [ (duration[player.id].noStinger / 20).toFixed(1) ] });
        } else {
          player.triggerEvent("morph:bee_has_stinger");
          if (player.getComponent("minecraft:health").currentValue > 0) {
            if (world.gameRules.showDeathMessages == true) {
              world.gameRules.showDeathMessages = false;
              player.kill();
              world.sendMessage({ translate: "death.attack.noStinger", with: [ player.name ] });
              world.gameRules.showDeathMessages = true;
            } else { player.kill(); };
          };
        };
      };
    } else if (duration[player.id].noStinger < 200) { duration[player.id].noStinger = 200; };
  };
});

world.beforeEvents.playerInteractWithBlock.subscribe(({ block, isFirstEvent, player }) => {
  if (!isFirstEvent || player.getProperty("dark7mc:entity") !== 40 || !player.getProperty("minecraft:has_nectar") ||
    !["minecraft:bee_nest", "minecraft:beehive"].includes(block.typeId)) return;

  system.run(() => {
    if (!player.isValid || player.getProperty("dark7mc:entity") !== 40 || !player.getProperty("minecraft:has_nectar") ||
      player.dimension.id !== block.dimension.id || !["minecraft:bee_nest", "minecraft:beehive"].includes(block.typeId)) return;
    const honey = block.permutation.getState("honey_level");
    if (honey >= 5) return;

    block.setPermutation(block.permutation.withState("honey_level", honey + 1));
    player.triggerEvent("morph:bee_no_nectar");
    block.dimension.playSound("block.beehive.enter", block.location);
  });
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => delete duration[playerId]);
