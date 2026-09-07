import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, Player, system } from "@minecraft/server";
import { isInvseeOpen, openInvsee } from "../../invsee/index";
import { namespace } from "../../utils/pack-data";
import { commandFeedback } from "../feedback";

const VIEWS = namespace.toNamespacedId("invsee_view");

export default {
  enums: [{ name: VIEWS, values: ["inventory", "enderchest", "omnitrix"] }],
  definition: {
    name: namespace.toNamespacedId("invsee"),
    description: "commands.invsee.description",
    permissionLevel: CommandPermissionLevel.Admin,
    cheatsRequired: true,
    mandatoryParameters: [{ name: "player", type: CustomCommandParamType.PlayerSelector }],
    optionalParameters: [{ name: VIEWS, type: CustomCommandParamType.Enum }]
  },
  callback(origin, players, view = "inventory") {
    const viewer = origin.sourceEntity;
    if (!(viewer instanceof Player) || !viewer.isValid) {
      return commandFeedback(origin, CustomCommandStatus.Failure, "commands.player_only");
    }
    if (players?.length !== 1) return commandFeedback(origin, CustomCommandStatus.Failure, "commands.select_one_player");
    if (isInvseeOpen(viewer)) return commandFeedback(origin, CustomCommandStatus.Failure, "invsee.error.already_open");
    system.run(() => { void openInvsee(viewer, players[0], view); });
    return { status: CustomCommandStatus.Success };
  }
};
