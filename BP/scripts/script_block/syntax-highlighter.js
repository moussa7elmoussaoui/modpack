import { tokenizer } from "./vendor/acorn.js";
import { MinecraftColor } from "./utils/minecraft-color.js";

const MAX_FORM_TEXT_LENGTH = 32767;
const TRUNCATED_MESSAGE_BUDGET = 512;

const COLORS = {
  comment: MinecraftColor.materialEmerald,
  string: MinecraftColor.materialCopper,
  number: MinecraftColor.green,
  keyword: MinecraftColor.blue,
  control: MinecraftColor.materialAmethyst,
  function: MinecraftColor.yellow,
  type: MinecraftColor.materialDiamond,
  variable: MinecraftColor.aqua,
};

const CONTROL_KEYWORDS = new Set([
  "async", "await", "break", "case", "catch", "continue", "debugger",
  "default", "do", "else", "export", "finally", "for", "from", "if",
  "import", "of", "return", "switch", "throw", "try", "while", "yield",
]);
const CONTEXT_KEYWORDS = new Set(["as", "async", "await", "from", "of"]);
const BUILTIN_TYPES = new Set([
  "Array", "ArrayBuffer", "BigInt", "Boolean", "Date", "Error", "EvalError",
  "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array",
  "Int32Array", "Map", "Number", "Object", "Promise", "Proxy", "RangeError",
  "ReferenceError", "RegExp", "Set", "String", "Symbol", "SyntaxError",
  "TypeError", "Uint8Array", "Uint16Array", "Uint32Array", "WeakMap", "WeakSet",
  "Dimension", "Entity", "ItemStack", "Player", "BlockPermutation",
  "ActionFormData", "ModalFormData", "MessageFormData", "SimulatedPlayer",
]);

export function escapeViewerText(text) {

  return text.replace(/\u00a7/g, "\u0019");
}

function plainPreview(source) {
  const text = escapeViewerText(source);
  if (text.length <= MAX_FORM_TEXT_LENGTH) return text;
  const length = MAX_FORM_TEXT_LENGTH - TRUNCATED_MESSAGE_BUDGET;

  const end = /[\ud800-\udbff]/.test(text[length - 1]) ? length - 1 : length;
  return { rawtext: [
    { text: text.slice(0, end) + "§r\n" },
    { translate: "script_block.preview.truncated" }
  ] };
}

function readTokens(source) {
  const tokens = [];
  const comments = [];
  const reader = tokenizer(source, { ecmaVersion: "latest", onComment: comments });
  try {
    for (;;) {
      const token = reader.getToken();
      if (token.type.label === "eof") break;
      tokens.push(token);
    }
  } catch {

  }
  return { tokens, comments };
}

function isFunctionAssignment(tokens, index) {
  if (tokens[index + 1]?.value !== "=") return false;
  let cursor = index + 2;
  if (tokens[cursor]?.value === "async") cursor++;
  if (tokens[cursor]?.value === "function" || tokens[cursor + 1]?.type.label === "=>") return true;
  if (tokens[cursor]?.type.label !== "(") return false;
  let depth = 0;
  for (; cursor < tokens.length; cursor++) {
    if (tokens[cursor].type.label === "(") depth++;
    if (tokens[cursor].type.label === ")" && --depth === 0) {
      return tokens[cursor + 1]?.type.label === "=>";
    }
  }
  return false;
}

function tokenColor(tokens, index) {
  const token = tokens[index];
  const previous = tokens[index - 1];
  const next = tokens[index + 1];
  const label = token.type.label;
  const word = token.value;
  const property = previous?.type.label === "." || previous?.type.label === "?.";

  if (label === "string" || label === "template" || label === "`") return COLORS.string;
  if (label === "regexp") return MinecraftColor.red;
  if (label === "num" || word === "Infinity" || word === "NaN") return COLORS.number;
  if (label === "${") return COLORS.keyword;
  if (property && (label === "name" || token.type.keyword)) {
    return next?.type.label === "(" ? COLORS.function : COLORS.variable;
  }
  if (token.type.keyword || CONTEXT_KEYWORDS.has(word)) {
    return CONTROL_KEYWORDS.has(word) ? COLORS.control : COLORS.keyword;
  }
  if (label !== "name" && label !== "privateId") return "";
  if (word === "undefined") return COLORS.keyword;
  if (previous?.value === "class" || previous?.value === "new" || BUILTIN_TYPES.has(word)) return COLORS.type;
  if (next?.type.label === "(" || next?.type.label === "=>" || isFunctionAssignment(tokens, index)) {
    return COLORS.function;
  }
  return COLORS.variable;
}

export function highlightCode(source) {
  const { tokens, comments } = readTokens(source);
  const braces = [];
  const spans = tokens.map((token, index) => {
    const label = token.type.label;
    let color = tokenColor(tokens, index);
    if (label === "${" || label === "{") {

      braces.push(label === "${");
    } else if (label === "}" && braces.pop()) {
      color = COLORS.keyword;
    }
    return { start: token.start, end: token.end, color };
  });
  for (const comment of comments) spans.push({ ...comment, color: COLORS.comment });
  spans.sort((a, b) => a.start - b.start);

  const parts = [];
  let length = 0;
  let index = 0;
  for (const span of spans) {
    if (span.start === span.end) continue;
    const gap = escapeViewerText(source.slice(index, span.start));
    const text = escapeViewerText(source.slice(span.start, span.end));
    const rendered = span.color ? span.color + text + MinecraftColor.reset : text;
    length += gap.length + rendered.length;
    if (length > MAX_FORM_TEXT_LENGTH) return plainPreview(source);
    parts.push(gap, rendered);
    index = span.end;
  }
  const tail = escapeViewerText(source.slice(index));
  if (length + tail.length > MAX_FORM_TEXT_LENGTH) return plainPreview(source);
  parts.push(tail);
  return parts.join("");
}
