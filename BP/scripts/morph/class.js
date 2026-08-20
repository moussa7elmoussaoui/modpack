import morphs from "../data/morphs";

export class Morph {
  #entityType; #properties;

  constructor(entityType, properties = {}) {
    if (!(entityType in morphs)) {
      throw new Error(`'${entityType}' is not a morphable entity type`);
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
  }

  get entityType() { return this.#entityType; };
  get properties() { return { ...this.#properties }; };

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

    return new Morph(entityType, properties);
  }

  toString() {
    const properties = Object.entries(this.#properties)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");

    return `${this.#entityType}[${properties}]`;
  }

  equals(other) {
    if (!(other instanceof Morph)) return false;
    if (this.#entityType !== other.#entityType) return false;

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