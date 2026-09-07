import { system } from "@minecraft/server";

const timerRegistry = new Map();

class ScriptTimer {
  constructor(handler, isRepeating, delayMs = 0) {
    if (typeof handler !== "function") {
      throw new TypeError("Handler must be a function");
    }
    if (typeof delayMs !== "number" || delayMs < 0) {
      throw new TypeError("Timeout must be a non-negative number");
    }
    if (typeof isRepeating !== "boolean") {
      throw new TypeError("Repeat must be a boolean");
    }

    this.handler = handler;
    this.delayMs = delayMs;
    this.isRepeating = isRepeating;
    this.nextRunTime = Date.now() + delayMs;
    this.isCancelled = false;
    this.id = this.startJob();
    timerRegistry.set(this.id, this);
  }

  startJob() {
    return system.runJob(this.runLoop());
  }

  *runLoop() {
    while (!this.isCancelled) {
      if (Date.now() >= this.nextRunTime) {
        try {
          yield this.handler();
        } catch (error) {
          console.error(error instanceof Error ? error : "Error: " + error);
        }

        if (this.isRepeating) {
          this.nextRunTime += this.delayMs;
        } else {
          this.cancel();
        }
      } else {
        yield;
      }
    }
  }

  cancel() {
    this.isCancelled = true;
    system.clearJob(this.id);
    timerRegistry.delete(this.id);
  }
}

export function setInterval(handler, delayMs) {
  return new ScriptTimer(handler, true, delayMs).id;
}

export function setTimeout(handler, delayMs) {
  return new ScriptTimer(handler, false, delayMs).id;
}

export function clearInterval(timerId) {
  const timer = timerRegistry.get(timerId);
  if (timer?.isRepeating === true) timer.cancel();
}

export function clearTimeout(timerId) {
  const timer = timerRegistry.get(timerId);
  if (timer?.isRepeating === false) timer.cancel();
}
