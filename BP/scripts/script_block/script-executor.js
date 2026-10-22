import * as timers from "./timers.js";
import * as util from "./utils/inspect.js";
import * as vanillaData from "./vanilla-data/index.js";
import { reportError } from "./error-reporter.js";
import { scriptJson } from "./utils/script-json.js";

const OPTIONAL_MODULE_LOADERS = [
  () => import("@minecraft/server-gametest"),
  () => import("@minecraft/server-editor-bindings"),
  () => import("@minecraft/server-editor-private-bindings"),
  () => import("@minecraft/server-editor"),
  () => import("@minecraft/server-net"),
  () => import("@minecraft/server-admin"),
  () => import("@minecraft/debug-utilities"),
  () => import("@minecraft/diagnostics"),
  () => import("@minecraft/server-graphics"),
];

async function buildScriptScope() {
  const scope = {
    ...timers,
    util,
    ...vanillaData,
    ...(await import("@minecraft/common")),
    ...(await import("@minecraft/server")),
    ...(await import("@minecraft/server-ui")),
  };

  for (const loadModule of OPTIONAL_MODULE_LOADERS) {
    try {
      Object.assign(scope, await loadModule());
    } catch {}
  }

  return { ...scope, JSON: scriptJson };
}

export async function executeScript(code, player) {
  const scope = await buildScriptScope();

  const result = new Function(
    `{${Object.keys(scope).join(",")}}`,
    `return (() => eval(${JSON.stringify(code)}));`,
  )(scope)();

  if (!(result instanceof Promise)) return result;

  result.catch((error) => {
    reportError(error, true, player);
  });
}
