import { system } from "@minecraft/server";
import { paramsUtil } from "../../utils/component-params";

const passableBlocks = [ "minecraft:air", "minecraft:water", "minecraft:lava" ];

export default {
  id: "summon_fangs_on_use",
  onUse: ({ source }, parameters) => {
    const params = parameters.params;

    const dimension = source.dimension;
    paramsUtil.optional(params.start_event, (parameter) => { source.triggerEvent(parameter); });
    paramsUtil.playSound(params.cast_sound, source);

    system.runTimeout(() => {
      const location = source.location;
      let y_level = Math.floor(location.y);
      paramsUtil.optional(params.stop_event, (parameter) => { source.triggerEvent(parameter); });

      for (let i = 0; i < params.fang_count; i++) {
        const fangLocation = {
          x: Math.floor(location.x + (i + 1.5) * Math.cos((source.getRotation().y + 90) * (Math.PI / 180))) + 0.5,
          y: y_level,
          z: Math.floor(location.z + (i + 1.5) * Math.sin((source.getRotation().y + 90) * (Math.PI / 180))) + 0.5
        };
        const block = dimension.getBlock(fangLocation);
        
        if (!passableBlocks.includes(block.typeId)) {
          if (!passableBlocks.includes(block.above(1).typeId)) {
            if (!passableBlocks.includes(block.above(2).typeId)) {
              break;
            } else { y_level += 2 }
          } else { y_level += 1 }
        } else if (passableBlocks.includes(block.below(1).typeId)) {
          if (passableBlocks.includes(block.below(2).typeId)) {
            if (passableBlocks.includes(block.below(3).typeId)) {
              if (passableBlocks.includes(block.below(4).typeId)) {
                if (passableBlocks.includes(block.below(5).typeId)) {
                  break;
                } else { y_level -= 4 }
              } else { y_level -= 3 }
            } else { y_level -= 2 }
          } else { y_level -= 1 }
        }

        fangLocation.y = y_level;
        system.runTimeout(() => {
          dimension.spawnEntity("minecraft:evocation_fang", fangLocation);
        }, i);
      }
    }, (params.cast_duration ?? 0) * 20);
  }
};