import { EntityComponentTypes, GameMode, Player, system, world } from "@minecraft/server";
import * as GameTest from "@minecraft/server-gametest";
import { findActiveOmnitrix, handleOmnitrixUse } from "../components/items/omnitrix";
import { Morph } from "../morph/class";
import { LocalizedError } from "../utils/messages";
import { clearTarget, newBrain, runCloneTurn, stopActions } from "./behavior";
import { clearCarriedGear, enderOf, inventoryEntries, inventoryOf, selectSlot } from "./inventory";
import {
  blockPosition, cloneName, cloneSlot, CLONE_COUNT, CLONE_TAG, distanceSquared, eligibleCloneCount, LEVELS_PER_CLONE,
  OVERWORLD, OWNER_NAME, RESPAWN_TICKS
} from "./model";
import { checkStorage, restoreCloneEnder, restoreCloneGear, saveCloneEnder, saveCloneGear } from "./storage";
import { entityCrowding, uncrowdedSpot } from "./terrain";

const SAVE_KEY = "dark7mc:urban_clones_v1";
const INVSEE_ACTIVE = "dark7mc:invsee_active";
const SAVE_INTERVAL = 400;
const XP_LIMIT = 2 ** 24;
const live = new Map();
const spawnRetries = new Map();
let state;
let loaded = false;
let owner;
let storageState;
let retryStorageAt = 0;
let nextSpawnAt = 0;
let lastClockTick;
let turnIndex = 0;
let lastRuntimeError;

function emptyState() {
  return { unlockedCount: 0, roster: Array.from({ length: CLONE_COUNT }, () => ({ remaining: 0 })) };
}

function saveState(nextState = state) {
  world.setDynamicProperty(SAVE_KEY, JSON.stringify(nextState));
  state = nextState;
}

function readState() {
  const saved = world.getDynamicProperty(SAVE_KEY);
  if (saved === undefined) return emptyState();
  const { unlockedCount = 0, roster } = JSON.parse(saved);
  if (!Array.isArray(roster) || roster.length !== CLONE_COUNT ||
    !Number.isInteger(unlockedCount) || unlockedCount < 0 || unlockedCount > CLONE_COUNT) {
    throw new Error("Invalid URBAN7MC clone roster.");
  }
  return { unlockedCount, roster };
}

export function isOwner(player) {
  return player instanceof Player && player.isValid && player.name === OWNER_NAME;
}

export function requireCloneAccess(player, slot = 1) {
  if (!isOwner(player)) throw new LocalizedError("clones.error.owner");
  if (!Number.isInteger(slot) || slot < 1 || slot > CLONE_COUNT) throw new LocalizedError("clones.error.number");
  if (slot > (state?.unlockedCount ?? 0)) {
    throw new LocalizedError("clones.error.locked", [slot * LEVELS_PER_CLONE, cloneName(slot)]);
  }
}

function isAlive(player) {
  return player?.isValid === true && (player.getComponent(EntityComponentTypes.Health)?.currentValue ?? 0) > 0;
}

function canWork(player) {
  return isAlive(player) && player.dimension.id === OVERWORLD && player.getGameMode() !== GameMode.Spectator;
}

function showRuntimeError(error) {
  const message = String(error?.message ?? error);
  if (message === lastRuntimeError) return;
  lastRuntimeError = message;
  console.warn(`[URBAN7MC clones] ${message}`);
  if (isOwner(owner)) owner.sendMessage(`Clones are temporarily unavailable. ${message}`);
}

function startStorage() {
  if (storageState || system.currentTick < retryStorageAt) return;
  if (typeof GameTest.spawnSimulatedPlayer !== "function") {
    showRuntimeError(new Error("This Bedrock build does not expose standalone simulated players."));
    retryStorageAt = system.currentTick + 200;
    return;
  }
  try {
    checkStorage();
    storageState = "ready";
  } catch (error) {
    retryStorageAt = system.currentTick + 200;
    showRuntimeError(error);
  }
}

function newActor(slot, player) {
  return { slot, player, brain: newBrain(), saveAt: system.currentTick + SAVE_INTERVAL, nextWarning: 0, paused: false };
}

function speak(actor, message) {
  try {
    actor.player.chat(message);
  } catch {
    world.sendMessage(`<${cloneName(actor.slot)}> ${message}`);
  }
}

function getRecord(slot) {
  return state.roster[slot - 1];
}

