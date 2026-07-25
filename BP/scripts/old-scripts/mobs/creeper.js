import { world, system, EntityDamageCause } from "@minecraft/server";

const explosion = {};

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (explosion[player.id] == undefined) { explosion[player.id] = { duration: 0, hasExploded: false }; };
    if (player.getProperty("morphing_bracelet:entity") == 5) {
      if (player.isSneaking) {
        if (!explosion[player.id].hasExploded) {
          if (explosion[player.id].duration == 0) { player.dimension.playSound("random.fuse", player.location, { pitch: 0.5 }) };
          if (explosion[player.id].duration < 30) { explosion[player.id].duration += 1; }
          else {
            explosion[player.id].hasExploded = true;
            if (player.getComponent("minecraft:is_charged")) { player.dimension.createExplosion(player.location, 6, { breaksBlocks: world.gameRules.mobGriefing, source: player }); }
            else { player.dimension.createExplosion(player.location, 3, { breaksBlocks: world.gameRules.mobGriefing, source: player }); };
            player.addEffect("invisibility", 20, { showParticles: false });
            system.run(() => { player.applyDamage(340282356779733632099999999999999999999, { cause: EntityDamageCause.entityExplosion }); });
          };
        } else if (explosion[player.id].duration > 0) { explosion[player.id].duration -= 1; };
      } else {
        if (explosion[player.id].duration > 0) { explosion[player.id].duration -= 1; };
        if (explosion[player.id].hasExploded) { explosion[player.id].hasExploded = false; }
      };
    } else {
      if (explosion[player.id].duration > 0) { explosion[player.id].duration -= 1; };
      if (explosion[player.id].hasExploded) { explosion[player.id].hasExploded = false; }
    };
  };
});