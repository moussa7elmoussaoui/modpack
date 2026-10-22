import { parse } from "./vendor/acorn.js";
import { beautify } from "./vendor/js-beautify.js";

const MAX_STORED_CODE_BYTES = 32767;
const PARSE_OPTIONS = { ecmaVersion: "latest", sourceType: "script" };
const FORMAT_OPTIONS = {
  indent_size: 2,
  indent_char: " ",
  preserve_newlines: true,
  max_preserve_newlines: 2,
  brace_style: "collapse",
  space_before_conditional: true,
  space_after_anon_function: true,
  end_with_newline: false,
  wrap_line_length: 100,
  unescape_strings: false,
  e4x: false,
};

function byteLength(text) {
  let length = 0;
  for (const character of text) {
    const code = character.codePointAt(0);
    length += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return length;
}

function syntaxTree(source, insertedSemicolons) {
  const tree = parse(source, {
    ...PARSE_OPTIONS,
    onInsertedSemicolon: position => insertedSemicolons?.push(position),
  });

  return JSON.stringify(tree, function (key, value) {
    if (key === "start" || key === "end") return undefined;
    if (key === "raw" && this.type === "Literal") return undefined;
    return typeof value === "bigint" ? { bigint: String(value) } : value;
  });
}

export function formatCode(source) {
  if (typeof source !== "string") throw new TypeError("Code must be text.");
  const semicolons = [];
  const originalTree = syntaxTree(source, semicolons);

  const pieces = [];
  let index = 0;
  for (const position of new Set(semicolons)) {
    pieces.push(source.slice(index, position), ";");
    index = position;
  }
  pieces.push(source.slice(index));
  const formatted = beautify(pieces.join(""), FORMAT_OPTIONS);

  if (byteLength(formatted) > MAX_STORED_CODE_BYTES) {
    throw new Error("Formatted code exceeds the block's storage limit.");
  }
  if (syntaxTree(formatted) !== originalTree) {
    throw new Error("Formatting could change the code's behavior.");
  }

  return formatted;
}
