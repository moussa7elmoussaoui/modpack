function getUserCodeStackTrace(error) {
  if (!error.stack) return "";

  const stackLines = error.stack.split("\n");
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
  const message =
    (isUnhandledRejection ? "Unhandled promise rejection: " : "") + String(error + stackTrace);

  if (player) {
    player.sendMessage(`§c${message}`);
  } else {
    console.error(`[Interpreter] ${message}`);
  }
}
