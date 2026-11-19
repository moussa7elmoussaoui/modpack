import { EntityComponentTypes, EquipmentSlot, ItemLockMode, ItemStack } from "@minecraft/server";
import { RESOURCES } from "./model";

export const EQUIPMENT_SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet, EquipmentSlot.Offhand];
const LOCK_NONE = ItemLockMode.none;
const PICKAXES = new Map([
  ["minecraft:wooden_pickaxe", 1], ["minecraft:golden_pickaxe", 1], ["minecraft:stone_pickaxe", 2],
  ["minecraft:copper_pickaxe", 2], ["minecraft:iron_pickaxe", 3], ["minecraft:diamond_pickaxe", 4],
  ["minecraft:netherite_pickaxe", 4]
]);

export function inventoryOf(player) {
  return player.getComponent(EntityComponentTypes.Inventory)?.container;
}

export function enderOf(player) {
  return player.getComponent(EntityComponentTypes.EnderInventory)?.container;
}

export function inventoryEntries(container) {
  const entries = [];
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (item) entries.push({ slot, item });
  }
  return entries;
}

export function movable(item) {
  return item.lockMode === LOCK_NONE;
}

export function countItems(container, identifiers) {
  let count = 0;
  for (const { item } of inventoryEntries(container)) {
    if (movable(item) && identifiers.includes(item.typeId)) count += item.amount;
  }
  return count;
}

function setAmount(container, slot, item, amount) {
  if (amount > 0) {
    item.amount = amount;
    container.setItem(slot, item);
  } else {
    container.setItem(slot, undefined);
  }
}

export function capacityFor(container, stack) {
  let capacity = 0;
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (!item) capacity += stack.maxAmount;
    else if (item.isStackableWith(stack)) capacity += item.maxAmount - item.amount;
    if (capacity >= stack.amount) return capacity;
  }
  return capacity;
}

export function moveItems(source, destination, identifiers, amount) {
  let moved = 0;
  for (const { slot, item } of inventoryEntries(source)) {
    if (moved >= amount) break;
    if (!movable(item) || !identifiers.includes(item.typeId)) continue;
    const stack = item.clone();
    const count = Math.min(item.amount, amount - moved, capacityFor(destination, item));
    if (count <= 0) continue;
    stack.amount = count;
    const original = item.clone();
    setAmount(source, slot, item, item.amount - stack.amount);
    try {
      insertStack(destination, stack);
      moved += stack.amount;
    } catch (error) {
      source.setItem(slot, original);
      throw error;
    }
  }
  return moved;
}

export function insertStack(container, stack) {
  const touched = new Map();
  const undo = () => {
    for (const [slot, item] of touched) container.setItem(slot, item);
  };
  try {
    let remaining = stack.amount;
    for (let slot = 0; remaining > 0 && slot < container.size; slot++) {
      const item = container.getItem(slot);
      if (item && !item.isStackableWith(stack)) continue;
      const added = Math.min(remaining, stack.maxAmount - (item?.amount ?? 0));
      if (added <= 0) continue;
      touched.set(slot, item);
      const next = item?.clone() ?? stack.clone();
      next.amount = (item?.amount ?? 0) + added;
      container.setItem(slot, next);
      remaining -= added;
    }
    if (remaining) throw new Error("Not enough inventory space for the stack.");
    return undo;
  } catch (error) {
    undo();
    throw error;
  }
}

export function selectSlot(player, container, slot) {
  if (slot >= 9) {
    let hotbar = player.selectedSlotIndex;
    for (let index = 0; index < 9; index++) {
      if (!container.getItem(index)) {
        hotbar = index;
        break;
      }
      if (movable(container.getItem(index))) hotbar = index;
    }
    const current = container.getItem(hotbar);
    if (current && !movable(current)) return undefined;
    container.swapItems(slot, hotbar, container);
    slot = hotbar;
  }
  player.selectedSlotIndex = slot;
  return slot;
}

export function selectItem(player, container, itemId) {
  const match = inventoryEntries(container).find(({ item }) => movable(item) && item.typeId === itemId);
  if (match) return selectSlot(player, container, match.slot);
}