function checkpoint(actor) {
  if (storageState !== "ready" || !isAlive(actor.player)) return;
  const { player, slot } = actor;
  const record = getRecord(slot);
  const gear = saveCloneGear(slot, record.gear, player);
  const ender = saveCloneEnder(slot, record.ender, player);
  Object.assign(record, {
    gear, ender, position: player.location, xp: player.getTotalXp(), morph: player.getMorph()?.toString()
  });
  actor.saveAt = system.currentTick + SAVE_INTERVAL;
  saveState();
}

function retryCheckpoint(actor) {
  try {
    checkpoint(actor);
  } catch (error) {
    actor.saveAt = system.currentTick + 100;
    showRuntimeError(error);
  }
}

function addSavedXp(player, xp) {
  for (let left = xp; left > 0; left -= XP_LIMIT) player.addExperience(Math.min(left, XP_LIMIT));
}

function spawnPosition(slot, record) {
  const { dimension, location } = owner;
  const preferred = record.position && distanceSquared(record.position, location) <= 28 ** 2 ? record.position : location;
  const result = uncrowdedSpot(dimension, preferred, entityCrowding(dimension, preferred, undefined, 10), { radius: 5 });
  if (result) return result;
  if (preferred !== location) {
    const fallback = uncrowdedSpot(dimension, location, entityCrowding(dimension, location, undefined, 10), { radius: 5 });
    if (fallback) return fallback;
  }
  throw new Error(`No safe spawn position near URBAN7MC for clone ${slot}.`);
}

function spawnClone(slot, record) {
  const position = spawnPosition(slot, record);
  const dimension = owner.dimension;
  const name = cloneName(slot);
  const player = GameTest.spawnSimulatedPlayer({ ...position, dimension }, name, GameMode.Survival);
  try {
    if (player.name !== name) throw new Error(`Bedrock returned "${player.name}" when spawning "${name}".`);
    if (!inventoryOf(player) || !enderOf(player)) throw new Error("Simulated players need native inventory and Ender Chest access.");
    player.addTag(CLONE_TAG);
    clearCarriedGear(player);
    player.resetLevel();
    restoreCloneEnder(slot, record.ender, player);
    if (record.spawned) {
      restoreCloneGear(slot, record.gear, player);
      addSavedXp(player, record.xp ?? 0);
    }
    const heldMorph = record.spawned && record.morph && findActiveOmnitrix(player);
    const morph = heldMorph
      ? Morph.parse(record.morph, { allowOmnitrix: true })
      : new Morph("minecraft:player", {}, player.name);
    player.setMorph(morph, { showEffects: false, soulSwitch: false, force: true });
    player.setDynamicProperty("isInitialized", true);
    live.set(slot, newActor(slot, player));
    record.spawned = true;
    record.position = position;
    saveState();
    lastRuntimeError = undefined;
  } catch (error) {
    live.delete(slot);
    if (player.isValid) player.disconnect();
    throw error;
  }
}

function park(actor) {
  const { player, slot, brain } = actor;
  clearTarget(brain);
  if (!isAlive(player)) return;
  stopActions(player, brain);
  checkpoint(actor);
  player.disconnect();
  live.delete(slot);
}

function updateRoster() {
  const players = world.getAllPlayers();
  owner = players.find(isOwner);
  const previousCount = state.unlockedCount;
  if (previousCount < CLONE_COUNT && isAlive(owner) && owner.level >= (previousCount + 1) * LEVELS_PER_CLONE) {
    const count = eligibleCloneCount(owner.level, owner.getMorph());
    if (count > previousCount) {
      saveState({ ...state, unlockedCount: count });
      const first = cloneName(previousCount + 1);
      const unlocked = count === previousCount + 1 ? first : `${first} through ${cloneName(count)}`;
      owner.sendMessage(`Unlocked ${unlocked}.`);
      if (previousCount === 0) owner.sendMessage('Say "Clones, help" to see your chat orders.');
    }
  }
  if (!state.unlockedCount) return;

  const now = system.currentTick;
  const elapsed = now - (lastClockTick ?? now);
  lastClockTick = now;
  let clockChanged = false;
  for (const record of state.roster) {
    if (!record.remaining) continue;
    record.remaining = Math.max(0, record.remaining - elapsed);
    clockChanged = true;
  }
  if (clockChanged) saveState();

  for (const player of players) {
    if (!(player instanceof GameTest.SimulatedPlayer) || !player.hasTag(CLONE_TAG)) continue;
    const slot = cloneSlot(player.name);
    if (!slot) continue;
    const record = getRecord(slot);
    if (slot > state.unlockedCount || !record.spawned || record.remaining > 0) {
      player.disconnect();
    } else if (!live.has(slot) && isAlive(player)) {
      live.set(slot, newActor(slot, player));
    }
  }

  if (canWork(owner) || live.size) startStorage();
  if (storageState !== "ready") return;
  if (!isOwner(owner)) {
    const actor = live.values().next().value;
    if (actor) park(actor);
    return;
  }
  if (!canWork(owner) || now < nextSpawnAt) return;
  const nextSlot = state.roster.findIndex((record, index) =>
    index < state.unlockedCount && !record.remaining && !live.has(index + 1) && (spawnRetries.get(index + 1) ?? 0) <= now
  ) + 1;
  if (!nextSlot) return;
  nextSpawnAt = now + 20;
  try {
    spawnClone(nextSlot, getRecord(nextSlot));
    spawnRetries.delete(nextSlot);
  } catch (error) {
    spawnRetries.set(nextSlot, now + 100);
    showRuntimeError(error);
  }
}

