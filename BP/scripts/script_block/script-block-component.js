import { system } from "@minecraft/server";
import { LAST_INTERACT_TICK_PROPERTY } from "./constants.js";
import { ScriptBlockStorage } from "./script-storage.js";
import { showScriptBlockMenu } from "./ui/script-block-menu.js";

export class ScriptBlockComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onPlayerBreak = this.onPlayerBreak.bind(this);
  }

  onPlayerInteract({ block, player }) {
    if (!player) return;
    if (player.isSneaking) return;

    if (player.getDynamicProperty(LAST_INTERACT_TICK_PROPERTY) === system.currentTick) return;

    player.setDynamicProperty(LAST_INTERACT_TICK_PROPERTY, system.currentTick);
    showScriptBlockMenu(block, player);
  }

  onPlayerBreak({ block }) {
    ScriptBlockStorage.fromBlock(block).remove();
  }
}
