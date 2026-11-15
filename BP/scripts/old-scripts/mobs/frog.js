import { EntityDamageCause, world, system } from "@minecraft/server";

world.afterEvents.entityHitEntity.subscribe(data => {
  const { damagingEntity, hitEntity } = data;
  if (damagingEntity.typeId == "minecraft:player" && damagingEntity.getProperty("dark7mc:entity") == 56) {
    if (hitEntity.typeId == "minecraft:player") {
      hitEntity.applyDamage(2, { cause: EntityDamageCause.entityAttack, damagingEntity });
    } else if (!damagingEntity.hasTag("morph:frog.cannot_tongue")) {
      damagingEntity.addTag("morph:frog.cannot_tongue");
      system.runTimeout(() => {
        if (!canUseTongue(damagingEntity, hitEntity)) return;
        hitEntity.clearVelocity();
        hitEntity.applyImpulse({ x: (damagingEntity.location.x - hitEntity.location.x) / 2, y: (damagingEntity.location.y - hitEntity.location.y) / 2, z: (damagingEntity.location.z - hitEntity.location.z) / 2 });
        const knockback = { x: (hitEntity.location.x - damagingEntity.location.x) / 2, z: (hitEntity.location.z - damagingEntity.location.z) / 2 };
        system.runTimeout(() => {
          if (!canUseTongue(damagingEntity, hitEntity)) return;
          hitEntity.applyDamage(2, { cause: EntityDamageCause.entityAttack, damagingEntity });
          system.run(() => {
            if (!canUseTongue(damagingEntity, hitEntity)) return;
            hitEntity.clearVelocity();
            hitEntity.applyKnockback(knockback, 0.5);
          });
        }, 4);
      }, 2);
      system.runTimeout(() => {
        if (damagingEntity.isValid) damagingEntity.removeTag("morph:frog.cannot_tongue");
      }, 20);
    };
  };
});

function canUseTongue(player, target) {
  return player.isValid && target.isValid && player.getProperty("dark7mc:entity") === 56;
}
