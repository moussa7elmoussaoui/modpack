import { ItemStack, system } from "@minecraft/server";
import {
  capacityFor, choosePlanks, countItems, craftOnce, insertStack, inventoryEntries, movable,
  moveItems, neededPickaxe, recipeFor, selectItem, selectTool
} from "./inventory";
import { blockPosition, distanceSquared, offset, positionKey, RESOURCES } from "./model";
import { clearTarget, isReserved, reserveBlock } from "./targets";
import { actionFromHere, approach, blockAt, entityCrowding, isExposed, safeNearby } from "./terrain";
import { reach, setStatus, stopPlayerMovement } from "./movement";

const SCAN_RANGE = 20;
const SCAN_BUDGET = 105;
const SCAN_OFFSETS = buildScanOffsets();
const CRAFTING_TABLE = "minecraft:crafting_table";
const FURNACE = "minecraft:furnace";
const LIT_FURNACE = "minecraft:lit_furnace";
const IRON_INGOT = "minecraft:iron_ingot";
const COAL = "minecraft:coal";
const PICKUP_RANGE = 1.25 ** 2;

function buildScanOffsets() {
  const positions = [];
  for (let x = -SCAN_RANGE; x <= SCAN_RANGE; x++) {
    for (let z = -SCAN_RANGE; z <= SCAN_RANGE; z++) {
      for (let y = -6; y <= 6; y++) {
        const distance = x * x + z * z + y * y * 2;
        if (distance <= SCAN_RANGE ** 2) positions.push({ x, y, z, distance });
      }
    }
  }
  return positions.sort((a, b) => a.distance - b.distance);
}

function reachAction(player, brain, target, placing) {
  const visible = actionFromHere(player, target.position, placing);
  const feet = blockPosition(player.location);
  const standingInBlock = placing && feet.x === target.position.x && feet.z === target.position.z &&
    target.position.y >= feet.y && target.position.y <= feet.y + 1;
  const standingOnBlock = !placing && feet.x === target.position.x && feet.z === target.position.z &&
    target.position.y === feet.y - 1;
  if (visible && !standingInBlock && !standingOnBlock) {
    stopPlayerMovement(player);
    brain.route = undefined;
    return visible;
  }
  const crowded = entityCrowding(player.dimension, target.position, player);
  if (target.stand && crowded(target.stand)) target.stand = undefined;
  const stand = target.stand ?? approach(player, target.position, placing, target.rejectedStands, crowded);
  if (!stand || stand === "crowded") {
    stopPlayerMovement(player);
    brain.route = undefined;
    return stand ? "moving" : "blocked";
  }
  target.stand = stand;
  const progress = reach(player, brain, stand);
  if (progress !== "moving") {
    target.rejectedStands.add(positionKey(blockPosition(target.stand)));
    target.stand = undefined;
    if (target.rejectedStands.size >= 5) return "blocked";
  }
  return "moving";
}

function findResource(player, brain, origin, resource) {
  const key = `${resource.blocks.join(",")}:${positionKey(origin)}`;
  if (brain.scan?.key !== key) brain.scan = { key, index: 0 };
  for (let n = 0; n < SCAN_BUDGET; n++) {
    const delta = SCAN_OFFSETS[brain.scan.index++];
    if (!delta) {
      brain.scan = undefined;
      return "exhausted";
    }
    const position = offset(origin, delta.x, delta.y, delta.z);
    const positionId = positionKey(position);
    if (brain.rejected.has(positionId) || isReserved(player.dimension, position)) continue;
    const block = blockAt(player.dimension, position);
    if (!resource.blocks.includes(block?.typeId) || !isExposed(player.dimension, position)) continue;
    return reserveBlock(player, brain, position);
  }
}

function nearbyDrop(player, wanted, radius) {
  const items = player.dimension.getEntities({ type: "minecraft:item", location: player.location, maxDistance: radius, closest: 12 });
  for (const entity of items) {
    const item = entity.getComponent("minecraft:item")?.itemStack;
    if (item && (!wanted || wanted.includes(item.typeId))) return { entity, item };
  }
}

