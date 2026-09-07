export function cloneDeep(value) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value.getTime());

  const clone = value instanceof Array ? new Array(value.length) : {};
  copyProperties(value, clone);
  return clone;
}

function copyProperties(source, target) {
  for (const key in source) {
    const property = source[key];
    if (property instanceof Date) {
      addToContainer(target, key, new Date(property.getTime()));
    } else if (property instanceof Function) {
      addToContainer(target, key, property);
    } else if (property instanceof Array) {
      copyProperties(property, addToContainer(target, key, new Array(property.length)));
    } else if (property instanceof Object) {
      copyProperties(property, addToContainer(target, key, {}));
    } else {
      addToContainer(target, key, property);
    }
  }
}

function addToContainer(container, key, value) {
  container[key] = value;
  return value;
}
