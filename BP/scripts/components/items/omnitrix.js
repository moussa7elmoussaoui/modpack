import { GameMode, ItemLockMode, ItemStack, MolangVariableMap, Player, system, world } from "@minecraft/server";
import { ActionFormData, uiManager } from "@minecraft/server-ui";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/class";
import { morphEvents, playerHasWornOmnitrix } from "../../morph/entity-methods";
import { getPlayerIconPath, getPlayerSkinIndex } from "../../data/player-skins";
import { namespace } from "../../utils/namespace";
import { renameItemTypeId } from "../../utils/rename-item";

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
const openMorphMenus = new Set();

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
  for (const [ownerName, config] of Object.entries(SPECIAL_MORPH_CONFIGS)) {
    if (morphId === config.morphId && source.name !== ownerName) return true;
  }
  return false;
}

function initializeOmnitrix(itemStack, owner) {
  if (itemStack.getDynamicProperty("morphs") !== undefined) return false;

  const ownerMorph = new Morph("minecraft:player", {}, owner.name).toString();
  itemStack.setDynamicProperty("morphs", JSON.stringify([ ownerMorph ]));
  return true;
}

function readMorphIds(itemStack) {
  const rawMorphs = itemStack.getDynamicProperty("morphs");
  if (typeof rawMorphs !== "string") return [];

  try {
    const morphIds = JSON.parse(rawMorphs);
    return Array.isArray(morphIds) ? morphIds : [];
  } catch {
    return [];
  }
}

function isActiveOmnitrix(itemStack) {
  return itemStack?.hasComponent(namespacedId) === true &&
    itemStack.getDynamicProperty(ACTIVE_ITEM_PROPERTY) === true;
}

function findActiveOmnitrix(player) {
  const inventory = player.getComponent("minecraft:inventory").container;
  for (let slot = 0; slot < inventory.size; slot++) {
    const itemStack = inventory.getItem(slot);
    if (isActiveOmnitrix(itemStack)) return { inventory, slot, itemStack };
  }
}

function hasWornOmnitrix(player) {
  return player.getDynamicProperty(WORN_PLAYER_PROPERTY) === true && findActiveOmnitrix(player) !== undefined;
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
  system.runTimeout(() => {
    if (player.getProperty(STATE_PROPERTY) !== STATES.opening) return;
    if (!hasWornOmnitrix(player)) {
      setOmnitrixState(player, STATES.unworn);
      return;
    }

    setOmnitrixState(player, STATES.open);
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
    setOmnitrixState(player, STATES.unworn);
    return;
  }

  const state = player.getProperty(STATE_PROPERTY);
  if (state === STATES.unworn || state === STATES.closed || state === STATES.closing) return;

  if (!isOmnitrixVisible(player)) {
    setOmnitrixState(player, STATES.closed);
    return;
  }

  setOmnitrixState(player, STATES.closing);
  system.runTimeout(() => {
    if (player.getProperty(STATE_PROPERTY) !== STATES.closing) return;
    setOmnitrixState(player, hasWornOmnitrix(player) ? STATES.closed : STATES.unworn);
  }, ANIMATION_TICKS);
}

export default {
  id: IDENTIFIER,
  onUse: ({ source }) => {
    if (!(source instanceof Player)) return;

    const inventory = source.getComponent("minecraft:inventory").container;
    const slot = source.selectedSlotIndex;
    const itemStack = inventory.getItem(slot);
    if (!itemStack?.hasComponent(namespacedId)) return;

    if (!isActiveOmnitrix(itemStack)) {
      if (!bindOmnitrix(source, slot, itemStack)) {
        source.sendMessage(OMNITRIX_WORN_MESSAGE);
      }
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
        readMorphIds(activeOmnitrix.itemStack)
      );
    });
  }
};

