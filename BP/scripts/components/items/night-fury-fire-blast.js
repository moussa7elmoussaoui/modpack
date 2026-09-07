import { system, world } from "@minecraft/server";
import { clearSegment, setSegment } from "../../actionbar.js";
import { PLAYER_DATA_MAP } from "../../night-fury-fire-blast/fire-blast-runtime.js";
import { getNightFuryAimDirection, isNightFury } from "../../night-fury-fire-blast/fire-blast-utils.js";
import FlameShot from "../../night-fury-fire-blast/moves/FlameShot.js";
import ScorpionSting from "../../night-fury-fire-blast/moves/ScorpionSting.js";
import DragonStrike from "../../night-fury-fire-blast/moves/DragonStrike.js";
import BounceBlast from "../../night-fury-fire-blast/moves/BounceBlast.js";

const ITEM_ID = "dark7mc:fire_blast";
const FIRE_BLAST_ORIGIN_FORWARD = 1.4;
const FIRE_BLAST_ORIGIN_HEIGHT = 0.42;
const NIGHT_FURY_CRITICAL_HEALTH = 0.3;
const NIGHT_FURY_NORMAL_LEVEL = 1;
const NIGHT_FURY_CRITICAL_LEVEL = 100;
const NIGHT_FURY_NORMAL_LEVEL_FACTOR = 0.01;
const NIGHT_FURY_CRITICAL_LEVEL_FACTOR = 1;
const MOVE_COOLDOWN = 12;
const DOUBLE_SNEAK_WINDOW = 10;
const ACTIONBAR_SEGMENT = "night_fury_fire_blast";
const ACTIONBAR_CLEAR_MARKER = "§r";
const MOVE_HUD_MARKERS = ["§0§k§r", "§1§k§r", "§2§k§r", "§3§k§r"];
const MOVES = [
  { name: "Flame Shot", activate: FlameShot.activate },
  { name: "Scorpion Sting", activate: ScorpionSting.activate },
  { name: "Dragon Strike", activate: DragonStrike.activate },
  { name: "Bounce Blast", activate: BounceBlast.activate }
];
const inputState = new Map();

function inputFor(player) {
  let input = inputState.get(player.id);
  if (!input) {
    input = {
      cooldown: 0,
      selectedMove: 0,
      sneakHeld: false,
      lastSneakPressTick: -Infinity,
      hudSegmentActive: false
    };
    inputState.set(player.id, input);
  }
  return input;
}

function stateFor(player) {
  let state = PLAYER_DATA_MAP[player.id];
  if (!state) {
    state = {
      dimension: player.dimension,
      viewDir: player.getViewDirection(),
      level: 1,
      levelFactor: 0.01
    };
    PLAYER_DATA_MAP[player.id] = state;
  }

  state.dimension = player.dimension;
  state.viewDir = player.getViewDirection();
  return state;
}

function holdingFireBlast(player) {
  const item = player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  return item?.typeId === ITEM_ID;
}

function fireBlastOrigin(player, direction) {
  const base = player.location;
  return {
    x: base.x + direction.x * FIRE_BLAST_ORIGIN_FORWARD,
    y: base.y + FIRE_BLAST_ORIGIN_HEIGHT + direction.y * FIRE_BLAST_ORIGIN_FORWARD,
    z: base.z + direction.z * FIRE_BLAST_ORIGIN_FORWARD
  };
}

function updateFireBlastPower(player, state) {
  const health = player.getComponent("minecraft:health");
  const maximumHealth = health?.defaultValue;
  const healthRatio = maximumHealth > 0 ? health.currentValue / maximumHealth : 1;
  const critical = healthRatio <= NIGHT_FURY_CRITICAL_HEALTH;

  state.level = critical ? NIGHT_FURY_CRITICAL_LEVEL : NIGHT_FURY_NORMAL_LEVEL;
  state.levelFactor = critical ? NIGHT_FURY_CRITICAL_LEVEL_FACTOR : NIGHT_FURY_NORMAL_LEVEL_FACTOR;
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const state = PLAYER_DATA_MAP[player.id];
    if (state) {
      state.dimension = player.dimension;
      state.viewDir = player.getViewDirection();
    }

    const isUsingFireBlast = isNightFury(player) && holdingFireBlast(player);
    const input = inputState.get(player.id);

    if (!isUsingFireBlast) {
      if (!input) continue;
      if (input.hudSegmentActive) {
        clearSegment(player, ACTIONBAR_SEGMENT, {
          refresh: true,
          emptyLine: ACTIONBAR_CLEAR_MARKER
        });
        input.hudSegmentActive = false;
      }
      input.sneakHeld = false;
      input.lastSneakPressTick = -Infinity;
      continue;
    }

    const activeInput = input ?? inputFor(player);
    const sneaking = player.isSneaking;
    if (sneaking && !activeInput.sneakHeld) {
      if (system.currentTick - activeInput.lastSneakPressTick <= DOUBLE_SNEAK_WINDOW) {
        activeInput.selectedMove = (activeInput.selectedMove + 1) % MOVES.length;
        activeInput.lastSneakPressTick = -Infinity;
      } else {
        activeInput.lastSneakPressTick = system.currentTick;
      }
    }

    activeInput.sneakHeld = sneaking;
    activeInput.hudSegmentActive = true;
    setSegment(player, ACTIONBAR_SEGMENT, {
      priority: 2,
      isHudMarker: true,
      getLine: () => MOVE_HUD_MARKERS[activeInput.selectedMove]
    });
  }
}, 1);

function activate(player) {
  if (!isNightFury(player) || !holdingFireBlast(player)) return;

  const state = stateFor(player);
  const input = inputFor(player);
  if (input.cooldown > system.currentTick) return;

  state.dimension = player.dimension;
  state.viewDir = player.getViewDirection();
  const aimDirection = getNightFuryAimDirection(player);
  updateFireBlastPower(player, state);
  const blastOrigin = fireBlastOrigin(player, aimDirection);
  player.playAnimation("animation.morph.night_fury.breath");

  MOVES[input.selectedMove].activate(player, state, blastOrigin);
  input.cooldown = system.currentTick + MOVE_COOLDOWN;
}

export default {
  id: "night_fury_fire_blast",
  onUse: ({ source }) => activate(source)
};
