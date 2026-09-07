import { Player } from "@minecraft/server";
import morphs, { morphEntityTypes } from "../data/morphs";
import { evaluateCondition } from "../morph/condition-evaluator";

export const ATTACHED_TO_MORPH_PROPERTY = "isAttachedToMorph";
export const ATTACHED_MORPH_TYPE_PROPERTY = "attachedMorphEntityType";

const customAbilityItemTypes = new Set(Object.values(morphs).flatMap(morph =>
  (morph.items ?? []).map(({ id }) => id).filter(id => !id.startsWith("minecraft:"))
));

export function isMorphAbilityItem(itemStack) {
  return itemStack !== undefined && (
    itemStack.getDynamicProperty(ATTACHED_TO_MORPH_PROPERTY) === true ||
    customAbilityItemTypes.has(itemStack.typeId)
  );
}

export function getMorphAbilityState(player) {
  const entityType = morphEntityTypes[player.getProperty("dark7mc:entity")];
  const itemTypes = new Set();

  for (const { id, condition } of morphs[entityType]?.items ?? []) {
    if (condition === undefined || evaluateCondition(player, condition)) itemTypes.add(id);
  }

  return { entityType, itemTypes };
}

export function canUseMorphAbility(entity, itemStack) {
  if (!(entity instanceof Player) || !entity.isValid || !isMorphAbilityItem(itemStack)) return false;

  const { entityType, itemTypes } = getMorphAbilityState(entity);
  const attachedEntityType = itemStack.getDynamicProperty(ATTACHED_MORPH_TYPE_PROPERTY);
  return attachedEntityType === entityType && itemTypes.has(itemStack.typeId);
}
