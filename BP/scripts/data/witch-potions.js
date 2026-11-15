export const WITCH_ENTITY_TYPE = "minecraft:witch";

export const WITCH_POTIONS = Object.freeze({
  "minecraft:potion": Object.freeze({
    delivery: "Consume",
    effects: Object.freeze([
      "minecraft:healing", "minecraft:fire_resistance", "minecraft:water_breathing", "minecraft:swiftness"
    ])
  }),
  "minecraft:splash_potion": Object.freeze({
    delivery: "ThrownSplash",
    effects: Object.freeze([
      "minecraft:harming", "minecraft:poison", "minecraft:slowness", "minecraft:weakness"
    ])
  })
});

export function getWitchPotionEffect(itemStack) {
  const definition = WITCH_POTIONS[itemStack?.typeId];
  if (definition === undefined) return;

  const potion = itemStack.getComponent("minecraft:potion");
  if (potion?.potionDeliveryType.id !== definition.delivery) return;

  const effect = potion.potionEffectType.id;
  return definition.effects.includes(effect) ? effect : undefined;
}
