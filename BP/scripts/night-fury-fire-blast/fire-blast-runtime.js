import { system } from "@minecraft/server";

export const ALL_PROJECTILES = {};
export const PLAYER_DATA_MAP = {};
export const WORLD_SETTINGS = {};

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
}

system.runInterval(() => {
  for (const projectile of Object.values(ALL_PROJECTILES)) {
    for (const watchedId of projectile.watchForIds ?? []) {
      const watched = ALL_PROJECTILES[watchedId];
      if (!watched || distance(projectile.loc, watched.loc) >= 2) continue;
      projectile.collision = true;
      watched.collision = true;
      const type = projectile.type;
      projectile.type = watched.type;
      watched.type = type;
    }
  }
}, 1);
