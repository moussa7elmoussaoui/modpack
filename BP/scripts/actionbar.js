import { system, world } from "@minecraft/server";

const segments = new Map();

export function setSegment(player, key, { priority = 0, getLine }) {
    let map = segments.get(player.id);
    if (!map) {
        map = new Map();
        segments.set(player.id, map);
    }
    map.set(key, { priority, getLine });
}

export function clearSegment(player, key) {
    const map = segments.get(player.id);
    if (!map) return;
    map.delete(key);
    if (map.size === 0) segments.delete(player.id);
}

system.runInterval(() => {
    for (const [playerId, map] of segments) {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (!player) {
            segments.delete(playerId);
            continue;
        }

        const lines = [];
        for (const { getLine } of [...map.values()].sort((a, b) => a.priority - b.priority)) {
            const line = getLine();
            if (line != null) lines.push(line);
        }

        if (lines.length === 0) continue;
        player.onScreenDisplay.setActionBar(lines.join("   "));
    }
});