import { cloneDeep } from "./deep-clone.js";

// Expose native Minecraft object properties to user scripts without changing
// JSON.stringify for the other add-ons sharing this script runtime.
export const scriptJson = Object.create(JSON);
scriptJson.stringify = (value, replacer, space) =>
  JSON.stringify(cloneDeep(value), replacer, space);
