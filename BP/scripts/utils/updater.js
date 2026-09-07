import { ItemStack, system, world } from "@minecraft/server";
import { renamedItems, renamedProperties, morphDataV1, morphDataV2 } from "../data/updates";

world.afterEvents.worldLoad.subscribe(() => {
  const oldInitializedProperty = world.getDynamicProperty("initialized");
  if (oldInitializedProperty === undefined) return;

  world.setDynamicProperty("isInitialized", oldInitializedProperty);
  world.setDynamicProperty("initialized", undefined);
});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (!initialSpawn) return;

  if (player.getProperty("morph:entity") !== -1) {
    player.setDynamicProperty("isInitialized", true);
  }

  for (const oldProperty of Object.keys(renamedProperties)) {
    const renamedProperty = renamedProperties[oldProperty];
    const newProperty = renamedProperty.newProperty;
    const defaultValue = renamedProperty.defaultValue;

    if (player.getProperty(oldProperty) !== defaultValue) {
      player.setProperty(newProperty, player.getProperty(oldProperty));
      player.setProperty(oldProperty, defaultValue);
    }
  }

  const inventory = player.getComponent("minecraft:inventory").container;
  for (let slot = 0; slot < inventory.size; slot++) {
    updateItem(inventory, slot, inventory.getItem(slot));
  }
});

world.afterEvents.playerInventoryItemChange.subscribe(({ itemStack, player, slot }) => {
  const inventory = player.getComponent("minecraft:inventory").container;
  updateItem(inventory, slot, itemStack);
});

function updateItem(inventory, slot, itemStack) {
  if (itemStack === undefined) return;

  if (itemStack.typeId in renamedItems) {
    inventory.setItem(slot, renameItemTypeId(itemStack, renamedItems[itemStack.typeId]));
  }

  if (itemStack.getLore().includes("Morphing Bracelet") && itemStack.getDynamicProperty("isAttachedToMorph") !== true) {
    itemStack.setDynamicProperty("isAttachedToMorph", true);
  }
  
  if (itemStack.hasComponent("dark7mc:morphing_bracelet")) {
    const version = itemStack.getDynamicProperty("version") ?? 0;
    const rawMorphs = itemStack.getDynamicProperty("morphs");
    if (typeof rawMorphs !== "string" || rawMorphs.trim().length === 0) return;

    if (version < 1) {
      const morphs = [...new Set(JSON.parse(rawMorphs).map(morph => {
        if (morph in morphDataV1) return morphDataV1[morph];
        return morph;
      }))];

      itemStack.setDynamicProperty("morphs", JSON.stringify(morphs));
    }
    
    if (version < 2) {
      const morphs = JSON.parse(itemStack.getDynamicProperty("morphs")).map(morph => {
        if (morph in morphDataV2) return morphDataV2[morph];
        return morph;
      });

      itemStack.setDynamicProperty("morphs", JSON.stringify(morphs));

      itemStack.setDynamicProperty("version", 2);
      inventory.setItem(slot, itemStack);
    }
  } else if (itemStack.hasComponent("dark7mc:morph_storage")) {
    const version = itemStack.getDynamicProperty("version") ?? 0;

    if (version < 1) {
      const morph = itemStack.getDynamicProperty("morph");

      if (morph in morphDataV1)
        itemStack.setDynamicProperty("morph", morphDataV1[morph]);
    }

    if (version < 2) {
      const morph = itemStack.getDynamicProperty("morph");

      if (morph in morphDataV2)
        itemStack.setDynamicProperty("morph", morphDataV2[morph]);

      itemStack.setDynamicProperty("version", 2);
      inventory.setItem(slot, itemStack);
    }
  }
}

export function renameItemTypeId(itemStack, identifier) {
  const newItemStack = new ItemStack(identifier);

  newItemStack.amount = itemStack.amount;
  newItemStack.keepOnDeath = itemStack.keepOnDeath;
  newItemStack.lockMode = itemStack.lockMode;
  newItemStack.nameTag = itemStack.nameTag;
  newItemStack.setCanDestroy(itemStack.getCanDestroy());
  newItemStack.setCanPlaceOn(itemStack.getCanPlaceOn());
  newItemStack.setLore(itemStack.getLore());

  if (newItemStack.hasComponent("minecraft:durability") && itemStack.hasComponent("minecraft:durability")) {
    newItemStack.getComponent("minecraft:durability").damage = itemStack.getComponent("minecraft:durability").damage;
  }

  for (const dynamicProperty of itemStack.getDynamicPropertyIds()) {
    newItemStack.setDynamicProperty(dynamicProperty, itemStack.getDynamicProperty(dynamicProperty));
  }

  return newItemStack;
}