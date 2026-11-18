export const FIRE_BLAST_ITEM_ID = "dark7mc:fire_blast";

export const NIGHT_FURY_MOVE_NAMES = Object.freeze([
  "Flame Shot", "Scorpion Sting", "Dragon Strike", "Bounce Blast"
]);

const SELECTED_MOVE_PROPERTY = "nightFuryMoveIndex";

export function getNightFuryMoveIndex(itemStack) {
  const index = itemStack?.getDynamicProperty(SELECTED_MOVE_PROPERTY);
  return Number.isInteger(index) && index >= 0 && index < NIGHT_FURY_MOVE_NAMES.length ? index : 0;
}

export function updateNightFuryMoveItem(itemStack, moveIndex = getNightFuryMoveIndex(itemStack)) {
  if (itemStack.typeId !== FIRE_BLAST_ITEM_ID) return false;

  const currentLore = itemStack.getRawLore();
  const attachedLore = currentLore.find(line =>
    line.rawtext?.some(part => part.translate === "morph.item.attached")
  );
  const lore = [{ rawtext: [
    { text: "\u00a7r\u00a77" },
    {
      translate: "morph.night_fury.current_move",
      with: { rawtext: [{ text: `\u00a76${NIGHT_FURY_MOVE_NAMES[moveIndex]}\u00a77` }] }
    },
    { text: "\u00a7r" }
  ]}, ...(attachedLore === undefined ? [] : [attachedLore]), { rawtext: [
    { text: "\n\u00a7r\u00a77" },
    { translate: "morph.item.switch_move" },
    { text: "\u00a7r" }
  ]}];

  if (itemStack.getDynamicProperty(SELECTED_MOVE_PROPERTY) === moveIndex &&
    JSON.stringify(currentLore) === JSON.stringify(lore)) return false;

  itemStack.setDynamicProperty(SELECTED_MOVE_PROPERTY, moveIndex);
  itemStack.setLore(lore);
  return true;
}
