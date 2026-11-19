import { system, world } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";

const handlers = new Set();

export function registerSimulatedPlayerChatHandler(handler) {
  if (typeof handler !== "function") {
    throw new TypeError("A simulated player chat handler must be a function.");
  }
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function reportHandlerError(error) {
  console.warn(`[Simulated player chat] ${String(error?.message ?? error)}`);
}

export function simulatedPlayerChat(player, message) {
  if (!(player instanceof SimulatedPlayer)) {
    throw new TypeError("simulatedPlayerChat expects a SimulatedPlayer.");
  }
  if (!player.isValid) return false;

  const text = String(message);
  const delay = 2 + Math.floor(Math.random() * 4);
  system.runTimeout(() => {
    if (!player.isValid) return;

    world.sendMessage(`\u00a77<\u00a7f${player.name}\u00a77> \u00a7r${text}`);
    const event = { sender: player, message: text };
    for (const handler of [...handlers]) {
      try {
        const result = handler(event);
        if (result && typeof result.then === "function") result.catch(reportHandlerError);
      } catch (error) {
        reportHandlerError(error);
      }
    }
  }, delay);
  return true;
}
