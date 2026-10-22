import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ScriptBlockStorage } from "../script-storage.js";
import { escapeViewerText, highlightCode } from "../syntax-highlighter.js";
import { formatCode } from "../code-formatter.js";
import { reportError } from "../error-reporter.js";

export function showCodeEditor(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const form = new ModalFormData();

  form.title("Script Block");
  form.textField("Text Field", "Type here", { defaultValue: storage.code });
  form.submitButton("Save");

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
    .title("Clear Script Block?")
    .body("Clear the saved code for this block? This cannot be undone.")
    .button("Clear code")
    .button("Cancel")
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
    .title("Format Script Block")
    .body(message)
    .button("OK")
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
      message = "Code is already formatted.";
    } else {

      storage.write(formatted);
      message = "Code formatted.";
    }
  } catch (error) {
    const reason = escapeViewerText(String(error.message ?? error)).slice(0, 200);
    message = `Couldn't format the code. Your original code was kept.\n\n${reason}`;
  }
  return showFormatResult(block, player, message);
}

export function showScriptBlockMenu(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const body = storage.code ? highlightCode(storage.code) : "No code saved.";

  return new ActionFormData()
    .title("Script Block")
    .body(body)
    .button("Clear")
    .button("Format")
    .button("Edit")
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        return confirmClearCode(block, player);
      } else if (response.selection === 1) {
        return formatSavedCode(block, player);
      } else if (response.selection === 2) {
        return showCodeEditor(block, player);
      }
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}
