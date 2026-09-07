import { system, world } from "@minecraft/server";

const segments = new Map();

function getActionbarText(map) {
    const visibleLines = [];
    const hudMarkers = [];

    for (const [key, { getLine, isHudMarker }] of [...map.entries()].sort((a, b) => a[1].priority - b[1].priority)) {
        const line = getLine();
        if (line == null) continue;
        if (isHudMarker) hudMarkers.push(line);
        else visibleLines.push({ key, line });
    }

    const speedometerIsVisible = visibleLines.some(({ key }) => key === "speedometer");
    const healthIsVisible = visibleLines.some(({ key }) => key === "hp");
    const displayedLines = speedometerIsVisible && healthIsVisible
        ? visibleLines.filter(({ key }) => key !== "hp")
        : visibleLines;

    return displayedLines.map(({ line }) => line).join("   ") + hudMarkers.join("");
}

export function setSegment(player, key, { priority = 0, getLine, isHudMarker = false }) {
    let map = segments.get(player.id);
    if (!map) {
        map = new Map();
        segments.set(player.id, map);
    }
    map.set(key, { priority, getLine, isHudMarker });
}

export function clearSegment(player, key, { refresh = false, emptyLine = "" } = {}) {
    const map = segments.get(player.id);
    if (!map) {
        if (refresh) player.onScreenDisplay.setActionBar(emptyLine);
        return;
    }

    map.delete(key);

    if (refresh) {
        const actionbarText = getActionbarText(map);
        player.onScreenDisplay.setActionBar(actionbarText || emptyLine);
    }

    if (map.size === 0) segments.delete(player.id);
}

system.runInterval(() => {
    for (const [playerId, map] of segments) {
        const player = world.getPlayers().find(p => p.id === playerId);
        if (!player) {
            segments.delete(playerId);
            continue;
        }

        const actionbarText = getActionbarText(map);

        if (!actionbarText) continue;
        player.onScreenDisplay.setActionBar(actionbarText);
    }
});
