import { EntityComponentTypes, EntityDamageCause, EntityTypes, EquipmentSlot, ItemLockMode, ItemStack, Potions, system, world } from "@minecraft/server";
import { InventoryMirror } from "../waila/core/InventoryMirror.js";
import { ATTACHED_MORPH_TYPE_PROPERTY, ATTACHED_TO_MORPH_PROPERTY, canUseMorphAbility, getMorphAbilityState, isMorphAbilityItem } from "./morph-item-guard";
import { getWitchPotionEffect, WITCH_ENTITY_TYPE, WITCH_POTIONS } from "../data/witch-potions";
import { updateNightFuryMoveItem } from "../data/night-fury-moves";

const CUSTOM_ENTITY_TYPE_NAMES = Object.freeze({
  "dark7mc:night_fury": "entity.dark7mc:night_fury.name"
});

world.beforeEvents.itemUse.subscribe(event => {
  if (isMorphAbilityItem(event.itemStack) && !canUseMorphAbility(event.source, event.itemStack)) {
    event.cancel = true;
  }
});

world.beforeEvents.entityItemPickup.subscribe(event => {
  const itemStack = event.item.getComponent(EntityComponentTypes.Item)?.itemStack;
  if (isMorphAbilityItem(itemStack) && !canUseMorphAbility(event.entity, itemStack)) event.cancel = true;
});

world.beforeEvents.entityHurt.subscribe(event => {
  if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;

  const entity = event.damageSource.damagingEntity;
  const itemStack = entity?.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Mainhand);
  if (isMorphAbilityItem(itemStack) && !canUseMorphAbility(entity, itemStack)) event.cancel = true;
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    try {
      reconcileMorphItems(player);
    } catch (error) {
      console.error("Failed to reconcile morph ability items:", error);
    }
  }
}, 1);

function reconcileMorphItems(player) {
  if (!player.isValid) return;

  if (InventoryMirror.getTrackedSlots(player).length > 0) return;

  const inventory = player.getComponent(EntityComponentTypes.Inventory)?.container;
  if (inventory === undefined) return;

  const { entityType, itemTypes } = getMorphAbilityState(player);
  const existingItems = new Set();
  const emptySlots = [];

  function keepAbilityItem(itemStack) {
    if (itemStack.getDynamicProperty(ATTACHED_MORPH_TYPE_PROPERTY) !== entityType ||
      !itemTypes.has(itemStack.typeId) || existingItems.has(itemStack.typeId)) return false;
    if (entityType === WITCH_ENTITY_TYPE && WITCH_POTIONS[itemStack.typeId] !== undefined &&
      getWitchPotionEffect(itemStack) === undefined) return false;
    existingItems.add(itemStack.typeId);
    return true;
  }

  function checkSlot(slot) {
    const itemStack = slot.getItem();
    if (itemStack === undefined) return true;
    if (!isMorphAbilityItem(itemStack)) return false;

    if (!keepAbilityItem(itemStack)) {
      slot.setItem(undefined);
      return true;
    }
    let itemChanged = updateNightFuryMoveItem(itemStack);
    if (itemStack.amount > 1) {
      itemStack.amount = 1;
      itemChanged = true;
    }
    if (itemChanged) slot.setItem(itemStack);
    return false;
  }

  const cursor = player.getComponent(EntityComponentTypes.CursorInventory);
  let cursorItem = cursor?.item;
  if (isMorphAbilityItem(cursorItem) && (cursorItem.amount > 1 || !keepAbilityItem(cursorItem))) {
    cursor.clear();
    cursorItem = undefined;
  }

  const selectedSlotIndex = player.selectedSlotIndex;
  const selectedSlot = inventory.getSlot(selectedSlotIndex);
  if (checkSlot(selectedSlot)) emptySlots.push(selectedSlot);
  const inventorySize = inventory.size;
  for (let index = 0; index < inventorySize; index++) {
    if (index === selectedSlotIndex) continue;
    const slot = inventory.getSlot(index);
    if (checkSlot(slot)) emptySlots.push(slot);
  }

  const offhand = player.getComponent(EntityComponentTypes.Equippable)?.getEquipmentSlot(EquipmentSlot.Offhand);
  if (offhand !== undefined) checkSlot(offhand);

  const availableSlots = emptySlots.length - (cursorItem === undefined ? 0 : 1);
  let nextSlot = 0;
  for (const itemType of itemTypes) {
    if (nextSlot >= availableSlots) break;
    if (existingItems.has(itemType)) continue;
    emptySlots[nextSlot].setItem(createAttachedMorphItem(itemType, entityType));
    nextSlot++;
  }
}

export function createAttachedMorphItem(itemType, entityType, potionEffect) {
  const potion = entityType === WITCH_ENTITY_TYPE ? WITCH_POTIONS[itemType] : undefined;
  const itemStack = potion === undefined
    ? new ItemStack(itemType)
    : Potions.resolve(potion.effects.includes(potionEffect) ? potionEffect : potion.effects[0], potion.delivery);
  itemStack.lockMode = ItemLockMode.inventory;
  itemStack.keepOnDeath = true;
  itemStack.setDynamicProperty(ATTACHED_TO_MORPH_PROPERTY, true);
  itemStack.setDynamicProperty(ATTACHED_MORPH_TYPE_PROPERTY, entityType);

  const entityTypeDefinition = EntityTypes.get(entityType);
  const localizationKey = entityTypeDefinition?.localizationKey ?? CUSTOM_ENTITY_TYPE_NAMES[entityType];
  itemStack.setLore([{ rawtext: [
    { text: "§r§7" },
    {
      translate: "morph.item.attached",
      with: { rawtext: [
        localizationKey ? { translate: localizationKey } : { text: entityType }
      ]}
    },
    { text: "§r" }
  ]}]);

  if (potion !== undefined) {
    itemStack.setLore([...itemStack.getRawLore(), { rawtext: [
      { text: "\n\u00a7r\u00a77" },
      { translate: "morph.item.switch_potion" },
      { text: "\u00a7r" }
    ]}]);
  }

  updateNightFuryMoveItem(itemStack);

  const durabilityComponent = itemStack.getComponent("minecraft:durability");
  if (durabilityComponent !== undefined) durabilityComponent.unbreakable = true;

  return itemStack;
}
