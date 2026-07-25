import { world, system } from "@minecraft/server";

world.afterEvents.entityHitEntity.subscribe(data => {
  const { damagingEntity, hitEntity } = data;
  if (damagingEntity.typeId == "minecraft:player" && damagingEntity.getProperty("morphing_bracelet:entity") == 56) {
    if (hitEntity.id == "minecraft:player") {
      hitEntity.runCommand(`damage @s 2 entity_attack entity ${damagingEntity.name}`);
    } else if (!damagingEntity.hasTag("morph:frog.cannot_tongue")) {
      damagingEntity.addTag("morph:frog.cannot_tongue");
      system.runTimeout(() => {
        hitEntity.clearVelocity();
        hitEntity.applyImpulse({ x: (damagingEntity.location.x - hitEntity.location.x) / 2, y: (damagingEntity.location.y - hitEntity.location.y) / 2, z: (damagingEntity.location.z - hitEntity.location.z) / 2 });
        const knockback = { x: (hitEntity.location.x - damagingEntity.location.x) / 2, z: (hitEntity.location.z - damagingEntity.location.z) / 2 };
        system.runTimeout(() => {
          hitEntity.runCommand(`damage @s 2 entity_attack entity ${damagingEntity.name}`);
          system.run(() => {
            hitEntity.clearVelocity();
            hitEntity.applyKnockback(knockback, 0.5);
          });
        }, 4);
      }, 2);
      system.runTimeout(() => {
        damagingEntity.removeTag("morph:frog.cannot_tongue");
      }, 20);
    };
  };
});