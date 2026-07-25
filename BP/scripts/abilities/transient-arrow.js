import { Player, world } from "@minecraft/server";
import { morphEntityTypes } from "../data/morphs";

const ENTITY_TYPES = [
  "minecraft:skeleton",
  "minecraft:stray",
  "minecraft:pillager",
  "minecraft:bogged"
];

world.afterEvents.projectileHitBlock.subscribe(({ projectile, source }) => {
  if (projectile.typeId !== "minecraft:arrow" || !(source instanceof Player)) return;

  const entityType = morphEntityTypes[source.getProperty("morphing_bracelet:entity")];
  if (!ENTITY_TYPES.includes(entityType)) return;

  projectile.remove();
});