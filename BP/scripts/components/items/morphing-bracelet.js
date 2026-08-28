import { Entity, GameMode, ItemStack, MolangVariableMap, Player, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/class";
import { morphEvents } from "../../morph/entity-methods";
import { getPlayerIconPath, getPlayerSkinIndex } from "../../data/player-skins";
import { namespace } from "../../utils/namespace";

const IDENTIFIER = "morphing_bracelet";

export default {
  id: IDENTIFIER,
  onUse: ({ itemStack, source }) => {
    const itemSlot = source.getComponent("minecraft:inventory").container.getSlot(source.selectedSlotIndex);
    const morphIds = JSON.parse(itemStack.getDynamicProperty("morphs"));

    showMorphMenu(source, itemSlot, itemStack, morphIds);
  }
};

function showMorphMenu(source, itemSlot, itemStack, morphIds) {
  const variantsByAge = new Map();

  const visibleMorphIds = morphIds.filter(morphId => getMorphPlayerName(morphId) !== source.name);
  for (const morphId of visibleMorphIds) {
    const entityType = parseEntityType(morphId);
    const playerName = getMorphPlayerName(morphId);
    const ageKey = playerName === undefined ? getAgeKey(morphId) : "named";
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
    if (canceled) return;

    const entry = sortedEntries[selection];
    if (entry.variants.length === 1) {
      applyMorphSelection(source, itemSlot, itemStack, entry.variants[0]);
      return;
    }

    system.runTimeout(() => {
      showVariantMenu(source, itemSlot, itemStack, morphIds, [...entry.variants].sort(sortMorphIds));
    }, 1);
  });
}

function showVariantMenu(source, itemSlot, itemStack, morphIds, sortedVariants) {
  const menuTitle = getMorphPlayerName(sortedVariants[0]) === undefined
    ? "morph.menu.variant"
    : "morph.menu.player";
  const variantMenu = new ActionFormData().title(menuTitle);
  for (const morphId of sortedVariants) {
    variantMenu.button(getMorphPlayerLabel(morphId), getMorphIconPath(morphId));
  }

  variantMenu.show(source).then(({ canceled, selection }) => {
    if (canceled) {
      system.runTimeout(() => showMorphMenu(source, itemSlot, itemStack, morphIds), 1);
      return;
    }

    applyMorphSelection(source, itemSlot, itemStack, sortedVariants[selection]);
  });
}

function applyMorphSelection(source, itemSlot, itemStack, morphId) {
  const currentMorph = source.getMorph();
  const selectedMorph = Morph.parse(morphId);
  if (currentMorph.equals(selectedMorph)) return;

  const soulSwitch = itemStack.hasMorph(currentMorph);
  const isMorphingSuccessful = source.setMorph(selectedMorph, { soulSwitch });
  if (!isMorphingSuccessful) return;

  itemStack.removeMorph(selectedMorph);
  if (!soulSwitch) itemStack.addMorph(currentMorph);

  if (source.getGameMode() === GameMode.Creative) { itemSlot.setItem(itemStack); }
  else if (itemStack.getComponent("minecraft:durability").maxDurability - 1 > itemStack.getComponent("minecraft:durability").damage) {
    itemStack.getComponent("minecraft:durability").damage++;
    itemSlot.setItem(itemStack);
  } else {
    itemSlot.setItem(undefined);
    source.dimension.playSound("respawn_anchor.deplete", source.location, { volume: 1.0, pitch: (Math.random() * 0.4) + 0.8 });
  }
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
  if (playerName === undefined && parseEntityType(morphId) === PLAYER_ENTITY_TYPE) return PLAYER_MODEL_TEXTURE;
  if (playerName !== undefined) return getPlayerIconPath(getPlayerSkinIndex(playerName));

  const bracketStart = morphId.indexOf("[");
  const bracketEnd = morphId.indexOf("]", bracketStart);

  const entityType = morphId.slice(0, bracketStart);
  const properties = morphId.slice(bracketStart + 1, bracketEnd);

  return `textures/morph_icons/${entityType.replace(":", "/")}${properties.length === 0 ? "" : `/${properties}`}`;
}

const PLAYER_MODEL_TEXTURE = "__player_paper_doll__";

