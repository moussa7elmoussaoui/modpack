import { MolangVariableMap, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../data/morphs";

const NIGHT_FURY = "dark7mc:night_fury";
const WATER_BLOCKS = new Set([ "minecraft:water", "minecraft:flowing_water" ]);
const MAX_SURFACE_DISTANCE = 3;
const MAX_SUBMERGED_DISTANCE = 1;
const MIN_HORIZONTAL_SPEED = 10 / 20;
const LEVEL_VERTICAL_SPEED = 0.1 / 20;
const STATE_DURATION_TICKS = 2;
const CONTINUOUS_INTERVAL_TICKS = 1;

const EFFECTS = Object.freeze({
  sprayBurst: { id: "dark7mc:night_fury_wake_spray_burst", originAboveSurface: 0.9 },
  radialSpray: { id: "dark7mc:night_fury_wake_radial_spray", originAboveSurface: 1.0 },
  surfaceSpray: { id: "dark7mc:night_fury_wake_surface_spray", originAboveSurface: 1.1 },
  sideRipple: { id: "dark7mc:night_fury_wake_side_ripple", originAboveSurface: 1.1 },
  forwardSpray: { id: "dark7mc:night_fury_wake_forward_spray", originAboveSurface: 1.1 },
  sideFoam: { id: "dark7mc:night_fury_wake_side_foam", originAboveSurface: 1.1 },
  sprayLoop: { id: "dark7mc:night_fury_wake_spray_loop", originAboveSurface: 0.9 },
  rearRipple: { id: "dark7mc:night_fury_wake_rear_ripple", originAboveSurface: 1.15 }
});

const FAST_WAKE_EFFECTS = Object.freeze([
  EFFECTS.sideRipple,
  EFFECTS.forwardSpray,
  EFFECTS.sideFoam,
  EFFECTS.sprayLoop,
  EFFECTS.rearRipple
]);

const wakeStates = new Map();
let tick = 0;

function getWaterSurface(block) {
  const depth = Number(block.permutation.getState("liquid_depth")) || 0;
  const isFalling = (depth & 8) !== 0;
  const surfaceHeight = isFalling ? 1 : (8 - (depth & 7)) / 8;
  return block.location.y + surfaceHeight;
}

function findWaterSurface(player) {
  const location = player.location;
  const blockX = Math.floor(location.x);
  const blockZ = Math.floor(location.z);
  const startY = Math.floor(location.y + MAX_SURFACE_DISTANCE);
  const endY = Math.floor(location.y - MAX_SUBMERGED_DISTANCE - 1);

  for (let y = startY; y >= endY; y--) {
    const block = player.dimension.getBlock({ x: blockX, y, z: blockZ });
    if (block === undefined) return undefined;
    if (block.typeId === "minecraft:air") continue;
    if (!WATER_BLOCKS.has(block.typeId)) return undefined;

    const surfaceY = getWaterSurface(block);
    const distance = location.y - surfaceY;
    if (distance < -MAX_SUBMERGED_DISTANCE || distance > MAX_SURFACE_DISTANCE) return undefined;

    return { x: location.x, y: surfaceY, z: location.z };
  }

  return undefined;
}

function getTravelDirection(player) {
  const velocity = player.getVelocity();
  const horizontalLength = Math.hypot(velocity.x, velocity.z);
  if (horizontalLength < MIN_HORIZONTAL_SPEED) return undefined;

  return {
    x: velocity.x / horizontalLength,
    y: 0,
    z: velocity.z / horizontalLength
  };
}

function isEligibleNightFury(player, travelDirection) {
  if (morphEntityTypes[player.getProperty("dark7mc:entity")] !== NIGHT_FURY) return false;
  if (player.isOnGround || !player.isSprinting) return false;

  const verticalSpeed = player.getVelocity().y;
  const isGliding = Math.abs(verticalSpeed) <= LEVEL_VERTICAL_SPEED;
  const isDiving = verticalSpeed < -LEVEL_VERTICAL_SPEED;
  return travelDirection !== undefined && (isGliding || isDiving);
}

function createWakeVariables(direction) {
  const variables = new MolangVariableMap();
  variables.setVector3("variable.night_fury_wake_forward", direction);
  variables.setVector3("variable.night_fury_wake_right", {
    x: -direction.z,
    y: 0,
    z: direction.x
  });
  variables.setFloat("variable.night_fury_wake_time_of_day", (world.getTimeOfDay() + 6000) % 24000 / 24000);
  return variables;
}

function spawnEffect(player, surface, variables, effect) {
  try {
    player.dimension.spawnParticle(effect.id, {
      x: surface.x,
      y: surface.y + effect.originAboveSurface,
      z: surface.z
    }, variables);
  } catch {
    // The player may have crossed an unloaded chunk or changed dimensions this tick.
  }
}

function spawnEffects(player, surface, variables, effects) {
  for (const effect of effects) spawnEffect(player, surface, variables, effect);
}

function startWake(player, surface, direction) {
  const variables = createWakeVariables(direction);
  spawnEffects(player, surface, variables, [ EFFECTS.sprayBurst, EFFECTS.radialSpray ]);

  wakeStates.set(player.id, {
    phase: "starting",
    phaseStartedAt: tick,
    nextContinuousAt: undefined
  });
}

function updateWake(player, surface, direction) {
  const state = wakeStates.get(player.id);
  if (state === undefined) {
    startWake(player, surface, direction);
    return;
  }

  const variables = createWakeVariables(direction);

  if (state.phase === "starting") {
    if (tick - state.phaseStartedAt < STATE_DURATION_TICKS) return;

    spawnEffect(player, surface, variables, EFFECTS.surfaceSpray);
    state.phase = "surface";
    state.phaseStartedAt = tick;
    return;
  }

  if (state.phase === "surface") {
    if (tick - state.phaseStartedAt < STATE_DURATION_TICKS) return;

    spawnEffects(player, surface, variables, FAST_WAKE_EFFECTS);
    state.phase = "fast";
    state.nextContinuousAt = tick + CONTINUOUS_INTERVAL_TICKS;
    return;
  }

  if (tick >= state.nextContinuousAt) {
    spawnEffects(player, surface, variables, FAST_WAKE_EFFECTS);
    state.nextContinuousAt = tick + CONTINUOUS_INTERVAL_TICKS;
  }

}

system.runInterval(() => {
  tick++;
  const currentPlayerIds = new Set();

  for (const player of world.getPlayers()) {
    currentPlayerIds.add(player.id);

    const direction = getTravelDirection(player);
    if (!isEligibleNightFury(player, direction)) {
      wakeStates.delete(player.id);
      continue;
    }

    const surface = findWaterSurface(player);
    if (surface === undefined) {
      wakeStates.delete(player.id);
      continue;
    }

    updateWake(player, surface, direction);
  }

  for (const playerId of wakeStates.keys()) {
    if (!currentPlayerIds.has(playerId)) wakeStates.delete(playerId);
  }
});
