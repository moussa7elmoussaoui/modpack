import { system, world } from "@minecraft/server";
import { setSegment } from "../actionbar";
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

function registerSpeedometer() {
    for (const player of world.getPlayers()) {
        setSegment(player, "speedometer", {
            priority: 1,
            getLine: () => {
                if (!player.hasTag("dark7mc:speedometer")) return null;

                const unitValue = getUnitValue(player);
                const unitText = getUnitText(unitValue);
                const velocity = player.getVelocity();
                const total = Math.hypot(velocity.x, velocity.y, velocity.z) * 20;

                return `\uE200 §e${displaySpeed(total, unitValue)} §7${unitText}`;
            }
        });
    }
}

system.runInterval(registerSpeedometer);
export { getUnitValue };