export function selectTool(player, container, resource) {
  const entries = inventoryEntries(container).filter(({ item }) => movable(item));
  let tool;
  if (resource.tier) {
    const suitable = entries.filter(({ item }) => (PICKAXES.get(item.typeId) ?? 0) >= resource.tier);
    tool = suitable.find(({ item }) => !item.getComponent("minecraft:enchantable")?.hasEnchantment("minecraft:silk_touch"));
    return tool && selectSlot(player, container, tool.slot) !== undefined;
  }
  const suffix = resource === RESOURCES.logs ? "_axe" : "_shovel";
  tool = entries.find(({ item }) => item.typeId.endsWith(suffix));
  if (tool) selectSlot(player, container, tool.slot);
  else {
    const current = container.getItem(player.selectedSlotIndex);
    if (current?.getComponent("minecraft:durability")) {
      const empty = Array.from({ length: 9 }, (_, index) => index).find(index => !container.getItem(index));
      if (empty !== undefined) player.selectedSlotIndex = empty;
    }
  }
  return true;
}

export function neededPickaxe(resource) {
  return ["", "minecraft:wooden_pickaxe", "minecraft:stone_pickaxe", "minecraft:iron_pickaxe"][resource.tier];
}

const vanilla = id => `minecraft:${id}`;
const PLANKS = RESOURCES.planks.items;
const STICKS = [vanilla("stick")];
const COBBLE = [vanilla("cobblestone"), vanilla("cobbled_deepslate"), vanilla("blackstone")];
const IRON = [vanilla("iron_ingot")];
const recipes = new Map([
  [vanilla("stick"), { inputs: [[PLANKS, 2]], amount: 4 }],
  [vanilla("crafting_table"), { inputs: [[PLANKS, 4]], amount: 1 }],
  [vanilla("furnace"), { inputs: [[COBBLE, 8]], amount: 1, table: true }],
  [vanilla("wooden_pickaxe"), { inputs: [[PLANKS, 3], [STICKS, 2]], amount: 1, table: true }],
  [vanilla("stone_pickaxe"), { inputs: [[COBBLE, 3], [STICKS, 2]], amount: 1, table: true }],
  [vanilla("iron_pickaxe"), { inputs: [[IRON, 3], [STICKS, 2]], amount: 1, table: true }]
]);
for (const itemId of PLANKS) {
  recipes.set(itemId, { inputs: [[[`${itemId.slice(0, -7)}_log`], 1]], amount: 4 });
}

export function choosePlanks(container, preferredResource) {
  const entries = inventoryEntries(container).filter(({ item }) => movable(item));
  if (preferredResource && PLANKS.includes(preferredResource)) return preferredResource;
  const plank = entries.find(({ item }) => PLANKS.includes(item.typeId))?.item;
  if (plank) return plank.typeId;
  const log = entries.find(({ item }) => RESOURCES.logs.items.includes(item.typeId))?.item;
  if (log) return `${log.typeId.slice(0, -4)}_planks`;
}

export function recipeFor(itemId) {
  return recipes.get(itemId);
}

export function craftOnce(container, itemId, recipe) {
  const touched = new Map();
  try {
    for (const [identifiers, amount] of recipe.inputs) {
      let missing = amount;
      for (const { slot, item } of inventoryEntries(container)) {
        if (!missing) break;
        if (!movable(item) || !identifiers.includes(item.typeId)) continue;
        if (!touched.has(slot)) touched.set(slot, item.clone());
        const consumed = Math.min(missing, item.amount);
        setAmount(container, slot, item, item.amount - consumed);
        missing -= consumed;
      }
      if (missing) return false;
    }
    const result = new ItemStack(itemId, recipe.amount);
    if (capacityFor(container, result) < result.amount) return false;
    insertStack(container, result);
    touched.clear();
    return true;
  } finally {
    for (const [slot, item] of touched) container.setItem(slot, item);
  }
}

export function clearCarriedGear(player) {
  inventoryOf(player).clearAll();
  const equipment = player.getComponent(EntityComponentTypes.Equippable);
  for (const slot of EQUIPMENT_SLOTS) equipment?.setEquipment(slot, undefined);
}
