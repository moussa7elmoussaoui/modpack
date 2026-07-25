import { EntityTypes, ItemStack } from "@minecraft/server";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/classes";

const PLAYER_ENTITY_TYPE = "minecraft:player";

export default {
  id: "morph_storage",
  onUse: ({ source }, { params }) => {
    const {
      item_converts_to: convertedItemType,
      on_use_action: onUseAction
    } = params;
    if (onUseAction !== "store") return;

    const morph = source.getMorph();
    const entityType = morph.entityType;
    if (entityType === PLAYER_ENTITY_TYPE) return;

    const newItemStack = new ItemStack(convertedItemType);
    newItemStack.setDynamicProperty("morph", morph.toString());
    newItemStack.setLore([{ rawtext: [
      { text: "§r§7" },
      { translate: EntityTypes.get(entityType).localizationKey },
      { text: "§r" }
    ]}]);
    source.getComponent("minecraft:inventory").container.setItem(source.selectedSlotIndex, newItemStack);
    source.setMorph(new Morph(PLAYER_ENTITY_TYPE), { soulSwitch: false });
  },
  onCompleteUse: ({ itemStack, source }, { params }) => {
    const {
      item_converts_to: convertedItemType,
      on_use_action: onUseAction
    } = params;
    if (onUseAction !== "consume") return;

    const morph = Morph.parse(itemStack.getDynamicProperty("morph"));
    source.setMorph(morph);

    const newItemStack = new ItemStack(convertedItemType);
    newItemStack.getComponent("minecraft:cooldown").startCooldown(source);
    source.getComponent("minecraft:inventory").container.setItem(source.selectedSlotIndex, newItemStack);
  }
};