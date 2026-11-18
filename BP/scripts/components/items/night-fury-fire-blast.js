import { system, world } from "@minecraft/server";
import { canUseMorphAbility } from "../../abilities/morph-item-guard";
import { clearSegment, setSegment } from "../../actionbar.js";
import { FIRE_BLAST_ITEM_ID, getNightFuryMoveIndex, updateNightFuryMoveItem } from "../../data/night-fury-moves";
import { PLAYER_DATA_MAP } from "../../night-fury-fire-blast/fire-blast-runtime.js";
import { getNightFuryAimDirection } from "../../night-fury-fire-blast/fire-blast-utils.js";
import FlameShot from "../../night-fury-fire-blast/moves/FlameShot.js";
import ScorpionSting from "../../night-fury-fire-blast/moves/ScorpionSting.js";
import DragonStrike from "../../night-fury-fire-blast/moves/DragonStrike.js";
import BounceBlast from "../../night-fury-fire-blast/moves/BounceBlast.js";

const FIRE_BLAST_ORIGIN_FORWARD = 1.4;
const FIRE_BLAST_ORIGIN_HEIGHT = 0.42;
const NIGHT_FURY_CRITICAL_HEALTH = 0.3;
const NIGHT_FURY_NORMAL_LEVEL = 1;
const NIGHT_FURY_CRITICAL_LEVEL = 100;
const NIGHT_FURY_NORMAL_LEVEL_FACTOR = 0.01;
const NIGHT_FURY_CRITICAL_LEVEL_FACTOR = 1;
const MOVE_COOLDOWN = 12;
const ACTIONBAR_SEGMENT = "night_fury_fire_blast";
const ACTIONBAR_CLEAR_MARKER = "§r";
const MOVE_HUD_MARKERS = ["§0§k§r", "§1§k§r", "§2§k§r", "§3§k§r"];
const MOVES = [
  FlameShot, ScorpionSting, DragonStrike, BounceBlast
];
const inputState = new Map();

function inputFor(player) {
  let input = inputState.get(player.id);
  if (!input) {
    input = {
      cooldown: 0,
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

function getHeldFireBlast(player) {
  const item = player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  return item?.typeId === FIRE_BLAST_ITEM_ID ? item : undefined;
}

world.beforeEvents.itemUse.subscribe(event => {
  const { source, itemStack } = event;
  if (event.cancel || itemStack?.typeId !== FIRE_BLAST_ITEM_ID ||
    !canUseMorphAbility(source, itemStack) || !source.isSneaking) return;

  event.cancel = true;
  const slotIndex = source.selectedSlotIndex;
  const moveIndex = getNightFuryMoveIndex(itemStack);
  system.run(() => {
    if (!source.isValid || source.selectedSlotIndex !== slotIndex) return;
    const slot = source.getComponent("minecraft:inventory")?.container?.getSlot(slotIndex);
    const currentItem = slot?.getItem();
    if (currentItem?.typeId !== FIRE_BLAST_ITEM_ID || !canUseMorphAbility(source, currentItem) ||
      getNightFuryMoveIndex(currentItem) !== moveIndex) return;

    updateNightFuryMoveItem(currentItem, (moveIndex + 1) % MOVES.length);
    slot.setItem(currentItem);
  });
});

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

    const heldItem = getHeldFireBlast(player);
    const isUsingFireBlast = canUseMorphAbility(player, heldItem);
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
      continue;
    }

    const activeInput = input ?? inputFor(player);
    const moveIndex = getNightFuryMoveIndex(heldItem);
    activeInput.hudSegmentActive = true;
    setSegment(player, ACTIONBAR_SEGMENT, {
      priority: 2,
      isHudMarker: true,
      getLine: () => MOVE_HUD_MARKERS[moveIndex]
    });
  }
}, 1);

function activate(player, itemStack) {
  if (!canUseMorphAbility(player, itemStack) || getHeldFireBlast(player) === undefined || player.isSneaking) return;

  const state = stateFor(player);
  const input = inputFor(player);
  if (input.cooldown > system.currentTick) return;

  state.dimension = player.dimension;
  state.viewDir = player.getViewDirection();
  const aimDirection = getNightFuryAimDirection(player);
  updateFireBlastPower(player, state);
  const blastOrigin = fireBlastOrigin(player, aimDirection);
  player.playAnimation("animation.morph.night_fury.breath");

  MOVES[getNightFuryMoveIndex(itemStack)].activate(player, state, blastOrigin);
  input.cooldown = system.currentTick + MOVE_COOLDOWN;
}

export default {
  id: "night_fury_fire_blast",
  onUse: ({ source, itemStack }) => activate(source, itemStack)
};
