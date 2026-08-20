import { InputPermissionCategory, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../../data/morphs";
import { Morph } from "../../morph/class";
import { morphEvents } from "../../morph/entity-methods";

const ENTITY_TYPE = "minecraft:shulker";

morphEvents.beforeMorph.subscribe(data => {
  const { morph, player } = data;
  if (morph.entityType !== ENTITY_TYPE) return;

  const location = player.location;
  const block = player.dimension.getBlock(location);

  if (player.isOnGround && !block.isSolid && block.below().isSolid && location.y % 1 === 0) {
    player.teleport({
      x: Math.floor(location.x) + 0.5,
      y: Math.floor(location.y),
      z: Math.floor(location.z) + 0.5
    });
  } else {
    data.cancel = true;
    player.onScreenDisplay.setActionBar({ translate: "morph.shulker.invalid_location" });
  }
});

morphEvents.afterMorph.subscribe(({ morph, player, previousMorph }) => {
  const wasShulker = previousMorph.entityType === ENTITY_TYPE;
  const isShulker = morph.entityType === ENTITY_TYPE;

  if (wasShulker === isShulker) return;

  player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, !isShulker);
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (morphEntityTypes[player.getProperty("dark7mc:entity")] !== ENTITY_TYPE) continue;

    const location = player.location;
    const block = player.dimension.getBlock(location);

    if (
      player.isOnGround &&
      !block.isSolid &&
      block.below().isSolid &&
      location.y % 1 === 0 &&
      isAxisCentered(location.x) &&
      isAxisCentered(location.z)
    ) continue;
    
    player.setMorph(new Morph("minecraft:player"));
  }
});

function isAxisCentered(axis) {
  return (Math.round(Math.abs(axis % 1) * 20) / 20) === 0.5;
}