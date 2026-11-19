import { system, world } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";
import { openInvsee } from "../invsee/index";
import { LocalizedError } from "../utils/messages";
import { registerSimulatedPlayerChatHandler } from "../utils/simulated-player-chat.js";
import { answerCloneQuestion, describeCloneOrder, parseCloneQuestion } from "./dialogue";
import {
  ATTACK_TARGET_RANGE, blockPosition, distanceSquared, entityTargetName, matchesAttackTarget, OVERWORLD, parseOrder, positionKey
} from "./model";
import {
  activateCloneOmnitrix, assignOrder, cloneReport, collectCloneXp, isOwner, replyAsClone, requireCloneAccess, rosterFor, withCloneInventory
} from "./service";
import { findStructuresSite } from "./terrain";

const VIEWS = new Map([
  ["inventory", "inventory"], ["ender chest", "enderchest"], ["enderchest", "enderchest"],
  ["morphs", "omnitrix"], ["morph menu", "omnitrix"], ["omnitrix", "omnitrix"]
]);

export function parseCloneAddress(message) {
  const text = message.trim();
  if (/^clones$/i.test(text)) return { request: "help" };
  const leading = /^(?:clones|(?:clone|urban7mc)\s+(\d+))\s*[:,]\s*(.*)$/i.exec(text);
  const trailing = leading ? undefined : /^(.+?)\s*,\s*(?:clones|(?:clone|urban7mc)\s+(\d+))[.!?]*$/i.exec(text);
  if (!leading && !trailing) return;
  const target = leading ? leading[1] : trailing[2];
  const command = leading ? leading[2] : trailing[1];
  return {
    slot: target === undefined ? undefined : Number(target),
    request: command.trim().toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[.!?]+$/, "").replace(/\s+/g, " ")
  };
}

function answerQuestion(player, slot, question) {
  const roster = rosterFor(player);
  if (slot !== undefined) {
    const entry = roster[slot - 1];
    if (!entry.ready) {
      replyFromAvailableClone(player, `Clone ${slot}: ${entry.status}`);
      return;
    }
    const report = cloneReport(player, slot);
    const answer = answerCloneQuestion(question, report);
    replyAsClone(player, slot, question.includeXp ? `${answer} I have ${report.xp} XP.` : answer);
    return;
  }

  const ready = roster.filter(clone => clone.ready);
  if (!ready.length) {
    return;
  }
  const speaker = Math.min(...ready.map(clone => clone.slot));
  let answer;
  if (question.topic === "roster" && question.request.startsWith("who")) {
    answer = "You can give orders to each of us.";
  } else if (["roster", "status", "progress"].includes(question.topic)) {
    const assigned = ready.filter(clone => cloneReport(player, clone.slot).order).length;
    answer = `${ready.length} of us are here and ${assigned} have orders. Say "Clones, status" to see what each of us is doing.`;
  } else if (question.topic === "xp") {
    const xp = ready.reduce((total, clone) => total + cloneReport(player, clone.slot).xp, 0);
    answer = `We have ${xp} XP points between us.`;
  } else if (["hello", "thanks", "capabilities", "unknown"].includes(question.topic)) {
    answer = answerCloneQuestion(question);
  } else {
    answer = `Ask one of us by name for that. Try "Clone ${speaker}, ${question.request}?"`;
  }
  replyAsClone(player, speaker, answer);
}

function replyFromAvailableClone(player, message) {
  const speaker = rosterFor(player).find(clone => clone.ready);
  if (speaker) replyAsClone(player, speaker.slot, message);
}

function genericReply(player) {
  const speaker = rosterFor(player).find(clone => clone.ready);
  if (!speaker) return;
  const replies = ["I'm here. What do you need?", "I heard you. Give me an order whenever you're ready.", "Right, I'm listening.", "Need anything from me?"];
  replyAsClone(player, speaker.slot, replies[Math.floor(Math.random() * replies.length)]);
}

function cloneErrorMessage(error) {
  const messages = {
    "clones.error.owner": "Only the clone owner can access the clones.",
    "clones.error.locked": "Reach level %s in your original form to unlock %s.",
    "clones.error.unavailable": "This clone is unavailable.",
    "clones.error.overworld": "Give orders to your clones in the Overworld.",
    "clones.error.omnitrix": "Put an unbound Omnitrix in this clone's inventory first.",
    "clones.error.inventory": "Make room in the clone's hotbar.",
    "clones.error.busy": "This clone already has an InvSee session open.",
    "clones.error.order": "I didn't understand that order.",
    "clones.error.site": "Aim at the top of the northwest corner of a clear building site before giving the build order.",
    "clones.error.number": "Choose a clone numbered 1 to 10.",
    "clones.error.target": "Choose a single clone.",
    "clones.error.viewer": "Opening an InvSee screen requires a connected client."
  };
  let message = messages[error?.localizationKey] ?? "Sorry, something went wrong.";
  for (const value of error?.localizationValues ?? []) message = message.replace("%s", String(value));
  return message;
}