function showMorphMenu(source, itemSlot, itemStack, morphIds) {
  openMorphMenus.add(source);
  morphIds = normalizeMorphIdsForMenu(source, itemSlot, itemStack, morphIds);
  const variantsByAge = new Map();
  const ownerMorphId = new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString();

  const visibleMorphIds = morphIds.filter(morphId => !isHiddenSpecialMorph(morphId, source));
  if (!visibleMorphIds.includes(ownerMorphId)) visibleMorphIds.push(ownerMorphId);

  for (const morphId of visibleMorphIds) {
    const entityType = parseEntityType(morphId);
    const playerName = getMorphPlayerName(morphId);
    const ageKey = playerName === source.name
      ? "self"
      : playerName === undefined ? getAgeKey(morphId) : "named";
    const groupKey = `${entityType}${ageKey}`;

    if (!variantsByAge.has(groupKey)) variantsByAge.set(groupKey, { entityType, ageKey, variants: [] });
    variantsByAge.get(groupKey).variants.push(morphId);
  }

  const sortedEntries = [...variantsByAge.values()].sort((a, b) => {
    if (a.entityType === PLAYER_ENTITY_TYPE && b.entityType === PLAYER_ENTITY_TYPE) {
      if (a.ageKey === "named") return 1;
      if (b.ageKey === "named") return -1;
      return 0;
    }

    if (a.entityType === PLAYER_ENTITY_TYPE) return -1;
    if (b.entityType === PLAYER_ENTITY_TYPE) return 1;

    const entityCompare = typeName(a.entityType).localeCompare(typeName(b.entityType));
    if (entityCompare !== 0) return entityCompare;

    return agePriority(a.ageKey) - agePriority(b.ageKey);
  });

  const morphMenu = new ActionFormData().title("morph.menu.title");
  for (const { variants } of sortedEntries) {
    const sortedVariants = [...variants].sort(sortMorphIds);
    const firstMorphId = sortedVariants[0];
    const buttonText = sortedVariants.length >= 100
      ? "99+"
      : sortedVariants.length >= 2 ? String(sortedVariants.length) : "";
    morphMenu.button(buttonText, getMorphIconPath(firstMorphId));
  }

  morphMenu.show(source).then(({ canceled, selection }) => {
    openMorphMenus.delete(source);
    if (canceled) {
      closeOmnitrixMenu(source);
      return;
    }

    const entry = sortedEntries[selection];
    if (entry?.variants.length === 1) {
      applyMorphSelection(source, itemSlot, itemStack, entry.variants[0]);
      closeOmnitrixMenu(source);
      return;
    }

    if (entry !== undefined) {
      system.runTimeout(() => {
        if (hasWornOmnitrix(source)) {
          showVariantMenu(source, itemSlot, itemStack, morphIds, [...entry.variants].sort(sortMorphIds));
        }
      }, 1);
    } else {
      closeOmnitrixMenu(source);
    }
  }).catch(() => {
    openMorphMenus.delete(source);
    closeOmnitrixMenu(source);
  });
}

function normalizeMorphIdsForMenu(source, itemSlot, itemStack, morphIds) {
  const normalizedMorphIds = [];
  const seen = new Set();
  let hasOwnerMorph = false;

  for (const morphId of morphIds) {
    let morph;
    try {
      morph = Morph.parse(morphId, { allowOmnitrix: true });
    } catch {
      continue;
    }

    const normalizedMorphId = morph.entityType === PLAYER_ENTITY_TYPE && morph.playerName === source.name
      ? new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString()
      : morph.toString();
    if (normalizedMorphId === new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString()) hasOwnerMorph = true;
    if (seen.has(normalizedMorphId)) continue;

    seen.add(normalizedMorphId);
    normalizedMorphIds.push(normalizedMorphId);
  }

  if (!hasOwnerMorph) normalizedMorphIds.push(new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString());

  if (JSON.stringify(normalizedMorphIds) !== JSON.stringify(morphIds)) {
    itemStack.setDynamicProperty("morphs", JSON.stringify(normalizedMorphIds));
    itemSlot.setItem(itemStack);
  }

  return normalizedMorphIds;
}

