import { world, EntityDamageCause } from "@minecraft/server";

world.afterEvents.entityHurt.subscribe(data => {
  const { damageSource, hurtEntity } = data;
  if (damageSource.damagingEntity && damageSource.damagingEntity.typeId == "minecraft:player" && damageSource.cause == EntityDamageCause.entityAttack) {
    if (damageSource.damagingEntity.getProperty("dark7mc:entity") == 15) { hurtEntity.addEffect("wither", 200); };
    if (damageSource.damagingEntity.getProperty("dark7mc:entity") == 19) { hurtEntity.addEffect("hunger", 600); };
    if (damageSource.damagingEntity.getProperty("dark7mc:entity") == 33) { hurtEntity.addEffect("poison", 140); };
    if (damageSource.damagingEntity.getProperty("dark7mc:entity") == 40 && damageSource.damagingEntity.getComponent("minecraft:mark_variant").value == 0) {
      hurtEntity.addEffect("poison", 200);
      if (damageSource.damagingEntity.getGameMode() != "Creative") {
        damageSource.damagingEntity.triggerEvent("morph:bee_no_stinger");
        damageSource.damagingEntity.dimension.playSound("mob.bee.sting", damageSource.damagingEntity.location);
      };
    };
  };
});