import { CommandPermissionLevel, Player, system } from "@minecraft/server";
import { namespace } from "../../utils/namespace";

export default {
  definition: {
    name: namespace.toNamespacedId("speedometer"),
    description: "Open the speedometer settings",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
    mandatoryParameters: [],
    optionalParameters: []
  },
  callback: (origin) => {
    const { sourceEntity } = origin;
    if (!sourceEntity || !sourceEntity.isValid || !(sourceEntity instanceof Player)) {
      return { status: 1 };
    }
    system.run(() => {
      sourceEntity.addTag("dark7mc:open_form");
    });
    return { status: 0 };
  }
};
