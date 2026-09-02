import { MolangVariableMap, system } from "@minecraft/server";
import { delayedFunc } from "../fire-blast-utils.js";

const move = {
    cost: 35,
    cooldown: 35,
    type: "standard",

    id: 109,

    damage: {
        base: 0,
        multiplied: 0
    },

    activate(player, PLAYER_DATA) {
        const levelCheck = PLAYER_DATA.level >= 100;
        const fireType = levelCheck ? "a:fire_blue_blast" : "a:fire_blast";
        const flutterType = levelCheck ? "a:fire_flutter_blue" : "a:fire_flutter";
        const shockwaveType = levelCheck ? "a:fire_shockwave_dynamic_blue" : "a:fire_shockwave_dynamic";

        delayedFunc(player, () => {
            PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_woosh", player.location, { volume: 0.5, pitch: 0.9 + Math.random() * 0.3 });
            PLAYER_DATA.dimension.playSound("night_fury_fire_blast.fire_swish", player.location, { volume: 0.5, pitch: 1.2 + Math.random() * 0.3 });

            player.runCommand(`camerashake add @s 0.4 0.2 positional`);
            const map = new MolangVariableMap();
            map.setVector3("variable.plane", { x: 0.5, y: 100, z: 45 });
            PLAYER_DATA.dimension.spawnParticle(shockwaveType, player.location, map);

            player.applyKnockback({ x: 0, z: 0 }, 1.4);

            let currentTick = 0;
            const sched_ID = system.runInterval(() => {
                currentTick++;
                if (currentTick > 25) return system.clearRun(sched_ID);
                PLAYER_DATA.dimension.spawnParticle(fireType, player.location);
                PLAYER_DATA.dimension.spawnParticle(flutterType, player.location);
            }, 1);
        }, 4);
    }
};

export default move;