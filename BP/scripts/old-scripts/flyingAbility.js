import { world, system } from "@minecraft/server";

const canFly = [ 10, 17, 37, 40, 42, 45, 49, 51, 54, 77, 81 ];
const canFloat = [ 4 ];
const canGlideInfinitely = [ 77 ];

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (!player.isGliding) {
      if (canFly.includes(player.getProperty("morphing_bracelet:entity"))) {
        if (player.isJumping) { player.addEffect("levitation", 5, { amplifier: 5, showParticles: false }); }
        else { player.removeEffect("levitation"); };
        player.addEffect("slow_falling", 5, { showParticles: false });
      } else if (canFloat.includes(player.getProperty("morphing_bracelet:entity"))) {
        player.addEffect("slow_falling", 5, { showParticles: false });
      };
    } else if (canGlideInfinitely.includes(player.getProperty("morphing_bracelet:entity")) && player.getRotation().x < 0) {
      player.addEffect("slow_falling", 5, { showParticles: false });
    };
  };
});
