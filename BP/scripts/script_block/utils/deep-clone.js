export function cloneDeep(value) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value.getTime());

  const clone = value instanceof Array ? [] : {};
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
      copyProperties(property, addToContainer(target, key, []));
    } else if (property instanceof Object) {
      copyProperties(property, addToContainer(target, key, {}));
    } else {
      addToContainer(target, key, property);
    }
  }
}

function addToContainer(container, key, value) {
  if (container instanceof Array) {
    container.push(value);
  } else {
    container[key] = value;
  }
  return value;
}