function showVariantMenu(source, itemSlot, itemStack, morphIds, sortedVariants) {
  openMorphMenus.add(source);
  const menuTitle = getMorphPlayerName(sortedVariants[0]) === undefined
    ? "morph.menu.variant"
    : "morph.menu.player";
  const variantMenu = new ActionFormData().title(menuTitle);
  for (const morphId of sortedVariants) {
    variantMenu.button(getMorphPlayerLabel(morphId), getMorphIconPath(morphId));
  }

  variantMenu.show(source).then(({ canceled, selection }) => {
    openMorphMenus.delete(source);
    if (canceled) {
      system.runTimeout(() => {
        if (hasWornOmnitrix(source)) showMorphMenu(source, itemSlot, itemStack, morphIds);
      }, 1);
      return;
    }

    const morphId = sortedVariants[selection];
    if (morphId !== undefined) applyMorphSelection(source, itemSlot, itemStack, morphId);
    closeOmnitrixMenu(source);
  }).catch(() => {
    openMorphMenus.delete(source);
    closeOmnitrixMenu(source);
  });
}

function applyMorphSelection(source, itemSlot, itemStack, morphId) {
  const currentMorph = source.getMorph();
  const selectedMorph = Morph.parse(morphId, { allowOmnitrix: true });

  const soulSwitch = itemStack.hasMorph(currentMorph);
  const isMorphingSuccessful = source.setMorph(selectedMorph, { soulSwitch });
  if (!isMorphingSuccessful) return;

  itemStack.removeMorph(selectedMorph);
  if (!soulSwitch) {
    const storedCurrentMorph = currentMorph.entityType === PLAYER_ENTITY_TYPE && currentMorph.playerName === source.name
      ? new Morph(PLAYER_ENTITY_TYPE, {}, source.name)
      : currentMorph;
    itemStack.addMorph(storedCurrentMorph);
  }

  if (source.getGameMode() !== GameMode.Creative &&
    itemStack.getComponent("minecraft:durability").maxDurability - 1 > itemStack.getComponent("minecraft:durability").damage) {
    itemStack.getComponent("minecraft:durability").damage++;
  } else if (source.getGameMode() !== GameMode.Creative) {
    source.dimension.playSound("respawn_anchor.deplete", source.location, { volume: 1.0, pitch: (Math.random() * 0.4) + 0.8 });
  }

  // A bound Omnitrix is permanent, including when it reaches maximum damage.
  itemSlot.setItem(itemStack);
}

function parseEntityType(morphId) {
  return morphId.slice(0, morphId.indexOf("["));
}

function typeName(entityType) {
  const separator = entityType.indexOf(":");
  return separator === -1 ? entityType : entityType.slice(separator + 1);
}

function getMorphIconPath(morphId) {
  const playerName = getMorphPlayerName(morphId);
  if (playerName !== undefined) return getPlayerIconPath(getPlayerSkinIndex(playerName));

  const bracketStart = morphId.indexOf("[");
  const bracketEnd = morphId.indexOf("]", bracketStart);
  const entityType = morphId.slice(0, bracketStart);
  const properties = morphId.slice(bracketStart + 1, bracketEnd);

  return `textures/morph_icons/${entityType.replace(":", "/")}${properties.length === 0 ? "" : `/${properties}`}`;
}

function getMorphPlayerName(morphId) {
  if (parseEntityType(morphId) !== PLAYER_ENTITY_TYPE) return undefined;
  return Morph.parse(morphId, { allowOmnitrix: true }).playerName;
}

function sortMorphIds(firstMorphId, secondMorphId) {
  const firstPlayerName = getMorphPlayerName(firstMorphId);
  const secondPlayerName = getMorphPlayerName(secondMorphId);
  if (firstPlayerName !== undefined && secondPlayerName !== undefined) {
    return firstPlayerName.localeCompare(secondPlayerName);
  }

  return firstMorphId.localeCompare(secondMorphId);
}

