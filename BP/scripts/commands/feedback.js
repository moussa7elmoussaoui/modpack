import { CustomCommandStatus, Player, world } from "@minecraft/server";
import { errorFeedback, feedback } from "../utils/messages";

function commandResult(origin, status, message, fallback) {
  const recipient = origin.sourceEntity instanceof Player ? origin.sourceEntity : origin.initiator;
  if (recipient instanceof Player && recipient.isValid) {
    if (status !== CustomCommandStatus.Success || world.gameRules.sendCommandFeedback) {
      recipient.sendMessage(message);
    }
    return { status };
  }
  return { status, message: fallback };
}

export function commandFeedback(origin, status, key) {
  const color = status === CustomCommandStatus.Failure ? "§c" : "§7";
  return commandResult(origin, status, feedback(key, [], color), key);
}

export function commandError(origin, error) {
  return commandResult(origin, CustomCommandStatus.Failure, errorFeedback(error), error?.message ?? String(error));
}
