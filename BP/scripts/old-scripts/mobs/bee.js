import { world, system } from "@minecraft/server";

const flowers = [
  "minecraft:poppy",
  "minecraft:blue_orchid",
  "minecraft:allium",
  "minecraft:azure_bluet",
  "minecraft:red_tulip",
  "minecraft:orange_tulip",
  "minecraft:white_tulip",
  "minecraft:pink_tulip",
  "minecraft:oxeye_daisy",
  "minecraft:cornflower",
  "minecraft:lily_of_the_valley",
  "minecraft:dandelion",
  "minecraft:wither_rose",
  "minecraft:sunflower",
  "minecraft:lilac",
  "minecraft:rose_bush",
  "minecraft:peony",
  "minecraft:flowering_azalea",
  "minecraft:azalea_leaves_flowered",
  "minecraft:mangrove_propagule",
  "minecraft:pitcher_plant",
  "minecraft:torchflower",
  "minecraft:cherry_leaves",
  "minecraft:pink_petals",
  "minecraft:open_eyeblossom",
  "minecraft:wildflowers",
  "minecraft:cactus_flower",
  "minecraft:chorus_flower",
  "minecraft:spore_blossom"
];

const duration = {};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (duration[player.id] == undefined) { duration[player.id] = { nectarCollection: 0, noStinger: 200 }; };
    if (player.getProperty("dark7mc:entity") == 40 && player.location.y >= player.dimension.heightRange.min && player.location.y <= player.dimension.heightRange.max) {
      const block = player.dimension.getBlock(player.location);
      if (!player.getProperty("minecraft:has_nectar") && player.isSneaking && flowers.includes(block.typeId)) {
        if (duration[player.id].nectarCollection >= 1) {
          player.triggerEvent("morph:bee_has_nectar");
          player.dimension.playSound("block.beehive.drip", player.location);
          player.addEffect("saturation", 1, { amplifier: 1, showParticles: false });
        } else { duration[player.id].nectarCollection += 1/200; };
      } else if (duration[player.id].nectarCollection > 0) { duration[player.id].nectarCollection = 0; };
    } else if (duration[player.id].nectarCollection > 0) { duration[player.id].nectarCollection = 0; };
    if (player.getProperty("dark7mc:entity") == 40 && player.getComponent("minecraft:mark_variant").value == 1) {
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

world.beforeEvents.playerInteractWithBlock.subscribe(data => {
  const { block, isFirstEvent, player } = data;
  system.run(() => {
    if (isFirstEvent && player.getProperty("dark7mc:entity") == 40 && player.getProperty("minecraft:has_nectar") && (block.typeId == "minecraft:bee_nest" || block.typeId == "minecraft:beehive")) {
      player.triggerEvent("morph:bee_no_nectar");
      block.setPermutation(block.permutation.withState("honey_level", block.permutation.getState("honey_level") < 5 ? block.permutation.getState("honey_level") + 1 : block.permutation.getState("honey_level") + 0));
      block.dimension.playSound("block.beehive.enter", block.location);
    };
  });
});

export function getFlowers() {
  return flowers;
};