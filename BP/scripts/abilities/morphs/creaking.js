import { BlockPermutation, Player, system, world } from "@minecraft/server";
import { morphEntityTypes } from "../../data/morphs";
import { renameItemTypeId } from "../../utils/updater";

const ENTITY_TYPE = "minecraft:creaking";

const VANILLA_HEART_BLOCK = "minecraft:creaking_heart";
const CUSTOM_HEART_BLOCK = "dark7mc:creaking_heart";
const LINKED_CREAKINGS_DATA = "linkedCreakingMorphs";
const MAX_DISTANCE_FROM_HEART = 34;

const { afterEvents, beforeEvents } = world;

afterEvents.playerInventoryItemChange.subscribe(({ itemStack, player, slot }) => {
  if (itemStack?.typeId !== CUSTOM_HEART_BLOCK) return;

  const vanillaItemStack = renameItemTypeId(itemStack, VANILLA_HEART_BLOCK);
  player.getComponent("minecraft:inventory").container.setItem(slot, vanillaItemStack);
});

beforeEvents.playerInteractWithBlock.subscribe(data => {
  const { block, isFirstEvent, player } = data;

  cancelEventIfImmobile(player, data);
  
  if (!isFirstEvent || player.isSneaking) return;

  const isHeartInactive = block.typeId === VANILLA_HEART_BLOCK && block.permutation.getState("creaking_heart_state") !== "awake";
  if (!isHeartInactive || !isMorphedAsCreaking(player, false)) return;

  data.cancel = true;

  system.run(() => {
    const data = JSON.parse(world.getDynamicProperty(LINKED_CREAKINGS_DATA));
    data[player.id] = { dimension: block.dimension.id, ...block.location };
    world.setDynamicProperty(LINKED_CREAKINGS_DATA, JSON.stringify(data));

    const blockStates = block.permutation.getAllStates();
    block.setPermutation(BlockPermutation.resolve(CUSTOM_HEART_BLOCK, {
      "dark7mc:natural": blockStates["natural"],
      "dark7mc:pillar_axis": blockStates["pillar_axis"]
    }));
    block.dimension.playSound("block.creaking_heart.spawn_mob", block.center());

    player.triggerEvent("dark7mc:creaking.invulnerable");
  });
});

beforeEvents.entityHurt.subscribe(data => cancelEventIfImmobile(data.damageSource.damagingEntity, data));
beforeEvents.itemUse.subscribe(data => cancelEventIfImmobile(data.source, data));
beforeEvents.playerBreakBlock.subscribe(data => cancelEventIfImmobile(data.player, data));
beforeEvents.playerInteractWithEntity.subscribe(data => cancelEventIfImmobile(data.player, data));

system.runInterval(() => {
  if (world.getDynamicProperty(LINKED_CREAKINGS_DATA) === undefined) {
    world.setDynamicProperty(LINKED_CREAKINGS_DATA, "{}");
  }

  const data = JSON.parse(world.getDynamicProperty(LINKED_CREAKINGS_DATA));
  let isDataModified = false;

  for (const [entityId, blockLocation] of Object.entries(data)) {
    const dimension = world.getDimension(blockLocation.dimension);
    const block = dimension.getBlock(blockLocation);
    const entity = world.getEntity(entityId);

    if (
      block?.typeId === CUSTOM_HEART_BLOCK &&
      entity instanceof Player &&
      entity.dimension.id === dimension.id &&
      isMorphedAsCreaking(entity, true) &&
      Math.hypot(
        entity.location.x - (blockLocation.x + 0.5),
        entity.location.y - (blockLocation.y + 0.5),
        entity.location.z - (blockLocation.z + 0.5)
      ) <= MAX_DISTANCE_FROM_HEART
    ) continue;

    delete data[entityId];
    isDataModified = true;
  }

  if (isDataModified) world.setDynamicProperty(LINKED_CREAKINGS_DATA, JSON.stringify(data));

  for (const player of world.getPlayers()) {
    if (player.id in data || !isMorphedAsCreaking(player, true)) continue;
    player.triggerEvent("dark7mc:creaking.vulnerable");
  }
});

function isMorphedAsCreaking(player, isInvulnerable = null) {
  if (!(player instanceof Player)) throw new TypeError("Expected 'player' argument to be an instance of Player");

  const isCreaking = morphEntityTypes[player.getProperty("dark7mc:entity")] === ENTITY_TYPE;
  const hasChargedComponent = player.hasComponent("minecraft:is_charged");

  return isCreaking && (isInvulnerable === null || hasChargedComponent === isInvulnerable);
}

function cancelEventIfImmobile(entity, eventData) {
  if (!(
    entity instanceof Player &&
    isMorphedAsCreaking(entity) &&
    entity.getProperty("minecraft:creaking_state") === "hostile_observed"
  )) return;

  eventData.cancel = true;
}