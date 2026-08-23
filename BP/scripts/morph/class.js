import morphs from "../data/morphs";

export class Morph {
  #entityType; #properties; #playerName;

  constructor(entityType, properties = {}, playerName = undefined) {
    if (!(entityType in morphs)) {
      throw new Error(`'${entityType}' is not a morphable entity type`);
    }

    if (playerName !== undefined && (entityType !== "minecraft:player" || typeof playerName !== "string" || playerName.length === 0)) {
      throw new Error("A player morph requires a non-empty player name");
    }

    const validProperties = Object.fromEntries(
      Object.entries(morphs[entityType].properties ?? {}).map(([ key, values ]) => [
        key, values.map(({ value }) => value)
      ])
    );
    
    for (const [key, value] of Object.entries(properties)) {
      if (!(key in validProperties)) {
        throw new Error(`'${entityType}' does not have a '${key}' property`);
      }

      if (!validProperties[key].includes(value)) {
        throw new Error(`The '${key}' property does not have a '${value}' value`);
      }
    }

    for (const [key, values] of Object.entries(validProperties)) {
      properties[key] ??= values[0];
    }

    properties = Object.fromEntries(
      Object.keys(validProperties).map(key => [key, properties[key]])
    );

    this.#entityType = entityType;
    this.#properties = properties;
    this.#playerName = playerName;
  }

  get entityType() { return this.#entityType; };
  get properties() { return { ...this.#properties }; };
  get playerName() { return this.#playerName; };

  static parse(identifier) {
    if (typeof identifier !== "string") {
      throw new TypeError("Identifier must be a string");
    }

    const bracketStart = identifier.indexOf("[");
    const bracketEnd = identifier.indexOf("]", bracketStart);
    const hasProperties = bracketStart !== -1 && bracketEnd !== -1;

    const entityType = (hasProperties ? identifier.slice(0, bracketStart) : identifier).trim();
    const properties = hasProperties ? Object.fromEntries(
      identifier
        .slice(bracketStart + 1, bracketEnd)
        .split(",")
        .filter(property => property.trim() !== "")
        .map(property => {
          const [key, ...value] = property.split("=");
          return [key.trim(), value.join("=").trim()]
        })
    ) : {};

    const playerName = entityType === "minecraft:player" && properties.name !== undefined
      ? decodeURIComponent(properties.name)
      : undefined;
    delete properties.name;

    return new Morph(entityType, properties, playerName);
  }

  toString() {
    const properties = Object.entries(this.#properties)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
    const playerName = this.#playerName === undefined ? "" : `name=${encodeURIComponent(this.#playerName)}`;
    const serializedProperties = [ properties, playerName ].filter(Boolean).join(",");

    return `${this.#entityType}[${serializedProperties}]`;
  }

  equals(other) {
    if (!(other instanceof Morph)) return false;
    if (this.#entityType !== other.#entityType) return false;
    if (this.#playerName !== other.#playerName) return false;

    const properties = this.#properties;
    const otherProperties = other.#properties;

    const propertyKeys = Object.keys(properties);
    if (propertyKeys.length !== Object.keys(otherProperties).length) return false;

    for (const key of propertyKeys) {
      if (properties[key] !== otherProperties[key]) return false;
    }

    return true;
  }
}