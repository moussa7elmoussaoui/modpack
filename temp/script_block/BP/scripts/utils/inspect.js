import { MinecraftColor } from "./minecraft-color.js";

export function inspect(value, options, ...legacyArguments) {
  const context = { seen: [], stylize: stylizeNoColor };

  if (legacyArguments.length >= 1) context.depth = legacyArguments[0];
  if (legacyArguments.length >= 2) context.colors = legacyArguments[1];

  if (isBoolean(options)) {
    context.showHidden = options;
  } else if (options) {
    mergeOptions(context, options);
  }

  if (isUndefined(context.showHidden)) context.showHidden = false;
  if (isUndefined(context.depth)) context.depth = 2;
  if (isUndefined(context.colors)) context.colors = false;
  if (isUndefined(context.customInspect)) context.customInspect = true;
  if (context.colors) context.stylize = stylizeWithColor;

  return formatValue(context, value, context.depth);
}

inspect.colors = {
  bold: [MinecraftColor.bold, MinecraftColor.reset],
  italic: [MinecraftColor.italic, MinecraftColor.reset],
  white: [MinecraftColor.white, MinecraftColor.reset],
  grey: [MinecraftColor.darkGray, MinecraftColor.reset],
  black: [MinecraftColor.black, MinecraftColor.reset],
  blue: [MinecraftColor.darkBlue, MinecraftColor.reset],
  cyan: [MinecraftColor.blue, MinecraftColor.reset],
  green: [MinecraftColor.darkGreen, MinecraftColor.reset],
  magenta: [MinecraftColor.darkPurple, MinecraftColor.reset],
  red: [MinecraftColor.red, MinecraftColor.reset],
  yellow: [MinecraftColor.gold, MinecraftColor.reset],
};

inspect.styles = {
  special: "cyan",
  number: "yellow",
  boolean: "yellow",
  undefined: "grey",
  null: "bold",
  string: "green",
  date: "magenta",
  regexp: "red",
};

function stylizeNoColor(text, styleType) {
  return text;
}

function stylizeWithColor(text, styleType) {
  const style = inspect.styles[styleType];
  return style ? inspect.colors[style][0] + text + inspect.colors[style][1] : text;
}

function isBoolean(value) {
  return typeof value === "boolean";
}

function isUndefined(value) {
  return value === void 0;
}

function isFunction(value) {
  return typeof value === "function";
}

function isString(value) {
  return typeof value === "string";
}

function isNull(value) {
  return value === null;
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function objectToString(value) {
  return Object.prototype.toString.call(value);
}

function isRegExp(value) {
  return isObject(value) && objectToString(value) === "[object RegExp]";
}

function isError(value) {
  return isObject(value) && (objectToString(value) === "[object Error]" || value instanceof Error);
}

function isDate(value) {
  return isObject(value) && objectToString(value) === "[object Date]";
}

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function mergeOptions(context, options) {
  if (!options || !isObject(options)) return context;
  const keys = Object.keys(options);
  let index = keys.length;
  while (index--) {
    context[keys[index]] = options[keys[index]];
  }
}

function formatError(error) {
  return "[" + Error.prototype.toString.call(error) + "]";
}

function arrayToHash(array) {
  const hash = {};
  array.forEach(function (value) {
    hash[value] = true;
  });
  return hash;
}

function isClass(value) {
  if (typeof value !== "function") return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "prototype");
  return !!descriptor && !descriptor.writable;
}

function formatPrimitive(context, value) {
  if (isUndefined(value)) return context.stylize("undefined", "undefined");

  if (isString(value)) {
    const quoted =
      "'" +
      JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') +
      "'";
    return context.stylize(quoted, "string");
  }

  if (typeof value === "number") return context.stylize("" + value, "number");
  if (isBoolean(value)) return context.stylize("" + value, "boolean");
  if (isNull(value)) return context.stylize("null", "null");
  return undefined;
}

