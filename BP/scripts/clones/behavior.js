import { system } from "@minecraft/server";
import { inventoryOf } from "./inventory";
import { distanceSquared } from "./model";
import { entityCrowding, uncrowdedSpot } from "./terrain";
import { followEntity, makeSpace, positionBeside, reach, setStatus, stopPlayerMovement } from "./movement";
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
  const recovery = recover(player, brain, inventory);
  if (recovery) return recovery === true ? {} : recovery;
  if (!order && makeSpace(player, brain, owner)) return {};
  if (order?.kind === "attack") return attackNamedTarget(player, brain, inventory, order);
  const defense = defend(player, brain, inventory, order?.kind === "defend" ? owner : undefined);
  if (defense) return defense === "blocked" ? { problem: "Can't reach a safe position around the nearby threat" } : {};
  if (!order || order.kind === "stop") {
    setStatus(brain, "Waiting");
    pickUp(player, brain, inventory, undefined, 2);
    return {};
  }
  if (order.kind === "follow" || order.kind === "defend") {
    setStatus(brain, order.kind === "follow" ? "Following" : "Guarding you");
    if (distanceSquared(player.location, owner.location) > 8 ** 2) {
      if (followEntity(player, brain, owner, 6) === "blocked") {
        return { problem: "Can't find a path back to you" };
      }
      return {};
    }

    const location = owner.location;
    const preferred = positionBeside(player, location, 3);
    const crowded = entityCrowding(player.dimension, location, player);
    const stand = uncrowdedSpot(player.dimension, preferred, crowded, {
      exclude: candidate => distanceSquared(candidate, location) > 6 ** 2,
      radius: 5
    });
    let atFollowSpot = false;
    if (stand) {
      const movement = reach(player, brain, stand, 0.6);
      if (movement === "blocked") return { problem: "Can't reach a clear spot beside you" };
      atFollowSpot = movement === "arrived";
    } else if (distanceSquared(player.location, location) > 4 ** 2) {
      if (followEntity(player, brain, owner, 4) === "blocked") {
        return { problem: "Can't find a path back to you" };
      }
    } else {
      stopPlayerMovement(player);
      setStatus(brain, "Waiting for room");
    }
    if (atFollowSpot) pickUp(player, brain, inventory, undefined, 1.25);
    return {};
  }
  if (order.kind === "stay") {
    setStatus(brain, "Holding position");
    if (distanceSquared(player.location, order.anchor) > 4 ** 2) {
      if (reach(player, brain, order.anchor, 0.6) === "blocked") return { problem: "Can't reach the requested position" };
    } else {
      stopPlayerMovement(player);
    }
    return {};
  }
  if (order.kind === "build") return runBuild(player, brain, inventory, order, context);
  return runCollection(player, brain, inventory, owner, order, context);
}
