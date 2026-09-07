import { EntityComponentTypes, EquipmentSlot, ItemLockMode, MolangVariableMap, Player, system, world } from "@minecraft/server";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/class";
import { morphEvents, playerHasWornOmnitrix } from "../../morph/entity-methods";
import { namespace } from "../../utils/pack-data";
import { renameItemTypeId } from "../../utils/rename-item";
import { initializeStoredMorphs, readStoredMorphIds } from "./morph-storage";
import { closeMorphMenuForms, registerOmnitrixUseHandler, showMorphMenu } from "./morph-menu";

const IDENTIFIER = "omnitrix";
const namespacedId = namespace.toNamespacedId(IDENTIFIER);
const WORN_ITEM_ID = "dark7mc:omnitrix_worn";
const PLAYER_ENTITY_TYPE = "minecraft:player";
const ACTIVE_ITEM_PROPERTY = "isOmnitrixActive";
const WORN_PLAYER_PROPERTY = "dark7mc:omnitrix_worn";
const STATE_PROPERTY = "dark7mc:omnitrix_state";
const STATES = Object.freeze({
  unworn: "unworn",
  closed: "worn_closed",
  opening: "opening",
  open: "open",
  closing: "closing"
});
const ANIMATION_TICKS = 10;
const HOLDING_ANIMATION_TICKS = 10;
const HOLDING_STATE_TRANSITION_TICKS = 12;
const OPEN_IDLE_SOUND_INTERVAL_TICKS = 76;
const holdingAnimationStates = new Map();
const idleSoundInstances = new Map();
const OMNITRIX_SOUNDS = Object.freeze({
  open: "item.omnitrix.open",
  openIdle: "item.omnitrix.open_idle",
  raise: "item.omnitrix.raise",
  lower: "item.omnitrix.lower"
});
const MORPH_STORAGE_COMPONENT_ID = namespace.toNamespacedId("morph_storage");

const OMNITRIX_WORN_MESSAGE = [{ text: "§7" }, { translate: "morph.omnitrix_worn" }, { text: "§r" }];

const SPECIAL_MORPH_CONFIGS = Object.freeze({
  "DARK7MC": Object.freeze({
    entityType: "dark7mc:night_fury",
    morphId: "dark7mc:night_fury[]",
    unlockNotifiedProperty: "nightFuryUnlockNotified"
  }),
  "URBAN7MC": Object.freeze({
    entityType: "dark7mc:ancient_elemental",
    morphId: "dark7mc:ancient_elemental[]",
    unlockNotifiedProperty: "ancientElementalUnlockNotified"
  })
});

function isHiddenSpecialMorph(morphId, source) {
  if (morphId === SPECIAL_MORPH_CONFIGS.URBAN7MC.morphId && source.name === "DARK7MC") {
    const currentMorph = source.getMorph();
    if (currentMorph?.entityType === PLAYER_ENTITY_TYPE && currentMorph.playerName === "URBAN7MC") return false;
  }

  for (const [ownerName, config] of Object.entries(SPECIAL_MORPH_CONFIGS)) {
    if (morphId === config.morphId && source.name !== ownerName) return true;
  }
  return false;
}

function initializeOmnitrix(itemStack, owner) {
  return initializeStoredMorphs(itemStack, owner.name);
}

function isActiveOmnitrix(itemStack) {
  return itemStack?.hasComponent(namespacedId) === true &&
    itemStack.hasComponent(MORPH_STORAGE_COMPONENT_ID) &&
    itemStack.getDynamicProperty(ACTIVE_ITEM_PROPERTY) === true;
}

function findActiveOmnitrix(player) {
  const inventory = player.getComponent("minecraft:inventory").container;
  for (let slot = 0; slot < inventory.size; slot++) {
    const itemStack = inventory.getItem(slot);
    if (isActiveOmnitrix(itemStack)) return { inventory, slot, itemStack };
  }
}

