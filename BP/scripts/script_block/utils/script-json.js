import { cloneDeep } from "./deep-clone.js";

export const scriptJson = Object.create(JSON);
scriptJson.stringify = (value, replacer, space) =>
  JSON.stringify(cloneDeep(value), replacer, space);
