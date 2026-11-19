import { EntityComponentTypes, EquipmentSlot, ItemStack, system } from "@minecraft/server";
import {
  capacityFor, choosePlanks, countItems, craftOnce, insertStack, inventoryEntries, inventoryOf, movable,
  moveItems, neededPickaxe, recipeFor, selectItem, selectSlot, selectTool
} from "./inventory";
import { blockPosition, cloneSlot, CLONE_COUNT, distanceSquared, offset, positionKey, RESOURCES, starterHut } from "./model";
import { actionFromHere, approach, blockAt, entityCrowding, isExposed, onDangerousGround, safeNearby, uncrowdedSpot } from "./terrain";

const reservations = new Map();
const SCAN_RANGE = 20;
const SCAN_BUDGET = 105;
const SCAN_OFFSETS = buildScanOffsets();
const CRAFTING_TABLE = "minecraft:crafting_table";
const FURNACE = "minecraft:furnace";
const LIT_FURNACE = "minecraft:lit_furnace";
const IRON_INGOT = "minecraft:iron_ingot";
const COAL = "minecraft:coal";
const PICKUP_RANGE = 1.25 ** 2;
const GOOD_FOOD = [
  "cooked_beef", "cooked_porkchop", "cooked_mutton", "cooked_salmon", "cooked_chicken", "cooked_cod",
  "baked_potato", "bread", "golden_carrot", "carrot", "apple", "beetroot", "sweet_berries", "melon_slice",
  "beef", "porkchop", "mutton", "salmon", "cod", "potato"
].map(item => `minecraft:${item}`);

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

export function newBrain() {
  return { rejected: new Set(), status: "Waiting" };
}

export function stopActions(player, brain) {
  if (player?.isValid) {
    player.stopMoving();
    player.stopBreakingBlock();
    player.stopBuild();
    player.stopUsingItem();
  }
  brain.route = undefined;
  brain.spacingTarget = undefined;
  brain.eatingUntil = undefined;
  if (brain.target) brain.target.breakingSince = undefined;
}

export function clearTarget(brain) {
  if (brain.target && reservations.get(brain.target.key) === brain) reservations.delete(brain.target.key);
  brain.target = undefined;
}

function setStatus(brain, text) {
  brain.status = text;
}

function reach(player, brain, position, radius = 0.9) {
  const distance = distanceSquared(player.location, position);
  if (distance <= radius ** 2) return "arrived";
  const key = positionKey(blockPosition(position));
  const now = system.currentTick;
  if (brain.route?.key !== key) {
    brain.route = { key, distance, progress: now, issued: -Infinity };
  }
  const route = brain.route;
  if (distance + 0.5 < route.distance) {
    route.distance = distance;
    route.progress = now;
  }
  if (now - route.progress >= 100) {
    brain.route = undefined;
    return "blocked";
  }
  if (now - route.issued >= 40) {
    route.issued = now;
    if (player.isInWater && typeof player.swim === "function") {
      player.swim();
      player.moveToLocation(position);
      return "moving";
    }
    if (!player.isOnGround) return "moving";
    const path = player.navigateToLocation(position);
    if (path?.isFullPath === false && path.getPath?.().length === 0) {
      brain.route = undefined;
      return "blocked";
    }
  }
  return "moving";
}

function positionBeside(player, origin, radius) {
  const angle = ((cloneSlot(player.name) ?? 1) - 1) * (2 * Math.PI / CLONE_COUNT);
  return offset(origin, Math.round(radius * Math.cos(angle)), 0, Math.round(radius * Math.sin(angle)));
}

function makeSpace(player, brain) {
  if (!player.isOnGround) return false;
  const { dimension, location } = player;
  const crowded = entityCrowding(dimension, location, player);
  if (brain.spacingTarget && crowded(brain.spacingTarget)) stopActions(player, brain);
  if (!brain.spacingTarget) {
    if (!crowded(location)) return false;
    const failed = brain.spacingBlocked;
    const stand = uncrowdedSpot(dimension, positionBeside(player, location, 1.5), candidate => crowded(candidate, 0.8), {
      exclude: candidate => distanceSquared(candidate, location) > 3 ** 2 ||
        (failed?.until > system.currentTick && positionKey(candidate) === failed.key)
    });
    if (!stand) return false;
    stopActions(player, brain);
    brain.spacingTarget = stand;
  }

  const progress = reach(player, brain, brain.spacingTarget, 0.4);
  if (progress === "moving") {
    setStatus(brain, "Making room");
    return true;
  }
  if (progress === "blocked") {
    brain.spacingBlocked = { key: positionKey(brain.spacingTarget), until: system.currentTick + 60 };
  }
  stopActions(player, brain);
  return false;
}

