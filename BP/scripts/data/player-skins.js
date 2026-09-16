import { world } from "@minecraft/server";

const PLAYER_SKIN_ASSIGNMENTS_PROPERTY = "dark7mc:player_skin_assignments";

const YOUTUBER_NAMES = [
  "Dream",
  "Technoblade",
  "DanTDM",
  "Stampy",
  "Mumbo Jumbo",
  "Grian",
  "TommyInnit",
  "Ph1LzA",
  "Sapnap",
  "Ramboo",
  "PrestonPlayz",
  "Aphmau",
  "Unspeakable",
  "Fundy",
  "GeorgeNotFound",
  "Wemmbu",
  "Dr Donut",
  "MrBeast",
  "Chandler",
  "Grox",
  "PewDiePie"
];

const YOUTUBER_SKIN_DATA = YOUTUBER_NAMES.map((name) => ({
  name,
  model: ["Grian", "Aphmau", "Fundy"].includes(name) ? 1 : 0,
  texture: `player/${["Grian", "Aphmau", "Fundy"].includes(name) ? "slim" : "wide"}/${name.toLowerCase().replaceAll(" ", "_")}`,
  icon: `player/${["Grian", "Aphmau", "Fundy"].includes(name) ? "slim" : "wide"}/${name.toLowerCase().replaceAll(" ", "_")}`
}));

const SLIM_SKINS = Array.from({ length: 150 }, (_, index) => {
  const skinPath = `player/slim/s${String(index + 1).padStart(3, "0")}`;
  return {
    model: 1,
    texture: skinPath,
    icon: skinPath,
  };
});

const STEVE_SKIN = Object.freeze({ name: "Steve", model: 0, texture: "player/wide/steve", icon: "player/wide/steve" });
const ALEX_SKIN = Object.freeze({ name: "Alex", model: 1, texture: "player/slim/alex", icon: "player/slim/alex" });

// Skin index order: Steve 0; s001–s150 1–150; Alex 151; Dream–PewDiePie 152–172.
const RANDOM_PLAYER_SKINS = Object.freeze([
  STEVE_SKIN,
  ...SLIM_SKINS,
  ALEX_SKIN,
  ...YOUTUBER_SKIN_DATA
]);

export const playerSkins = Object.freeze([
  ...RANDOM_PLAYER_SKINS,
  { name: "DARK7MC", model: 0, texture: "player/wide/dark7mc", icon: "player/wide/dark7mc" },
  { name: "URBAN7MC", model: 0, texture: "player/wide/urban7mc", icon: "player/wide/urban7mc" }
]);

const PLAYER_SKIN_BY_NAME = Object.freeze(Object.fromEntries([
  ["Steve", 0],
  ["Alex", 1 + SLIM_SKINS.length],
  ...YOUTUBER_NAMES.map((name, index) => [name, 2 + SLIM_SKINS.length + index]),
  ["DARK7MC", RANDOM_PLAYER_SKINS.length],
  ["URBAN7MC", RANDOM_PLAYER_SKINS.length + 1]
]));

export function getPlayerSkinIndex(playerName) {
  if (playerName in PLAYER_SKIN_BY_NAME) return PLAYER_SKIN_BY_NAME[playerName];
  if (playerName === undefined) return Math.floor(Math.random() * RANDOM_PLAYER_SKINS.length);

  const assignments = JSON.parse(world.getDynamicProperty(PLAYER_SKIN_ASSIGNMENTS_PROPERTY) ?? "{}");
  const assignedSkin = assignments[playerName];
  if (Number.isInteger(assignedSkin) && assignedSkin >= 0 && assignedSkin < playerSkins.length) {
    return assignedSkin;
  }

  const skinIndex = Math.floor(Math.random() * RANDOM_PLAYER_SKINS.length);
  assignments[playerName] = skinIndex;
  world.setDynamicProperty(PLAYER_SKIN_ASSIGNMENTS_PROPERTY, JSON.stringify(assignments));
  return skinIndex;
}

export function getPlayerIconPath(skinIndex) {
  const skin = playerSkins[skinIndex];
  if (skin?.icon !== undefined) return `textures/morph_icons/minecraft/${skin.icon}`;
  return skin?.model === 1
    ? "textures/morph_icons/minecraft/player/slim/alex"
    : "textures/morph_icons/minecraft/player/wide/steve";
}
