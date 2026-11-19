export const OWNER_NAME = "URBAN7MC";
export const CLONE_COUNT = 10;
export const LEVELS_PER_CLONE = 10;
export const CLONE_TAG = "dark7mc:urban_clone";
export const RESPAWN_TICKS = 72_000;
export const OVERWORLD = "minecraft:overworld";

export function cloneName(slot) {
  return `${OWNER_NAME} ${slot}`;
}

export function cloneSlot(name) {
  const match = /^URBAN7MC ([1-9]|10)$/.exec(name ?? "");
  return match ? Number(match[1]) : undefined;
}

export function eligibleCloneCount(level, morph) {
  if (morph?.entityType !== "minecraft:player" || morph.playerName !== OWNER_NAME) return 0;
  return Math.min(CLONE_COUNT, Math.floor(level / LEVELS_PER_CLONE));
}

export function blockPosition({ x, y, z }) {
  return { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
}

export function offset({ x, y, z }, dx, dy, dz) {
  return { x: x + dx, y: y + dy, z: z + dz };
}

export function distanceSquared(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}

export function positionKey({ x, y, z }) {
  return `${x},${y},${z}`;
}

const vanilla = names => names.map(name => `minecraft:${name}`);
export const WOOD_TYPES = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry", "pale_oak"];
const logs = vanilla(WOOD_TYPES.map(wood => `${wood}_log`));
const planks = vanilla(WOOD_TYPES.map(wood => `${wood}_planks`));
export const RESOURCES = {
  logs: { label: "logs", blocks: logs, items: logs },
  planks: { label: "planks", items: planks },
  cobblestone: { label: "cobblestone", blocks: vanilla(["stone", "cobblestone"]), items: vanilla(["cobblestone"]), tier: 1 },
  cobbled_deepslate: { label: "cobbled deepslate", blocks: vanilla(["deepslate", "cobbled_deepslate"]), items: vanilla(["cobbled_deepslate"]), tier: 1 },
  dirt: { label: "dirt", blocks: vanilla(["dirt", "grass_block"]), items: vanilla(["dirt"]) },
  sand: { label: "sand", blocks: vanilla(["sand"]), items: vanilla(["sand"]) },
  gravel: { label: "gravel", blocks: vanilla(["gravel"]), items: vanilla(["gravel"]) },
  coal: ore("coal", "coal", 1),
  copper: ore("copper", "raw_copper", 2),
  iron: ore("iron", "raw_iron", 2),
  gold: ore("gold", "raw_gold", 3),
  lapis: ore("lapis", "lapis_lazuli", 2),
  redstone: ore("redstone", "redstone", 3),
  diamond: ore("diamond", "diamond", 3),
  emerald: ore("emerald", "emerald", 3)
};

function ore(block, item, tier) {
  const blocks = [`${block}_ore`, `deepslate_${block}_ore`];
  if (block === "redstone") blocks.push("lit_redstone_ore", "lit_deepslate_redstone_ore");
  return { label: item.replaceAll("_", " "), blocks: vanilla(blocks), items: vanilla([item]), tier };
}

const aliases = new Map([
  ["wood", "logs"], ["log", "logs"], ["wood logs", "logs"], ["stone", "cobblestone"], ["cobble", "cobblestone"],
  ["deepslate", "cobbled_deepslate"], ["lapis lazuli", "lapis"], ["diamonds", "diamond"], ["emeralds", "emerald"],
  ["sands", "sand"]
]);
for (const [key, resource] of Object.entries(RESOURCES)) {
  aliases.set(key.replaceAll("_", " "), key);
  aliases.set(resource.label, key);
  if (resource.tier && key !== "cobblestone" && key !== "cobbled_deepslate") aliases.set(`${key} ore`, key);
}

export const MAX_ORDER_AMOUNT = 256;

export function parseOrder(input) {
  const text = input.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  if (["follow", "follow me", "come", "come here"].includes(text)) return { kind: "follow" };
  if (["stay", "stay here", "hold position", "wait"].includes(text)) return { kind: "stay" };
  if (["defend", "defend me", "guard", "guard me"].includes(text)) return { kind: "defend" };
  if (["stop", "cancel", "cancel order"].includes(text)) return { kind: "stop" };
  if (/^build (?:a |the )?(?:starter )?(?:hut|shelter)(?: here)?$/.test(text)) return { kind: "build" };

  const match = /^(gather|collect|mine|bring me|get me) (?:(\d+) )?([\w ]+)$/.exec(text);
  if (!match) return;
  const [, verb, count, material] = match;
  const resource = aliases.get(material.replaceAll("_", " "));
  const amount = count === undefined ? 16 : Number(count);
  if (!resource || !Number.isInteger(amount) || amount < 1 || amount > MAX_ORDER_AMOUNT) return;
  if (verb === "mine" && !RESOURCES[resource].blocks) return;
  return { kind: verb === "mine" ? "mine" : "gather", resource, amount };
}

export function starterHut(origin, planks = "minecraft:oak_planks") {
  const cells = [];
  for (let y = 0; y <= 3; y++) {
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const wall = x === 0 || x === 4 || z === 0 || z === 4;
        const doorway = x === 2 && z === 0;
        const step = y === 1 && x === 1 && z === 1;
        if (y === 0 || y === 3 || step || (wall && !doorway)) {
          cells.push({ position: offset(origin, x, y, z), item: planks });
        }
      }
    }
  }
  return cells;
}
