import { MolangVariableMap, system } from "@minecraft/server";
import { calcVectorOffset, applyBendingDamage, calculateDistance, delayedFunc, traceLine } from "../fire-blast-utils.js";
import { DAMAGE_TIERS } from "../fire-blast-damage.js";

import { ALL_PROJECTILES } from "../fire-blast-runtime.js";
import FireJump from "./FireJump.js";


const move = {
    cost: 35,
    cooldown: 2,
    type: 'standard',

    id: 45,

    tier: 'MEDIUM',
    damage: {
        base: DAMAGE_TIERS.MEDIUM,
        multiplied: 0
    },

    activate(player, PLAYER_DATA, fixedOrigin) {
        player.playAnimation("animation.morph.night_fury.breath");
        const startPosition = fixedOrigin ?? player.location;

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        delayedFunc(player, () => {
            let travelDir = PLAYER_DATA.viewDir;
            
            player.runCommand(`camerashake add @s 0.3 0.05 positional`);

            const levelCheck = PLAYER_DATA.level >= 100;
            const fireType = (levelCheck) ? "a:fire_blue_blast" : "a:fire_blast";
            const fireTypeSecondary = (levelCheck) ? "a:fire_flutter_blue" : "a:fire_flutter";
            const fireTypePop = (levelCheck) ? "a:fire_blue_blast_pop" : "a:fire_blast_pop";    

            let currentTick = -2;
            let endRuntime = false;
            let prevLocation;
            const sched_ID = system.runInterval(function tick() {
                currentTick += 2;
                if (currentTick > 17) {
                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }

                const loc = currentTick === 0
                    ? startPosition
                    : calcVectorOffset(player, 0, 1, currentTick, travelDir, startPosition);
                if (ALL_PROJECTILES[sched_ID] === undefined) {
                    ALL_PROJECTILES[sched_ID] = { id: sched_ID, loc: loc, collision: false, watchForIds: [], type: 'air' };

                    for (const projectile of Object.values(ALL_PROJECTILES)) {
                        if (projectile.id != sched_ID && calculateDistance(projectile.loc, loc) < 64) {
                            ALL_PROJECTILES[sched_ID].watchForIds.push(projectile.id);
                        }
                    }
                } else {
                    const projectile = ALL_PROJECTILES[sched_ID];
                    projectile.loc = loc;
                    if (projectile.collision) endRuntime = true;
                }

                const nearbyEntities = [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"], excludeTags: ["bending_dmg_off"] })];
                nearbyEntities.forEach(entity => applyBendingDamage(player, entity, DAMAGE_TIERS.MEDIUM, 1, false, true));
                if (nearbyEntities[0] != undefined) endRuntime = true;

                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
                if (rayCast) endRuntime = true;

                if (prevLocation) {
                    traceLine(player, prevLocation, loc, 4, fireType);
                    traceLine(player, prevLocation, loc, 4, fireTypeSecondary);
                }
                prevLocation = loc;

                if (currentTick > 15 || endRuntime) {
                    PLAYER_DATA.dimension.spawnParticle(fireTypePop, loc);

                    if (calculateDistance(player.location, loc) < 2 && travelDir.y < -0.95) {
                        FireJump.activate(player, PLAYER_DATA);
                    }

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;