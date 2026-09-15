import { CommandPermissionLevel, Player, system } from "@minecraft/server";
import { namespace } from "../../utils/namespace";

const OMNITRIX_SIZES = new Set([ "wide", "slim" ]);

export default {
  definition: {
    name: namespace.toNamespacedId("omnitrix_size"),
    description: "Set your Omnitrix size (wide or slim)",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
    mandatoryParameters: [
      { name: "size", type: "String" }
    ],
    optionalParameters: []
  },
  callback: (origin, size) => {
    const { sourceEntity } = origin;
    if (!sourceEntity || !sourceEntity.isValid || !(sourceEntity instanceof Player)) {
      return { status: 1 };
    }

    const omnitrixSize = size.toLowerCase();
    if (!OMNITRIX_SIZES.has(omnitrixSize)) {
      return { message: "Use either wide or slim.", status: 1 };
    }

    system.run(() => sourceEntity.setProperty("dark7mc:omnitrix_owner_model", omnitrixSize));
    return { message: `Omnitrix size set to ${omnitrixSize}.`, status: 0 };
  }
};
