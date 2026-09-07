import { world } from "@minecraft/server";
import sounds from "../data/sounds";

world.afterEvents.entityHurt.subscribe(data => {
  const { hurtEntity, damageSource } = data;
  if (hurtEntity.typeId == "minecraft:player") {
    const mobSound = sounds[hurtEntity.getProperty("dark7mc:entity")];
    const sound = {
      pitch: (Array.isArray(mobSound.pitch) ? range(mobSound.pitch): mobSound.pitch) + (hurtEntity.getComponent("minecraft:is_baby") ? 0.5: 0),
      volume: mobSound.volume
    };
    if (hurtEntity.getComponent("minecraft:health").currentValue > 0) {
      if (mobSound.hurt != undefined) {
        if (typeof mobSound.hurt == "object") {
          if (Array.isArray(mobSound.hurt)) {
            for (const hurtSound of mobSound.hurt) {
              if (hurtSound.pitch != undefined) { sound.pitch = (Array.isArray(hurtSound.pitch) ? range(hurtSound.pitch): hurtSound.pitch) + (hurtEntity.getComponent("minecraft:is_baby") ? 0.5: 0); };
              if (hurtSound.volume != undefined) { sound.volume = hurtSound.volume; };
              if (hurtSound.conditions == undefined ? true: eval(hurtSound.conditions.replace(new RegExp("\\bthis\\b","g"), "hurtEntity"))) {
                hurtEntity.dimension.playSound(hurtSound.sound, hurtEntity.location, sound);
              };
            };
          } else {
            if (mobSound.hurt.pitch != undefined) { sound.pitch = (Array.isArray(mobSound.hurt.pitch) ? range(mobSound.hurt.pitch): mobSound.hurt.pitch) + (hurtEntity.getComponent("minecraft:is_baby") ? 0.5: 0); };
            if (mobSound.hurt.volume != undefined) { sound.volume = mobSound.hurt.volume; };
            if (mobSound.hurt.conditions == undefined ? true: eval(mobSound.hurt.conditions.replace(new RegExp("\\bthis\\b","g"), "hurtEntity"))) {
              hurtEntity.dimension.playSound(mobSound.hurt.sound, hurtEntity.location, sound);
            };
          };
        } else { hurtEntity.dimension.playSound(mobSound.hurt, hurtEntity.location, sound); };
      } else { hurtEntity.dimension.playSound("game.player.hurt", hurtEntity.location, sound); };
    };
  };
});

world.afterEvents.entityDie.subscribe(data => {
  const { deadEntity, damageSource } = data;
  if (deadEntity.typeId == "minecraft:player") {
    const mobSound = sounds[deadEntity.getProperty("dark7mc:entity")];
    const sound = {
      pitch: (Array.isArray(mobSound.pitch) ? range(mobSound.pitch): mobSound.pitch) + (deadEntity.getComponent("minecraft:is_baby") ? 0.5: 0),
      volume: mobSound.volume
    };
    if (mobSound.death != undefined) {
      if (typeof mobSound.death == "object") {
        if (Array.isArray(mobSound.death)) {
          for (const deathSound of mobSound.death) {
            if (deathSound.pitch != undefined) { sound.pitch = (Array.isArray(deathSound.pitch) ? range(deathSound.pitch): deathSound.pitch) + (deadEntity.getComponent("minecraft:is_baby") ? 0.5: 0); };
            if (deathSound.volume != undefined) { sound.volume = deathSound.volume; };
            if (deathSound.conditions == undefined ? true: eval(deathSound.conditions.replace(new RegExp("\\bthis\\b","g"), "deadEntity"))) {
              deadEntity.dimension.playSound(deathSound.sound, deadEntity.location, sound);
            };
          };
        } else {
          if (mobSound.death.pitch != undefined) { sound.pitch = (Array.isArray(mobSound.death.pitch) ? range(mobSound.death.pitch): mobSound.death.pitch) + (deadEntity.getComponent("minecraft:is_baby") ? 0.5: 0); };
          if (mobSound.death.volume != undefined) { sound.volume = mobSound.death.volume; };
          if (mobSound.death.conditions == undefined ? true: eval(mobSound.death.conditions.replace(new RegExp("\\bthis\\b","g"), "deadEntity"))) {
            deadEntity.dimension.playSound(mobSound.death.sound, deadEntity.location, sound);
          };
        };
      } else { deadEntity.dimension.playSound(mobSound.death, deadEntity.location, sound); };
    } else { deadEntity.dimension.playSound("game.player.die", deadEntity.location, sound); };
  };
});

function range(array) {
  return parseFloat(Math.random() * (array[1] - array[0]) + array[0]);
};