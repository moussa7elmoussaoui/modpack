import { system } from "@minecraft/server";
import { calcVectorOffset, applyFireBlastDamage, calculateDistance, delayedFunc, getEntitiesNearViewDirection, findDesireableTarget, normalizeVector, traceLine, excludeRiders, DAMAGE_TIERS } from "../fire-blast-utils.js";

import { ALL_PROJECTILES } from "../fire-blast-runtime.js";

function dragonTracer(player, PLAYER_DATA, offset, entity, fireType, fireTypeSecondary, startPosition) {
    let travelDir = { x: 0, y: 0, z: 0 };
    startPosition ??= player.location;

    player.runCommand(`camerashake add @s 0.2 0.05 positional`);

    let currentTick = -1;
    let endRuntime = false;
    let loc = startPosition;
    let prevLoc = startPosition;
    let firstTick = true;
    const sched_ID = system.runInterval(function tick() {
        currentTick += 0.1;
        if (currentTick > 5) {
            delete ALL_PROJECTILES[sched_ID];
            return system.clearRun(sched_ID);
        }

        if (entity && entity.isValid) {
            travelDir = normalizeVector({ x: entity.location.x - loc.x, y: entity.location.y - loc.y - 2, z: entity.location.z - loc.z }, 1);
        } else {
            const target = calcVectorOffset(player, 0, 0, 32, PLAYER_DATA.viewDir, player.location);

            travelDir = normalizeVector({ x: target.x - loc.x, y: target.y - loc.y - 2, z: target.z - loc.z }, 1);
        }

        if (firstTick) {
            loc = startPosition;
            firstTick = false;
        } else {
            loc = calcVectorOffset(player, offset.x, offset.y, offset.z, travelDir, loc);
        }

        if (ALL_PROJECTILES[sched_ID] === undefined) {
            ALL_PROJECTILES[sched_ID] = { id: sched_ID, loc: loc, collision: false, watchForIds: [], type: 'dragon' };

            for (const projectile of Object.values(ALL_PROJECTILES)) {
                if (projectile.id != sched_ID && calculateDistance(projectile.loc, loc) < 64) {
                    ALL_PROJECTILES[sched_ID].watchForIds.push(projectile.id);
                }
            }
        } else {
            const projectile = ALL_PROJECTILES[sched_ID];
            projectile.loc = loc;
            if (projectile.collision && projectile.type != 'dragon') endRuntime = true;
        }

        const nearbyEntities = excludeRiders(player, [...PLAYER_DATA.dimension.getEntities({ location: loc, maxDistance: 3, excludeNames: [player.name], excludeFamilies: ["inanimate"], excludeTypes: ["item"] })]);
        nearbyEntities.forEach(entity => applyFireBlastDamage(player, entity, DAMAGE_TIERS.HEAVY, 4, false, true));
        if (nearbyEntities[0] != undefined) endRuntime = true;

        const rayCast = PLAYER_DATA.dimension.getBlockFromRay(loc, travelDir, { includePassableBlocks: false, includeLiquidBlocks: false, maxDistance: 3 });
        if (rayCast) endRuntime = true;


        traceLine(player, loc, prevLoc, 4, fireType);
        prevLoc = loc;

        PLAYER_DATA.dimension.spawnParticle(fireTypeSecondary, loc);

        if (currentTick > 4 || endRuntime) {
            delete ALL_PROJECTILES[sched_ID];
            if (offset.y == 1) PLAYER_DATA.dimension.spawnParticle("minecraft:huge_explosion_emitter", loc);
            PLAYER_DATA.dimension.playSound("random.explode", loc, { volume: 4.7, pitch: 1 - Math.random() * 0.2 });
            return system.clearRun(sched_ID);
        }
    }, 1);
}

const move = {
    cooldown: 30,

    activate(player, PLAYER_DATA, fixedOrigin) {
        player.playAnimation("animation.morph.night_fury.breath");
        const startPosition = fixedOrigin ?? player.location;

        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = (levelCheck) ? "dark7mc:fire_blue_blast" : "dark7mc:fire_blast";
        const fireTypeSecondary = (levelCheck) ? "dark7mc:fire_flutter_blue" : "dark7mc:fire_flutter";

        PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_blast", player.location, { volume: 0.5, pitch: 1 + Math.random() * 0.2 });
        PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_woosh", player.location, { volume: 0.5, pitch: 0.9 + Math.random() * 0.3 });
        PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_swish", player.location, { volume: 0.5, pitch: 1.2 + Math.random() * 0.3 });

        delayedFunc(player, () => {
            const entities = getEntitiesNearViewDirection(player, 32, 8);
            const entity = findDesireableTarget(entities);

            
            dragonTracer(player, PLAYER_DATA, { x: 1, y: 0.5, z: 1 }, entity, fireType, fireTypeSecondary, startPosition);
            dragonTracer(player, PLAYER_DATA, { x: -1, y: 0.5, z: 1 }, entity, fireType, fireTypeSecondary, startPosition);
            dragonTracer(player, PLAYER_DATA, { x: 0, y: 1, z: 1 }, entity, fireType, fireTypeSecondary, startPosition);
        }, 8);
    }
}

export default move;
