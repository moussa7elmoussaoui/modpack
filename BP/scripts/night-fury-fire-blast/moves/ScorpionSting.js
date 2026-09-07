import { system } from "@minecraft/server";
import { calcVectorOffset, applyFireBlastDamage, calculateDistance, delayedFunc, getEntitiesNearViewDirection, findDesireableTarget, normalizeVector, traceLine, excludeRiders, DAMAGE_TIERS } from "../fire-blast-utils.js";

import { ALL_PROJECTILES } from "../fire-blast-runtime.js";


const move = {
    cooldown: 10,

    activate(player, PLAYER_DATA, fixedOrigin) {
        player.playAnimation("animation.morph.night_fury.breath");
        const startPosition = fixedOrigin ?? player.location;

        delayedFunc(player, () => PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_blast", player.location, { volume: 1.5, pitch: 1 + Math.random() * 0.2 }), 4);

        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = (levelCheck) ? "dark7mc:fire_blue_blast" : "dark7mc:fire_blast";
        const flutterType = (levelCheck) ? "dark7mc:fire_flutter_blue" : "dark7mc:fire_flutter";
        const fireTypePop = (levelCheck) ? "dark7mc:fire_blue_blast_pop" : "dark7mc:fire_blast_pop";

        delayedFunc(player, () => {
            let travelDir = { x: 0, y: 0, z: 0 };
            const viewDir = PLAYER_DATA.viewDir;

            player.runCommand(`camerashake add @s 0.1 0.05 positional`);

            let currentTick = -0.2;
            let endRuntime = false;
            let loc = startPosition;
            let prevLoc = startPosition;
            let firstTick = true;

            const entities = getEntitiesNearViewDirection(player, 32, 10);
            const entity = findDesireableTarget(entities);

            const sched_ID = system.runInterval(function tick() {
                currentTick += 0.025;
                if (currentTick > 27) {
                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }

                if (entity && entity.isValid) {
                    travelDir = normalizeVector({ x: entity.location.x - loc.x, y: entity.location.y - loc.y - 2, z: entity.location.z - loc.z }, 1);
                } else {
                    const targetXZ = calcVectorOffset(player, 0, 0, 16, viewDir, player.location);
                    const target = PLAYER_DATA.dimension.getTopmostBlock({ x: targetXZ.x, z: targetXZ.z }, targetXZ.y + 30);

                    travelDir = normalizeVector({ x: target.x - loc.x, y: target.y - loc.y - 2, z: target.z - loc.z }, 1);
                }

                if (firstTick) {
                    firstTick = false;
                } else {
                    loc = calcVectorOffset(player, 0, 1, currentTick, travelDir, loc);
                    loc = calcVectorOffset(player, 0, 1, 1, travelDir, loc);
                }

                if (ALL_PROJECTILES[sched_ID] === undefined) {
                    ALL_PROJECTILES[sched_ID] = { id: sched_ID, loc: loc, collision: false, watchForIds: [], type: 'fire' };

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

                const nearbyEntities = excludeRiders(player, [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"] })]);
                nearbyEntities.forEach(entity => applyFireBlastDamage(player, entity, DAMAGE_TIERS.MEDIUM_PLUS, 4, false, true));
                if (nearbyEntities[0] != undefined) endRuntime = true;

                const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 1 });
                if (rayCast) endRuntime = true;

                traceLine(player, loc, prevLoc, 4, fireType);
                prevLoc = loc;

                PLAYER_DATA.dimension.spawnParticle(flutterType, loc);

                if (currentTick > 15 || endRuntime) {
                    PLAYER_DATA.dimension.spawnParticle(fireTypePop, loc);

                    PLAYER_DATA.dimension.playSound("night_fury_fire_blast.debris", loc, { volume: 1.7, pitch: 1 + Math.random() * 0.2 });
                    PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 5.7, pitch: 1 - Math.random() * 0.2 });

                    delete ALL_PROJECTILES[sched_ID];
                    return system.clearRun(sched_ID);
                }
            }, 1);
        }, 8);
    }
}

export default move;
