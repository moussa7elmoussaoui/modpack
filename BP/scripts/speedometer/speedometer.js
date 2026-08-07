import { system, world } from "@minecraft/server";
export var UnitTagValue;
(function (UnitTagValue) {
    UnitTagValue["MetersPerSecond"] = "ms";
    UnitTagValue["KilometersPerHour"] = "kmh";
    UnitTagValue["MilesPerHour"] = "mph";
})(UnitTagValue || (UnitTagValue = {}));
export var UnitText;
(function (UnitText) {
    UnitText["MetersPerSecond"] = "m/s";
    UnitText["KilometersPerHour"] = "km/h";
    UnitText["MilesPerHour"] = "mph";
})(UnitText || (UnitText = {}));
function getUnitValue(player) {
    const unitTag = player.getTags().find(tag => tag.startsWith("dark7mc:unit="));
    const unitValue = unitTag ? unitTag.split("=")[1] : UnitTagValue.MetersPerSecond;
    return unitValue;
}
function getUnitText(unitValue) {
    switch (unitValue) {
        case UnitTagValue.KilometersPerHour:
            return UnitText.KilometersPerHour;
        case UnitTagValue.MilesPerHour:
            return UnitText.MilesPerHour;
        default:
            return UnitText.MetersPerSecond;
    }
}
function displaySpeed(speedMs, unitValue) {
    switch (unitValue) {
        case UnitTagValue.KilometersPerHour:
            return (speedMs * 3.6).toFixed(1);
        case UnitTagValue.MilesPerHour:
            return (speedMs * 2.2369).toFixed(1);
        default:
            return speedMs.toFixed(1);
    }
}

// Per-segment visibility (default: all enabled unless the ":off" tag is present)
const SEGMENT_OFF_TAGS = {
    horizontal: "dark7mc:speedo:off:h",
    vertical: "dark7mc:speedo:off:v",
    total: "dark7mc:speedo:off:t"
};

function isSegmentEnabled(player, segment) {
    return !player.hasTag(SEGMENT_OFF_TAGS[segment]);
}

function displaySpeedometer() {
    for (const player of world.getPlayers({ tags: ["dark7mc:speedometer"] })) {
        const unitValue = getUnitValue(player);
        const unitText = getUnitText(unitValue);
        const velocity = player.getVelocity();

        const segments = [];
        if (isSegmentEnabled(player, "horizontal")) {
            const horizontal = Math.hypot(velocity.x, velocity.z) * 20;
            segments.push(`§7H §f${displaySpeed(horizontal, unitValue)} §8${unitText}`);
        }
        if (isSegmentEnabled(player, "vertical")) {
            const vertical = velocity.y * 20;
            segments.push(`§7V §f${displaySpeed(vertical, unitValue)} §8${unitText}`);
        }
        if (isSegmentEnabled(player, "total")) {
            const total = Math.hypot(velocity.x, velocity.y, velocity.z) * 20;
            segments.push(`§7T §f${displaySpeed(total, unitValue)} §8${unitText}`);
        }

        if (segments.length === 0) continue;

        player.onScreenDisplay.setActionBar(segments.join("   §8│§r   "));
    }
}

system.runInterval(displaySpeedometer);
export { getUnitValue };
