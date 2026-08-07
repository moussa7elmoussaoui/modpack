import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { UnitTagValue, UnitText, getUnitValue } from "./speedometer";
const speedUnitTexts = [UnitText.MetersPerSecond, UnitText.KilometersPerHour, UnitText.MilesPerHour];
const speedUnits = [UnitTagValue.MetersPerSecond, UnitTagValue.KilometersPerHour, UnitTagValue.MilesPerHour];
const SEGMENT_TAGS = {
    horizontal: "dark7mc:speedo:off:h",
    vertical: "dark7mc:speedo:off:v",
    total: "dark7mc:speedo:off:t"
};
function clearUnitValues(player) {
    player.removeTag('dark7mc:unit=' + UnitTagValue.MetersPerSecond);
    player.removeTag('dark7mc:unit=' + UnitTagValue.KilometersPerHour);
    player.removeTag('dark7mc:unit=' + UnitTagValue.MilesPerHour);
}
function segmentDefault(player, segment) {
    return !player.hasTag(SEGMENT_TAGS[segment]);
}
function applySegment(player, segment, enabled) {
    if (enabled)
        player.removeTag(SEGMENT_TAGS[segment]);
    else
        player.addTag(SEGMENT_TAGS[segment]);
}
system.runInterval(() => {
    for (const player of world.getPlayers({ tags: ['dark7mc:open_form'] })) {
        player.removeTag('dark7mc:open_form');
        const unitValue = getUnitValue(player);
        const unitIndex = speedUnits.indexOf(unitValue);
        new ModalFormData()
            .title("Speedometer Settings")
            .dropdown("Speed Unit", speedUnitTexts, { defaultValueIndex: unitIndex })
            .toggle("Enabled", { defaultValue: player.hasTag('dark7mc:speedometer') })
            .toggle("Horizontal (H)", { defaultValue: segmentDefault(player, 'horizontal') })
            .toggle("Vertical (V)", { defaultValue: segmentDefault(player, 'vertical') })
            .toggle("Total (T)", { defaultValue: segmentDefault(player, 'total') })
            .show(player)
            .then((response) => {
            if (response.canceled)
                return;
            const [unit, enabled, showH, showV, showT] = response.formValues;
            clearUnitValues(player);
            player.addTag('dark7mc:unit=' + speedUnits[unit]);
            if (!enabled)
                player.removeTag('dark7mc:speedometer');
            else
                player.addTag('dark7mc:speedometer');
            applySegment(player, 'horizontal', !!showH);
            applySegment(player, 'vertical', !!showV);
            applySegment(player, 'total', !!showT);
        });
    }
});