function getMorphPlayerLabel(morphId) {
  return getMorphPlayerName(morphId) ?? "";
}

const AGE_PRIORITIES = { adult: 0, wooly_adult: 0, sheared_adult: 1, baby: 2 };

function getAgeKey(morphId) {
  const bracketStart = morphId.indexOf("[");
  const bracketEnd = morphId.indexOf("]", bracketStart);
  const properties = morphId.slice(bracketStart + 1, bracketEnd);

  for (const property of properties.split(",")) {
    if (property.startsWith("age=")) return property.slice(4);
  }
  return "";
}

function agePriority(ageKey) {
  return AGE_PRIORITIES[ageKey] ?? 3;
}

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  system.run(() => {
    if (!hasWornOmnitrix(player)) {
      setOmnitrixState(player, STATES.unworn);
      return;
    }

    setOmnitrixState(player, STATES.closed);
  });
});

morphEvents.afterMorph.subscribe(({ player, previousMorph, soulSwitch }) => {
  if (openMorphMenus.has(player)) {
    openMorphMenus.delete(player);
    uiManager.closeAllForms(player);
  }
  if (soulSwitch) giveMorphToPlayer(player, previousMorph);
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
      if (openMorphMenus.has(player)) {
        openMorphMenus.delete(player);
        uiManager.closeAllForms(player);
      }
      if (player.getProperty(STATE_PROPERTY) !== STATES.unworn) {
        setOmnitrixState(player, STATES.unworn);
      }
    }

    const { dimension, location } = player;
    const { heightRange } = dimension;
    const inventory = player.getComponent("minecraft:inventory").container;
    const selectedItemStack = inventory.getItem(player.selectedSlotIndex);
    const blockStandingOn = player.getBlockStandingOn({ ignoreThinBlocks: true });

    if (
      !isActiveOmnitrix(selectedItemStack) ||
      !hasWornOmnitrixItem ||
      location.y < heightRange.min || location.y > heightRange.max ||
      ![ "minecraft:soul_sand", "minecraft:soul_soil" ].includes(blockStandingOn?.typeId)
    ) continue;

    if (selectedItemStack.getComponent("minecraft:durability").damage <= 0) continue;

    if (system.currentTick % 20 === 0) {
      selectedItemStack.getComponent("minecraft:durability").damage--;
      inventory.setItem(player.selectedSlotIndex, selectedItemStack);
    }
    if (system.currentTick % 2 === 0) {
      const particleVariables = new MolangVariableMap();
      particleVariables.setVector3("variable.direction", { x: 0, y: 1, z: 0 });
      dimension.spawnParticle("minecraft:soul_particle", {
        x: blockStandingOn.x + Math.random(),
        y: blockStandingOn.y + 1,
        z: blockStandingOn.z + Math.random()
      }, particleVariables);
      dimension.playSound("bloom.sculk_catalyst", location);
    }
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
  if (!hasWornOmnitrix(player) || activeOmnitrix === undefined || activeOmnitrix.itemStack.hasMorph(morph)) return false;

  activeOmnitrix.itemStack.addMorph(morph);
  activeOmnitrix.inventory.setItem(activeOmnitrix.slot, activeOmnitrix.itemStack);
  return true;
}

function isOmnitrixOwner(player) {
  return hasWornOmnitrix(player);
}

ItemStack.prototype.hasMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return false;
  }
  return readMorphIds(this).includes(morph.toString());
};

ItemStack.prototype.addMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return;
  }

  const morphId = morph.toString();
  const morphIds = readMorphIds(this);
  if (!morphIds.includes(morphId)) this.setDynamicProperty("morphs", JSON.stringify(morphIds.concat(morphId)));
};

ItemStack.prototype.removeMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return;
  }

  const morphId = morph.toString();
  const morphIds = readMorphIds(this);
  if (morphIds.includes(morphId)) this.setDynamicProperty("morphs", JSON.stringify(morphIds.filter(element => element !== morphId)));
};
