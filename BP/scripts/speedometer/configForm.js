import { system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { UnitTagValue, UnitText, getUnitValue } from "./speedometer";
const speedUnitTexts = [UnitText.MetersPerSecond, UnitText.KilometersPerHour, UnitText.MilesPerHour];
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
            .title("Config Form")
            .dropdown("Speed Unit", speedUnitTexts, { defaultValueIndex: unitIndex })
            .toggle("Enabled", { defaultValue: player.hasTag('dark7mc:speedometer') })
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