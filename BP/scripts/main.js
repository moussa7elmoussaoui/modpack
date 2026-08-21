import { GameMode, system, world } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";
import "./abilities/index";
import commands from "./commands/registries";
import components from "./components/registries";
import { Morph } from "./morph/class";
import "./morph/entity-methods";
import "./abilities/block-morph-riding";
import "./utils/is-solid";
import { namespace } from "./utils/namespace";
import "./utils/updater";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry, customCommandRegistry, itemComponentRegistry }) => {
  for (const blockComponent of components.blocks) { blockComponentRegistry.registerCustomComponent(namespace.toNamespacedId(blockComponent.id), blockComponent); }
  for (const itemComponent of components.items) { itemComponentRegistry.registerCustomComponent(namespace.toNamespacedId(itemComponent.id), itemComponent); }
  for (const commandEnum of commands.enums) { customCommandRegistry.registerEnum(commandEnum.name, commandEnum.values); }
  for (const command of commands.commands) { customCommandRegistry.registerCommand(command.definition, command.callback); }
});

const humanMorph = new Morph("minecraft:player");

world.afterEvents.worldLoad.subscribe(() => {
  if (world.getDynamicProperty("isInitialized") === true) return;
  world.gameRules.showTags = false;
  world.setDynamicProperty("isInitialized", true);
});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (!initialSpawn || player.getDynamicProperty("isInitialized") === true) return;
  player.setMorph(humanMorph, { showEffects: false });
  player.setDynamicProperty("isInitialized", true);
});

world.afterEvents.playerGameModeChange.subscribe(({ player, toGameMode }) => {
  if (toGameMode !== GameMode.Spectator) return;
  player.setMorph(humanMorph, { showEffects: false });
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity.typeId !== "minecraft:player") return;
  uiManager.closeAllForms(deadEntity);
});

// The add-on's scripts are gradually being reworked. This line separates the updated code of 'main.js' above from the legacy code below.

import "old-scripts/abilityIndicator.js";
import "old-scripts/foodEaten.js";
import "old-scripts/itemAbilities.js";
import "old-scripts/mobSounds.js";
import "old-scripts/onHit.js";

import "old-scripts/mobs/creeper.js";
import "old-scripts/mobs/enderman.js";
import "old-scripts/mobs/fox.js";
import "old-scripts/mobs/bee.js";
import "old-scripts/mobs/frog.js";
import "old-scripts/mobs/enderDragon.js";
import "old-scripts/mobs/breeze.js";

// WAILA addon integration
import "./waila/main.js";

// Speedometer addon integration
import "./speedometer/index.js";
