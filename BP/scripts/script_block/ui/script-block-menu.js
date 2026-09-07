import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ScriptBlockStorage } from "../script-storage.js";
import { escapeViewerText, highlightCode } from "../syntax-highlighter.js";
import { formatCode } from "../code-formatter.js";
import { reportError } from "../error-reporter.js";
import { LocalizedError, translated } from "../../utils/messages";

export function showCodeEditor(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const form = new ModalFormData();

  form.title("script_block.menu.title");
  form.textField(translated("script_block.code.label"), translated("script_block.code.placeholder"), { defaultValue: storage.code });
  form.submitButton(translated("script_block.save"));

  return form
    .show(player)
    .then((response) => {
      if (response.canceled || !response.formValues) return;

      const [code] = response.formValues;
      storage.write(code);
      return showScriptBlockMenu(block, player);
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}

export function confirmClearCode(block, player) {
  return new ActionFormData()
    .title("script_block.clear.title")
    .body(translated("script_block.clear.body"))
    .button(translated("gui.clear"))
    .button(translated("gui.cancel"))
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        ScriptBlockStorage.fromBlock(block).remove();
        return showScriptBlockMenu(block, player);
      } else if (response.selection === 1) {
        return showScriptBlockMenu(block, player);
      }
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}

function showFormatResult(block, player, message) {
  return new ActionFormData()
    .title("script_block.format.title")
    .body(message)
    .button(translated("gui.ok"))
    .show(player)
    .then((response) => {
      if (!response.canceled && response.selection === 0) {
        return showScriptBlockMenu(block, player);
      }
    });
}

function formatSavedCode(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  let message;
  try {
    const formatted = formatCode(storage.code);
    if (formatted === storage.code) {
      message = translated("script_block.format.unchanged");
    } else {

      storage.write(formatted);
      message = translated("script_block.format.success");
    }
  } catch (error) {
    const reason = escapeViewerText(String(error.message ?? error)).slice(0, 200);
    message = { rawtext: [
      translated("script_block.format.failed"),
      { text: "\n\n" },
      error instanceof LocalizedError ? translated(error.localizationKey, error.localizationValues) : { text: reason }
    ] };
  }
  return showFormatResult(block, player, message);
}

export function showScriptBlockMenu(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const body = storage.code ? highlightCode(storage.code) : translated("script_block.preview.empty");

  return new ActionFormData()
    .title("script_block.menu.title")
    .body(body)
    .button(translated("gui.edit"))
    .button(translated("script_block.format.button"))
    .button(translated("gui.clear"))
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        return showCodeEditor(block, player);
      } else if (response.selection === 1) {
        return formatSavedCode(block, player);
      } else if (response.selection === 2) {
        return confirmClearCode(block, player);
      }
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}