function getMorphPlayerName(morphId) {
  if (parseEntityType(morphId) !== PLAYER_ENTITY_TYPE) return undefined;
  return Morph.parse(morphId).playerName;
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
  const playerName = getMorphPlayerName(morphId);
  return playerName ?? "";
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

const namespacedId = namespace.toNamespacedId(IDENTIFIER);

world.afterEvents.playerInventoryItemChange.subscribe(({ itemStack, player, slot }) => {
  if (itemStack?.hasComponent(namespacedId) && itemStack.getDynamicProperty("morphs") === undefined) {
    itemStack.setDynamicProperty("morphs", JSON.stringify([ "minecraft:player[]" ]));
    player.getComponent("minecraft:inventory").container.setItem(slot, itemStack);
  }
});

morphEvents.afterMorph.subscribe(({ player, previousMorph, soulSwitch }) => {
  if (!soulSwitch) return;

  giveMorphToPlayer(player, previousMorph);
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const { dimension, location } = player;
    const { heightRange } = dimension;

    const inventory = player.getComponent("minecraft:inventory").container;
    const selectedItemStack = inventory.getItem(player.selectedSlotIndex);
    const blockStandingOn = player.getBlockStandingOn({ ignoreThinBlocks: true });

    if (
      selectedItemStack?.hasComponent(namespacedId) &&
      location.y >= heightRange.min && location.y <= heightRange.max &&
      [ "minecraft:soul_sand", "minecraft:soul_soil" ].includes(blockStandingOn?.typeId)
    ) {
      if (selectedItemStack.getComponent("minecraft:durability").damage > 0) {
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
    }
  }
});

const PLAYER_ENTITY_TYPE = "minecraft:player";

world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
  const { damagingEntity } = damageSource;

  if (!(damagingEntity?.typeId === PLAYER_ENTITY_TYPE && isBraceletOwner(damagingEntity))) return;

  const secretMorph = getSecretMorph(deadEntity);
  if (secretMorph !== undefined) {
    giveKilledMobMorphToPlayer(damagingEntity, deadEntity, secretMorph);
  } else if (deadEntity.typeId === PLAYER_ENTITY_TYPE) {
    if (damagingEntity.name === deadEntity.name || deadEntity.name.length === 0) return;

    giveKilledMobMorphToPlayer(
      damagingEntity,
      deadEntity,
      new Morph(PLAYER_ENTITY_TYPE, {}, deadEntity.name)
    );
  } else if (deadEntity.typeId in morphs) {
    const morph = deadEntity.getMorph();
    if (morph === undefined) return;

    giveKilledMobMorphToPlayer(damagingEntity, deadEntity, morph);
  } else {
    const unavailableMobsCollected = JSON.parse(damagingEntity.getDynamicProperty("unavailableMobsCollected") ?? "[]");

    const entityType = deadEntity.typeId;
    if (unavailableMobsCollected.includes(entityType)) return;
    
    damagingEntity.setDynamicProperty("unavailableMobsCollected",
      JSON.stringify(unavailableMobsCollected.concat(entityType))
    );

    const message = `morph.unavailable.${entityType.split(":")[0] === "minecraft" ? "vanilla" : "modded"}`;
    damagingEntity.sendMessage([{ text: "§7" }, { translate: message }, { text: "§r" }]);
  }
});

function getSecretMorph(deadEntity) {
  if (deadEntity.typeId === "minecraft:bat" && deadEntity.nameTag === "night_fury") {
    return new Morph("dark7mc:night_fury");
  }
}

function giveKilledMobMorphToPlayer(player, deadEntity, morph) {
  const isSuccessful = giveMorphToPlayer(player, morph);
  if (!isSuccessful) return;

  const { location: damagerLocation } = player;
  const headLocation = deadEntity.getHeadLocation();

  const particleVariables = new MolangVariableMap();
  const particleDirection = {
    x: damagerLocation.x - headLocation.x,
    y: (damagerLocation.y + 0.5) - headLocation.y,
    z: damagerLocation.z - headLocation.z
  };
  particleVariables.setVector3("variable.direction", particleDirection);
  particleVariables.setFloat("variable.distance",
    Math.sqrt(
      particleDirection.x ** 2 +
      particleDirection.y ** 2 +
      particleDirection.z ** 2
    )
  );

  deadEntity.dimension.spawnParticle("dark7mc:soul_orb_particle", headLocation, particleVariables);
  const orbImpactLocation = {
    x: damagerLocation.x,
    y: damagerLocation.y + 0.5,
    z: damagerLocation.z
  };
  const orbImpactDimension = player.dimension;

  // The soul orb has a 0.5-second lifetime, so this burst fires as it reaches the player.
  system.runTimeout(() => {
    orbImpactDimension.spawnParticle("dark7mc:morph_unlock_burst", orbImpactLocation);
  }, 10);

  player.dimension.playSound("beacon.activate", damagerLocation);
}

function giveMorphToPlayer(player, morph) {
  if (!(player instanceof Player)) throw new TypeError("Expected 'player' argument to be an instance of Player");
  if (!(morph instanceof Morph)) throw new TypeError("Expected 'morph' argument to be an instance of Morph");

  const inventory = player.getComponent("minecraft:inventory").container;
  for (let slot = 0; slot < inventory.size; slot++) {
    const itemStack = inventory.getItem(slot);
    if (itemStack?.hasComponent(namespacedId) && !itemStack.hasMorph(morph)) {
      itemStack.addMorph(morph);
      inventory.setItem(slot, itemStack);
      return true;
    }
  }

  return false;
}

function isBraceletOwner(entity) {
  const inventory = entity.getComponent("minecraft:inventory").container;
  for (let slot = 0; slot < inventory.size; slot++) {
    if (inventory.getItem(slot)?.hasComponent(namespacedId)) return true;
  }
  return false;
}

ItemStack.prototype.hasMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  if (this.hasComponent(namespacedId)) {
    return JSON.parse(this.getDynamicProperty("morphs")).includes(morph.toString());
  } else {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return false;
  }
};

ItemStack.prototype.addMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  if (this.hasComponent(namespacedId)) {
    const morphId = morph.toString();
    if (morphId === "minecraft:player[]") return;

    const morphs = JSON.parse(this.getDynamicProperty("morphs"));
    if (morphs.includes(morphId)) return;

    this.setDynamicProperty("morphs", JSON.stringify(morphs.concat(morphId)));
  } else {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
  }
};

ItemStack.prototype.removeMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");

  if (this.hasComponent(namespacedId)) {
    const morphId = morph.toString();
    if (morphId === "minecraft:player[]") return;

    const morphs = JSON.parse(this.getDynamicProperty("morphs"));
    if (!morphs.includes(morphId)) return;
    
    this.setDynamicProperty("morphs", JSON.stringify(morphs.filter(element => element !== morphId)));
  } else {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
  }
};