export function pickUp(player, brain, inventory, wanted, radius) {
  const drop = nearbyDrop(player, wanted, radius);
  if (!drop || capacityFor(inventory, drop.item) < drop.item.amount) return false;
  const location = drop.entity.location;
  if (distanceSquared(player.location, location) <= PICKUP_RANGE) {
    if (brain.nearDropId !== drop.entity.id) {
      brain.nearDropId = drop.entity.id;
      return true;
    }
    const undo = insertStack(inventory, drop.item);
    try {
      drop.entity.remove();
    } catch (error) {
      undo();
      throw error;
    }
    return true;
  }
  brain.nearDropId = undefined;
  const stand = safeNearby(player.dimension, location);
  if (stand) return reach(player, brain, stand) === "moving";
  return false;
}

function harvest(player, brain, inventory, order, resource) {
  const origin = order.anchor;
  const resourceKey = resource.blocks.join(",");
  if (brain.target && brain.target.resourceKey !== resourceKey) {
    player.stopBreakingBlock();
    clearTarget(brain);
  }
  const previous = brain.target;
  if (previous?.breakingSince !== undefined) {
    const block = blockAt(player.dimension, previous.position);
    if (block && !resource.blocks.includes(block.typeId)) {
      player.stopBreakingBlock();
      clearTarget(brain);
      brain.pickupUntil = system.currentTick + 50;
      brain.scan = undefined;
    }
  }
  if (brain.pickupUntil > system.currentTick) {
    setStatus(brain, "Collecting drops");
    if (pickUp(player, brain, inventory, resource.items, 6)) return;
    if (brain.pickupUntil - system.currentTick >= 30) return;
    brain.pickupUntil = undefined;
  }
  if (pickUp(player, brain, inventory, resource.items, 2.75)) return;
  if (capacityFor(inventory, new ItemStack(resource.items[0], 1)) === 0) {
    return "Inventory full";
  }

  const target = brain.target ?? findResource(player, brain, origin, resource);
  if (target === "exhausted") {
    brain.rejected.clear();
    return `Can't find reachable ${resource.label} near the marked spot`;
  }
  if (!target) {
    setStatus(brain, `Looking for ${resource.label}`);
    return;
  }
  target.resourceKey = resourceKey;
  const block = blockAt(player.dimension, target.position);
  if (!resource.blocks.includes(block?.typeId)) {
    clearTarget(brain);
    return;
  }
  const action = reachAction(player, brain, target, false);
  if (action === "blocked" || (target.breakingSince !== undefined && system.currentTick - target.breakingSince > 240)) {
    player.stopBreakingBlock();
    brain.rejected.add(positionKey(target.position));
    clearTarget(brain);
    return;
  }
  if (action === "moving") {
    setStatus(brain, `Walking to ${resource.label}`);
    return;
  }
  setStatus(brain, `Mining ${resource.label}`);
  if (target.breakingSince === undefined) {
    player.lookAtLocation(action.aim);
    if (player.breakBlock(target.position, action.hit.face)) {
      target.breakingSince = system.currentTick;
    } else {
      brain.rejected.add(positionKey(target.position));
      clearTarget(brain);
    }
  }
}

export function place(player, brain, inventory, position, itemId) {
  const block = blockAt(player.dimension, position);
  if (block?.typeId === itemId || (itemId === FURNACE && block?.typeId === LIT_FURNACE)) return "placed";
  if (!block?.isAir) return "obstructed";
  const target = brain.target?.placing && positionKey(brain.target.position) === positionKey(position)
    ? brain.target : reserveBlock(player, brain, position);
  if (!target) return "reserved";
  target.placing = true;
  target.itemId = itemId;
  const action = reachAction(player, brain, target, true);
  if (action === "moving" || action === "blocked") return action;
  const slot = selectItem(player, inventory, itemId);
  if (slot === undefined) return "missing";
  if (target.lastUse !== undefined && system.currentTick - target.lastUse < 12) return "moving";
  target.attempts = (target.attempts ?? 0) + 1;
  if (target.attempts > 4) return "blocked";
  target.lastUse = system.currentTick;
  const before = countItems(inventory, [itemId]);
  player.lookAtLocation(action.aim);
  if (player.useItemInSlotOnBlock(slot, action.hit.block.location, action.hit.face, action.hit.faceLocation)) {
    target.prePlacementCount = before;
  }
  return "moving";
}

