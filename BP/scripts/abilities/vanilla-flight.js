import {
  ButtonState,
  EntityDamageCause,
  GameMode,
  InputButton,
  InputPermissionCategory,
  Player,
  system,
  world
} from "@minecraft/server";
import { morphEntityTypes } from "../data/morphs";
import { morphEvents } from "../morph/events";

const JUMP_FLIGHT = new Set([
  "minecraft:bat", "minecraft:blaze", "minecraft:bee", "minecraft:parrot"
]);
const FREE_FLIGHT = new Map([
  ["minecraft:wither", 0.1],
  ["minecraft:vex", 0.05],
  ["minecraft:ghast", 0.025],
  ["minecraft:phantom", 0.05],
  ["minecraft:allay", 0.05],
  ["minecraft:ender_dragon", 0.15],
  ["minecraft:happy_ghast", 0.025]
]);
const SAVED_INPUT = "dark7mc:flight_saved_input";
const CONTROL_CATEGORIES = [
  InputPermissionCategory.LateralMovement,
  InputPermissionCategory.Jump,
  InputPermissionCategory.Sneak
];
const reportedErrors = new Set();

function getEntityType(player) {
  return morphEntityTypes[player.getProperty("dark7mc:entity")];
}

function isSurvivalMovement(player) {
  const mode = player.getGameMode();
  return mode === GameMode.Survival || mode === GameMode.Adventure;
}

function restoreInput(player) {
  const saved = player.getDynamicProperty(SAVED_INPUT);
  if (saved === undefined) return;

  const permissions = JSON.parse(saved);
  for (let index = 0; index < CONTROL_CATEGORIES.length; index++) {
    player.inputPermissions.setPermissionCategory(CONTROL_CATEGORIES[index], permissions[index]);
  }
  player.setDynamicProperty(SAVED_INPUT, undefined);
}

function takeFlightControl(player) {
  if (player.getDynamicProperty(SAVED_INPUT) === undefined) {
    const permissions = CONTROL_CATEGORIES.map(category =>
      player.inputPermissions.isPermissionCategoryEnabled(category)
    );
    if (permissions.some(enabled => !enabled)) return false;

    player.setDynamicProperty(SAVED_INPUT, JSON.stringify(permissions));
  }

  for (const category of CONTROL_CATEGORIES) {
    if (player.inputPermissions.isPermissionCategoryEnabled(category)) {
      player.inputPermissions.setPermissionCategory(category, false);
    }
  }
  return true;
}

function reconcileInput(player) {
  const canFly = FREE_FLIGHT.has(getEntityType(player)) && isSurvivalMovement(player) &&
    !player.isSleeping && !player.getComponent("minecraft:riding") &&
    (player.getComponent("minecraft:health")?.currentValue ?? 1) > 0;

  if (!canFly) {
    restoreInput(player);
    return false;
  }
  return takeFlightControl(player);
}

function isPressed(player, button) {
  return player.inputInfo.getButtonState(button) === ButtonState.Pressed;
}

function updateFlight(player) {
  const hasFlightControl = reconcileInput(player);
  const entityType = getEntityType(player);
  if (!isSurvivalMovement(player) || player.isSleeping || player.getComponent("minecraft:riding")) return;

  if (entityType === "minecraft:chicken" || JUMP_FLIGHT.has(entityType)) {
    if (!player.isGliding || player.getRotation().x < 0) {
      player.addEffect("slow_falling", 1, { showParticles: false });
    }
    if (JUMP_FLIGHT.has(entityType) && isPressed(player, InputButton.Jump)) {
      player.addEffect("levitation", 1, { amplifier: 5, showParticles: false });
    }
    return;
  }

  if (!hasFlightControl) return;

  const speed = FREE_FLIGHT.get(entityType);
  const input = player.inputInfo.getMovementVector();
  const direction = player.getViewDirection();
  const yaw = player.getRotation().y * Math.PI / 180;
  let x = direction.x * input.y + Math.cos(yaw) * input.x;
  let y = direction.y * input.y;
  let z = direction.z * input.y + Math.sin(yaw) * input.x;

  y += Number(isPressed(player, InputButton.Jump)) - Number(isPressed(player, InputButton.Sneak));
  const scale = speed / Math.max(1, Math.hypot(x, y, z));
  player.applyImpulse({ x: x * scale, y: y * scale - player.getVelocity().y * 0.1, z: z * scale });
}

function safelyUpdate(player, callback) {
  try {
    callback(player);
    reportedErrors.delete(player.id);
  } catch (error) {
    try { restoreInput(player); } catch {   }
    if (!reportedErrors.has(player.id)) {
      console.warn(`[vanilla-flight] ${error}`);
      reportedErrors.add(player.id);
    }
  }
}

system.runInterval(() => {
  for (const player of world.getPlayers()) safelyUpdate(player, updateFlight);
}, 1);

world.beforeEvents.entityHurt.subscribe(data => {
  if (!(data.hurtEntity instanceof Player) || data.damageSource.cause !== EntityDamageCause.fall) return;
  const entityType = getEntityType(data.hurtEntity);
  if (entityType === "minecraft:chicken" || JUMP_FLIGHT.has(entityType) || FREE_FLIGHT.has(entityType)) {
    data.cancel = true;
  }
});

morphEvents.afterMorph.subscribe(({ player }) => {
  restoreInput(player);
  system.run(() => safelyUpdate(player, reconcileInput));
});

world.afterEvents.playerSpawn.subscribe(({ player }) => {
  system.run(() => safelyUpdate(player, reconcileInput));
});
world.afterEvents.worldLoad.subscribe(() => {
  for (const player of world.getPlayers()) safelyUpdate(player, reconcileInput);
});
world.afterEvents.playerGameModeChange.subscribe(({ player }) => {
  system.run(() => safelyUpdate(player, reconcileInput));
});
world.afterEvents.playerLeave.subscribe(({ playerId }) => reportedErrors.delete(playerId));
