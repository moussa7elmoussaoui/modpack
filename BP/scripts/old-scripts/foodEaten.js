import { world } from "@minecraft/server";

world.afterEvents.itemCompleteUse.subscribe(data => {
  const { itemStack, source } = data;
  if (source.typeId == "minecraft:player") {
    if (source.getProperty("dark7mc:entity") == 35 && !source.getComponent("minecraft:is_shaking") && itemStack.typeId == "minecraft:golden_apple") {
      source.triggerEvent("morph:zombie_villager_cure");
    };
    if (source.getProperty("dark7mc:entity") == 42 && source.getGameMode() != "Creative" && itemStack.typeId == "minecraft:cookie") {
      source.addEffect("fatal_poison", 20000);
    };
  };
});