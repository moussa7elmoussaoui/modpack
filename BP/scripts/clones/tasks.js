import { choosePlanks, countItems, inventoryOf, moveItems } from "./inventory";
import { distanceSquared, RESOURCES, starterHut } from "./model";
import { clearTarget } from "./targets";
import { blockAt } from "./terrain";
import { reach, setStatus } from "./movement";
import { ensureResource, gatherPlanks, place } from "./work";

export function runCollection(player, brain, inventory, owner, order, context) {
  const resource = RESOURCES[order.resource];
  const left = order.amount - (order.delivered ?? 0);
  if (left <= 0) return { complete: `Delivered ${order.amount} ${resource.label}` };
  const held = countItems(inventory, resource.items);
  if (held >= left || (held > 0 && inventory.emptySlotsCount === 0)) {
    clearTarget(brain);
    if (distanceSquared(player.location, owner.location) > 3 ** 2) {
      setStatus(brain, "Bringing supplies back");
      const status = reach(player, brain, owner.location, 2.5);
      if (status === "blocked") return { problem: "Can't reach you to deliver the items" };
      return {};
    }
    const moved = moveItems(inventory, inventoryOf(owner), resource.items, left);
    if (!moved) return { problem: "Your inventory is full" };
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
export function runBuild(player, brain, inventory, order, context) {
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
