import { world } from "@minecraft/server";

const PLAYER_SKIN_ASSIGNMENTS_PROPERTY = "dark7mc:player_skin_assignments";

const YOUTUBER_NAMES = [
  "Dream",
  "Technoblade",
  "DanTDM",
  "Stampy",
  "Mumbo Jumbo",
  "Grian",
  "CaptainSparklez",
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
  "Grox"
];

const YOUTUBER_SKIN_DATA = YOUTUBER_NAMES.map((name, index) => ({
  name,
  model: 0,
  texture: `player_disguise/wide/${name.toLowerCase().replaceAll(" ", "_")}`,
  icon: `player_disguise/wide/${name.toLowerCase().replaceAll(" ", "_")}`
}));

const SLIM_SKINS = Array.from({ length: 150 }, (_, index) => {
  const skinPath = `player_disguise/slim/s${String(index + 1).padStart(3, "0")}`;
  return {
    model: 1,
    texture: skinPath,
    icon: skinPath,
  };
});

const RANDOM_PLAYER_SKINS = Object.freeze([
  { name: "Steve", model: 0, texture: "player_disguise/wide/steve", icon: "player_disguise/wide/steve" },
  { name: "Alex", model: 1, texture: "player_disguise/slim/alex", icon: "player_disguise/slim/alex" },
  ...YOUTUBER_SKIN_DATA,
  ...SLIM_SKINS
]);

export const playerSkins = Object.freeze([
  ...RANDOM_PLAYER_SKINS,
  { name: "DARK7MC", model: 0, texture: "player_disguise/wide/dark7mc", icon: "player_disguise/wide/dark7mc" }
]);

const PLAYER_SKIN_BY_NAME = Object.freeze(Object.fromEntries([
  ["Steve", 0],
  ["Alex", 1],
  ...YOUTUBER_NAMES.map((name, index) => [name, index + 2]),
  ["DARK7MC", RANDOM_PLAYER_SKINS.length]
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
    ? "textures/morph_icons/minecraft/player_disguise/slim/alex"
    : "textures/morph_icons/minecraft/player_disguise/wide/steve";
}
