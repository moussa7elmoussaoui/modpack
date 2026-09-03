import { Player, system, world } from "@minecraft/server";
import { PLAYER_DATA_MAP } from "../../night-fury-fire-blast/fire-blast-runtime.js";
import FlameShot from "../../night-fury-fire-blast/moves/FlameShot.js";
import ScorpionSting from "../../night-fury-fire-blast/moves/ScorpionSting.js";
import DragonStrike from "../../night-fury-fire-blast/moves/DragonStrike.js";
import BounceBlast from "../../night-fury-fire-blast/moves/BounceBlast.js";

const ITEM_ID = "dark7mc:fire_blast";
const MORPH_ID = 81;
const FIRE_BLAST_ORIGIN_FORWARD = 1.4;
const FIRE_BLAST_ORIGIN_DROP = 1.2;
const NIGHT_FURY_CRITICAL_HEALTH = 0.3;
const NIGHT_FURY_NORMAL_LEVEL = 1;
const NIGHT_FURY_CRITICAL_LEVEL = 100;
const NIGHT_FURY_NORMAL_LEVEL_FACTOR = 0.01;
const NIGHT_FURY_CRITICAL_LEVEL_FACTOR = 1;
const inputState = new Map();

function stateFor(player) {
  let state = PLAYER_DATA_MAP[player.id];
  if (!state) {
    state = {
      dimension: player.dimension,
      viewDir: player.getViewDirection(),
      level: 1,
      levelFactor: 0.01,
      skills: [],
      elementMap: [],
      settings: { showStatusMessages: false, showDamageDebug: false },
      chi: 100,
      combo: 0,
      lastHit: Date.now(),
      overflow: 0,
      sneakTimer: 0,
      blockSpamCount: 0,
      lastChatMsg: Date.now()
    };
    PLAYER_DATA_MAP[player.id] = state;
  }

  state.dimension = player.dimension;
  state.viewDir = player.getViewDirection();
  state.settings ??= { showStatusMessages: false, showDamageDebug: false };
  state.skills ??= [];
  return state;
}

function holdingFireBlast(player) {
  const item = player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  return item?.typeId === ITEM_ID;
}

function isNightFury(player) {
  return player instanceof Player && player.getProperty("dark7mc:entity") === MORPH_ID;
}

function fireBlastOrigin(player, direction) {
  const head = player.getHeadLocation();
  return {
    x: head.x + direction.x * FIRE_BLAST_ORIGIN_FORWARD,
    y: head.y + direction.y * FIRE_BLAST_ORIGIN_FORWARD - FIRE_BLAST_ORIGIN_DROP,
    z: head.z + direction.z * FIRE_BLAST_ORIGIN_FORWARD
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
    if (!state) continue;
    state.dimension = player.dimension;
    state.viewDir = player.getViewDirection();
  }
}, 1);

function activate(player, trigger) {
  if (!isNightFury(player) || !holdingFireBlast(player)) return;

  const state = stateFor(player);
  const input = inputState.get(player.id) ?? { punch: false, cooldown: 0 };
  if (input.cooldown > system.currentTick) return;

  state.dimension = player.dimension;
  state.viewDir = player.getViewDirection();
  updateFireBlastPower(player, state);
  state.nightFuryFireBlastOrigin = fireBlastOrigin(player, state.viewDir);
  player.playAnimation("animation.morph.night_fury.breath");

  if (trigger === "punch") {
    input.punch = true;
    const move = player.isOnGround ? FlameShot : ScorpionSting;
    move.activate(player, state, state.nightFuryFireBlastOrigin);
    input.cooldown = system.currentTick + move.cooldown;
  } else {
    const move = player.isSneaking ? BounceBlast : DragonStrike;
    move.activate(player, state, state.nightFuryFireBlastOrigin);
    input.cooldown = system.currentTick + move.cooldown;
  }

  inputState.set(player.id, input);
}

system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
  if (!(sourceEntity instanceof Player)) return;

  const input = inputState.get(sourceEntity.id) ?? { punch: false, cooldown: 0 };
  switch (id) {
    case "night_fury_fire_blast:left_click_on":
      if (!input.punch) activate(sourceEntity, "punch");
      break;
    case "night_fury_fire_blast:left_click_off":
      input.punch = false;
      inputState.set(sourceEntity.id, input);
      break;
  }
});

export default {
  id: "night_fury_fire_blast",
  onUse: ({ source }) => activate(source, "use")
};
