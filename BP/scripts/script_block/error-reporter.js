import { feedback, LocalizedError, translated } from "../utils/messages";

function getUserCodeStackTrace(error) {
  const stack = error?.stack;
  if (typeof stack !== "string" || stack.length === 0) return "";

  const stackLines = stack.split("\n");
  const userFrameIndexes = [];
  const evalFramePattern = /at <eval> \(<input>:[0-9]+\)/i;
  const inputFramePattern = /at <input>:[0-9]+/i;

  for (let index = 0; index < stackLines.length; index++) {
    const line = stackLines[index];
    if (evalFramePattern.test(line) || inputFramePattern.test(line)) {
      userFrameIndexes.push(index);
    }
  }

  const lastUserFrameIndex = Math.max(...userFrameIndexes);
  return "\n" + stackLines.filter((line, index) => index <= lastUserFrameIndex).join("\n");
}

export function reportError(error, isUnhandledRejection, player) {
  const stackTrace = getUserCodeStackTrace(error);

  if (player) {
    const detail = error instanceof LocalizedError ? { rawtext: [
      translated(error.localizationKey, error.localizationValues),
      { text: stackTrace }
    ] } : String(error) + stackTrace;
    player.sendMessage(feedback(isUnhandledRejection ? "script_block.error.unhandled" : "script_block.error.script", [detail], "§c"));
  } else {
    const message =
      (isUnhandledRejection ? "Unhandled promise rejection: " : "") + String(error) + stackTrace;
    console.error(`[Interpreter] ${message}`);
  }
}
