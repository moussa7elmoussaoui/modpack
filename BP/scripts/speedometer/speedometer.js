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
        case UnitTagValue.MetersPerSecond:
            return UnitText.MetersPerSecond;
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
        case UnitTagValue.MetersPerSecond:
            return speedMs.toFixed(1);
        case UnitTagValue.KilometersPerHour:
            return (speedMs * 3.6).toFixed(1);
        case UnitTagValue.MilesPerHour:
            return (speedMs * 2.2369).toFixed(1);
        default:
            return speedMs.toFixed(1);
    }
}
function displaySpeedometer() {
    for (const player of world.getPlayers({ tags: ["dark7mc:speedometer"] })) {
        const unitValue = getUnitValue(player);
        const unitText = getUnitText(unitValue);
        const velocity = player.getVelocity();
        const speedMs = Math.hypot(velocity.x, velocity.y, velocity.z) * 20;
        player.runCommand(`title @s actionbar ${player.name}\nSpeed: ${displaySpeed(speedMs, unitValue)} ${unitText}`);
    }
}
system.runInterval(displaySpeedometer);
export { getUnitValue };