function workSite(player, order) {
  if (player.dimension.id !== OVERWORLD) throw new LocalizedError("clones.error.overworld");
  if (order.kind === "build") {
    const anchor = findStructuresSite(player);
    if (!anchor) throw new LocalizedError("clones.error.site");
    return anchor;
  }
  const hit = player.getBlockFromViewDirection({ maxDistance: 24 });
  return hit?.block.location ?? blockPosition(player.location);
}

function nearbyAttackTargets(player, order) {
  return player.dimension.getEntities({ location: player.location, maxDistance: ATTACK_TARGET_RANGE })
    .filter(entity => matchesAttackTarget(entity, order))
    .sort((a, b) => distanceSquared(a.location, player.location) - distanceSquared(b.location, player.location));
}

async function handle(player, { slot, request }) {
  if (request === "help" || !request) {
    genericReply(player);
    return;
  }
  requireCloneAccess(player, slot);
  if (request === "status") {
    if (slot !== undefined) return answerQuestion(player, slot, { topic: "status", includeXp: true });
    const statuses = rosterFor(player).map(clone => `Clone ${clone.slot}: ${clone.status}`).join("; ");
    replyFromAvailableClone(player, statuses);
    return;
  }
  if (request === "collect xp" || request === "collect all xp") {
    const amount = collectCloneXp(player, slot);
    replyFromAvailableClone(player, `Collected ${amount} XP.`);
    return;
  }

  const view = VIEWS.get(request.replace(/^(?:open|show)(?: me)?\s+/, ""));
  if (view || request === "activate omnitrix") {
    if (slot === undefined) throw new LocalizedError("clones.error.target");
    if (!view) {
      activateCloneOmnitrix(player, slot);
      replyAsClone(player, slot, "I activated my Omnitrix.");
      return;
    }
    if (player instanceof SimulatedPlayer) throw new LocalizedError("clones.error.viewer");
    await withCloneInventory(player, slot, clone => openInvsee(player, clone, view));
    return;
  }

  const order = parseOrder(request);
  if (!order) {
    const question = parseCloneQuestion(request);
    if (!question) throw new LocalizedError("clones.error.order");
    return answerQuestion(player, slot, { ...question, request });
  }
  if (slot === undefined && order.kind === "build") throw new LocalizedError("clones.error.target");
  if (order.kind === "attack") {
    if (player.dimension.id !== OVERWORLD) throw new LocalizedError("clones.error.overworld");
    const targets = nearbyAttackTargets(player, order);
    if (!targets.length) {
      const description = order.targetTypeId
        ? `No nearby entity of type "${order.targetName}" was found`
        : `No nearby entity or player named "${order.targetName}" was found`;
      replyFromAvailableClone(player, `${description} within ${ATTACK_TARGET_RANGE} blocks.`);
      return;
    }
    order.targetIds = targets.map(target => target.id);
    order.targetId = targets[0].id;
    if (!order.targetTypeId) order.targetName = entityTargetName(targets[0]);
  }
  if (order.resource || order.kind === "build") order.anchor = workSite(player, order);
  const slots = slot === undefined
    ? rosterFor(player).filter(clone => clone.ready).map(clone => clone.slot)
    : [slot];
  if (!slots.length) throw new LocalizedError("clones.error.unavailable");
  for (const target of slots) assignOrder(player, target, order);

  const speaker = Math.min(...slots);
  const subject = slots.length > 1 ? `${slots.length} of us will` : "I'll";
  const task = describeCloneOrder(order, slots.length > 1);
  const location = order.anchor ? ` near ${positionKey(order.anchor)}` : "";
  replyAsClone(player, speaker, `${subject} ${task}${location}.`);
}

function dispatchCloneChat(player, addressed) {
  return handle(player, addressed).catch(error => {
    if (player.isValid) replyFromAvailableClone(player, cloneErrorMessage(error));
  });
}

function processOwnerChat({ sender, message }) {
  if (!isOwner(sender)) return;
  const addressed = parseCloneAddress(message);
  void dispatchCloneChat(sender, addressed ?? { request: "help" });
}

registerSimulatedPlayerChatHandler(processOwnerChat);

function onChat({ sender, message }) {
  if (!isOwner(sender)) return;
  system.run(() => processOwnerChat({ sender, message }));
}

if (world.beforeEvents.chatSend) {
  world.beforeEvents.chatSend.subscribe(event => onChat(event));
} else {
  world.afterEvents.chatSend?.subscribe(event => onChat(event));
}
