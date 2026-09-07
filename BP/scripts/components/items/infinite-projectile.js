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
      const headLocation = source.getHeadLocation();
      const viewDirection = source.getViewDirection();

      const forwardDistance = params.forward_distance ?? 0;
      const drop = params.drop ?? 0;

      const baseLocation = spawnOffset === undefined ? headLocation : {
        x: headLocation.x + spawnOffset[0],
        y: headLocation.y + spawnOffset[1],
        z: headLocation.z + spawnOffset[2]
      };

      const projectile = source.dimension.spawnEntity(
        params.projectile_entity,
        {
          x: baseLocation.x + viewDirection.x * forwardDistance,
          y: baseLocation.y + viewDirection.y * forwardDistance - drop,
          z: baseLocation.z + viewDirection.z * forwardDistance
        }
      ).getComponent("minecraft:projectile");
      projectile.owner = source;
      projectile.shoot({
        x: viewDirection.x * launchPower,
        y: viewDirection.y * launchPower,
        z: viewDirection.z * launchPower
      });

      paramsUtil.optional(params.shoot_event, (parameter) => { source.triggerEvent(parameter); });
      paramsUtil.optional(params.shoot_animation, (parameter) => { source.playAnimation(parameter); });
      paramsUtil.playSound(params.shoot_sound, source);
    }, (params.shoot_delay ?? 0) * 20);
  }
};