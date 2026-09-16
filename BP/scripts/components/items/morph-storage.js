import { EntityTypes, ItemStack } from "@minecraft/server";
import morphs from "../../data/morphs";
import { Morph } from "../../morph/class";

const PLAYER_ENTITY_TYPE = "minecraft:player";
const STORAGE_BLOCKED_ENTITY_TYPES = new Set([ "dark7mc:night_fury", "dark7mc:ancient_elemental" ]);

const SELF_SEAL_BLOCKED_MESSAGE = [{ text: "§7" }, { translate: "morph.self_seal_blocked" }, { text: "§r" }];
const STORAGE_BLOCKED_MESSAGE = [{ text: "§7" }, { translate: "morph.storage_blocked" }, { text: "§r" }];

function isOwnPlayerMorph(morph, player) {
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
    if (STORAGE_BLOCKED_ENTITY_TYPES.has(entityType)) {
      source.sendMessage(STORAGE_BLOCKED_MESSAGE);
      return;
    }
    if (isOwnPlayerMorph(morph, source)) {
      source.sendMessage(SELF_SEAL_BLOCKED_MESSAGE);
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
    source.setMorph(new Morph(PLAYER_ENTITY_TYPE, {}, source.name), { soulSwitch: false });
  },
  onCompleteUse: ({ itemStack, source }, { params }) => {
    const {
      item_converts_to: convertedItemType,
      on_use_action: onUseAction
    } = params;
    if (onUseAction !== "consume") return;

    source.setMorph(Morph.parse(itemStack.getDynamicProperty("morph"), { allowOmnitrix: true }));

    const newItemStack = new ItemStack(convertedItemType);
    newItemStack.getComponent("minecraft:cooldown").startCooldown(source);
    source.getComponent("minecraft:inventory").container.setItem(source.selectedSlotIndex, newItemStack);
  }
};