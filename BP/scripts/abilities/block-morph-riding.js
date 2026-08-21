import { world, system } from "@minecraft/server";

const blockedMounts = new Set();

system.runInterval(() => {
  for (const mount of world.getPlayers()) {
    const morph = mount.getMorph();
    const isRideableMorph = morph !== undefined && morph.entityType !== "minecraft:player" && mount.hasComponent("minecraft:rideable");
    const shouldBlock = isRideableMorph && (mount.isSneaking || mount.isSleeping);
    const isBlocked = blockedMounts.has(mount.id);

    if (shouldBlock && !isBlocked) {
      blockedMounts.add(mount.id);
      mount.triggerEvent("morph:block_riding");
    } else if (!shouldBlock && isBlocked) {
      blockedMounts.delete(mount.id);

      if (morph !== undefined) {
        mount.refreshMorphComponents();
      }
    }

    if (!shouldBlock) continue;

    mount.getComponent("minecraft:rideable")?.ejectRiders();
  }
});