import { system } from "@minecraft/server";
import { Morph } from "../../morph/class";
import morphs from "../../data/morphs";
import { namespace } from "../../utils/pack-data";
import { LocalizedError } from "../../utils/messages";
import { commandError, commandFeedback } from "../feedback";

function resolveMorphId(identifier) {
  if (typeof identifier !== "string") throw new TypeError("Identifier must be a string");

  const bracketStart = identifier.indexOf("[");
  const entityType = (bracketStart === -1 ? identifier : identifier.slice(0, bracketStart)).trim();
  const properties = bracketStart === -1 ? "" : identifier.slice(bracketStart).trim();
  if (entityType.includes(":")) return entityType + properties;

  const resolvedType = ["minecraft", namespace.value]
    .map(value => `${value}:${entityType}`)
    .find(value => Object.prototype.hasOwnProperty.call(morphs, value));

  if (resolvedType === undefined) throw new LocalizedError("morph.error.unsupported", [entityType]);

  return resolvedType + properties;
}

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
      const resolvedMorphId = resolveMorphId(morphId);
      const morph = /^minecraft:player(?:\[\s*\])?$/.test(resolvedMorphId)
        ? undefined
        : Morph.parse(resolvedMorphId);

      system.run(() => {
        for (const player of players) {
          player.setMorph(morph ?? new Morph("minecraft:player", {}, player.name), { showEffects });
        }
      });

      return commandFeedback(origin, 0, "commands.morph.success");
    } catch (error) {
      return commandError(origin, error);
    }
  }
}