export function removeMorphFromActiveOmnitrix(player, morph) {
  if (!hasWornOmnitrix(player)) return false;

  const activeOmnitrix = findActiveOmnitrix(player);
  if (activeOmnitrix === undefined || !activeOmnitrix.itemStack.hasMorph(morph)) return false;

  activeOmnitrix.itemStack.removeMorph(morph);
  activeOmnitrix.inventory.setItem(activeOmnitrix.slot, activeOmnitrix.itemStack);
  return true;
}

function hasActiveCursorOmnitrix(player) {
  const cursorItem = player.getComponent(EntityComponentTypes.CursorInventory)?.item;
  return isActiveOmnitrix(cursorItem);
}

function hasWornOmnitrix(player) {
  return player.getDynamicProperty(WORN_PLAYER_PROPERTY) === true &&
    (findActiveOmnitrix(player) !== undefined || hasActiveCursorOmnitrix(player));
}

function clearOffhandForWornOmnitrix(player) {
  const equippable = player.getComponent(EntityComponentTypes.Equippable);
  const offhandItem = equippable?.getEquipment(EquipmentSlot.Offhand);
  if (offhandItem === undefined) return;

  equippable.setEquipment(EquipmentSlot.Offhand, undefined);

  const inventory = player.getComponent("minecraft:inventory").container;
  const remainingItem = inventory.addItem(offhandItem);
  if (remainingItem !== undefined) player.dimension.spawnItem(remainingItem, player.location);
}

function stopOmnitrixIdleSound(player) {
  const idleSound = idleSoundInstances.get(player.id);
  if (idleSound === undefined) return;

  idleSoundInstances.delete(player.id);
  system.clearRun(idleSound.intervalId);
  idleSound.soundInstance.stop();
}

function playOmnitrixIdleSound(player) {
  stopOmnitrixIdleSound(player);
  const idleSound = {
    soundInstance: player.dimension.playSound(OMNITRIX_SOUNDS.openIdle, player.location),
    intervalId: undefined
  };
  idleSoundInstances.set(player.id, idleSound);
  idleSound.intervalId = system.runInterval(() => {
    if (idleSoundInstances.get(player.id) !== idleSound) return;
    if (!isOmnitrixVisible(player)) {
      stopOmnitrixIdleSound(player);
      return;
    }
    idleSound.soundInstance = player.dimension.playSound(OMNITRIX_SOUNDS.openIdle, player.location);
  }, OPEN_IDLE_SOUND_INTERVAL_TICKS);
}

function updateHoldingAnimationOffhandLock(player, isHoldingWornOmnitrix) {
  const currentTick = system.currentTick;
  let animationState = holdingAnimationStates.get(player.id);

  if (animationState === undefined) {
    if (!isHoldingWornOmnitrix) return;

    animationState = { phase: "raising", startedTick: currentTick };
    holdingAnimationStates.set(player.id, animationState);
    player.playSound(OMNITRIX_SOUNDS.raise);
    clearOffhandForWornOmnitrix(player);
    return;
  }

  const elapsedTicks = currentTick - animationState.startedTick;
  if (animationState.phase === "raising") {
    clearOffhandForWornOmnitrix(player);
    if (isHoldingWornOmnitrix || elapsedTicks <= HOLDING_STATE_TRANSITION_TICKS) return;

    animationState.phase = "lowering";
    animationState.startedTick = currentTick;
    player.playSound(OMNITRIX_SOUNDS.lower);
    clearOffhandForWornOmnitrix(player);
    return;
  }

  if (elapsedTicks < HOLDING_ANIMATION_TICKS) clearOffhandForWornOmnitrix(player);
  if (elapsedTicks <= HOLDING_STATE_TRANSITION_TICKS) return;

  if (isHoldingWornOmnitrix) {
    animationState.phase = "raising";
    animationState.startedTick = currentTick;
    player.playSound(OMNITRIX_SOUNDS.raise);
    clearOffhandForWornOmnitrix(player);
    return;
  }

  holdingAnimationStates.delete(player.id);
}

