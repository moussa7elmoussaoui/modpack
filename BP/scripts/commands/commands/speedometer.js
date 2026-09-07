import { CommandPermissionLevel, Player, system } from "@minecraft/server";
import { namespace } from "../../utils/pack-data";
import { commandFeedback } from "../feedback";

export default {
  definition: {
    name: namespace.toNamespacedId("speedometer"),
    description: "commands.speedometer.description",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
    mandatoryParameters: [],
    optionalParameters: []
  },
  callback: (origin) => {
    const { sourceEntity } = origin;
    if (!sourceEntity || !sourceEntity.isValid || !(sourceEntity instanceof Player)) {
      return commandFeedback(origin, 1, "commands.player_only");
    }
    system.run(() => {
      sourceEntity.addTag("dark7mc:open_form");
    });
    return { status: 0 };
  }
};
