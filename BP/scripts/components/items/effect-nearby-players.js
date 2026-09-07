import { GameMode } from "@minecraft/server";
import { paramsUtil } from "../../utils/component-params";

export default {
  id: "effect_nearby_players",
  onUse: ({ source }, { params }) => {
    const {
      mob_effect: mobEffect,
      distance: distance,
      exclude_creative_mode: excludeCreativeMode,
      effect_sound: effectSound
    } = params;

    const options = {
      location: source.location,
      maxDistance: distance
    };

    paramsUtil.optional(excludeCreativeMode, (parameter) => {
      if (!parameter) return;
      options.excludeGameModes = [ GameMode.Creative ];
    });

    source.dimension.getPlayers(options).forEach(player => {
      if (player.id === source.id) return;

      player.addEffect(mobEffect.name, mobEffect.duration * 20, { amplifier: mobEffect.amplifier ?? 0 });
      paramsUtil.playSound(effectSound, player, false);
    });

    paramsUtil.playSound(effectSound, source, false);
  }
}