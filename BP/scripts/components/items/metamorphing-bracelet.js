import { ActionFormData } from "@minecraft/server-ui";
import { allMorphIds } from "../../data/morphs";
import { Morph } from "../../morph/classes";

export default {
  id: "metamorphing_bracelet",
  onUse: ({ source }) => {    
    const morphMenu = new ActionFormData().title("morph.menu.title");

    for (const morphId of allMorphIds) {
      const bracketStart = morphId.indexOf("[");
      const bracketEnd = morphId.indexOf("]", bracketStart);

      const entityType = morphId.slice(0, bracketStart);
      const properties = morphId.slice(bracketStart + 1, bracketEnd);

      const iconEntityType = entityType === "minecraft:night_fury" ? "minecraft:bat" : entityType;
      const iconPath = `textures/morph_icons/${iconEntityType.replace(":", "/")}${properties.length === 0 ? "" : `/${properties}`}`;
      morphMenu.button(morphId, iconPath);
    }

    morphMenu.show(source).then(({ canceled, selection }) => {
      if (canceled) return;
      
      const selectedMorph = Morph.parse(allMorphIds[selection]);
      if (source.getMorph().equals(selectedMorph)) return;

      source.setMorph(selectedMorph);
    });
  }
};