function formatValue(context, value, recurseTimes) {
  
  if (
    context.customInspect &&
    value &&
    isFunction(value.inspect) &&
    value.inspect !== inspect &&
    (!value.constructor || value.constructor.prototype !== value)
  ) {
    let customResult = value.inspect(recurseTimes, context);
    if (!isString(customResult)) customResult = formatValue(context, customResult, recurseTimes);
    return customResult;
  }

  const primitive = formatPrimitive(context, value);
  if (primitive) return primitive;

  let keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);

  try {
    if (context.showHidden && Object.getOwnPropertyNames) {
      keys = Object.getOwnPropertyNames(value);
    }
  } catch (ignored) {}

  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
    return formatError(value);
  }

  if (keys.length === 0) {
    if (isClass(value)) {
      const nameSuffix = value.name ? ": " + value.name : " (anonymous)";
      return "[Function" + nameSuffix + "] " + formatValue(context, value.prototype, recurseTimes);
    }
    if (isFunction(value)) {
      const nameSuffix = value.name ? ": " + value.name : " (anonymous)";
      return context.stylize("[Function" + nameSuffix + "]", "special");
    }
    if (isRegExp(value)) return context.stylize(RegExp.prototype.toString.call(value), "regexp");
    if (isDate(value)) return context.stylize(Date.prototype.toString.call(value), "date");
    if (isError(value)) return formatError(value);
  }

  let base = "";
  let isArray = false;
  let braces = ["{", "}"];

  if (Array.isArray(value)) {
    isArray = true;
    braces = ["[", "]"];
  }
  if (isFunction(value)) {
    base = "[Function" + (value.name ? ": " + value.name : " (anonymous)") + "]";
  }
  if (isRegExp(value)) base = " " + RegExp.prototype.toString.call(value);
  if (isDate(value)) base = " " + Date.prototype.toUTCString.call(value);
  if (isError(value)) base = " " + formatError(value);

  const isEmpty = keys.length === 0 && !(isArray && value.length != 0);
  if (isEmpty) return braces[0] + base + braces[1];

  if (recurseTimes < 0) {
    return isRegExp(value)
      ? context.stylize(RegExp.prototype.toString.call(value), "regexp")
      : context.stylize("[Object]", "special");
  }

  context.seen.push(value);
  const output = isArray
    ? formatArray(context, value, recurseTimes, visibleKeys, keys)
    : keys.map(function (key) {
        return formatProperty(context, value, recurseTimes, visibleKeys, key, isArray);
      });
  context.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatArray(context, array, recurseTimes, visibleKeys, keys) {
  const output = [];

  for (let index = 0, length = array.length; index < length; ++index) {
    if (hasOwnProperty(array, String(index))) {
      output.push(formatProperty(context, array, recurseTimes, visibleKeys, String(index), true));
    } else {
      output.push("");
    }
  }

  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(context, array, recurseTimes, visibleKeys, key, true));
    }
  });

  return output;
}

function formatProperty(context, object, recurseTimes, visibleKeys, key, isArrayElement) {
  let name;
  let formattedValue;
  let descriptor = { value: void 0 };

  try {
    descriptor.value = object[key];
  } catch (ignored) {}

  try {
    if (Object.getOwnPropertyDescriptor) {
      descriptor = Object.getOwnPropertyDescriptor(object, key) || descriptor;
    }
  } catch (ignored) {}

  if (descriptor.get) {
    formattedValue = descriptor.set
      ? context.stylize("[Getter/Setter]", "special")
      : context.stylize("[Getter]", "special");
  } else if (descriptor.set) {
    formattedValue = context.stylize("[Setter]", "special");
  }

  if (!hasOwnProperty(visibleKeys, key)) name = "[" + key + "]";

  if (!formattedValue) {
    if (context.seen.indexOf(descriptor.value) < 0) {
      formattedValue = isNull(recurseTimes)
        ? formatValue(context, descriptor.value, null)
        : formatValue(context, descriptor.value, recurseTimes - 1);

      if (formattedValue.indexOf("\n") > -1) {
        if (isArrayElement) {
          formattedValue = formattedValue
            .split("\n")
            .map(function (line) {
              return "  " + line;
            })
            .join("\n")
            .substr(2);
        } else {
          const lines = formattedValue.split("\n");
          formattedValue =
            lines.shift() +
            "\n" +
            lines
              .map(function (line) {
                return "  " + line;
              })
              .join("\n");
        }
      }
    } else {
      formattedValue = context.stylize("[Circular]", "special");
    }
  }

  if (isUndefined(name)) {
    if (isArrayElement && key.match(/^\d+$/)) return formattedValue;

    name = JSON.stringify("" + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = context.stylize(name, "name");
    } else {
      name = name
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')
        .replace(/(^"|"$)/g, "'");
      name = context.stylize(name, "string");
    }
  }

  return name + ": " + formattedValue;
}

function reduceToSingleString(output, base, braces) {
  
  const totalLength = output.reduce(function (total, entry) {
    return total + entry.replace(/§\d\d?/g, "").length + 1;
  }, 0);

  if (totalLength > 60) {
    return (
      (base === "" ? "" : base + " ") + braces[0] + "\n  " + output.join(",\n  ") + "\n" + braces[1]
    );
  }

  return base + " " + braces[0] + " " + output.join(", ") + " " + braces[1];
}
