import { Entity, EntityComponentTypes, Player, system, world } from "@minecraft/server";
import { Morph } from "./class";
import { evaluateCondition } from "./condition-evaluator";
import morphs, { morphEntityTypes } from "../data/morphs";
import { getPlayerSkinIndex, playerSkins } from "../data/player-skins";
import { emitMorphEvent, morphEvents } from "./events";
import { refreshMorphNameTag } from "./name-visibility";

const PLAYER_MORPH_NAME_PROPERTY = "dark7mc:player_morph_name";
const MORPH_WEARS_OMNITRIX_PROPERTY = "dark7mc:morph_wears_omnitrix";

export function playerHasWornOmnitrix(player) {
  if (player.getDynamicProperty("dark7mc:omnitrix_worn") !== true) return false;

  const inventory = player.getComponent("minecraft:inventory")?.container;
  if (inventory === undefined) return false;

  for (let slot = 0; slot < inventory.size; slot++) {
    const itemStack = inventory.getItem(slot);
    if (itemStack?.hasComponent("dark7mc:omnitrix") &&
      itemStack.getDynamicProperty("isOmnitrixActive") === true) return true;
  }

  const cursorItem = player.getComponent(EntityComponentTypes.CursorInventory)?.item;
  return cursorItem?.hasComponent("dark7mc:omnitrix") === true &&
    cursorItem.getDynamicProperty("isOmnitrixActive") === true;
}

function getMorphSourceWearsOmnitrix(morph, player) {
  if (morph.entityType !== "minecraft:player") return false;
  if (morph.playerName === player.name) return playerHasWornOmnitrix(player);

  const sourcePlayer = world.getPlayers().find(candidate => candidate.name === morph.playerName);
  return sourcePlayer === undefined ? morph.wearsOmnitrix : playerHasWornOmnitrix(sourcePlayer);
}

function getMorphWearsOmnitrix(player) {
  const wearsOmnitrix = player.getDynamicProperty(MORPH_WEARS_OMNITRIX_PROPERTY);
  return wearsOmnitrix === undefined
    ? player.getProperty("dark7mc:morph_omnitrix") === true
    : wearsOmnitrix === true;
}

function getMorphEntityType(player) {
  return morphEntityTypes[player.getProperty("dark7mc:entity")];
}

Entity.prototype.hasProperty = function(identifier) {
  return this.getProperty(identifier) !== undefined;
};

Entity.prototype.getMorph = function() {
  let entityType;

  if (this instanceof Player) {
    entityType = getMorphEntityType(this);
  } else {
    entityType = this.typeId;
    if (!(entityType in morphs)) return;
  }

  const properties = {};
  const validProperties = morphs[entityType].properties ?? {};

  for (const key in validProperties) {
    for (const value of validProperties[key]) {
      if (evaluateCondition(this, value.condition)) {
        properties[key] = value.value;
        break;
      }
    }

    if (properties[key] === undefined) return;
  }

  const playerName = this instanceof Player && entityType === "minecraft:player"
    ? this.getDynamicProperty(PLAYER_MORPH_NAME_PROPERTY) ?? this.name
    : undefined;
  const wearsOmnitrix = this instanceof Player && entityType === "minecraft:player"
    ? playerName === this.name
      ? playerHasWornOmnitrix(this)
      : getMorphWearsOmnitrix(this)
    : false;
  return new Morph(entityType, properties, playerName, wearsOmnitrix);
};

Player.prototype.refreshMorphNameTag = function(entityType = getMorphEntityType(this), playerName) {
  return refreshMorphNameTag(this, entityType, playerName);
};