export function settlePlacement(player, brain, inventory, context) {
  const target = brain.target;
  if (!target?.placing || target.prePlacementCount === undefined) return;
  const placed = blockAt(player.dimension, target.position)?.typeId === target.itemId;
  if (!placed) return;
  if (countItems(inventory, [target.itemId]) >= target.prePlacementCount) {
    const entry = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId === target.itemId);
    if (entry) {
      if (entry.item.amount === 1) inventory.setItem(entry.slot, undefined);
      else {
        entry.item.amount--;
        inventory.setItem(entry.slot, entry.item);
      }
    }
  }
  clearTarget(brain);
  context.dirty();
}

function workAreaContains(order, location) {
  return distanceSquared(order.anchor, location) <= (SCAN_RANGE + 8) ** 2;
}

function nearBlueprint(order, position) {
  return order.kind === "build" && position.x >= order.anchor.x - 1 && position.x <= order.anchor.x + 5 &&
    position.z >= order.anchor.z - 1 && position.z <= order.anchor.z + 5;
}

function station(player, brain, inventory, order, itemId, context) {
  order.stations ??= {};
  let position = order.stations[itemId];
  const nearby = position && blockAt(player.dimension, position);
  const exists = nearby?.typeId === itemId || (itemId === FURNACE && nearby?.typeId === LIT_FURNACE);
  if (exists) {
    const visible = actionFromHere(player, position, false);
    if (visible) {
      return { ready: true, position };
    }
    const key = positionKey(position);
    brain.stationStand ??= {};
    const stand = brain.stationStand[key] ??= approach(player, position, false, brain.rejected);
    if (!stand || reach(player, brain, stand) === "blocked") return { problem: `Can't reach the ${itemId.slice(10).replaceAll("_", " ")}` };
    setStatus(brain, "Walking to workstation");
    return {};
  }
  if (countItems(inventory, [itemId]) < 1) {
    return { problem: supplyItem(player, brain, inventory, order, itemId, context) };
  }
  if (!position || !blockAt(player.dimension, position)?.isAir) {
    const site = safeNearby(player.dimension, player.location, candidate =>
      nearBlueprint(order, candidate) || !workAreaContains(order, candidate) ||
      distanceSquared(candidate, player.location) < 2 ||
      Object.values(order.stations).some(used => positionKey(used) === positionKey(candidate)) ||
      isReserved(player.dimension, candidate)
    );
    if (!site) return { problem: "Need an open spot for a workstation" };
    position = blockPosition(site);
    order.stations[itemId] = position;
    context.changed();
  }
  setStatus(brain, "Setting up a workstation");
  const result = place(player, brain, inventory, position, itemId);
  if (result === "blocked" || result === "obstructed") {
    delete order.stations[itemId];
    context.changed();
    return { problem: "Can't place the workstation here" };
  }
  return {};
}

export function ensureResource(player, brain, inventory, order, resource, context) {
  if (resource.tier && !selectTool(player, inventory, resource)) {
    return supplyItem(player, brain, inventory, order, neededPickaxe(resource), context);
  }
  if (!resource.tier) selectTool(player, inventory, resource);
  return harvest(player, brain, inventory, order, resource);
}

export function gatherPlanks(player, brain, inventory, order, context, preferred) {
  const planks = choosePlanks(inventory, preferred);
  if (planks) return supplyItem(player, brain, inventory, order, planks, context, countItems(inventory, [planks]) + 1);
  return ensureResource(player, brain, inventory, order, RESOURCES.logs, context);
}

