import { GameMode, system, world } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";
import "./morph/events";
import "./abilities/items-on-morph";
import "./abilities/index";
import commands from "./commands/registries";
import components from "./components/registries";
import { Morph } from "./morph/class";
import "./morph/entity-methods";
import "./abilities/block-morph-riding";
import "./utils/is-solid";
import { namespace } from "./utils/pack-data";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry, customCommandRegistry, itemComponentRegistry }) => {
  for (const blockComponent of components.blocks) { blockComponentRegistry.registerCustomComponent(namespace.toNamespacedId(blockComponent.id), blockComponent); }
  for (const itemComponent of components.items) { itemComponentRegistry.registerCustomComponent(namespace.toNamespacedId(itemComponent.id), itemComponent); }
  for (const command of commands.commands) {
    for (const { name, values } of command.enums ?? []) customCommandRegistry.registerEnum(name, values);
    customCommandRegistry.registerCommand(command.definition, command.callback);
  }
});

function createPlayerMorph(player) {
  return new Morph("minecraft:player", {}, player.name);
}

world.afterEvents.worldLoad.subscribe(() => {
  if (world.getDynamicProperty("isInitialized") === true) return;
  world.gameRules.showTags = false;
  world.setDynamicProperty("isInitialized", true);
});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (initialSpawn && player.getDynamicProperty("isInitialized") !== true) {
    player.setMorph(createPlayerMorph(player), { showEffects: false, soulSwitch: false, force: true });
    player.setDynamicProperty("isInitialized", true);
  }

  player.refreshMorphNameTag();
});

world.afterEvents.playerGameModeChange.subscribe(({ player, toGameMode }) => {
  if (toGameMode !== GameMode.Spectator) return;

  const currentMorph = player.getMorph();
  if (currentMorph?.entityType === "minecraft:player") return;

  player.setMorph(createPlayerMorph(player), { showEffects: false });
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity.typeId !== "minecraft:player") return;
  uiManager.closeAllForms(deadEntity);
});

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

import "./waila/main.js";

import "./speedometer/index.js";

import "./script_block/main.js";
