import { GameMode, system, world } from "@minecraft/server";
import { morphEvents } from "../morph/entity-methods";

const FLYING_ENTITY_TYPES = [
  "minecraft:bat",
  "minecraft:blaze",
  "minecraft:wither",
  "minecraft:bee",
  "minecraft:parrot",
  "minecraft:vex",
  "minecraft:ghast",
  "minecraft:phantom",
  "minecraft:allay",
  "minecraft:ender_dragon",
  "dark7mc:night_fury"
];

const MAYFLY_PROPERTY = "mayfly";
const notified = new Set();
let educationDisabled = false;

function isFlyingMorph(player) {
  const morph = player.getMorph();
  return morph !== undefined && FLYING_ENTITY_TYPES.includes(morph.entityType);
}

function setMayfly(player, enabled) {
  if (educationDisabled) return false;

  try {
    player.runCommand(`ability @s mayfly ${enabled ? "true" : "false"}`);
    return true;
  } catch {
    educationDisabled = true;
    return false;
  }
}

function forceStopFlying(player) {
  if (player.isOnGround) return;

  const mode = player.getGameMode();
  if (mode === GameMode.Spectator) return;

  const neutral = mode === GameMode.Survival ? GameMode.Adventure : GameMode.Survival;

  try {
    player.setGameMode(neutral);
    player.setGameMode(mode);
  } catch {
  }
}

function handlePlayer(player, isFlying, { reapply = false } = {}) {
  const wasGranted = player.getDynamicProperty(MAYFLY_PROPERTY) === true;

  if (!isFlying) {
    if (wasGranted) {
      if (!setMayfly(player, false)) return;
    }
    player.setDynamicProperty(MAYFLY_PROPERTY, undefined);
    notified.delete(player.id);
    if (wasGranted) forceStopFlying(player);
    return;
  }

  if (player.getGameMode() === GameMode.Spectator) return;

  if (wasGranted && !reapply) return;

  if (setMayfly(player, true)) {
    player.setDynamicProperty(MAYFLY_PROPERTY, true);
    return;
  }

  player.setDynamicProperty(MAYFLY_PROPERTY, false);

  if (player.getGameMode() === GameMode.Creative) return;

  if (notified.has(player.id)) return;

  notified.add(player.id);
  player.sendMessage([
    { text: "§7[Morph] " },
    { text: "§eFlying requires Education Edition - enable it in the World Settings to fly as this mob." },
    { text: "§r" }
  ]);
}

morphEvents.afterMorph.subscribe(({ morph, player }) => {
  handlePlayer(player, FLYING_ENTITY_TYPES.includes(morph.entityType));
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  system.run(() => handlePlayer(player, isFlyingMorph(player), { reapply: true }));
});

world.afterEvents.playerGameModeChange.subscribe(({ player }) => {
  const playerId = player.id;
  system.runTimeout(() => {
    const resolved = world.getPlayers().find(candidate => candidate.id === playerId);
    if (resolved === undefined) return;
    handlePlayer(resolved, isFlyingMorph(resolved));
  }, 2);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  notified.delete(playerId);
});
