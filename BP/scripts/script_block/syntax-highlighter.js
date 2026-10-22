import { MinecraftColor } from "./utils/minecraft-color.js";

const MAX_FORM_TEXT_LENGTH = 32767;

const NUMBER_PATTERN =
  /^(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?n?|\.\d+(?:[eE][+-]?\d+)?)/;

const KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const LITERALS = new Set(["false", "Infinity", "NaN", "null", "true", "undefined"]);

const BUILTIN_GLOBALS = new Set([
  "Array",
  "Boolean",
  "Date",
  "Error",
  "JSON",
  "Map",
  "Math",
  "Number",
  "Object",
  "Promise",
  "Set",
  "String",
  "console",
  "system",
  "world",
]);

export function highlightCode(source) {
  let result = "";
  let index = 0;

  const colorize = (text, color) => `${color}${text}${MinecraftColor.reset}`;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (/\s/.test(current)) {
      
      let end = index + 1;
      while (end < source.length && /\s/.test(source[end])) end++;
      result += source.slice(index, end);
      index = end;
    } else if (current === "/" && next === "/") {
      
      let end = source.indexOf("\n", index);
      if (end === -1) end = source.length;
      result += colorize(source.slice(index, end), MinecraftColor.darkGray);
      index = end;
    } else if (current === "/" && next === "*") {
      
      let end = source.indexOf("*/", index + 2);
      if (end === -1) end = source.length - 2;
      end += 2;
      result += colorize(source.slice(index, end), MinecraftColor.darkGray);
      index = end;
    } else if (current === "'" || current === '"' || current === "`") {
      
      const quote = current;
      let end = index + 1;
      for (; end < source.length; end++) {
        if (source[end] === "\\") {
          end++;
        } else if (source[end] === quote) {
          end++;
          break;
        }
      }
      result += colorize(source.slice(index, end), MinecraftColor.green);
      index = end;
    } else if (/\d/.test(current) || (current === "." && /\d/.test(next))) {
      
      const number = source.slice(index).match(NUMBER_PATTERN)[0];
      result += colorize(number, MinecraftColor.gold);
      index += number.length;
    } else if (/[A-Za-z_$]/.test(current)) {
      
      const identifier = source.slice(index).match(/^[A-Za-z_$][\w$]*/)[0];

      let lookahead = index + identifier.length;
      while (/\s/.test(source[lookahead] ?? "")) lookahead++;

      const color = KEYWORDS.has(identifier)
        ? MinecraftColor.red
        : LITERALS.has(identifier)
          ? MinecraftColor.lightPurple
          : BUILTIN_GLOBALS.has(identifier)
            ? MinecraftColor.aqua
            : source[lookahead] === "("
              ? MinecraftColor.yellow
              : "";

      result += color ? colorize(identifier, color) : identifier;
      index += identifier.length;
    } else {
      
      result += current;
      index++;
    }
  }

  return result.length <= MAX_FORM_TEXT_LENGTH ? result : source;
}
