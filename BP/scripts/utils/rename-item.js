import { ItemStack } from "@minecraft/server";

export function renameItemTypeId(itemStack, identifier) {
  const newItemStack = new ItemStack(identifier);

  newItemStack.amount = itemStack.amount;
  newItemStack.keepOnDeath = itemStack.keepOnDeath;
  newItemStack.lockMode = itemStack.lockMode;
  newItemStack.nameTag = itemStack.nameTag;
  newItemStack.setCanDestroy(itemStack.getCanDestroy());
  newItemStack.setCanPlaceOn(itemStack.getCanPlaceOn());
  newItemStack.setLore(itemStack.getLore());

  if (newItemStack.hasComponent("minecraft:durability") && itemStack.hasComponent("minecraft:durability")) {
    newItemStack.getComponent("minecraft:durability").damage = itemStack.getComponent("minecraft:durability").damage;
  }

  for (const dynamicProperty of itemStack.getDynamicPropertyIds()) {
    newItemStack.setDynamicProperty(dynamicProperty, itemStack.getDynamicProperty(dynamicProperty));
  }

  return newItemStack;
}