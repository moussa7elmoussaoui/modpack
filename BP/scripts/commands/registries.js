import morphCommand from "./commands/morph";
import morphEnum from "./enums/morph";
import speedometerCommand from "./commands/speedometer";

export default {
  commands: [ morphCommand, speedometerCommand ],
  enums: [ morphEnum ]
};