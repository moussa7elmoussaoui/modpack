import { GameMode, system, world } from "@minecraft/server";
import { uiManager } from "@minecraft/server-ui";
import { SimulatedPlayer } from "@minecraft/server-gametest";
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
import { hasReservedCloneName, CLONE_TAG } from "./clones/model";
import "./clones/chat";

const RESERVED_CLONE_NAME_TAG = "dark7mc:reserved_clone_name";
const RESERVED_CLONE_NAME_REASON = "This name is reserved for one of the add-on's clones. Change your player name to join this world.";
const rejectedCloneNamePlayers = new Set();

function enforceReservedCloneName(player) {
  if (!hasReservedCloneName(player.name)) return false;
  if (player instanceof SimulatedPlayer && player.hasTag(CLONE_TAG)) return false;
  if (rejectedCloneNamePlayers.has(player.id)) return true;

  rejectedCloneNamePlayers.add(player.id);

  if (player instanceof SimulatedPlayer) {
    player.disconnect();
    return true;
  }

  system.run(() => {
    if (!player.isValid) return;
    try {
      player.addTag(RESERVED_CLONE_NAME_TAG);
      const result = player.dimension.runCommand(
        `kick @a[tag=${RESERVED_CLONE_NAME_TAG}] ${RESERVED_CLONE_NAME_REASON}`
      );
      if (result.successCount === 0) throw new Error("The kick command did not find the player.");
    } catch {
      if (player.isValid) {
        try { player.removeTag(RESERVED_CLONE_NAME_TAG); } catch {}
      }
    }
  });
  return true;
}

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

function initializePlayerSpawn(initialSpawn, player) {
  if (initialSpawn && player.getDynamicProperty("isInitialized") !== true) {
    player.setMorph(createPlayerMorph(player), { showEffects: false, soulSwitch: false, force: true });
    player.setDynamicProperty("isInitialized", true);
  }

  player.refreshMorphNameTag();
}

world.afterEvents.worldLoad.subscribe(() => {
  if (world.getDynamicProperty("isInitialized") !== true) {
    world.gameRules.showTags = false;
    world.setDynamicProperty("isInitialized", true);
  }
  system.run(() => {
    for (const player of world.getAllPlayers()) enforceReservedCloneName(player);
  });
});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (player instanceof SimulatedPlayer && hasReservedCloneName(player.name) && !player.hasTag(CLONE_TAG)) {
    system.run(() => {
      if (!player.isValid || enforceReservedCloneName(player)) return;
      initializePlayerSpawn(initialSpawn, player);
    });
    return;
  }
  if (enforceReservedCloneName(player)) {
    return;
  }
  initializePlayerSpawn(initialSpawn, player);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  rejectedCloneNamePlayers.delete(playerId);
});

world.afterEvents.playerGameModeChange.subscribe(({ player, toGameMode }) => {
  if (toGameMode !== GameMode.Spectator) return;

  const currentMorph = player.getMorph();
  if (currentMorph?.entityType === "minecraft:player") return;

  player.setMorph(createPlayerMorph(player), { showEffects: false });
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity.typeId !== "minecraft:player" || deadEntity.hasTag(CLONE_TAG)) return;
  uiManager.closeAllForms(deadEntity);
});

import "old-scripts/abilityIndicator.js";
import "old-scripts/foodEaten.js";
import "old-scripts/itemAbilities.js";
import "old-scripts/mobSounds.js";
import "old-scripts/onHit.js";

import "old-scripts/mobs/enderman.js";
import "old-scripts/mobs/fox.js";
import "old-scripts/mobs/bee.js";
import "old-scripts/mobs/frog.js";
import "old-scripts/mobs/breeze.js";

import "./waila/main.js";

import "./speedometer/index.js";

import "./script_block/main.js";
