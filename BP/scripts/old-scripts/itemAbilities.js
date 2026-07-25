import { world, system, ItemStack, ItemLockMode } from "@minecraft/server";

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    for (let slot = 0; slot < player.getComponent("minecraft:inventory").container.size; slot++) {
      const itemStack = player.getComponent("minecraft:inventory").container.getItem(slot);
      if (itemStack && itemStack.getLore().includes("Morphing Bracelet") && itemStack.hasComponent("minecraft:durability") && itemStack.getComponent("minecraft:durability").damage != 0) {
        itemStack.getComponent("minecraft:durability").damage = 0;
        player.getComponent("minecraft:inventory").container.setItem(slot, itemStack);
      };
    };
  };
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (player.getProperty("morphing_bracelet:entity") == 3 || player.getProperty("morphing_bracelet:entity") == 41) {
      player.runCommand('replaceitem entity @s slot.inventory 8 arrow 1 0 {"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}');
      system.runTimeout(() => {
        if (player.getProperty("morphing_bracelet:entity") != 3 && player.getProperty("morphing_bracelet:entity") != 41) {
          player.runCommand("replaceitem entity @s slot.inventory 8 air");
        };
      }, 5);
    } else if (player.getProperty("morphing_bracelet:entity") == 25) {
      player.runCommand('replaceitem entity @s slot.inventory 8 arrow 1 19 {"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}');
      system.runTimeout(() => {
        if (player.getProperty("morphing_bracelet:entity") != 25) {
          player.runCommand("replaceitem entity @s slot.inventory 8 air");
        };
      }, 5);
    } else if (player.getProperty("morphing_bracelet:entity") == 79) {
      player.runCommand('replaceitem entity @s slot.inventory 8 arrow 1 26 {"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}');
      system.runTimeout(() => {
        if (player.getProperty("morphing_bracelet:entity") != 79) {
          player.runCommand("replaceitem entity @s slot.inventory 8 air");
        };
      }, 5);
    };
  };
}, 5);


const SLOT_TO_SWAP = 17;

system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
  switch (id) {
    case "morph:replace":
      const selectedSlot = sourceEntity.selectedSlotIndex;
      const container = sourceEntity.getComponent("minecraft:inventory").container;

      container.swapItems(SLOT_TO_SWAP, selectedSlot, container);
      sourceEntity.triggerEvent("morph:drop_item");
      container.swapItems(SLOT_TO_SWAP, selectedSlot, container);

      container.setItem(SLOT_TO_SWAP, new ItemStack("minecraft:arrow"));
      break;
  }
});