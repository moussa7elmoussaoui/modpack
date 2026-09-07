import { translated } from "../utils/messages";

export const MARKERS = Object.freeze({
  morph: "dark7mc.invsee.morph|",
  variants: "dark7mc.invsee.variants|",
  players: "dark7mc.invsee.players|"
});

const LOCALIZED_TITLE_WIDTHS = Object.freeze({
  "morph.menu.title": 123,
  "morph.menu.player": 192,
  "morph.menu.variant": 129,
  "morph.menu.variant.baby": 192,
  "morph.menu.variant.sheared": 219
});

export function displayName(name) {
  const validCharacters = Array.from(String(name ?? "")).filter(character =>
    character.length > 1 || character.charCodeAt(0) < 0xd800 || character.charCodeAt(0) > 0xdfff
  ).join("");
  return validCharacters
    .replace(/\u00a7[\s\S]?/gu, "")
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ").trim() || "?";
}

function clusters(text) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(part => part.segment);
  }
  const result = [];
  let joinNext = false;
  let regionalCount = 0;
  for (const character of text.normalize("NFC")) {
    const combining = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe00-\ufe0f\ufe20-\ufe2f\u200d]/.test(character) || /[\u{1f3fb}-\u{1f3ff}]/u.test(character);
    const regional = /[\u{1f1e6}-\u{1f1ff}]/u.test(character);
    if (result.length && (combining || joinNext || (regional && regionalCount % 2 === 1))) result[result.length - 1] += character;
    else result.push(character);
    joinNext = character === "\u200d";
    regionalCount = regional ? regionalCount + 1 : 0;
  }
  return result;
}

function width(text) {
  let pixels = 0;
  for (const character of text) {
    if (/[\u0300-\u036f\ufe00-\ufe0f\u200d]/.test(character)) continue;
    pixels += " !.,:;|'il".includes(character) ? 3 : /[^\x20-\x7e]/.test(character) ? 9 : 6;
  }
  return pixels;
}

export function fitName(name, budget) {
  const clean = displayName(name);
  if (width(clean) <= budget) return clean;
  let abbreviated = "";
  for (const cluster of clusters(clean)) {
    if (width(abbreviated + cluster + "…") > budget) break;
    abbreviated += cluster;
  }
  return abbreviated + "…";
}

export function localizedMenuTitle(name, type, maxWidth = 238, label = { translate: type }) {
  const entityNameWidth = type === "morph.menu.variant" ? 112 : 0;
  const titleWidth = LOCALIZED_TITLE_WIDTHS[label.translate] ?? LOCALIZED_TITLE_WIDTHS[type];
  const nameWidth = Math.min(maxWidth, maxWidth * 2 - titleWidth - entityNameWidth - 24);
  return translated("invsee.menu.title", [fitName(name, Math.max(0, nameWidth)), label]);
}
