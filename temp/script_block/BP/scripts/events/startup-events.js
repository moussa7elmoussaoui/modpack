import { system } from "@minecraft/server";
import { SCRIPT_STORAGE_COMPONENT_ID } from "../constants.js";
import { ScriptBlockComponent } from "../script-block-component.js";

export function registerStartupHandler() {
  system.beforeEvents.startup.subscribe((event) => {
    event.blockComponentRegistry.registerCustomComponent(
      SCRIPT_STORAGE_COMPONENT_ID,
      new ScriptBlockComponent(),
    );
  });
}
