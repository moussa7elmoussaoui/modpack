import { system, world } from "@minecraft/server";
import { ActionFormData, uiManager } from "@minecraft/server-ui";
import { Morph } from "../../morph/class";
import { playerHasWornOmnitrix } from "../../morph/entity-methods";
import { getPlayerIconPath, getPlayerSkinIndex } from "../../data/player-skins";
import { mergeStoredPlayerMorphs } from "./morph-storage";

const PLAYER_ENTITY_TYPE = "minecraft:player";
const openMorphMenus = new Set();
const AGE_PRIORITIES = { adult: 0, wooly_adult: 0, sheared_adult: 1, baby: 2 };

let omnitrixUseHandler;

export default {
  id: "morph_menu",
  onUse: event => {
    if (omnitrixUseHandler === undefined) {
      throw new Error("Omnitrix use handler has not been registered");
    }
    return omnitrixUseHandler(event);
  }
};

export function registerOmnitrixUseHandler(handler) {
  omnitrixUseHandler = handler;
}

export function closeMorphMenuForms(player) {
  if (!openMorphMenus.delete(player)) return;
  uiManager.closeAllForms(player);
}

export function showMorphMenu(source, itemSlot, itemStack, morphIds, menuActions) {
  openMorphMenus.add(source);
  morphIds = normalizeMorphIdsForMenu(source, itemSlot, itemStack, morphIds);
  const variantsByAge = new Map();
  const ownerMorphId = new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString();

  const visibleMorphIds = morphIds.filter(morphId => !menuActions.isMorphHidden(morphId));
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
      menuActions.close();
      return;
    }

    const entry = sortedEntries[selection];
    if (entry?.variants.length === 1) {
      applyMorphSelection(source, itemSlot, itemStack, entry.variants[0]);
      menuActions.close();
      return;
    }

    if (entry !== undefined) {
      system.runTimeout(() => {
        if (menuActions.isWorn()) {
          showVariantMenu(source, itemSlot, itemStack, morphIds, [...entry.variants].sort(sortMorphIds), menuActions);
        }
      }, 1);
    } else {
      menuActions.close();
    }
  }).catch(() => {
    openMorphMenus.delete(source);
    menuActions.close();
  });
}

function normalizeMorphIdsForMenu(source, itemSlot, itemStack, morphIds) {
  let normalizedMorphIds = [];
  const seenMorphIds = new Set();
  const onlinePlayers = new Map(world.getPlayers().map(player => [player.name, player]));
  let hasOwnerMorph = false;

  for (const morphId of morphIds) {
    let morph;
    try {
      morph = Morph.parse(morphId, { allowOmnitrix: true });
    } catch {
      continue;
    }

    if (morph.entityType === PLAYER_ENTITY_TYPE) {
      const playerName = morph.playerName;
      const normalizedMorph = playerName === source.name
        ? new Morph(PLAYER_ENTITY_TYPE, {}, source.name)
        : new Morph(
          PLAYER_ENTITY_TYPE,
          morph.properties,
          playerName,
          onlinePlayers.has(playerName)
            ? playerHasWornOmnitrix(onlinePlayers.get(playerName))
            : morph.wearsOmnitrix
        );

      if (playerName === source.name) hasOwnerMorph = true;
      normalizedMorphIds = mergeStoredPlayerMorphs(normalizedMorphIds, normalizedMorph);
      continue;
    }

    const normalizedMorphId = morph.toString();
    if (seenMorphIds.has(normalizedMorphId)) continue;

    seenMorphIds.add(normalizedMorphId);
    normalizedMorphIds.push(normalizedMorphId);
  }

  if (!hasOwnerMorph) normalizedMorphIds.push(new Morph(PLAYER_ENTITY_TYPE, {}, source.name).toString());

  if (JSON.stringify(normalizedMorphIds) !== JSON.stringify(morphIds)) {
    itemStack.setDynamicProperty("morphs", JSON.stringify(normalizedMorphIds));
    itemSlot.setItem(itemStack);
  }

  return normalizedMorphIds;
}

function showVariantMenu(source, itemSlot, itemStack, morphIds, sortedVariants, menuActions) {
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
        if (menuActions.isWorn()) showMorphMenu(source, itemSlot, itemStack, morphIds, menuActions);
      }, 1);
      return;
    }

    const morphId = sortedVariants[selection];
    if (morphId !== undefined) applyMorphSelection(source, itemSlot, itemStack, morphId);
    menuActions.close();
  }).catch(() => {
    openMorphMenus.delete(source);
    menuActions.close();
  });
}

function applyMorphSelection(source, itemSlot, itemStack, morphId) {
  const currentMorph = source.getMorph();
  const selectedMorph = Morph.parse(morphId, { allowOmnitrix: true });

  const isMorphingSuccessful = source.setMorph(selectedMorph, { soulSwitch: false });
  if (!isMorphingSuccessful) return;

  const storedCurrentMorph = currentMorph.entityType === PLAYER_ENTITY_TYPE && currentMorph.playerName === source.name
    ? new Morph(PLAYER_ENTITY_TYPE, {}, source.name)
    : currentMorph;
  itemStack.addMorph(storedCurrentMorph);

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
