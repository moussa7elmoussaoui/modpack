import { ItemStack } from "@minecraft/server";
import { Morph } from "../../morph/class";
import { namespace } from "../../utils/pack-data";

const PLAYER_ENTITY_TYPE = "minecraft:player";
const namespacedId = namespace.toNamespacedId("morph_storage");
const STORAGE_BLOCKED_ENTITY_TYPES = new Set([ "dark7mc:night_fury", "dark7mc:ancient_elemental" ]);

const SELF_SEAL_BLOCKED_MESSAGE = [{ text: "§7" }, { translate: "morph.self_seal_blocked" }, { text: "§r" }];
const STORAGE_BLOCKED_MESSAGE = [{ text: "§7" }, { translate: "morph.storage_blocked" }, { text: "§r" }];

function isOwnPlayerMorph(morph, player) {
  return morph.entityType === PLAYER_ENTITY_TYPE && morph.playerName === player.name;
}

export function initializeStoredMorphs(itemStack, ownerName) {
  if (itemStack.getDynamicProperty("morphs") !== undefined) return false;

  const ownerMorph = new Morph(PLAYER_ENTITY_TYPE, {}, ownerName).toString();
  itemStack.setDynamicProperty("morphs", JSON.stringify([ ownerMorph ]));
  return true;
}

export function readStoredMorphIds(itemStack) {
  const rawMorphs = itemStack.getDynamicProperty("morphs");
  if (typeof rawMorphs !== "string") return [];

  try {
    const morphIds = JSON.parse(rawMorphs);
    return Array.isArray(morphIds) ? morphIds : [];
  } catch {
    return [];
  }
}

export function mergeStoredPlayerMorphs(morphIds, morph) {
  const updatedMorphIds = [];
  let inserted = false;

  for (const morphId of morphIds) {
    let existingMorph;
    try {
      existingMorph = Morph.parse(morphId, { allowOmnitrix: true });
    } catch {
      updatedMorphIds.push(morphId);
      continue;
    }

    if (existingMorph.entityType === PLAYER_ENTITY_TYPE && existingMorph.playerName === morph.playerName) {
      if (!inserted) {
        updatedMorphIds.push(morph.toString());
        inserted = true;
      }
      continue;
    }

    updatedMorphIds.push(morphId);
  }

  if (!inserted) updatedMorphIds.push(morph.toString());
  return updatedMorphIds;
}

export default { id: "morph_storage" };

ItemStack.prototype.hasMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return false;
  }
  return readStoredMorphIds(this).includes(morph.toString());
};

ItemStack.prototype.addMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return;
  }

  const morphId = morph.toString();
  const morphIds = readStoredMorphIds(this);
  if (morph.entityType !== PLAYER_ENTITY_TYPE) {
    if (!morphIds.includes(morphId)) this.setDynamicProperty("morphs", JSON.stringify(morphIds.concat(morphId)));
    return;
  }

  const updatedMorphIds = mergeStoredPlayerMorphs(morphIds, morph);
  if (JSON.stringify(updatedMorphIds) !== JSON.stringify(morphIds)) {
    this.setDynamicProperty("morphs", JSON.stringify(updatedMorphIds));
  }
};

ItemStack.prototype.removeMorph = function(morph) {
  if (!(morph instanceof Morph)) throw new TypeError("Expected argument to be an instance of Morph");
  if (!this.hasComponent(namespacedId)) {
    console.error(`Component '${namespacedId}' is not found in the item '${this.typeId}'`);
    return;
  }

  const morphId = morph.toString();
  const morphIds = readStoredMorphIds(this);
  if (morphIds.includes(morphId)) this.setDynamicProperty("morphs", JSON.stringify(morphIds.filter(element => element !== morphId)));
};