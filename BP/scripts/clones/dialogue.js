import { inventoryEntries } from "./inventory";
import { blockPosition, parseOrder, positionKey, RESOURCES } from "./model";

const TOPICS = [
  ["hello", /^(?:hi|hey|hello)(?: there)?$/],
  ["thanks", /^(?:thanks|thank you|good job|well done)(?: again)?$/],
  ["capabilities", /^(?:what can you do|what orders do you know|how can you help)$/],
  ["roster", /^(?:who(?:'s| is) (?:ready|alive)|how many (?:of you|clones) are (?:ready|alive)|are you all ready)$/],
  ["xp", /^(?:(?:how much|how many) (?:xp|experience)(?: points)?(?: do you have)?|what level are you|what(?:'s| is) your (?:xp|level))$/],
  ["health", /^(?:how are you(?: doing)?|are you (?:ok|okay|hurt|all right|alright)|what(?:'s| is) your health|how much health do you have)$/],
  ["hunger", /^(?:are you hungry|do you need food|how hungry are you)$/],
  ["location", /^(?:where are you(?: now)?|what are your coordinates|what(?:'s| is) your location)$/],
  ["ender", /^(?:what(?:'s| is) in your ender chest|what do you have in your ender chest)$/],
  ["inventory", /^(?:what(?:'s| is) in your (?:inventory|pockets)|what (?:are you carrying|do you have)|what (?:gear|tools|items) do you have)$/],
  ["omnitrix", /^(?:do you have (?:an?|your) omnitrix|is your omnitrix active|can you morph)$/],
  ["progress", /^(?:are you (?:done|finished|ready|busy)|how(?:'s| is) (?:the|your) (?:job|order|progress)(?: going)?|how much progress have you made|how far along are you)$/],
  ["status", /^(?:what are you doing(?: right now)?|what(?:'s| is) your (?:job|order|status)|why (?:did you stop|are you stuck|aren't you moving)|do you need help|are you stuck)$/]
];

export function parseCloneQuestion(request) {
  const topic = TOPICS.find(([, pattern]) => pattern.test(request))?.[0];
  if (topic) return { topic };

  const itemQuestion = /^(?:do you have (?:(?:any|an?) )?([\w ]+)|how (?:many|much) ([\w ]+) do you have)$/.exec(request);
  if (itemQuestion) {
    const item = itemQuestion[1] ?? itemQuestion[2];
    return { topic: "items", item, resource: parseOrder(`gather 1 ${item}`)?.resource, yesNo: itemQuestion[1] !== undefined };
  }
  if (/^can you (?:gather|mine|build|defend|follow|stay|stop)\b/.test(request)) {
    return { topic: "capabilities" };
  }
  if (/^(?:what|where|when|who|why|how|do|does|did|are|is|can|could|would|have)\b/.test(request)) {
    return { topic: "unknown" };
  }
}

export function describeCloneOrder(order, group = false) {
  if (order.resource) return `${order.kind} ${order.amount} ${RESOURCES[order.resource].label}`;
  return {
    follow: "follow you", stay: group ? "hold our positions" : "hold this position", defend: "guard you",
    build: "build the starter hut", stop: group ? "stop what we're doing" : "stop what I'm doing"
  }[order.kind];
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function itemName(id) {
  return id.split(":").at(-1).replaceAll("_", " ");
}

function itemCount(container, resource, name) {
  if (!container) return 0;
  return inventoryEntries(container).reduce((total, { item }) => {
    const label = itemName(item.typeId);
    const matches = RESOURCES[resource]?.items.includes(item.typeId) || [label, `${label}s`, `${label}es`].includes(name);
    return matches ? total + item.amount : total;
  }, 0);
}

function inventorySummary(container) {
  if (!container) return "I can’t read it right now.";
  const counts = new Map();
  for (const { item } of inventoryEntries(container)) {
    counts.set(item.typeId, (counts.get(item.typeId) ?? 0) + item.amount);
  }
  if (!counts.size) return "It’s empty.";
  const items = [...counts].sort((a, b) => b[1] - a[1]);
  const list = items.slice(0, 5).map(([id, count]) => `${count}× ${itemName(id)}`);
  if (items.length > list.length) list.push(`${items.length - list.length} other item types`);
  return `I have ${list.join(", ")}.`;
}

function currentActivity(report) {
  if (report.paused) return "I’m paused right now.";
  if (report.problem) return `I’m stuck. ${report.problem}.`;
  if (report.status === "Order received" && report.order) {
    return `I’m getting ready to ${describeCloneOrder(report.order)}.`;
  }
  if (report.status === "Waiting") {
    return report.recentWork ? `I’m waiting for an order. ${report.recentWork}.` : "I’m waiting for an order.";
  }
  return `I’m ${lowerFirst(report.status)}.`;
}

export function answerCloneQuestion(question, report) {
  switch (question.topic) {
    case "hello": return "Hey, URBAN7MC. What do you need?";
    case "thanks": return "Anytime.";
    case "capabilities": return "I can follow you, hold position, defend you, gather or mine materials, and build a starter hut. Give me an order whenever you’re ready.";
    case "roster": return "I’m here and ready to take orders.";
    case "xp": return `I’m level ${report.level} and have ${report.xp} XP points.`;
    case "health": {
      const health = `${Math.round(report.health)}/${Math.round(report.maxHealth)} health`;
      const hunger = report.hunger === undefined ? "" : ` and ${Math.round(report.hunger)}/20 hunger`;
      return `I have ${health}${hunger}.`;
    }
    case "hunger": {
      if (report.hunger === undefined) return "I can't tell how hungry I am right now.";
      const feeling = report.hunger <= 16 ? "I could use some food." : "I'm okay for food.";
      return `${feeling} My hunger is ${Math.round(report.hunger)}/20.`;
    }
    case "location": {
      const dimension = report.dimension.split(":").at(-1).replaceAll("_", " ");
      return `I’m at ${positionKey(blockPosition(report.location))} in the ${dimension}.`;
    }
    case "inventory": return inventorySummary(report.inventory);
    case "ender": return inventorySummary(report.enderChest);
    case "omnitrix": {
      if (report.omnitrix) return "My Omnitrix is active. I can morph.";
      if (itemCount(report.inventory, undefined, "omnitrix")) return "I'm carrying an Omnitrix. It still needs to be activated.";
      return "I don’t have an Omnitrix.";
    }
    case "items": {
      if (!report.inventory) return "I can’t read my inventory right now.";
      const count = itemCount(report.inventory, question.resource, question.item);
      const prefix = question.yesNo ? (count ? "Yes. " : "No. ") : "";
      return `${prefix}I have ${count}× ${question.item} in my inventory.`;
    }
    case "progress": {
      if (report.order?.resource) {
        const { amount, delivered = 0, resource } = report.order;
        return `${currentActivity(report)} I’ve delivered ${delivered}/${amount} ${RESOURCES[resource].label} and have ${itemCount(report.inventory, resource)} on me.`;
      }
      return currentActivity(report);
    }
    case "status": return currentActivity(report);
    default: return "I can answer questions about my orders, progress, health, location, inventory, XP, and Omnitrix.";
  }
}
