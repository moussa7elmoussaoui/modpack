import { Player, world } from "@minecraft/server";
import { SCRIPT_BLOCK_TYPE_ID } from "../constants.js";
import { getCandidateScriptBlocks } from "../blocks/candidate-script-blocks.js";
import { reportError } from "../error-reporter.js";
import { executeScript } from "../script-executor.js";
import { ScriptBlockStorage } from "../script-storage.js";

export function registerPressurePlateHandler() {
  world.afterEvents.pressurePlatePush.subscribe(function ({ block, source }) {
    const candidateBlocks = getCandidateScriptBlocks(block, "pressure_plate");

    for (const candidate of candidateBlocks) {
      candidate?.typeId === SCRIPT_BLOCK_TYPE_ID &&
        executeScript(ScriptBlockStorage.fromBlock(candidate).code).catch((error) => {
          source instanceof Player && reportError(error, false, source);
        });
    }
  });
}

export function registerButtonHandler() {
  world.afterEvents.buttonPush.subscribe(function ({ block, source }) {
    const candidateBlocks = getCandidateScriptBlocks(block, "button");

    for (const candidate of candidateBlocks) {
      candidate &&
        candidate.typeId === SCRIPT_BLOCK_TYPE_ID &&
        executeScript(ScriptBlockStorage.fromBlock(candidate).code).catch((error) => {
          source instanceof Player && reportError(error, false, source);
        });
    }
  });
}

export function registerLeverHandler() {
  world.afterEvents.leverAction.subscribe(function ({ block, isPowered, player }) {
    const candidateBlocks = getCandidateScriptBlocks(block, "lever");

    for (const candidate of candidateBlocks) {
      candidate &&
        candidate.typeId === SCRIPT_BLOCK_TYPE_ID &&
        isPowered &&
        executeScript(ScriptBlockStorage.fromBlock(candidate).code).catch((error) => {
          reportError(error, false, player);
        });
    }
  });
}
