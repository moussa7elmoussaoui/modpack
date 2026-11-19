import { system, world } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";
import { openInvsee } from "../invsee/index";
import { errorFeedback, LocalizedError } from "../utils/messages";
import { answerCloneQuestion, describeCloneOrder, parseCloneQuestion } from "./dialogue";
import { blockPosition, cloneName, OVERWORLD, parseOrder, positionKey } from "./model";
import {
  activateCloneOmnitrix, assignOrder, cloneReport, collectCloneXp, isOwner, replyAsClone, requireCloneAccess, rosterFor, withCloneInventory
} from "./service";
import { findStructuresSite } from "./terrain";

const HELP = "Say “Clone 1, gather 4 logs” or “Clones, follow me”. For more options, say “Clones, help”.";
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
      player.sendMessage(`${cloneName(slot)}: ${entry.status}`);
      return;
    }
    const report = cloneReport(player, slot);
    const answer = answerCloneQuestion(question, report);
    replyAsClone(player, slot, question.includeXp ? `${answer} I have ${report.xp} XP.` : answer);
    return;
  }

  const ready = roster.filter(clone => clone.ready);
  if (!ready.length) {
    player.sendMessage("None of your clones are available to answer right now.");
    return;
  }
  const speaker = ready[0].slot;
  let answer;
  if (question.topic === "roster" && question.request.startsWith("who")) {
    answer = `You can give orders to ${ready.map(clone => cloneName(clone.slot)).join(", ")}.`;
  } else if (["roster", "status", "progress"].includes(question.topic)) {
    const assigned = ready.filter(clone => cloneReport(player, clone.slot).order).length;
    answer = `${ready.length} of us are here and ${assigned} have orders. Say "Clones, status" to see what each of us is doing.`;
  } else if (question.topic === "xp") {
    const xp = ready.reduce((total, clone) => total + cloneReport(player, clone.slot).xp, 0);
    answer = `We have ${xp} XP points between us.`;
  } else if (["hello", "thanks", "capabilities", "unknown"].includes(question.topic)) {
    answer = answerCloneQuestion(question);
  } else {
    answer = `Ask one of us by name for that. Try "${cloneName(speaker)}, ${question.request}?"`;
  }
  replyAsClone(player, speaker, answer);
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

async function handle(player, { slot, request }) {
  requireCloneAccess(player, slot);

  if (request === "help" || !request) {
    player.sendMessage(HELP);
    player.sendMessage('Ask a clone a question, like "URBAN7MC 1, what are you doing?"');
    player.sendMessage("Orders include follow, stay, defend, stop, gather, mine, and build the starter hut.");
    player.sendMessage("Other chat commands include status, inventory, ender chest, morphs, activate Omnitrix, and collect XP.");
    return;
  }
  if (request === "status") {
    if (slot !== undefined) return answerQuestion(player, slot, { topic: "status", includeXp: true });
    for (const clone of rosterFor(player)) player.sendMessage(`${cloneName(clone.slot)}: ${clone.status}`);
    return;
  }
  if (request === "collect xp" || request === "collect all xp") {
    const amount = collectCloneXp(player, slot);
    player.sendMessage(`Collected ${amount} XP.`);
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
  if (order.resource || order.kind === "build") order.anchor = workSite(player, order);
  const slots = slot === undefined
    ? rosterFor(player).filter(clone => clone.ready).map(clone => clone.slot)
    : [slot];
  if (!slots.length) throw new LocalizedError("clones.error.unavailable");
  for (const target of slots) assignOrder(player, target, order);

  const subject = slots.length > 1 ? `${slots.length} of us will` : "I'll";
  const task = describeCloneOrder(order, slots.length > 1);
  const location = order.anchor ? ` near ${positionKey(order.anchor)}` : "";
  replyAsClone(player, slots[0], `${subject} ${task}${location}.`);
}

function dispatchCloneChat(player, addressed) {
  return handle(player, addressed).catch(error => {
    if (player.isValid) player.sendMessage(errorFeedback(error));
  });
}

function onChat({ sender, message }, event) {
  if (!isOwner(sender)) return;
  const addressed = parseCloneAddress(message);
  if (!addressed) return;
  if (event) event.cancel = true;
  system.run(() => { void dispatchCloneChat(sender, addressed); });
}

if (world.beforeEvents.chatSend) {
  world.beforeEvents.chatSend.subscribe(event => onChat(event, event));
} else {
  world.afterEvents.chatSend?.subscribe(event => onChat(event));
}
