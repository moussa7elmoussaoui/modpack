import { cloneDeep } from "./utils/deep-clone.js";

const originalStringify = JSON.stringify;

export function installDeepCloneJsonStringify() {
  JSON.stringify = ((value, replacer, space) =>
    originalStringify.call(undefined, cloneDeep(value), replacer, space)).bind(JSON);
}
