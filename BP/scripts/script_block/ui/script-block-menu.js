import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { ScriptBlockStorage } from "../script-storage.js";
import { highlightCode } from "../syntax-highlighter.js";
import { reportError } from "../error-reporter.js";

export function showCodeEditor(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const form = new ModalFormData();

  form.title("Script Block");
  form.textField("Text Field", "Type here", { defaultValue: storage.code });
  form.submitButton("Save");

  form
    .show(player)
    .then((response) => {
      if (response.canceled || !response.formValues) return;

      const [code] = response.formValues;
      storage.write(code);
      showScriptBlockMenu(block, player);
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}

export function confirmClearCode(block, player) {
  new ActionFormData()
    .title("Clear Script Block?")
    .body("Clear the saved code for this block? This cannot be undone.")
    .button("Clear code")
    .button("Cancel")
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        ScriptBlockStorage.fromBlock(block).remove();
        showScriptBlockMenu(block, player);
      } else if (response.selection === 1) {
        showScriptBlockMenu(block, player);
      }
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}

export function showScriptBlockMenu(block, player) {
  const storage = ScriptBlockStorage.fromBlock(block);
  const body = storage.code ? highlightCode(storage.code) : "No code saved.";

  new ActionFormData()
    .title("Script Block")
    .body(body)
    .button("Edit")
    .button("Clear")
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      if (response.selection === 0) {
        showCodeEditor(block, player);
      } else if (response.selection === 1) {
        confirmClearCode(block, player);
      }
    })
    .catch((error) => {
      reportError(error, false, player);
    });
}