function reachAction(player, brain, target, placing) {
  const visible = actionFromHere(player, target.position, placing);
  const feet = blockPosition(player.location);
  const standingInBlock = placing && feet.x === target.position.x && feet.z === target.position.z &&
    target.position.y >= feet.y && target.position.y <= feet.y + 1;
  const standingOnBlock = !placing && feet.x === target.position.x && feet.z === target.position.z &&
    target.position.y === feet.y - 1;
  if (visible && !standingInBlock && !standingOnBlock) {
    player.stopMoving();
    brain.route = undefined;
    return visible;
  }
  const crowded = entityCrowding(player.dimension, target.position, player);
  if (target.stand && crowded(target.stand)) target.stand = undefined;
  const stand = target.stand ?? approach(player, target.position, placing, target.rejectedStands, crowded);
  if (!stand || stand === "crowded") {
    player.stopMoving();
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

function reserveBlock(player, brain, position) {
  const key = `${player.dimension.id}:${positionKey(position)}`;
  const previous = reservations.get(key);
  if (previous && previous !== brain) return;
  clearTarget(brain);
  reservations.set(key, brain);
  brain.target = { key, position, rejectedStands: new Set() };
  return brain.target;
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
    if (brain.rejected.has(positionId) || reservations.has(`${player.dimension.id}:${positionId}`)) continue;
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

function pickUp(player, brain, inventory, wanted, radius) {
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

function place(player, brain, inventory, position, itemId) {
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

function settlePlacement(player, brain, inventory, context) {
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
      reservations.has(`${player.dimension.id}:${positionKey(candidate)}`)
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

function ensureResource(player, brain, inventory, order, resource, context) {
  if (resource.tier && !selectTool(player, inventory, resource)) {
    return supplyItem(player, brain, inventory, order, neededPickaxe(resource), context);
  }
  if (!resource.tier) selectTool(player, inventory, resource);
  return harvest(player, brain, inventory, order, resource);
}

function gatherPlanks(player, brain, inventory, order, context, preferred) {
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

function runCollection(player, brain, inventory, owner, order, context) {
  const resource = RESOURCES[order.resource];
  const left = order.amount - (order.delivered ?? 0);
  if (left <= 0) return { complete: `Delivered ${order.amount} ${resource.label}` };
  const held = countItems(inventory, resource.items);
  if (held >= left || (held > 0 && inventory.emptySlotsCount === 0)) {
    clearTarget(brain);
    if (distanceSquared(player.location, owner.location) > 3 ** 2) {
      setStatus(brain, "Bringing supplies back");
      const status = reach(player, brain, owner.location, 2.5);
      if (status === "blocked") return { problem: "Can't reach URBAN7MC to deliver the items" };
      return {};
    }
    const moved = moveItems(inventory, inventoryOf(owner), resource.items, left);
    if (!moved) return { problem: "URBAN7MC's inventory is full" };
    order.delivered = (order.delivered ?? 0) + moved;
    context.checkpoint();
    context.changed();
    return {};
  }
  const problem = order.resource === "planks"
    ? gatherPlanks(player, brain, inventory, order, context)
    : ensureResource(player, brain, inventory, order, resource, context);
  return { problem };
}

function runBuild(player, brain, inventory, order, context) {
  if (!order.material) {
    const material = choosePlanks(inventory);
    if (!material) return { problem: ensureResource(player, brain, inventory, order, RESOURCES.logs, context) };
    order.material = material;
    context.changed();
  }
  if (!brain.blueprint) brain.blueprint = starterHut(order.anchor, order.material);
  const type = order.material;
  const cells = brain.blueprint;
  const current = cells.find(cell => blockAt(player.dimension, cell.position)?.typeId !== type);
  if (!current) return { complete: "Starter hut finished" };
  const obstruction = cells.some(cell => {
    const block = blockAt(player.dimension, cell.position);
    return !block || (!block.isAir && block.typeId !== type);
  });
  if (obstruction) return { problem: "The hut needs a clear, loaded 5×5 area" };
  const finished = cells.findIndex(cell => cell === current);
  setStatus(brain, `Building starter hut (${finished}/${cells.length})`);
  const needed = cells.length - finished;
  const held = countItems(inventory, [type]);
  if (!held || (finished === 0 && held < Math.min(needed, 16))) {
    return { problem: gatherPlanks(player, brain, inventory, order, context, type) };
  }
  const placing = place(player, brain, inventory, current.position, type);
  if (placing === "obstructed" || placing === "blocked") return { problem: "Can't reach a supported face for the next hut block" };
  if (placing === "placed") {
    clearTarget(brain);
    context.dirty();
  }
  return {};
}

function defend(player, brain, inventory, protect) {
  const hostiles = player.dimension.getEntities({
    families: ["monster"], excludeTypes: ["minecraft:player"], location: player.location, maxDistance: protect ? 10 : 5, closest: 8
  });
  const target = hostiles.find(entity => !protect || distanceSquared(entity.location, protect.location) <= 75 ||
    distanceSquared(entity.location, player.location) <= 16);
  if (!target) return false;
  if (!protect && distanceSquared(player.location, target.location) > 3 ** 2) return false;
  const health = player.getComponent(EntityComponentTypes.Health);
  if (target.typeId === "minecraft:creeper" || (health && health.currentValue < health.effectiveMax * 0.35)) {
    const feet = blockPosition(player.location);
    const away = offset(feet, Math.sign(feet.x - target.location.x) * 5, 0, Math.sign(feet.z - target.location.z) * 5);
    const safe = safeNearby(player.dimension, away, position => distanceSquared(position, target.location) < 25);
    if (safe) {
      setStatus(brain, "Taking cover");
      player.stopBreakingBlock();
      clearTarget(brain);
      reach(player, brain, safe);
      return true;
    }
  }
  setStatus(brain, "Defending");
  player.stopBreakingBlock();
  clearTarget(brain);
  if (distanceSquared(player.location, target.location) > 3 ** 2) {
    if (!protect) return false;
    reach(player, brain, target.location, 2.5);
    return true;
  }
  player.stopMoving();
  const weapon = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId.endsWith("_sword"));
  if (weapon) selectSlot(player, inventory, weapon.slot);
  player.lookAtEntity(target);
  if (player.getEntitiesFromViewDirection({ maxDistance: 3.4 }).some(hit => hit.entity.id === target.id)) player.attack();
  return true;
}

function recover(player, brain, inventory) {
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
  player.stopMoving();
  if (!player.useItemInSlot(player.selectedSlotIndex)) return false;
  brain.eatingUntil = system.currentTick + 36;
  setStatus(brain, "Eating");
  return true;
}

function equipArmor(player, inventory) {
  const equipment = player.getComponent(EntityComponentTypes.Equippable);
  const pieces = [[EquipmentSlot.Head, "_helmet"], [EquipmentSlot.Chest, "_chestplate"],
    [EquipmentSlot.Legs, "_leggings"], [EquipmentSlot.Feet, "_boots"]];
  for (const [slot, suffix] of pieces) {
    if (equipment?.getEquipment(slot)) continue;
    const gear = inventoryEntries(inventory).find(({ item }) => movable(item) && item.typeId.endsWith(suffix));
    if (gear && equipment?.setEquipment(slot, gear.item)) inventory.setItem(gear.slot, undefined);
  }
}

export function runCloneTurn(player, owner, order, brain, context) {
  const inventory = inventoryOf(player);
  if (!inventory) return { problem: "Clone inventory unavailable" };
  settlePlacement(player, brain, inventory, context);
  if (brain.nextArmorCheck === undefined || system.currentTick >= brain.nextArmorCheck) {
    equipArmor(player, inventory);
    brain.nextArmorCheck = system.currentTick + 100;
  }
  if (recover(player, brain, inventory) || makeSpace(player, brain) || defend(player, brain, inventory, order?.kind === "defend" ? owner : undefined)) return {};
  if (!order || order.kind === "stop") {
    setStatus(brain, "Waiting");
    pickUp(player, brain, inventory, undefined, 2);
    return {};
  }
  if (order.kind === "follow" || order.kind === "defend" || order.kind === "stay") {
    const location = order.kind === "stay" ? order.anchor : owner.location;
    setStatus(brain, { follow: "Following", defend: "Guarding URBAN7MC", stay: "Holding position" }[order.kind]);
    if (distanceSquared(player.location, location) > 4 ** 2) {
      const preferred = order.kind === "stay" ? location : positionBeside(player, location, 3);
      const crowded = entityCrowding(player.dimension, location, player);
      const stand = uncrowdedSpot(player.dimension, preferred, crowded, {
        exclude: candidate => distanceSquared(candidate, location) > 4 ** 2
      });
      if (stand) reach(player, brain, stand, 0.6);
      else player.stopMoving();
    } else {
      player.stopMoving();
      pickUp(player, brain, inventory, undefined, 2);
    }
    return {};
  }
  if (order.kind === "build") return runBuild(player, brain, inventory, order, context);
  return runCollection(player, brain, inventory, owner, order, context);
}
