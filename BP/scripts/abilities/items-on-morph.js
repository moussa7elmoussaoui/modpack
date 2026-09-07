import { EntityTypes, ItemLockMode, ItemStack, system } from "@minecraft/server";
import morphs from "../data/morphs";
import { evaluateCondition } from "../morph/condition-evaluator";
import { morphEvents } from "../morph/events";

const ATTACHED_TO_MORPH_PROPERTY = "isAttachedToMorph";
const CUSTOM_ENTITY_TYPE_NAMES = Object.freeze({
  "dark7mc:night_fury": "Night Fury",
  "dark7mc:ancient_elemental": "Ancient Elemental"
});

morphEvents.afterMorph.subscribe(({ morph, player }) => {
  const entityType = morph.entityType;
  const inventory = player.getComponent("minecraft:inventory").container;
  clearAttachedMorphItems(inventory);

  system.runTimeout(() => {
    for (const { id, condition } of morphs[entityType].items ?? []) {
      if (condition !== undefined && !evaluateCondition(player, condition)) continue;
      inventory.addItem(createAttachedMorphItem(id, entityType));
    }
  }, 1);
});

function clearAttachedMorphItems(inventory) {
  for (let slotIndex = 0; slotIndex < inventory.size; slotIndex++) {
    const slot = inventory.getSlot(slotIndex);
    if (slot.getDynamicProperty(ATTACHED_TO_MORPH_PROPERTY) === true) {
      slot.setItem(undefined);
    }
  }
}

function createAttachedMorphItem(itemType, entityType) {
  const itemStack = new ItemStack(itemType);
  itemStack.lockMode = ItemLockMode.inventory;
  itemStack.keepOnDeath = true;
  itemStack.setDynamicProperty(ATTACHED_TO_MORPH_PROPERTY, true);

  const entityTypeDefinition = EntityTypes.get(entityType);
  itemStack.setLore([{ rawtext: [
    { text: "§r§7" },
    {
      translate: "morph.item.attached",
      with: { rawtext: [
        entityTypeDefinition === undefined
          ? { text: CUSTOM_ENTITY_TYPE_NAMES[entityType] ?? entityType }
          : { translate: entityTypeDefinition.localizationKey }
      ]}
    },
    { text: "§r" }
  ]}]);

  const durabilityComponent = itemStack.getComponent("minecraft:durability");
  if (durabilityComponent !== undefined) durabilityComponent.unbreakable = true;

  return itemStack;
}