function synchronizeWornItemVisibility(player, shouldHideItem) {
  const activeOmnitrix = findActiveOmnitrix(player);
  if (activeOmnitrix === undefined) return;

  const targetItemId = shouldHideItem ? WORN_ITEM_ID : namespacedId;
  if (activeOmnitrix.itemStack.typeId === targetItemId) return;

  activeOmnitrix.inventory.setItem(
    activeOmnitrix.slot,
    renameItemTypeId(activeOmnitrix.itemStack, targetItemId)
  );
}

function setOmnitrixState(player, state) {
  player.setProperty(STATE_PROPERTY, state);
}

function isOmnitrixVisible(player) {
  return player.getProperty("dark7mc:morph_omnitrix") === true;
}

function bindOmnitrix(player, slot, itemStack) {
  if (findActiveOmnitrix(player) !== undefined) return false;

  initializeOmnitrix(itemStack, player);
  itemStack.setDynamicProperty(ACTIVE_ITEM_PROPERTY, true);
  itemStack.lockMode = ItemLockMode.inventory;
  itemStack.keepOnDeath = true;

  const inventory = player.getComponent("minecraft:inventory").container;
  inventory.setItem(slot, renameItemTypeId(itemStack, WORN_ITEM_ID));
  player.setDynamicProperty(WORN_PLAYER_PROPERTY, true);
  setOmnitrixState(player, STATES.closed);
  return true;
}

function openOmnitrixMenu(player, onOpened) {
  if (!hasWornOmnitrix(player) || player.getProperty(STATE_PROPERTY) !== STATES.closed) return false;

  if (!isOmnitrixVisible(player)) {
    setOmnitrixState(player, STATES.open);
    try {
      onOpened();
    } catch {
      closeOmnitrixMenu(player);
    }
    return true;
  }

  setOmnitrixState(player, STATES.opening);
  player.dimension.playSound(OMNITRIX_SOUNDS.open, player.location);
  system.runTimeout(() => {
    if (player.getProperty(STATE_PROPERTY) !== STATES.opening) return;
    if (!hasWornOmnitrix(player)) {
      setOmnitrixState(player, STATES.unworn);
      return;
    }
    setOmnitrixState(player, STATES.open);
    playOmnitrixIdleSound(player);
    try {
      onOpened();
    } catch {
      closeOmnitrixMenu(player);
    }
  }, ANIMATION_TICKS);
  return true;
}

function closeOmnitrixMenu(player) {
  if (!hasWornOmnitrix(player)) {
    stopOmnitrixIdleSound(player);
    setOmnitrixState(player, STATES.unworn);
    return;
  }

  const state = player.getProperty(STATE_PROPERTY);
  if (state === STATES.unworn || state === STATES.closed || state === STATES.closing) return;

  if (!isOmnitrixVisible(player)) {
    stopOmnitrixIdleSound(player);
    setOmnitrixState(player, STATES.closed);
    return;
  }

  stopOmnitrixIdleSound(player);
  setOmnitrixState(player, STATES.closing);
  system.runTimeout(() => {
    if (player.getProperty(STATE_PROPERTY) !== STATES.closing) return;
    setOmnitrixState(player, hasWornOmnitrix(player) ? STATES.closed : STATES.unworn);
  }, ANIMATION_TICKS);
}

export default { id: IDENTIFIER };

export function handleOmnitrixUse({ source }) {
  if (!(source instanceof Player)) return;

  const inventory = source.getComponent("minecraft:inventory").container;
  const slot = source.selectedSlotIndex;
  const itemStack = inventory.getItem(slot);
  if (!itemStack?.hasComponent(namespacedId)) return;

  if (!isActiveOmnitrix(itemStack)) {
    if (!bindOmnitrix(source, slot, itemStack)) source.sendMessage(OMNITRIX_WORN_MESSAGE);
    return;
  }

  if (!hasWornOmnitrix(source)) return;

  openOmnitrixMenu(source, () => {
    const activeOmnitrix = findActiveOmnitrix(source);
    if (activeOmnitrix === undefined) {
      closeOmnitrixMenu(source);
      return;
    }

    showMorphMenu(
      source,
      activeOmnitrix.inventory.getSlot(activeOmnitrix.slot),
      activeOmnitrix.itemStack,
      readStoredMorphIds(activeOmnitrix.itemStack),
      {
        close: () => closeOmnitrixMenu(source),
        isWorn: () => hasWornOmnitrix(source),
        isMorphHidden: morphId => isHiddenSpecialMorph(morphId, source)
      }
    );
  });
}

