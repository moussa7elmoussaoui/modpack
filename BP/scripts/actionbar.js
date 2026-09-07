import { system, world } from "@minecraft/server";

const segments = new Map();

function getActionbarText(map) {
    const visibleLines = [];
    const hudMarkers = [];

    for (const { getLine, isHudMarker } of [...map.values()].sort((a, b) => a.priority - b.priority)) {
        const line = getLine();
        if (line == null) continue;
        if (isHudMarker) hudMarkers.push(line);
        else visibleLines.push(line);
    }

    if (visibleLines.every(line => typeof line === "string")) {
        return visibleLines.join("\u00a7r   ") + hudMarkers.join("");
    }

    const rawtext = [];
    for (const line of visibleLines) {
        if (rawtext.length) rawtext.push({ text: "\u00a7r   " });
        rawtext.push(typeof line === "string" ? { text: line } : line);
    }
    if (hudMarkers.length) rawtext.push({ text: hudMarkers.join("") });
    return { rawtext };
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
    if (segments.size === 0) return;

    const playersById = new Map(world.getPlayers().map(player => [player.id, player]));
    for (const [playerId, map] of segments) {
        const player = playersById.get(playerId);
        if (!player) {
            segments.delete(playerId);
            continue;
        }

        const actionbarText = getActionbarText(map);

        if (!actionbarText) continue;
        player.onScreenDisplay.setActionBar(actionbarText);
    }
});
