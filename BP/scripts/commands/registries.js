import morphCommand from "./commands/morph";
import morphEnum from "./enums/morph";
import omnitrixSizeCommand from "./commands/omnitrix-size";
import speedometerCommand from "./commands/speedometer";

export default {
  commands: [ morphCommand, omnitrixSizeCommand, speedometerCommand ],
  enums: [ morphEnum ]
};
