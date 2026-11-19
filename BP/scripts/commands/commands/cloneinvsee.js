import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, Player, system } from "@minecraft/server";
import { isOwner, withCloneInventory } from "../../clones/service";
import { isInvseeOpen, openInvsee } from "../../invsee/index";
import { errorFeedback } from "../../utils/messages";
import { namespace } from "../../utils/pack-data";
import { commandFeedback } from "../feedback";

const VIEWS = namespace.toNamespacedId("clone_invsee_view");

export default {
  enums: [{ name: VIEWS, values: ["inventory", "enderchest", "omnitrix"] }],
  definition: {
    name: namespace.toNamespacedId("cloneinvsee"),
    description: "commands.invsee.description",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: false,
    mandatoryParameters: [{ name: "clone", type: CustomCommandParamType.Integer }],
    optionalParameters: [{ name: VIEWS, type: CustomCommandParamType.Enum }]
  },
  callback(origin, slot, view = "inventory") {
    const viewer = origin.sourceEntity;
    if (!(viewer instanceof Player) || !viewer.isValid) {
      return commandFeedback(origin, CustomCommandStatus.Failure, "commands.player_only");
    }
    if (!isOwner(viewer)) return commandFeedback(origin, CustomCommandStatus.Failure, "clones.error.owner");
    if (!Number.isInteger(slot) || slot < 1 || slot > 10) {
      return commandFeedback(origin, CustomCommandStatus.Failure, "clones.error.number");
    }
    if (viewer.getMorph()?.entityType !== "minecraft:player") {
      return commandFeedback(origin, CustomCommandStatus.Failure, "invsee.error.player_morph_required");
    }
    if (isInvseeOpen(viewer)) return commandFeedback(origin, CustomCommandStatus.Failure, "invsee.error.already_open");
    system.run(() => {
      void withCloneInventory(viewer, slot, clone => openInvsee(viewer, clone, view)).catch(error => {
        if (viewer.isValid) viewer.sendMessage(errorFeedback(error));
      });
    });
    return { status: CustomCommandStatus.Success };
  }
};