function updateActor(actor) {
  const { player, brain, slot } = actor;
  if (!player.isValid) {
    clearTarget(brain);
    live.delete(slot);
    return;
  }
  if (!isAlive(player)) {
    handleDeath(actor);
    return;
  }
  if (!canWork(owner) || player.dimension.id !== OVERWORLD || actor.paused || player.getDynamicProperty(INVSEE_ACTIVE) === true) {
    if (!actor.wasPaused) stopActions(player, brain);
    actor.wasPaused = true;
    return;
  }
  actor.wasPaused = false;
  if (system.currentTick >= actor.saveAt) retryCheckpoint(actor);
  if (system.currentTick < (actor.retryAt ?? 0)) return;
  const record = getRecord(slot);
  const { complete, problem } = runCloneTurn(player, owner, record.order, brain, {
    changed: saveState,
    dirty: () => { actor.saveAt = Math.min(actor.saveAt, system.currentTick + 40); },
    checkpoint: () => checkpoint(actor)
  });
  brain.problem = problem;
  if (complete) {
    record.order = undefined;
    brain.status = "Waiting";
    brain.recentWork = complete;
    clearTarget(brain);
    stopActions(player, brain);
    retryCheckpoint(actor);
    saveState();
    speak(actor, `Done. ${complete}.`);
  } else if (problem) {
    brain.status = problem;
    clearTarget(brain);
    stopActions(player, brain);
    actor.retryAt = system.currentTick + 100;
    if (system.currentTick >= actor.nextWarning) {
      speak(actor, `I'm stuck. ${problem}.`);
      actor.nextWarning = system.currentTick + 600;
    }
  }
}

function handleDeath(actor) {
  const { slot, player, brain } = actor;
  const record = getRecord(slot);
  if (live.get(slot) !== actor) return;
  live.delete(slot);
  clearTarget(brain);
  if (storageState === "ready" && player.isValid) {
    try {
      record.ender = saveCloneEnder(slot, record.ender, player);
    } catch (error) {
      showRuntimeError(error);
    }
  }
  Object.assign(record, {
    remaining: RESPAWN_TICKS, spawned: false, order: undefined,
    position: undefined, gear: undefined, morph: undefined, xp: 0
  });
  if (lastClockTick !== undefined) {
    record.remaining += system.currentTick - lastClockTick;
  }
  saveState();
  if (isOwner(owner)) owner.sendMessage(`${cloneName(slot)} died and will return in three Minecraft days.`);
  system.run(() => { if (player.isValid) player.disconnect(); });
}

world.afterEvents.worldLoad.subscribe(() => {
  try {
    state = readState();
    loaded = true;
  } catch (error) {
    showRuntimeError(error);
  }
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  for (const actor of live.values()) {
    if (actor.player.id !== deadEntity.id) continue;
    handleDeath(actor);
    break;
  }
});

system.runInterval(() => {
  if (!loaded) return;
  try {
    if (system.currentTick % 20 === 0) updateRoster();
    const actor = live.get(turnIndex + 1);
    turnIndex = (turnIndex + 1) % CLONE_COUNT;
    if (actor) updateActor(actor);
  } catch (error) {
    showRuntimeError(error);
  }
}, 1);

function requireActor(viewer, slot) {
  requireCloneAccess(viewer, slot);
  const actor = live.get(slot);
  if (!actor || !isAlive(actor.player)) throw new LocalizedError("clones.error.unavailable");
  return actor;
}

