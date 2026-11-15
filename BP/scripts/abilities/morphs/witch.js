import { EntityComponentTypes, EntityDamageCause, Player, system, world } from "@minecraft/server";
import { createAttachedMorphItem } from "../items-on-morph";
import { ATTACHED_MORPH_TYPE_PROPERTY, ATTACHED_TO_MORPH_PROPERTY, canUseMorphAbility } from "../morph-item-guard";
import { getWitchPotionEffect, WITCH_ENTITY_TYPE, WITCH_POTIONS } from "../../data/witch-potions";
import { morphEvents } from "../../morph/events";
import { morphEntityTypes } from "../../data/morphs";
import { feedback } from "../../utils/messages";

const USE_COOLDOWN = 60;
const cooldowns = new Map();
const pendingUses = new Map();

function isWitchPotion(player, itemStack) {
  return canUseMorphAbility(player, itemStack) && getWitchPotionEffect(itemStack) !== undefined;
}

function matchesPotion(player, itemStack, type, effect) {
  return itemStack?.typeId === type && isWitchPotion(player, itemStack) && getWitchPotionEffect(itemStack) === effect;
}

world.beforeEvents.itemUse.subscribe(event => {
  const { source, itemStack } = event;
  if (event.cancel || !isWitchPotion(source, itemStack)) return;

  const type = itemStack.typeId;
  const effect = getWitchPotionEffect(itemStack);
  const slotIndex = source.selectedSlotIndex;

  if (source.isSneaking) {
    event.cancel = true;
    pendingUses.delete(source.id);
    system.run(() => {
      if (!source.isValid || source.selectedSlotIndex !== slotIndex) return;
      const slot = source.getComponent(EntityComponentTypes.Inventory)?.container?.getSlot(slotIndex);
      if (slot === undefined || !matchesPotion(source, slot.getItem(), type, effect)) return;

      const effects = WITCH_POTIONS[type].effects;
      const nextEffect = effects[(effects.indexOf(effect) + 1) % effects.length];
      const nextPotion = createAttachedMorphItem(type, WITCH_ENTITY_TYPE, nextEffect);
      slot.setItem(nextPotion);
      source.onScreenDisplay.setActionBar(feedback("morph.witch.selected_potion", [{ translate: nextPotion.localizationKey }]));
    });
    return;
  }

  const remaining = (cooldowns.get(source.id) ?? 0) - system.currentTick;
  if (remaining > 0) {
    event.cancel = true;
    source.sendMessage(feedback("morph.witch.potion_cooldown", [(remaining / 20).toFixed(1)]));
    return;
  }

  pendingUses.set(source.id, { slotIndex, type, effect });
});

function replenishPotion(source, itemStack, type) {
  if (itemStack.typeId !== type || !isWitchPotion(source, itemStack)) return;

  const use = pendingUses.get(source.id);
  pendingUses.delete(source.id);
  if (use === undefined || use.type !== type || use.effect !== getWitchPotionEffect(itemStack)) return;

  cooldowns.set(source.id, system.currentTick + USE_COOLDOWN);
  const inventory = source.getComponent(EntityComponentTypes.Inventory)?.container;
  if (inventory === undefined) return;

  const current = inventory.getItem(use.slotIndex);
  const isBottle = type === "minecraft:potion" && current?.typeId === "minecraft:glass_bottle" && current.amount === 1;
  const replacement = createAttachedMorphItem(type, WITCH_ENTITY_TYPE, use.effect);
  if (current === undefined || isBottle || matchesPotion(source, current, type, use.effect)) {
    inventory.setItem(use.slotIndex, replacement);
    return;
  }

  for (let index = 0; index < inventory.size; index++) {
    if (inventory.getItem(index) === undefined) {
      inventory.setItem(index, replacement);
      return;
    }
  }
}

world.afterEvents.itemCompleteUse.subscribe(({ source, itemStack }) => {
  replenishPotion(source, itemStack, "minecraft:potion");
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  replenishPotion(source, itemStack, "minecraft:splash_potion");
});

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const { block, itemStack } = event;
  if (block.typeId !== "minecraft:cauldron" && block.typeId !== "minecraft:lava_cauldron") return;
  if (itemStack?.getDynamicProperty(ATTACHED_TO_MORPH_PROPERTY) === true &&
    itemStack.getDynamicProperty(ATTACHED_MORPH_TYPE_PROPERTY) === WITCH_ENTITY_TYPE &&
    WITCH_POTIONS[itemStack.typeId] !== undefined) event.cancel = true;
});

world.beforeEvents.entityHurt.subscribe(event => {
  if (event.hurtEntity instanceof Player && event.damageSource.cause === EntityDamageCause.magic &&
    morphEntityTypes[event.hurtEntity.getProperty("dark7mc:entity")] === WITCH_ENTITY_TYPE) {
    event.damage *= 0.15;
  }
});

morphEvents.afterMorph.subscribe(({ player }) => pendingUses.delete(player.id));
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  pendingUses.delete(playerId);
  cooldowns.delete(playerId);
});
