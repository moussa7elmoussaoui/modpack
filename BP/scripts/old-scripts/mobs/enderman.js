import { world, system } from "@minecraft/server";

world.afterEvents.projectileHitEntity.subscribe(data => {
  const entity = data.getEntityHit().entity;
  if (entity.typeId == "minecraft:player" && entity.getProperty("dark7mc:entity") == 9) {
    for (let i = 0; i < 1000; i++) {
      const location = { x: range([entity.location.x + 4, entity.location.x - 4]), y: entity.location.y + 4, z: range([entity.location.z + 4, entity.location.z - 4]) };
      if (entity.dimension.getBlockBelow(location) != undefined) {
        const newLocation = { x: location.x, y: entity.dimension.getBlockBelow(location).above().y, z: location.z };
        if (Math.sqrt(Math.pow(newLocation.x - entity.location.x, 2) + Math.pow(newLocation.y - entity.location.y, 2) + Math.pow(newLocation.z - entity.location.z, 2)) >= 16) {
          entity.dimension.playSound("mob.endermen.portal", entity.location);
        };
        entity.teleport(newLocation, { checkForBlocks: true });
        system.runTimeout(() => { entity.dimension.playSound("mob.endermen.portal", entity.location); }, 1);
        break;
      };
    };
  };
});

function range(array) {
  return Math.random() * (array[1] - array[0]) + array[0];
};