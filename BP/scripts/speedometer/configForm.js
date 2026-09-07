import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { UnitTagValue, getUnitValue } from "./speedometer";
import { translated } from "../utils/messages";
const speedUnitTexts = ["ms", "kmh", "mph"].map(unit => translated(`speedometer.unit.${unit}`));
const speedUnits = [UnitTagValue.MetersPerSecond, UnitTagValue.KilometersPerHour, UnitTagValue.MilesPerHour];
function clearUnitValues(player) {
    player.removeTag('dark7mc:unit=' + UnitTagValue.MetersPerSecond);
    player.removeTag('dark7mc:unit=' + UnitTagValue.KilometersPerHour);
    player.removeTag('dark7mc:unit=' + UnitTagValue.MilesPerHour);
}
system.runInterval(() => {
    for (const player of world.getPlayers({ tags: ['dark7mc:open_form'] })) {
        player.removeTag('dark7mc:open_form');
        const unitValue = getUnitValue(player);
        const unitIndex = speedUnits.indexOf(unitValue);
        new ModalFormData()
            .title(translated("speedometer.settings.title"))
            .dropdown(translated("speedometer.settings.unit"), speedUnitTexts, { defaultValueIndex: unitIndex })
            .toggle(translated("speedometer.settings.enabled"), { defaultValue: player.hasTag('dark7mc:speedometer') })
            .show(player)
            .then((response) => {
            if (response.canceled)
                return;
            const [unit, enabled] = response.formValues;
            clearUnitValues(player);
            player.addTag('dark7mc:unit=' + speedUnits[unit]);
            if (!enabled)
                player.removeTag('dark7mc:speedometer');
            else
                player.addTag('dark7mc:speedometer');
        });
    }
});