registerOmnitrixUseHandler(handleOmnitrixUse);

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  system.run(() => {
    if (!hasWornOmnitrix(player)) {
      setOmnitrixState(player, STATES.unworn);
      return;
    }

    setOmnitrixState(player, STATES.closed);
  });
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  holdingAnimationStates.delete(playerId);
  const idleSound = idleSoundInstances.get(playerId);
  if (idleSound === undefined) return;

  idleSoundInstances.delete(playerId);
  system.clearRun(idleSound.intervalId);
  idleSound.soundInstance.stop();
});

morphEvents.afterMorph.subscribe(({ player, previousMorph, soulSwitch }) => {
  closeMorphMenuForms(player);
  if (soulSwitch) giveMorphToPlayer(player, previousMorph);
  stopOmnitrixIdleSound(player);
  setOmnitrixState(player, hasWornOmnitrix(player) ? STATES.closed : STATES.unworn);
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const hasWornOmnitrixItem = hasWornOmnitrix(player);
    const currentMorph = player.getMorph();
    const shouldRenderMorphOmnitrix = hasWornOmnitrixItem && currentMorph?.wearsOmnitrix === true;

    if (player.getProperty("dark7mc:morph_omnitrix") !== shouldRenderMorphOmnitrix) {
      player.setProperty("dark7mc:morph_omnitrix", shouldRenderMorphOmnitrix);
    }

    synchronizeWornItemVisibility(player, shouldRenderMorphOmnitrix);

    if (!hasWornOmnitrixItem) {
      closeMorphMenuForms(player);
      if (player.getProperty(STATE_PROPERTY) !== STATES.unworn) {
        stopOmnitrixIdleSound(player);
        setOmnitrixState(player, STATES.unworn);
      }
    }

    const inventory = player.getComponent("minecraft:inventory").container;
    const selectedItemStack = inventory.getItem(player.selectedSlotIndex);
    const isHoldingWornOmnitrix = hasWornOmnitrixItem &&
      selectedItemStack?.typeId === WORN_ITEM_ID &&
      isActiveOmnitrix(selectedItemStack);
    updateHoldingAnimationOffhandLock(player, isHoldingWornOmnitrix);
  }
});

function unlockSpecialMorph(player, config) {
  const activeOmnitrix = findActiveOmnitrix(player);
  if (activeOmnitrix === undefined || !hasWornOmnitrix(player)) return false;

  const { inventory, slot, itemStack } = activeOmnitrix;
  const morph = new Morph(config.entityType);
  if (itemStack.hasMorph(morph)) return false;

  itemStack.addMorph(morph);
  let shouldNotify = false;
  if (itemStack.getDynamicProperty(config.unlockNotifiedProperty) !== true) {
    itemStack.setDynamicProperty(config.unlockNotifiedProperty, true);
    shouldNotify = true;
  }
  inventory.setItem(slot, itemStack);
  return shouldNotify;
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const config = SPECIAL_MORPH_CONFIGS[player.name];
    if (config === undefined || !isSecretMorphOwner(player, config) || !unlockSpecialMorph(player, config)) continue;

    player.sendMessage([
      { text: "§b" },
      { translate: "morph.unlock.special" },
      { text: "§r" }
    ]);
    player.dimension.spawnParticle("dark7mc:morph_unlock_burst", {
      x: player.location.x,
      y: player.location.y + 0.5,
      z: player.location.z
    });
    player.dimension.playSound("beacon.activate", player.location);
  }
}, 20);

