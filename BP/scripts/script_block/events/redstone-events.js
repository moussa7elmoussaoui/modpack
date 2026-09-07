import { Player, world } from "@minecraft/server";
import { SCRIPT_BLOCK_TYPE_ID } from "../constants.js";
import { getCandidateScriptBlocks } from "../blocks/candidate-script-blocks.js";
import { reportError } from "../error-reporter.js";
import { executeScript } from "../script-executor.js";
import { ScriptBlockStorage } from "../script-storage.js";

function executeCandidateScripts(block, deviceType, player) {
  for (const candidate of getCandidateScriptBlocks(block, deviceType)) {
    if (candidate?.typeId !== SCRIPT_BLOCK_TYPE_ID) continue;

    executeScript(ScriptBlockStorage.fromBlock(candidate).code, player).catch((error) => {
      reportError(error, false, player);
    });
  }
}

export function registerPressurePlateHandler() {
  world.afterEvents.pressurePlatePush.subscribe(function ({ block, source }) {
    executeCandidateScripts(block, "pressure_plate", source instanceof Player ? source : undefined);
  });
}

export function registerButtonHandler() {
  world.afterEvents.buttonPush.subscribe(function ({ block, source }) {
    executeCandidateScripts(block, "button", source instanceof Player ? source : undefined);
  });
}

export function registerLeverHandler() {
  world.afterEvents.leverAction.subscribe(function ({ block, isPowered, player }) {
    if (!isPowered) return;

    executeCandidateScripts(block, "lever", player);
  });
}
