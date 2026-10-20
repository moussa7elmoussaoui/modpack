import { world } from "@minecraft/server";

export class ScriptBlockStorage {
  constructor(x, y, z, dimension) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.propertyId = `Interpreter::${dimension.id},${x},${y},${z}`;

    const storedCode = world.getDynamicProperty(this.propertyId);
    this.code = typeof storedCode === "string" ? storedCode : "";
  }

  write(code) {
    this.code = code;
    world.setDynamicProperty(this.propertyId, code);
  }

  remove() {
    world.setDynamicProperty(this.propertyId);
  }

  static fromBlock(block) {
    return new ScriptBlockStorage(
      block.location.x,
      block.location.y,
      block.location.z,
      block.dimension,
    );
  }
}
