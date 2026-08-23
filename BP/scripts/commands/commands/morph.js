import { system } from "@minecraft/server";
import { Morph } from "../../morph/class";
import { namespace } from "../../utils/namespace";
import morphEnum from "../enums/morph";

export default {
  definition: {
    name: namespace.toNamespacedId("morph"),
    description: "commands.morph.description",
    permissionLevel: 1,
    cheatsRequired: true,
    mandatoryParameters: [
      { name: "player", type: "PlayerSelector" },
      { name: morphEnum.name, type: "Enum" }
    ],
    optionalParameters: [
      { name: "showEffects", type: "Boolean" }
    ]
  },
  callback: (origin, players, morphId, showEffects = true) => {
    try {
      const morph = Morph.parse(morphId);

      system.run(() => {
        for (const player of players) {
          const isSelfDisguise = morph.entityType === "minecraft:player"
            && morph.playerName !== undefined
            && morph.playerName === player.name;

          player.setMorph(isSelfDisguise ? new Morph("minecraft:player") : morph, { showEffects });
        }
      });

      return { message: "commands.morph.success", status: 0 };
    } catch (error) {
      return { message: `${error}`, status: 1 };
    }
  }
}