import { system } from "@minecraft/server";
import { inventoryOf } from "./inventory";
import { distanceSquared } from "./model";
import { entityCrowding, uncrowdedSpot } from "./terrain";
import { makeSpace, positionBeside, reach, setStatus, stopPlayerMovement } from "./movement";
import { clearTarget } from "./targets";
import { attackNamedTarget, defend } from "./combat";
import { pickUp, settlePlacement } from "./work";
import { runBuild, runCollection } from "./tasks";
import { equipArmor, recover } from "./equipment";

export { newBrain, stopActions } from "./movement";
export { clearTarget };
export { tryJumpReset } from "./combat";

export function runCloneTurn(player, owner, order, brain, context) {
  const inventory = inventoryOf(player);
  if (!inventory) return { problem: "Clone inventory unavailable" };
  settlePlacement(player, brain, inventory, context);
  if (brain.nextArmorCheck === undefined || system.currentTick >= brain.nextArmorCheck) {
    equipArmor(player, inventory);
    brain.nextArmorCheck = system.currentTick + 100;
  }
  if (recover(player, brain, inventory) || makeSpace(player, brain, owner)) return {};
  if (order?.kind === "attack") return attackNamedTarget(player, brain, inventory, order);
  if (defend(player, brain, inventory, order?.kind === "defend" ? owner : undefined)) return {};
  if (!order || order.kind === "stop") {
    setStatus(brain, "Waiting");
    pickUp(player, brain, inventory, undefined, 2);
    return {};
  }
  if (order.kind === "follow" || order.kind === "defend" || order.kind === "stay") {
    const location = order.kind === "stay" ? order.anchor : owner.location;
    setStatus(brain, { follow: "Following", defend: "Guarding you", stay: "Holding position" }[order.kind]);
    if (distanceSquared(player.location, location) > 4 ** 2) {
      const preferred = order.kind === "stay" ? location : positionBeside(player, location, 3);
      const crowded = entityCrowding(player.dimension, location, player);
      const stand = uncrowdedSpot(player.dimension, preferred, crowded, {
        exclude: candidate => distanceSquared(candidate, location) > 4 ** 2
      });
      if (stand) reach(player, brain, stand, 0.6);
      else stopPlayerMovement(player);
    } else {
      stopPlayerMovement(player);
      pickUp(player, brain, inventory, undefined, 2);
    }
    return {};
  }
  if (order.kind === "build") return runBuild(player, brain, inventory, order, context);
  return runCollection(player, brain, inventory, owner, order, context);
}
