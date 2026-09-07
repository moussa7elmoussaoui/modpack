const convertBlock = ({ block }, parameters) => block.setType(parameters.params.convert_to);

export default {
  id: "convert_block",
  onPlace: convertBlock,
  onPlayerInteract: convertBlock,
  onRandomTick: convertBlock
};