export const OMNITRIX_ACTIVE_PROPERTY = "isOmnitrixActive";
export const OMNITRIX_OWNER_NAME_PROPERTY = "dark7mc:omnitrix_owner_name";

export function isActiveOmnitrix(itemStack) {
  return itemStack?.hasComponent("dark7mc:omnitrix") === true &&
    itemStack.hasComponent("dark7mc:morph_storage") &&
    itemStack.getDynamicProperty(OMNITRIX_ACTIVE_PROPERTY) === true;
}

export function isOwnedOmnitrix(itemStack, player) {
  return isActiveOmnitrix(itemStack) &&
    itemStack.getDynamicProperty(OMNITRIX_OWNER_NAME_PROPERTY) === player.name;
}
