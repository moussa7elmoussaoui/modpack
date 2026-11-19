import { EntityComponentTypes, StructureSaveMode, world } from "@minecraft/server";
import { EQUIPMENT_SLOTS, enderOf, inventoryOf } from "./inventory";
import { blockPosition, offset } from "./model";
import { blockAt } from "./terrain";

const STORAGE_TYPE = "dark7mc:clone_storage";
const INVENTORY_SIZE = 36;
const GEAR_SIZE = INVENTORY_SIZE + EQUIPMENT_SLOTS.length;
const ENDER_SIZE = 27;

export function checkStorage() {
  if (typeof world.structureManager?.createFromWorld !== "function") {
    throw new Error("This Bedrock build cannot save clone inventories.");
  }
}

function structureKey(slot, kind, revision) {
  return `dark7mc:clone_${slot}_${kind}_${revision}`;
}

function scratchSite(player) {
  const dimension = player.dimension;
  const feet = blockPosition(player.location);
  const base = { x: feet.x, y: dimension.heightRange.max - 2, z: feet.z };
  for (const [x, z] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) {
    const site = offset(base, x, 0, z);
    if (!blockAt(dimension, site)?.isAir) continue;
    clearScratch(dimension, site);
    if (!dimension.getEntitiesAtBlockLocation(site).length) return { dimension, site };
  }
  throw new Error("The clone's loaded chunk has no free inventory storage cell.");
}

function scratchInventory(entity) {
  return entity.getComponent(EntityComponentTypes.Inventory)?.container;
}

function clearScratch(dimension, site) {
  for (const entity of dimension.getEntitiesAtBlockLocation(site)) {
    if (entity.typeId === STORAGE_TYPE) entity.remove();
  }
}

function writeSnapshot(slot, kind, oldRevision, items, player) {
  if (items.every(item => item === undefined)) return undefined;
  const { dimension, site } = scratchSite(player);
  const revision = oldRevision === 0 ? 1 : 0;
  const key = structureKey(slot, kind, revision);
  const entity = dimension.spawnEntity(STORAGE_TYPE, offset(site, 0.5, 0.1, 0.5), { initialPersistence: true });
  try {
    const inventory = scratchInventory(entity);
    if (!inventory) throw new Error("The clone storage container is missing.");
    for (const [index, item] of items.entries()) inventory.setItem(index, item);
    const structures = world.structureManager;
    if (structures.get(key)) structures.delete(key);
    structures.createFromWorld(key, dimension, site, site, {
      includeBlocks: false, includeEntities: true, saveMode: StructureSaveMode.World
    });
    return revision;
  } finally {
    if (entity.isValid) entity.remove();
  }
}

function readSnapshot(slot, kind, revision, size, player) {
  if (revision === undefined) return new Array(size).fill(undefined);
  const { dimension, site } = scratchSite(player);
  const key = structureKey(slot, kind, revision);
  world.structureManager.place(key, dimension, site, { includeBlocks: false, includeEntities: true });
  try {
    const entity = dimension.getEntitiesAtBlockLocation(site).find(candidate => candidate.typeId === STORAGE_TYPE);
    const inventory = entity && scratchInventory(entity);
    if (!inventory) throw new Error(`Could not restore clone storage ${key}.`);
    return copySlots(inventory, size);
  } finally {
    clearScratch(dimension, site);
  }
}

function copySlots(container, size) {
  return Array.from({ length: size }, (_, slot) => container.getItem(slot));
}

export function saveCloneGear(slot, revision, player) {
  const equipment = player.getComponent(EntityComponentTypes.Equippable);
  const items = copySlots(inventoryOf(player), INVENTORY_SIZE);
  for (const slot of EQUIPMENT_SLOTS) items.push(equipment?.getEquipment(slot));
  return writeSnapshot(slot, "gear", revision, items, player);
}

export function saveCloneEnder(slot, revision, player) {
  const ender = enderOf(player);
  if (!ender) throw new Error("The simulated player's Ender Chest is unavailable.");
  return writeSnapshot(slot, "ender", revision, copySlots(ender, ENDER_SIZE), player);
}

export function restoreCloneGear(slot, revision, player) {
  const inventory = inventoryOf(player);
  const equipment = player.getComponent(EntityComponentTypes.Equippable);
  const items = readSnapshot(slot, "gear", revision, GEAR_SIZE, player);
  for (let index = 0; index < INVENTORY_SIZE; index++) inventory.setItem(index, items[index]);
  for (const [index, equipmentSlot] of EQUIPMENT_SLOTS.entries()) {
    equipment?.setEquipment(equipmentSlot, items[INVENTORY_SIZE + index]);
  }
}

export function restoreCloneEnder(slot, revision, player) {
  const ender = enderOf(player);
  if (!ender) throw new Error("The simulated player's Ender Chest is unavailable.");
  const items = readSnapshot(slot, "ender", revision, ENDER_SIZE, player);
  for (const [index, item] of items.entries()) ender.setItem(index, item);
}
