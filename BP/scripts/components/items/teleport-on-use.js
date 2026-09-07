import { Direction, system } from "@minecraft/server";
import { paramsUtil } from "../../utils/component-params";

export default {
  id: "teleport_on_use",
  onUse: ({ source }, parameters) => {
    const params = parameters.params;

    const blockFromViewDirection = source.getBlockFromViewDirection();
    if (blockFromViewDirection === undefined) return;
    const { block, face, faceLocation } = blockFromViewDirection;
    const blockLocation = block.location;

    const fadeDuration = params.fade_duration;
    source.camera.fade({ fadeTime: { fadeInTime: fadeDuration / 2, fadeOutTime: fadeDuration / 2, holdTime: 0 } });

    system.runTimeout(() => {
      const entityBounds = source.getAABB().extent;

      let offsetX = 0, offsetY = 0, offsetZ = 0;
      switch (face) {
        case Direction.Down:
          offsetY = -entityBounds.y * 2;
          break;
        case Direction.East:
          offsetX = entityBounds.x + (faceLocation.x === 0 ? 1 : 0);
          break;
        case Direction.North:
          offsetZ = -entityBounds.z;
          break;
        case Direction.South:
          offsetZ = entityBounds.z + (faceLocation.z === 0 ? 1 : 0);
          break;
        case Direction.Up:
          offsetY = faceLocation.y === 0 ? 1 : 0;
          break;
        case Direction.West:
          offsetX = -entityBounds.x;
          break;
      }

      const teleportLocation = {
        x: blockLocation.x + faceLocation.x + offsetX,
        y: blockLocation.y + faceLocation.y + offsetY,
        z: blockLocation.z + faceLocation.z + offsetZ
      };
      
      if (getDistance(source.location, teleportLocation) >= 16) { paramsUtil.playSound(params.teleport_sound, source); }
      source.teleport(teleportLocation);

      system.runTimeout(() => paramsUtil.playSound(params.teleport_sound, source), 1);
    }, fadeDuration * 10);
  }
};

function getDistance(location1, location2) {
  return Math.abs(Math.sqrt((location2.x - location1.x) ** 2 + (location2.y - location1.y) ** 2 + (location2.z - location1.z) ** 2));
}