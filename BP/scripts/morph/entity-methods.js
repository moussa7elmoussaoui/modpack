import { Entity, EntityTypes, ItemLockMode, ItemStack, Player, system, world } from "@minecraft/server";
import { Morph } from "./class";
import { evaluateCondition } from "./condition-evaluator";
import morphs, { morphEntityTypes } from "../data/morphs";
import { getPlayerSkinIndex, playerSkins } from "../data/player-skins";

const PLAYER_MORPH_NAME_PROPERTY = "dark7mc:player_morph_name";
const MORPH_WEARS_OMNITRIX_PROPERTY = "dark7mc:morph_wears_omnitrix";

const CUSTOM_ENTITY_TYPE_NAMES = Object.freeze({
  "dark7mc:night_fury": "Night Fury",
  "dark7mc:ancient_elemental": "Ancient Elemental"
});

export function playerHasWornOmnitrix(player) {
  if (player.getDynamicProperty("dark7mc:omnitrix_worn") !== true) return false;

  const inventory = player.getComponent("minecraft:inventory")?.container;
  if (inventory === undefined) return false;

  for (let slot = 0; slot < inventory.size; slot++) {
    const itemStack = inventory.getItem(slot);
    if (itemStack?.hasComponent("dark7mc:omnitrix") &&
      itemStack.getDynamicProperty("isOmnitrixActive") === true) return true;
  }

  return false;
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

const beforeListeners = new Set();
const afterListeners = new Set();

function callListeners(listeners, options) {
  for (const listener of listeners) {
    try { listener(options); }
    catch (error) { console.error(error); }
  }
}

Player.prototype.refreshMorphNameTag = function(entityType = getMorphEntityType(this), playerName) {
  if (entityType === undefined) return false;

  playerName ??= this.getMorph()?.playerName;
  this.nameTag = entityType === "minecraft:player" ? (playerName ?? this.name) : "";
  return true;
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

  callListeners(beforeListeners, eventOptions);
  if (eventOptions.cancel) return false;
  
  morph = eventOptions.morph;
  const { entityType, properties } = morph;
  const currentPlayerHasOmnitrix = playerHasWornOmnitrix(this);
  const morphWearsOmnitrix = getMorphSourceWearsOmnitrix(morph, this);
  this.setDynamicProperty(MORPH_WEARS_OMNITRIX_PROPERTY, morphWearsOmnitrix);

  if (entityType === "minecraft:player") {
    const skinIndex = getPlayerSkinIndex(morph.playerName);
    this.setProperty("dark7mc:player_skin", skinIndex);
    this.setProperty("dark7mc:player_model", playerSkins[skinIndex].model);
  }

  this.setDynamicProperty(PLAYER_MORPH_NAME_PROPERTY, morph.playerName);
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

  this.refreshMorphNameTag(entityType, morph.playerName);

  if (showEffects) {
    const { dimension } = this;
    dimension.playSound("mob.player.morph", this.location);
    dimension.spawnEntity("dark7mc:morph_transform_vfx", this.location);
  }

  const inventory = this.getComponent("minecraft:inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getSlot(i);
    if (slot.getDynamicProperty("isAttachedToMorph") === true) {
      slot.setItem(undefined);
    }
  }

  system.runTimeout(() => {
    for (const { id, condition } of morphs[entityType].items ?? []) {
      if (condition !== undefined && !evaluateCondition(this, condition)) continue;

      const itemStack = new ItemStack(id);
      itemStack.lockMode = ItemLockMode.inventory;
      itemStack.keepOnDeath = true;
      itemStack.setDynamicProperty("isAttachedToMorph", true);
      const entityTypeDefinition = EntityTypes.get(entityType);
      itemStack.setLore([{ rawtext: [
        { text: "§r§7" },
        { translate: "morph.item.attached_to" },
        { text: " " },
        entityTypeDefinition === undefined
          ? { text: CUSTOM_ENTITY_TYPE_NAMES[entityType] ?? entityType }
          : { translate: entityTypeDefinition.localizationKey },
        { text: "§r" }
      ]}]);

      inventory.addItem(itemStack);
    }
  }, 1);

  callListeners(afterListeners, eventOptions);
  return true;
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

export const morphEvents = Object.freeze({
  beforeMorph: Object.freeze({
    subscribe(listener) { beforeListeners.add(listener); return listener; },
    unsubscribe(listener) { beforeListeners.delete(listener); return listener; }
  }),
  afterMorph: Object.freeze({
    subscribe(listener) { afterListeners.add(listener); return listener; },
    unsubscribe(listener) { afterListeners.delete(listener); return listener; }
  })
});
