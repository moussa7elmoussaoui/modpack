import { Entity, GameMode, ItemStack, MolangVariableMap, Player, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/classes";
import { morphEvents } from "../../morph/entity-methods";
import { namespace } from "../../utils/namespace";

const IDENTIFIER = "morphing_bracelet";

export default {
  id: IDENTIFIER,
  onUse: ({ itemStack, source }) => {
    const itemSlot = source.getComponent("minecraft:inventory").container.getSlot(source.selectedSlotIndex);
    const morphIds = JSON.parse(itemStack.getDynamicProperty("morphs"));
    
    const morphMenu = new ActionFormData().title("morph.menu.title");

    for (const morphId of morphIds) {
      const bracketStart = morphId.indexOf("[");
      const bracketEnd = morphId.indexOf("]", bracketStart);

      const entityType = morphId.slice(0, bracketStart);
      const properties = morphId.slice(bracketStart + 1, bracketEnd);

      const iconEntityType = entityType === "minecraft:night_fury" ? "minecraft:bat" : entityType;
      const iconPath = `textures/morph_icons/${iconEntityType.replace(":", "/")}${properties.length === 0 ? "" : `/${properties}`}`;
      morphMenu.button(morphId, iconPath);
    }

    morphMenu.show(source).then(({ canceled, selection }) => {
      if (canceled) return;

      const currentMorph = source.getMorph();
      const selectedMorph = Morph.parse(morphIds[selection]);
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
    });
  }
};

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
  } else if (deadEntity.typeId in morphs) {
    if (deadEntity.typeId === PLAYER_ENTITY_TYPE) return;
  
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
    return new Morph("minecraft:night_fury");
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
