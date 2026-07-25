import { system } from "@minecraft/server";
import { paramsUtil } from "../../utils/component-params";

export default {
  id: "infinite_projectile",
  onUse: ({ source }, parameters) => {
    const params = parameters.params;

    paramsUtil.optional(params.use_event, (parameter) => { source.triggerEvent(parameter); });
    paramsUtil.optional(params.use_animation, (parameter) => { source.playAnimation(parameter); });
    paramsUtil.playSound(params.use_sound, source);

    system.runTimeout(() => {
      const launchPower = params.launch_power;
      const spawnOffset = params.spawn_offset;

      const projectile = source.dimension.spawnEntity(
        params.projectile_entity,
        spawnOffset === undefined ? source.getHeadLocation() : {
          x: source.getHeadLocation().x + spawnOffset[0],
          y: source.getHeadLocation().y + spawnOffset[1],
          z: source.getHeadLocation().z + spawnOffset[2]
        }
      ).getComponent("minecraft:projectile");
      projectile.owner = source;
      projectile.shoot({
        x: source.getViewDirection().x * launchPower,
        y: source.getViewDirection().y * launchPower,
        z: source.getViewDirection().z * launchPower
      });

      paramsUtil.optional(params.shoot_event, (parameter) => { source.triggerEvent(parameter); });
      paramsUtil.optional(params.shoot_animation, (parameter) => { source.playAnimation(parameter); });
      paramsUtil.playSound(params.shoot_sound, source);
    }, (params.shoot_delay ?? 0) * 20);
  }
};