export function translated(key, values = []) {
  return values.length ? {
    translate: key,
    with: { rawtext: values.map(value => value !== null && typeof value === "object" ? value : { text: String(value) }) }
  } : { translate: key };
}

export function feedback(key, values = [], color = "§7") {
  return { rawtext: [{ text: `§r${color}` }, translated(key, values), { text: "§r" }] };
}

export class LocalizedError extends Error {
  constructor(key, values = [], fallback = key) {
    super(fallback);
    this.localizationKey = key;
    this.localizationValues = values;
  }
}

export function errorFeedback(error) {
  if (error instanceof LocalizedError) return feedback(error.localizationKey, error.localizationValues, "§c");
  console.error(error?.stack ?? error);
  return feedback("addon.error.unexpected", [], "§c");
}