// This code will be further improved :)
Player.prototype.setMorph = function(morph, { showEffects = true, soulSwitch = true, force = false } = {}) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  if (morph.entityType === "minecraft:player" && morph.playerName === this.name) {
    morph = new Morph("minecraft:player", {}, this.name, playerHasWornOmnitrix(this));
  }

  const previousMorph = this.getMorph();
  if (!force && previousMorph !== undefined && previousMorph.equals(morph)) return false;
  const eventOptions = { cancel: false, morph, player: this, previousMorph, soulSwitch };

  return emitMorphEvent(eventOptions, event => {
    const activeMorph = event.morph;
    const { entityType, properties } = activeMorph;
    const currentPlayerHasOmnitrix = playerHasWornOmnitrix(this);
    const morphWearsOmnitrix = getMorphSourceWearsOmnitrix(activeMorph, this);
    this.setDynamicProperty(MORPH_WEARS_OMNITRIX_PROPERTY, morphWearsOmnitrix);

    if (entityType === "minecraft:player") {
      const skinIndex = getPlayerSkinIndex(activeMorph.playerName);
      this.setProperty("dark7mc:player_skin", skinIndex);
      this.setProperty("dark7mc:player_model", playerSkins[skinIndex].model);
    }

    this.setDynamicProperty(PLAYER_MORPH_NAME_PROPERTY, activeMorph.playerName);
    const entityIndex = morphEntityTypes.indexOf(entityType);

    this.triggerEvent("dark7mc:clear_components");
    this.setProperty("dark7mc:entity", entityIndex);

    const baseTag = `components.${entityType}`;
    this.addTag(baseTag);
    for (const [key, value] of Object.entries(properties)) {
      this.addTag(`${baseTag}.${key}=${value}`);
    }
    this.triggerEvent("dark7mc:add_components");
    const shouldRenderOmnitrix = morphWearsOmnitrix && currentPlayerHasOmnitrix;
    this.setProperty("dark7mc:morph_omnitrix", shouldRenderOmnitrix);
    this.setProperty("dark7mc:omnitrix_state", currentPlayerHasOmnitrix ? "worn_closed" : "unworn");

    if (entityType !== "minecraft:player" && (this.isSneaking || this.isSleeping) && this.hasComponent("minecraft:rideable")) {
      this.triggerEvent("morph:block_riding");
    }

    const health = this.getComponent("minecraft:health");
    const previousHealth = { currentValue: health.currentValue, defaultValue: health.defaultValue };
    system.runTimeout(() =>
      health.setCurrentValue(previousHealth.currentValue * (health.defaultValue / previousHealth.defaultValue))
    , 1);

    this.getComponent("minecraft:rideable")?.ejectRiders();
    this.getComponent("minecraft:riding")?.entityRidingOn.getComponent("minecraft:rideable")?.ejectRider(this);

    this.refreshMorphNameTag(entityType, activeMorph.playerName);

    if (showEffects) {
      const { dimension } = this;
      dimension.playSound("mob.player.morph", this.location);
      dimension.spawnEntity("dark7mc:morph_transform_vfx", this.location);
    }
  });
};

Player.prototype.refreshMorphComponents = function() {
  const morph = this.getMorph();
  if (morph === undefined) return false;

  this.addTag("morph:refresh_components");
  this.triggerEvent("dark7mc:clear_components");
  const entityIndex = morphEntityTypes.indexOf(morph.entityType);
  if (morph.entityType === "minecraft:player") {
    const skinIndex = this.getProperty("dark7mc:player_skin") ?? 0;
    this.setProperty("dark7mc:player_model", playerSkins[skinIndex]?.model ?? 0);
  }
    this.setProperty("dark7mc:morph_omnitrix", morph.wearsOmnitrix && playerHasWornOmnitrix(this));
  this.setProperty("dark7mc:entity", entityIndex);

  const baseTag = `components.${morph.entityType}`;
  this.addTag(baseTag);
  for (const [key, value] of Object.entries(morph.properties)) {
    this.addTag(`${baseTag}.${key}=${value}`);
  }
  this.triggerEvent("dark7mc:add_components");
  system.runTimeout(() => this.removeTag("morph:refresh_components"), 1);

  return true;
};

export { morphEvents };
