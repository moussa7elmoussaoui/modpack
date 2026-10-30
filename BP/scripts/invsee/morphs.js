import { ActionFormData } from "@minecraft/server-ui";
import { Morph } from "../morph/class";
import {
  agePriority, applyMorphSelection, getAgeKey, getMorphIconPath, getMorphPlayerName, getMorphVariantTitle,
  normalizeMorphIdsForMenu, sortMorphIds
} from "../components/items/morph-menu";
import { findActiveOmnitrix, isHiddenSpecialMorph } from "../components/items/omnitrix";
import { readStoredMorphIds } from "../components/items/morph-storage";
import { displayName, localizedMenuTitle, MARKERS } from "./titles";
import { LocalizedError } from "../utils/messages";

export function readMorphMenu(target) {
  const active = findActiveOmnitrix(target);
  if (!active) throw new LocalizedError("invsee.error.no_omnitrix");
  const ids = normalizeMorphIdsForMenu(target, { setItem() {} }, active.itemStack, readStoredMorphIds(active.itemStack));
  const owner = new Morph("minecraft:player", {}, target.name).toString();
  const visible = ids.filter(id => !isHiddenSpecialMorph(id, target));
  if (!visible.includes(owner)) visible.push(owner);
  const groups = new Map();
  for (const id of visible) {
    const morph = Morph.parse(id, { allowOmnitrix: true });
    const age = morph.playerName === target.name ? "self" : morph.playerName === undefined ? getAgeKey(id) : "named";
    const key = `${morph.entityType}${age}`;
    if (!groups.has(key)) groups.set(key, { entityType: morph.entityType, ageKey: age, variants: [] });
    groups.get(key).variants.push(id);
  }
  const entries = [...groups.values()].sort((a, b) => {
    if (a.entityType === "minecraft:player" && b.entityType === "minecraft:player") {
      if (a.ageKey === "named") return 1;
      if (b.ageKey === "named") return -1;
      return 0;
    }
    if (a.entityType === "minecraft:player") return -1;
    if (b.entityType === "minecraft:player") return 1;
    const typeCompare = a.entityType.split(":")[1].localeCompare(b.entityType.split(":")[1]);
    return typeCompare || agePriority(a.ageKey) - agePriority(b.ageKey);
  });
  for (const entry of entries) entry.variants.sort(sortMorphIds);
  return { ...active, entries };
}

export function morphForm(target, menu) {
  const form = new ActionFormData().title(localizedMenuTitle(target.name, "morph.menu.title"))
    .body(MARKERS.morph + displayName(target.name));
  for (const { variants } of menu.entries) {
    const count = variants.length >= 100 ? "99+" : variants.length > 1 ? String(variants.length) : "";
    form.button(count, getMorphIconPath(variants[0]));
  }
  return form;
}

export function variantsForm(target, variants) {
  const players = getMorphPlayerName(variants[0]) !== undefined;
  const type = players ? "morph.menu.player" : "morph.menu.variant";
  const title = players ? undefined : getMorphVariantTitle(variants[0]);
  const form = new ActionFormData().title(localizedMenuTitle(target.name, type, 238, title))
    .body((players ? MARKERS.players : MARKERS.variants) + displayName(target.name));
  for (const id of variants) form.button(getMorphPlayerName(id) ?? "", getMorphIconPath(id));
  return form;
}

export function selectTargetMorph(target, id) {
  const current = readMorphMenu(target);
  if (!current.entries.some(entry => entry.variants.includes(id))) {
    throw new LocalizedError("invsee.error.morph_unavailable");
  }
  applyMorphSelection(target, current.inventory.getSlot(current.slot), id);
}