export function rosterFor(viewer) {
  requireCloneAccess(viewer);
  return state.roster.map((record, index) => {
    const slot = index + 1;
    if (slot > state.unlockedCount) return { slot, ready: false, status: `Unlocks at level ${slot * LEVELS_PER_CLONE}` };
    const actor = live.get(slot);
    const ready = isAlive(actor?.player);
    const seconds = Math.ceil(record.remaining / 20);
    const cooldown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return {
      slot, ready,
      status: seconds > 0 ? `Respawns in ${cooldown}` : ready ? actor.brain.status : "Waiting to spawn"
    };
  });
}

export function assignOrder(viewer, slot, order) {
  const actor = requireActor(viewer, slot);
  if (!canWork(viewer) || actor.player.dimension.id !== OVERWORLD) throw new LocalizedError("clones.error.overworld");
  const record = getRecord(slot);
  clearTarget(actor.brain);
  stopActions(actor.player, actor.brain);
  actor.brain = newBrain();
  actor.retryAt = undefined;
  actor.nextWarning = 0;
  record.order = order.kind === "stop" ? undefined : {
    ...order, anchor: order.kind === "stay" ? blockPosition(actor.player.location) : order.anchor
  };
  actor.brain.status = record.order ? "Order received" : "Waiting";
  saveState();
}

export function replyAsClone(viewer, slot, message) {
  speak(requireActor(viewer, slot), message);
}

export function cloneReport(viewer, slot) {
  const { player, brain, paused, wasPaused } = requireActor(viewer, slot);
  const health = player.getComponent(EntityComponentTypes.Health);
  return {
    status: brain.status,
    order: getRecord(slot).order,
    problem: brain.problem,
    recentWork: brain.recentWork,
    paused: paused || wasPaused,
    level: player.level,
    xp: player.getTotalXp(),
    health: health.currentValue,
    maxHealth: health.effectiveMax,
    hunger: player.getComponent(EntityComponentTypes.Hunger)?.currentValue,
    location: player.location,
    dimension: player.dimension.id,
    inventory: inventoryOf(player),
    enderChest: enderOf(player),
    omnitrix: !!findActiveOmnitrix(player)
  };
}

export function activateCloneOmnitrix(viewer, slot) {
  const actor = requireActor(viewer, slot);
  if (findActiveOmnitrix(actor.player)) return;
  const inventory = inventoryOf(actor.player);
  const candidate = inventoryEntries(inventory).find(({ item }) => item.typeId === "dark7mc:omnitrix");
  if (!candidate) throw new LocalizedError("clones.error.omnitrix");
  if (selectSlot(actor.player, inventory, candidate.slot) === undefined) throw new LocalizedError("clones.error.inventory");
  handleOmnitrixUse({ source: actor.player });
  if (!findActiveOmnitrix(actor.player)) throw new LocalizedError("clones.error.omnitrix");
  retryCheckpoint(actor);
}

export async function withCloneInventory(viewer, slot, action) {
  const actor = requireActor(viewer, slot);
  if (actor.paused || actor.player.getDynamicProperty(INVSEE_ACTIVE) === true) throw new LocalizedError("clones.error.busy");
  actor.paused = true;
  try {
    stopActions(actor.player, actor.brain);
    return await action(actor.player);
  } finally {
    actor.paused = false;
    retryCheckpoint(actor);
  }
}

export function collectCloneXp(viewer, slot) {
  requireCloneAccess(viewer, slot);
  const actors = slot === undefined ? live.values() : [requireActor(viewer, slot)];
  let collected = 0;
  for (const actor of actors) {
    if (!isAlive(actor.player)) continue;
    const clone = actor.player;
    while (true) {
      const cloneBefore = clone.getTotalXp();
      const amount = Math.min(cloneBefore, XP_LIMIT);
      if (!amount) break;
      const viewerBefore = viewer.getTotalXp();
      clone.addExperience(-amount);
      const debited = Math.max(0, cloneBefore - clone.getTotalXp());
      if (!debited) break;
      let credited = 0;
      try {
        viewer.addExperience(debited);
        credited = Math.min(debited, Math.max(0, viewer.getTotalXp() - viewerBefore));
      } finally {
        if (credited < debited) clone.addExperience(debited - credited);
        getRecord(actor.slot).xp = clone.getTotalXp();
        saveState();
      }
      collected += credited;
      if (debited < amount || credited < debited) break;
    }
  }
  return collected;
}
