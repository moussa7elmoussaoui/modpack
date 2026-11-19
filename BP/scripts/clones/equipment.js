import { EntityComponentTypes, EquipmentSlot, system } from "@minecraft/server";
import { inventoryEntries, movable, selectSlot } from "./inventory";
import { clearTarget } from "./targets";
import { onDangerousGround, safeNearby } from "./terrain";
import { reach, setStatus, stopPlayerMovement } from "./movement";

const GOOD_FOOD = [
  "cooked_beef", "cooked_porkchop", "cooked_mutton", "cooked_salmon", "cooked_chicken", "cooked_cod",
  "baked_potato", "bread", "golden_carrot", "carrot", "apple", "beetroot", "sweet_berries", "melon_slice",
  "beef", "porkchop", "mutton", "salmon", "cod", "potato"
].map(item => "minecraft:" + item);
const ARMOR_MATERIAL_SCORE = new Map([
  ["leather", 1], ["golden", 2], ["turtle", 2], ["chainmail", 3], ["iron", 4], ["diamond", 5], ["netherite", 6]
]);

export function enchantmentLevel(item, id) {
  try {
    return item.getComponent("minecraft:enchantable")?.getEnchantment(id)?.level ?? 0;
  } catch {
    return 0;
  }
}

export function durabilityScore(item) {
  try {
    const durability = item.getComponent("minecraft:durability");
    if (!durability || durability.maxDurability <= 0) return 0;
    return Math.max(0, durability.maxDurability - durability.damage) / durability.maxDurability;
  } catch {
    return 0;
  }
}

export function armorScore(item) {
  if (!item) return -Infinity;
  const material = item.typeId.slice("minecraft:".length).split("_")[0];
  const tier = ARMOR_MATERIAL_SCORE.get(material) ?? 0;
  return tier * 10 + enchantmentLevel(item, "minecraft:protection") * 2 +
    enchantmentLevel(item, "minecraft:unbreaking") * 0.2 + durabilityScore(item);
}

export function recover(player, brain, inventory) {
  if (onDangerousGround(player)) {
    const safe = safeNearby(player.dimension, player.location);
    if (safe) {
      player.stopBreakingBlock();
      clearTarget(brain);
      setStatus(brain, "Getting to safety");
      reach(player, brain, safe);
      return true;
    }
  }
  if (brain.eatingUntil > system.currentTick) return true;
  brain.eatingUntil = undefined;
  const hunger = player.getComponent(EntityComponentTypes.Hunger);
  if (!hunger || hunger.currentValue > 16) return false;
  const food = inventoryEntries(inventory).find(({ item }) => movable(item) && GOOD_FOOD.includes(item.typeId));
  if (!food || selectSlot(player, inventory, food.slot) === undefined) return false;
  player.stopBreakingBlock();
  clearTarget(brain);
  stopPlayerMovement(player);
  if (!player.useItemInSlot(player.selectedSlotIndex)) return false;
  brain.eatingUntil = system.currentTick + 36;
  setStatus(brain, "Eating");
  return true;
}

export function equipArmor(player, inventory) {
  const equipment = player.getComponent(EntityComponentTypes.Equippable);
  const pieces = [[EquipmentSlot.Head, "_helmet"], [EquipmentSlot.Chest, "_chestplate"],
    [EquipmentSlot.Legs, "_leggings"], [EquipmentSlot.Feet, "_boots"]];
  for (const [slot, suffix] of pieces) {
    const current = equipment?.getEquipment(slot);
    const gear = inventoryEntries(inventory)
      .filter(({ item }) => movable(item) && item.typeId.endsWith(suffix))
      .sort((a, b) => armorScore(b.item) - armorScore(a.item))[0];
    if (gear && armorScore(gear.item) > armorScore(current) && equipment?.setEquipment(slot, gear.item)) {
      inventory.setItem(gear.slot, current);
    }
  }
  if (!equipment?.getEquipment(EquipmentSlot.Offhand)) {
    const shield = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId === "minecraft:shield");
    if (shield && equipment?.setEquipment(EquipmentSlot.Offhand, shield.item)) inventory.setItem(shield.slot, undefined);
  }
}
