export type JsonPath = readonly (string | number)[];

export type JsonTextChange =
  | { kind: 'replace'; path: JsonPath; value: unknown }
  | { kind: 'appendMembers'; path: JsonPath; entries: readonly (readonly [string, unknown])[] }
  | { kind: 'appendItems'; path: JsonPath; items: readonly unknown[] };

interface JsonNode {
  start: number;
  end: number;
  members?: Map<string, JsonNode>;
  items?: JsonNode[];
}

interface TextEdit { start: number; end: number; text: string }

function fail(detail: string): never {
  throw new Error(`Cannot edit addon JSON: ${detail}.`);
}

/** Serialize only new values; reject values JSON.stringify would silently discard or change. */
function serialize(value: unknown, ancestors = new Set<object>()): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('new values must contain only finite numbers');
    return Object.is(value, -0) ? '-0' : JSON.stringify(value);
  }
  if (typeof value !== 'object') fail(`unsupported new JSON value (${typeof value})`);
  if (ancestors.has(value)) fail('cyclic new JSON value');
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) fail('new objects must be plain JSON objects');
  if (Object.getOwnPropertySymbols(value).length) fail('new values cannot contain symbol properties');
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const items: string[] = [];
      for (let index = 0; index < value.length; index++) {
        if (!Object.hasOwn(value, index)) fail('new arrays cannot contain missing items');
        items.push(serialize(value[index], ancestors));
      }
      return `[${items.join(',')}]`;
    }
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).map(key => `${JSON.stringify(key)}:${serialize(object[key], ancestors)}`).join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
}

/** Record token ranges without converting untouched numbers, strings, or whitespace. */
function parseRanges(source: string): JsonNode {
  try { JSON.parse(source); }
  catch { fail('the source is not valid JSON'); }
  let position = 0;
  const whitespace = () => { while (/[ \t\r\n]/.test(source[position] ?? 'x')) position++; };
  const stringEnd = () => {
    position++; // Opening quote; JSON.parse already checked escapes and termination.
    while (position < source.length) {
      const character = source[position++];
      if (character === '\\') position++;
      else if (character === '"') return;
    }
    fail('unterminated string');
  };
  const value = (): JsonNode => {
    whitespace();
    const node: JsonNode = { start: position, end: position };
    if (source[position] === '{') {
      node.members = new Map(); position++; whitespace();
      if (source[position] !== '}') {
        while (true) {
          whitespace();
          const start = position; stringEnd();
          const key: string = JSON.parse(source.slice(start, position));
          if (node.members.has(key)) fail(`duplicate property ${JSON.stringify(key)}`);
          whitespace(); position++; // Colon.
          node.members.set(key, value()); whitespace();
          if (source[position] !== ',') break;
          position++;
        }
      }
      position++;
    } else if (source[position] === '[') {
      node.items = []; position++; whitespace();
      if (source[position] !== ']') {
        while (true) {
          node.items.push(value()); whitespace();
          if (source[position] !== ',') break;
          position++;
        }
      }
      position++;
    } else if (source[position] === '"') stringEnd();
    else while (position < source.length && !/[,\]} \t\r\n]/.test(source[position])) position++;
    node.end = position;
    return node;
  };
  return value();
}

function findNode(root: JsonNode, path: JsonPath): JsonNode {
  let node = root;
  for (const part of path) {
    if (typeof part === 'string' && node.members?.has(part)) node = node.members.get(part)!;
    else if (typeof part === 'number' && Number.isSafeInteger(part) && part >= 0 && node.items && part < node.items.length) node = node.items[part];
    else fail(`missing or incompatible path ${JSON.stringify(path)}`);
  }
  return node;
}

function overlaps(left: TextEdit, right: TextEdit): boolean {
  if (left.start === right.start) return true;
  if (left.start === left.end) return left.start > right.start && left.start < right.end;
  if (right.start === right.end) return right.start > left.start && right.start < left.end;
  return left.start < right.end && right.start < left.end;
}

/** Apply narrowly targeted changes while preserving every other source character verbatim. */
export function editJsonText(source: string, changes: readonly JsonTextChange[]): string {
  const root = parseRanges(source);
  const edits: TextEdit[] = [];
  for (const change of changes) {
    const node = findNode(root, change.path);
    if (change.kind === 'replace') edits.push({ start: node.start, end: node.end, text: serialize(change.value) });
    else if (change.kind === 'appendMembers') {
      if (!node.members) fail(`expected an object at ${JSON.stringify(change.path)}`);
      const keys = new Set(node.members.keys());
      const entries = change.entries.map(([key, value]) => {
        if (typeof key !== 'string') fail('new property names must be strings');
        if (keys.has(key)) fail(`duplicate new property ${JSON.stringify(key)}`);
        keys.add(key);
        return `${JSON.stringify(key)}:${serialize(value)}`;
      });
      if (entries.length) {
        const last = [...node.members.values()].at(-1);
        const start = last?.end ?? node.start + 1;
        edits.push({ start, end: start, text: `${last ? ',' : ''}${entries.join(',')}` });
      }
    } else {
      if (!node.items) fail(`expected an array at ${JSON.stringify(change.path)}`);
      if (change.items.length) {
        const last = node.items.at(-1);
        const start = last?.end ?? node.start + 1;
        edits.push({ start, end: start, text: `${last ? ',' : ''}${change.items.map(item => serialize(item)).join(',')}` });
      }
    }
  }
  const ordered = edits.sort((left, right) => right.start - left.start || right.end - left.end);
  for (let index = 1; index < ordered.length; index++) {
    if (overlaps(ordered[index - 1], ordered[index])) fail('overlapping changes');
  }
  let result = source;
  for (const edit of ordered) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return result;
}