function supplyItem(player, brain, inventory, order, itemId, context, amount = 1) {
  if (countItems(inventory, [itemId]) >= amount) return;
  if (itemId === IRON_INGOT) return smeltIron(player, brain, inventory, order, context);
  const recipe = recipeFor(itemId);
  if (!recipe) return `Can't make ${itemId}`;
  for (const [ingredients, count] of recipe.inputs) {
    if (countItems(inventory, ingredients) >= count) continue;
    if (ingredients === RESOURCES.planks.items) return gatherPlanks(player, brain, inventory, order, context);
    if (ingredients.includes("minecraft:cobblestone")) {
      return ensureResource(player, brain, inventory, order, RESOURCES.cobblestone, context);
    }
    if (RESOURCES.logs.items.includes(ingredients[0])) {
      const id = ingredients[0];
      return ensureResource(player, brain, inventory, order, { label: id.slice(10), blocks: [id], items: [id] }, context);
    }
    return supplyItem(player, brain, inventory, order, ingredients[0], context, count);
  }
  if (recipe.table) {
    const table = station(player, brain, inventory, order, CRAFTING_TABLE, context);
    if (!table.ready) return table.problem;
  }
  clearTarget(brain);
  setStatus(brain, `Crafting ${itemId.slice(10).replaceAll("_", " ")}`);
  if (!craftOnce(inventory, itemId, recipe)) return "Inventory full";
  context.dirty();
}

function smeltIron(player, brain, inventory, order, context) {
  const site = order.stations?.[FURNACE];
  const prior = site && blockAt(player.dimension, site);
  const priorContainer = prior?.getComponent("minecraft:inventory")?.container;
  const existing = priorContainer?.getItem(0);
  const waiting = priorContainer?.getItem(2) || (existing &&
    (priorContainer.getItem(1) || prior.typeId === LIT_FURNACE));
  if (priorContainer && !waiting) {
    if (!existing && countItems(inventory, RESOURCES.iron.items) < 1) {
      return ensureResource(player, brain, inventory, order, RESOURCES.iron, context);
    }
    if (!priorContainer.getItem(1) && countItems(inventory, [COAL, ...RESOURCES.planks.items]) < 1) {
      return gatherPlanks(player, brain, inventory, order, context);
    }
  }
  const furnace = station(player, brain, inventory, order, FURNACE, context);
  if (!furnace.ready) return furnace.problem;
  const container = blockAt(player.dimension, furnace.position)?.getComponent("minecraft:inventory")?.container;
  if (!container || container.size < 3) return "This Bedrock build doesn't expose the furnace inventory";
  const output = container.getItem(2);
  if (output?.typeId === IRON_INGOT && capacityFor(inventory, output) >= output.amount) {
    moveItems(container, inventory, [IRON_INGOT], output.amount);
    context.dirty();
    return;
  }
  if (output) return "Clear the furnace output or make room in the clone's inventory";
  const input = container.getItem(0);
  if (input?.typeId === "minecraft:raw_iron") {
    setStatus(brain, "Smelting iron");
    if (container.getItem(1) || blockAt(player.dimension, furnace.position)?.typeId === LIT_FURNACE) return;
  } else if (input) {
    return "The furnace already has something in it";
  }
  if (!input && countItems(inventory, RESOURCES.iron.items) < 1) {
    return ensureResource(player, brain, inventory, order, RESOURCES.iron, context);
  }
  let fuel = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId === COAL);
  fuel ??= inventoryEntries(inventory).find(({ item }) => movable(item) && RESOURCES.planks.items.includes(item.typeId));
  if (!container.getItem(1) && !fuel) return gatherPlanks(player, brain, inventory, order, context);
  if (!container.getItem(1)) moveOneTo(inventory, fuel, container, 1);
  if (!input) {
    const raw = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId === "minecraft:raw_iron");
    moveOneTo(inventory, raw, container, 0);
  }
  setStatus(brain, "Smelting iron");
  context.dirty();
}

function moveOneTo(inventory, entry, target, slot) {
  const stack = entry.item.clone();
  stack.amount = 1;
  const original = entry.item.clone();
  if (entry.item.amount === 1) inventory.setItem(entry.slot, undefined);
  else {
    entry.item.amount -= 1;
    inventory.setItem(entry.slot, entry.item);
  }
  try {
    target.setItem(slot, stack);
  } catch (error) {
    inventory.setItem(entry.slot, original);
    throw error;
  }
}
