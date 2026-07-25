import { GameMode, HudElement, HudVisibility, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../data/morphs";
import { morphEvents } from "../morph/entity-methods";

const ENTITY_TYPES = [
  "minecraft:wither",
  "minecraft:warden",
  "minecraft:ender_dragon"
];

const HEALTH_SYMBOL = "\uE10C";

morphEvents.afterMorph.subscribe(({ morph, player, previousMorph }) => {
  const wasHudHidden = ENTITY_TYPES.includes(previousMorph.entityType);
  const shouldHideHud = ENTITY_TYPES.includes(morph.entityType);

  if (wasHudHidden === shouldHideHud) return;

  player.onScreenDisplay.setHudVisibility(
    shouldHideHud ? HudVisibility.Hide : HudVisibility.Reset,
    [ HudElement.Health, HudElement.Armor ]
  );
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (player.getGameMode() === GameMode.Creative) continue;

    const entityType = morphEntityTypes[player.getProperty("morphing_bracelet:entity")];
    if (!ENTITY_TYPES.includes(entityType)) continue;

    const healthComponent = player.getComponent("minecraft:health");
    const healthPercentage = Math.ceil(healthComponent.currentValue) / Math.ceil(healthComponent.defaultValue);

    player.onScreenDisplay.setActionBar(`${HEALTH_SYMBOL} ${(healthPercentage * 100).toFixed(1)}%`);
  }
});