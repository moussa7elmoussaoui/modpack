import { system } from "@minecraft/server";
import { Morph } from "../../morph/class";
import { namespace } from "../../utils/namespace";

const OWN_PLAYER_MORPH_ID = "minecraft:player[]";

export default {
  definition: {
    name: namespace.toNamespacedId("morph"),
    description: "commands.morph.description",
    permissionLevel: 1,
    cheatsRequired: true,
    mandatoryParameters: [
      { name: "player", type: "PlayerSelector" },
      { name: "morph", type: "String" }
    ],
    optionalParameters: [
      { name: "showEffects", type: "Boolean" }
    ]
  },
  callback: (origin, players, morphId, showEffects = true) => {
    try {
      const morph = morphId === OWN_PLAYER_MORPH_ID ? undefined : Morph.parse(morphId);

      system.run(() => {
        for (const player of players) {
          player.setMorph(morph ?? new Morph("minecraft:player", {}, player.name), { showEffects });
        }
      });

      return { message: "commands.morph.success", status: 0 };
    } catch (error) {
      return { message: `${error}`, status: 1 };
    }
  }
}
