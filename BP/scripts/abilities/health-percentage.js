import { GameMode, HudElement, HudVisibility, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../data/morphs";
import { morphEvents } from "../morph/entity-methods";
import { setSegment } from "../actionbar";

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
    setSegment(player, "hp", {
      priority: 0,
      getLine: () => {
        if (player.getGameMode() === GameMode.Creative) return null;

        const entityType = morphEntityTypes[player.getProperty("dark7mc:entity")];
        if (!ENTITY_TYPES.includes(entityType)) return null;

        const healthComponent = player.getComponent("minecraft:health");
        const healthPercentage = Math.ceil(healthComponent.currentValue) / Math.ceil(healthComponent.defaultValue);

        return `${HEALTH_SYMBOL} §c${(healthPercentage * 100).toFixed(1)}%`;
      }
    });
  }
});