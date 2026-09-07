import { EntityDamageCause, system } from "@minecraft/server";
import { paramsUtil } from "../../utils/component-params";

export default {
  id: "sonic_boom",
  onUse: ({ source }, parameters) => {
    const params = parameters.params;

    paramsUtil.optional(params.charge_animation, (parameter) => { source.playAnimation(parameter); });
    paramsUtil.playSound(params.charge_sound, source);

    system.runTimeout(() => {
      const viewDirection = source.getViewDirection();
      const headLocation = source.getHeadLocation();

      for (const target of source.getEntitiesFromViewDirection({
        ignoreBlockCollision: params.can_pass_through_blocks ?? true,
        maxDistance: params.attack_distance
      })) {
        const entity = target.entity;
        const horizontalKnockback = params.knockback_horizontal_strength ?? 0;

        try {
          entity.applyDamage(params.attack_damage, { cause: EntityDamageCause.sonicBoom, damagingEntity: source });
          entity.applyKnockback({
            x: viewDirection.x * horizontalKnockback,
            z: viewDirection.z * horizontalKnockback
          }, params.knockback_vertical_strength ?? 0);
        } catch {}
      }

      paramsUtil.optional(params.attack_particles, (parameter) => {
        for (let i = 0; i < params.attack_distance; i++) {
          source.dimension.spawnParticle(parameter, {
            x: headLocation.x + (viewDirection.x * (i + 1)),
            y: headLocation.y + (viewDirection.y * (i + 1)),
            z: headLocation.z + (viewDirection.z * (i + 1))
          });
        }
      });

      paramsUtil.playSound(params.attack_sound, source);
    }, (params.charge_duration ?? 0) * 20);
  }
}