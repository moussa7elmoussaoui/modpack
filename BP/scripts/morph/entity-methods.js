import { Entity, EntityTypes, ItemLockMode, ItemStack, Player, system } from "@minecraft/server";
import { Morph } from "./class";
import { evaluateCondition } from "./condition-evaluator";
import morphs, { morphEntityTypes } from "../data/morphs";

Entity.prototype.hasProperty = function(identifier) {
  return this.getProperty(identifier) !== undefined;
};

Entity.prototype.getMorph = function() {
  let entityType;

  if (this instanceof Player) {
    entityType = morphEntityTypes[this.getProperty("dark7mc:entity")];
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

  return new Morph(entityType, properties);
};

const beforeListeners = new Set();
const afterListeners = new Set();

function callListeners(listeners, options) {
  for (const listener of listeners) {
    try { listener(options); }
    catch (error) { console.error(error); }
  }
}

Player.prototype.refreshMorphNameTag = function(entityType = morphEntityTypes[this.getProperty("dark7mc:entity")]) {
  if (entityType === undefined) return false;

  this.nameTag = entityType === "minecraft:player" ? this.name : "";
  return true;
};

// This code will be further improved :)
Player.prototype.setMorph = function(morph, { showEffects = true, soulSwitch = true } = {}) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  const previousMorph = this.getMorph();
  const eventOptions = { cancel: false, morph, player: this, previousMorph, soulSwitch };

  callListeners(beforeListeners, eventOptions);
  if (eventOptions.cancel) return false;
  
  morph = eventOptions.morph;
  const { entityType, properties } = morph;

  this.triggerEvent("dark7mc:clear_components");
  this.setProperty("dark7mc:entity", morphEntityTypes.indexOf(entityType));
  
  const baseTag = `components.${entityType}`;
  this.addTag(baseTag);
  for (const [key, value] of Object.entries(properties)) {
    this.addTag(`${baseTag}.${key}=${value}`);
  }
  this.triggerEvent("dark7mc:add_components");

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

  this.refreshMorphNameTag(entityType);

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
        entityTypeDefinition === undefined ? { text: "Night Fury" } : { translate: entityTypeDefinition.localizationKey },
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
  this.setProperty("dark7mc:entity", morphEntityTypes.indexOf(morph.entityType));

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
