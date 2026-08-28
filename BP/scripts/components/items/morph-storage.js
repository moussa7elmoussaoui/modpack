import { EntityTypes, ItemStack } from "@minecraft/server";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/class";

const PLAYER_ENTITY_TYPE = "minecraft:player";

const SELF_DISGUISE_MESSAGE = [{ text: "§7" }, { translate: "morph.self_disguise" }, { text: "§r" }];

function isSelfDisguise(morph, player) {
  return morph.entityType === PLAYER_ENTITY_TYPE && morph.playerName === player.name;
}

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
    if (entityType === PLAYER_ENTITY_TYPE && morph.playerName === undefined) return;
    if (isSelfDisguise(morph, source)) {
      source.sendMessage(SELF_DISGUISE_MESSAGE);
      return;
    }

    const newItemStack = new ItemStack(convertedItemType);
    newItemStack.setDynamicProperty("morph", morph.toString());
    const entityTypeDefinition = EntityTypes.get(entityType);
    newItemStack.setLore([{ rawtext: [
      { text: "§r§7" },
      entityTypeDefinition === undefined
        ? { text: entityType }
        : { translate: entityTypeDefinition.localizationKey },
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
    if (isSelfDisguise(morph, source)) {
      source.sendMessage(SELF_DISGUISE_MESSAGE);
      return;
    }

    source.setMorph(morph);

    const newItemStack = new ItemStack(convertedItemType);
    newItemStack.getComponent("minecraft:cooldown").startCooldown(source);
    source.getComponent("minecraft:inventory").container.setItem(source.selectedSlotIndex, newItemStack);
  }
};