world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
  const { damagingEntity } = damageSource;
  if (!(damagingEntity instanceof Player && isOmnitrixOwner(damagingEntity))) return;

  if (deadEntity.typeId === PLAYER_ENTITY_TYPE) {
    if (damagingEntity.name === deadEntity.name || deadEntity.name.length === 0) return;
    giveKilledMobMorphToPlayer(
      damagingEntity,
      deadEntity,
      new Morph(PLAYER_ENTITY_TYPE, {}, deadEntity.name, playerHasWornOmnitrix(deadEntity))
    );
  } else if (deadEntity.typeId in morphs) {
    const morph = deadEntity.getMorph();
    if (morph !== undefined) giveKilledMobMorphToPlayer(damagingEntity, deadEntity, morph);
  } else {
    const unavailableMobsCollected = JSON.parse(damagingEntity.getDynamicProperty("unavailableMobsCollected") ?? "[]");
    const entityType = deadEntity.typeId;
    if (unavailableMobsCollected.includes(entityType)) return;

    damagingEntity.setDynamicProperty("unavailableMobsCollected", JSON.stringify(unavailableMobsCollected.concat(entityType)));
    const message = `morph.unavailable.${entityType.split(":")[0] === "minecraft" ? "vanilla" : "modded"}`;
    damagingEntity.sendMessage([{ text: "§7" }, { translate: message }, { text: "§r" }]);
  }
});

function isSecretMorphOwner(player, config) {
  const morph = player.getMorph();
  return player.level >= 100 &&
    morph?.entityType === PLAYER_ENTITY_TYPE &&
    morph.playerName === player.name &&
    hasOmnitrixWithoutMorph(player, config);
}

function hasOmnitrixWithoutMorph(player, config) {
  const activeOmnitrix = findActiveOmnitrix(player);
  return hasWornOmnitrix(player) && activeOmnitrix !== undefined && !activeOmnitrix.itemStack.hasMorph(new Morph(config.entityType));
}

function giveKilledMobMorphToPlayer(player, deadEntity, morph) {
  if (!giveMorphToPlayer(player, morph)) return;

  const { location: damagerLocation } = player;
  const headLocation = deadEntity.getHeadLocation();
  const particleVariables = new MolangVariableMap();
  const particleDirection = {
    x: damagerLocation.x - headLocation.x,
    y: (damagerLocation.y + 0.5) - headLocation.y,
    z: damagerLocation.z - headLocation.z
  };
  particleVariables.setVector3("variable.direction", particleDirection);
  particleVariables.setFloat("variable.distance", Math.sqrt(
    particleDirection.x ** 2 + particleDirection.y ** 2 + particleDirection.z ** 2
  ));

  deadEntity.dimension.spawnParticle("dark7mc:soul_orb_particle", headLocation, particleVariables);
  const orbImpactLocation = { x: damagerLocation.x, y: damagerLocation.y + 0.5, z: damagerLocation.z };
  const orbImpactDimension = player.dimension;
  system.runTimeout(() => orbImpactDimension.spawnParticle("dark7mc:morph_unlock_burst", orbImpactLocation), 10);
  player.dimension.playSound("beacon.activate", damagerLocation);
}

function giveMorphToPlayer(player, morph) {
  if (!(player instanceof Player)) throw new TypeError("Expected 'player' argument to be an instance of Player");
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  const activeOmnitrix = findActiveOmnitrix(player);
  if (!hasWornOmnitrix(player) || activeOmnitrix === undefined) return false;

  const previousMorphIds = readStoredMorphIds(activeOmnitrix.itemStack);
  activeOmnitrix.itemStack.addMorph(morph);
  if (JSON.stringify(readStoredMorphIds(activeOmnitrix.itemStack)) === JSON.stringify(previousMorphIds)) return false;

  activeOmnitrix.inventory.setItem(activeOmnitrix.slot, activeOmnitrix.itemStack);
  return true;
}

function isOmnitrixOwner(player) {
  return hasWornOmnitrix(player);
}
