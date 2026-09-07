export function refreshMorphNameTag(player, entityType, playerName) {
  if (entityType === undefined) return false;

  playerName ??= player.getMorph()?.playerName;
  player.nameTag = entityType === "minecraft:player" ? (playerName ?? player.name) : "";
  return true;
}
