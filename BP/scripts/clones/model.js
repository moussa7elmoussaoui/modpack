import { morphEntityTypes } from "../data/morphs";

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

export function hasReservedCloneName(name) {
  return /^URBAN7MC (?:[1-9]|10)$/.test(name ?? "");
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
export const ATTACK_TARGET_RANGE = 24;
const MIN_BUILD_SPAN = 3;
const MAX_BUILD_SPAN = 16;
const MAX_BUILD_HEIGHT = 12;

export function entityTargetType(entity) {
  if (entity?.typeId !== "minecraft:player") return entity?.typeId ?? "";
  try {
    const morphIndex = entity.getProperty("dark7mc:entity");
    return (Number.isInteger(morphIndex) && morphEntityTypes[morphIndex]) || entity.typeId;
  } catch {
    return entity.typeId;
  }
}

export function entityIsInvisible(entity) {
  try {
    return Boolean(entity?.getEffect("invisibility"));
  } catch {
    return false;
  }
}

export function entityTargetName(entity) {
  const isPlayer = entity?.typeId === "minecraft:player";
  if (isPlayer && entityTargetType(entity) !== "minecraft:player") return "";
  let name = entity?.nameTag;
  if (isPlayer) {
    try {
      const morph = entity.getMorph?.();
      if (morph?.entityType === "minecraft:player" && typeof morph.playerName === "string") {
        name = morph.playerName;
      }
    } catch {}
    if (typeof name !== "string" || !name.trim()) name = entity.name;
  }
  return typeof name === "string" ? name.replace(/§[0-9a-fk-or]/gi, "").trim() : "";
}

export function normalizeEntityName(name) {
  return String(name ?? "").replace(/§[0-9a-fk-or]/gi, "").trim().toLowerCase();
}

function normalizeEntityType(name) {
  let value = String(name ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  let namespace = "minecraft";
  const separator = value.indexOf(":");
  if (separator !== -1) {
    namespace = value.slice(0, separator);
    value = value.slice(separator + 1);
  }
  if (namespace === "minecraft") {
    const plurals = { wolves: "wolf", witches: "witch", foxes: "fox" };
    value = plurals[value] ?? (value.endsWith("s") && !value.endsWith("ss") ? value.slice(0, -1) : value);
  }
  if (!/^[a-z0-9_.-]+$/.test(namespace) || !/^[a-z0-9_.-]+$/.test(value)) return "";
  return `${namespace}:${value}`;
}

export function matchesAttackTarget(entity, order) {
  if (!entity?.isValid || entityIsInvisible(entity)) return false;
  try {
    const health = entity.getComponent("minecraft:health");
    if (health && health.currentValue <= 0) return false;
  } catch {}
  if (order.targetTypeId) {
    if (entity.hasTag(CLONE_TAG)) return false;
    if (order.targetTypeId === "minecraft:player" && entity.typeId === "minecraft:player" &&
      normalizeEntityName(entityTargetName(entity)) === normalizeEntityName(OWNER_NAME)) return false;
    return entityTargetType(entity) === order.targetTypeId;
  }
  return normalizeEntityName(entityTargetName(entity)) === normalizeEntityName(order.targetName);
}

export function parseOrder(input) {
  const text = input.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  if (["follow", "follow me", "come", "come here"].includes(text)) return { kind: "follow" };
  if (["stay", "stay here", "hold position", "wait"].includes(text)) return { kind: "stay" };
  if (["defend", "defend me", "guard", "guard me"].includes(text)) return { kind: "defend" };
  if (["stop", "cancel", "cancel order"].includes(text)) return { kind: "stop" };
  const morph = /^(?:please\s+)?(?:morph|transform|turn)\s+(?:into|to)\s+(.+?)(?:\s+please)?$/.exec(text)
    ?? /^(?:please\s+)?become\s+(.+?)(?:\s+please)?$/.exec(text);
  if (morph) {
    const targetName = morph[1].replace(/^(?:a|an|the)\s+/, "").trim();
    if (targetName) return { kind: "morph", targetName };
  }
  const buildOrder = parseBuildOrder(text);
  if (buildOrder) return buildOrder;
  const attack = /^(?:please\s+)?(?:attack|kill|hunt|target|go after|take out|take down)\s+(.+?)(?:\s+please)?$/.exec(text);
  if (attack) {
    const targetName = attack[1]
      .replace(/^(?:(?:the\s+)?(?:player|entity|mob|creature)\s+)?(?:(?:named|called)\s+)/, "")
      .trim();
    if (targetName) {
      const typeMatch = /^(?:the\s+)?(?:nearest|closest)\s+(.+)$/.exec(targetName);
      if (typeMatch) {
        const typeName = typeMatch[1].replace(/\s+(?:mobs?|entities|creatures?)$/, "").trim();
        const targetTypeId = normalizeEntityType(typeName);
        if (targetTypeId) {
          const targetLabel = targetTypeId.replace(/^minecraft:/, "").replaceAll("_", " ");
          return { kind: "attack", targetName: targetLabel, targetTypeId };
        }
      }
      return { kind: "attack", targetName };
    }
  }

  const match = /^(gather|collect|mine|bring me|get me) (?:(\d+) )?([\w ]+)$/.exec(text);
  if (!match) return;
  const [, verb, count, material] = match;
  const resource = aliases.get(material.replaceAll("_", " "));
  const amount = count === undefined ? 16 : Number(count);
  if (!resource || !Number.isInteger(amount) || amount < 1 || amount > MAX_ORDER_AMOUNT) return;
  if (verb === "mine" && !RESOURCES[resource].blocks) return;
  return { kind: verb === "mine" ? "mine" : "gather", resource, amount };
}

function parseBuildOrder(text) {
  const match = /^build\s+(?:a\s+|the\s+)?(.+?)(?:\s+here)?$/.exec(text);
  if (!match) return;
  const specification = match[1];
  if (/^(?:starter\s+)?(?:hut|shelter|house)$/.test(specification)) {
    return { kind: "build", structure: "hut" };
  }

  const floor = /^(?:(\d{1,2})\s*(?:x|by)\s*(\d{1,2})\s+)?floor(?:\s+(\d{1,2})\s*(?:x|by)\s*(\d{1,2}))?$/.exec(specification);
  if (floor) {
    const length = Number(floor[1] ?? floor[3] ?? 5);
    const width = Number(floor[2] ?? floor[4] ?? 5);
    if (validBuildSpan(length) && validBuildSpan(width)) {
      return { kind: "build", structure: "floor", length, width };
    }
    return;
  }

  const wallSize = /^wall\s+(\d{1,2})\s*(?:x|by)\s*(\d{1,2})$/.exec(specification);
  if (wallSize) {
    const length = Number(wallSize[1]);
    const height = Number(wallSize[2]);
    if (validBuildSpan(length) && validBuildHeight(height)) {
      return { kind: "build", structure: "wall", length, height };
    }
    return;
  }

  const wall = /^wall(?:\s+(\d{1,2})(?:\s+blocks?)?\s+long)?(?:\s+(?:and\s+)?(\d{1,2})(?:\s+blocks?)?\s+high)?$/.exec(specification);
  if (wall) {
    const length = Number(wall[1] ?? 5);
    const height = Number(wall[2] ?? 3);
    if (validBuildSpan(length) && validBuildHeight(height)) {
      return { kind: "build", structure: "wall", length, height };
    }
    return;
  }

  const tower = /^tower(?:\s+(\d{1,2})(?:\s+blocks?)?(?:\s+high)?)?$/.exec(specification);
  if (tower) {
    const height = Number(tower[1] ?? 5);
    if (validBuildHeight(height)) return { kind: "build", structure: "tower", height };
  }
}

function validBuildSpan(value) {
  return Number.isInteger(value) && value >= MIN_BUILD_SPAN && value <= MAX_BUILD_SPAN;
}

function validBuildHeight(value) {
  return Number.isInteger(value) && value >= 3 && value <= MAX_BUILD_HEIGHT;
}

export function buildDimensions(order) {
  switch (order.structure ?? "hut") {
    case "floor": return { length: order.length ?? 5, width: order.width ?? 5, height: 1 };
    case "wall": return { length: order.length ?? 5, width: 1, height: order.height ?? 3 };
    case "tower": return { length: 3, width: 3, height: order.height ?? 5 };
    default: return { length: 5, width: 5, height: 4 };
  }
}

export function describeBuildOrder(order) {
  const { length, width, height } = buildDimensions(order);
  switch (order.structure ?? "hut") {
    case "floor": return `build a ${length} by ${width} floor`;
    case "wall": return `build a ${length}-block wall ${height} blocks high`;
    case "tower": return `build a ${height}-block tower`;
    default: return "build a starter hut";
  }
}

export function buildBlueprint(order, origin, planks = "minecraft:oak_planks") {
  const shape = order.structure ?? "hut";
  if (shape === "hut") return starterHut(origin, planks);

  const { length, width, height } = buildDimensions(order);
  const cells = [];
  const add = (x, y, z) => cells.push({ position: offset(origin, x, y, z), item: planks });

  if (shape === "floor") {
    for (let x = 0; x < length; x++) {
      for (let z = 0; z < width; z++) add(x, 0, z);
    }
  } else if (shape === "wall") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < length; x++) add(x, y, 0);
    }
  } else if (shape === "tower") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const floorOrRoof = y === 0 || y === height - 1;
          const wall = x === 0 || x === 2 || z === 0 || z === 2;
          const doorway = z === 0 && x === 1 && y === 1;
          if (floorOrRoof || (wall && !doorway)) add(x, y, z);
        }
      }
    }
  }

  return cells;
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
