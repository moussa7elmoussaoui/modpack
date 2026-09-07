function incompatible(detail: string): never {
  throw new Error(`The bundled addon name mapping is incompatible (${detail}). Refresh the base assets before generating.`);
}

/** Read an array expression without evaluating any addon JavaScript. */
function arrayAt(source: string, start: number): { text: string; end: number } {
  while (/\s/.test(source[start] ?? '') && start < source.length) start++;
  if (source[start] !== '[') incompatible('expected a literal name array');
  const stack: string[] = [];
  let quote = '', escaped = false, comment = '';
  for (let index = start; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (comment === '//') { if (char === '\n') comment = ''; continue; }
    if (comment === '/*') { if (char === '*' && next === '/') { comment = ''; index++; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '/' && (next === '/' || next === '*')) { comment = `/${next}`; index++; continue; }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if ('[({'.includes(char)) stack.push(char);
    else if ('])}'.includes(char)) {
      const expected = { ']': '[', ')': '(', '}': '{' }[char];
      if (stack.pop() !== expected) incompatible('unbalanced name mapping');
      if (!stack.length) return { text: source.slice(start, index + 1), end: index + 1 };
    }
  }
  return incompatible('unterminated name array');
}

function arrayEntries(text: string): string[] {
  const body = text.slice(1, -1), entries: string[] = [];
  let start = 0, depth = 0, quote = '', escaped = false;
  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'" || char === '`') quote = char;
    else if ('[({'.includes(char)) depth++;
    else if ('])}'.includes(char)) depth--;
    else if (char === ',' && depth === 0) { entries.push(body.slice(start, index).trim()); start = index + 1; }
  }
  entries.push(body.slice(start).trim());
  return entries.filter(Boolean);
}

/** Discover every explicit player-name assignment in the actual bundled skin script. */
export function readReservedPlayerNames(script: string): string[] {
  const declarations = [...script.matchAll(/\bconst\s+PLAYER_SKIN_BY_NAME\s*=\s*Object\.freeze\s*\(\s*Object\.fromEntries\s*\(/g)];
  if (declarations.length !== 1) incompatible('player name mapping declaration');
  const declaration = declarations[0];
  const mapping = arrayAt(script, declaration.index! + declaration[0].length);
  if (!/^\s*\)\s*\)\s*;/.test(script.slice(mapping.end))) incompatible('player name mapping expression');
  const names: string[] = [];
  for (const entry of arrayEntries(mapping.text)) {
    if (entry.startsWith('[')) {
      const literal = arrayAt(entry, 0), parts = arrayEntries(literal.text);
      if (literal.end !== entry.length || parts.length !== 2 || !/^"(?:\\.|[^"\\])*"$/.test(parts[0])) incompatible('unsupported literal player name');
      names.push(JSON.parse(parts[0])); continue;
    }
    const mapped = entry.match(/^\.\.\.([A-Za-z_$][\w$]*)\s*\.map\s*\(\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*[A-Za-z_$][\w$]*\s*\)\s*=>\s*/);
    if (!mapped) incompatible('unsupported player name entry');
    const returned = arrayAt(entry, mapped[0].length), parts = arrayEntries(returned.text);
    if (!/^\s*\)$/.test(entry.slice(returned.end)) || parts.length !== 2 || parts[0] !== mapped[2]) incompatible('unsupported player name mapping callback');
    const variable = mapped[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const definitions = [...script.matchAll(new RegExp(`\\bconst\\s+${variable}\\s*=\\s*`, 'g'))];
    if (definitions.length !== 1) incompatible(`name array ${mapped[1]}`);
    const definition = definitions[0];
    const array = arrayAt(script, definition.index! + definition[0].length);
    if (!/^\s*;/.test(script.slice(array.end))) incompatible(`name array ${mapped[1]} expression`);
    let values: unknown;
    try { values = JSON.parse(array.text.replace(/,\s*\]$/, ']')); }
    catch { incompatible(`name array ${mapped[1]} must contain JSON strings`); }
    if (!Array.isArray(values) || values.some(value => typeof value !== 'string')) incompatible(`name array ${mapped[1]} must contain strings`);
    names.push(...values);
  }
  if (!names.length || names.some(name => !name.trim() || name !== name.trim())) incompatible('empty or invalid reserved names');
  return [...new Set(names)];
}

/** Protect the existing identities even when a visitor changes their capitalization. */
export function isReservedPlayerName(name: string, reservedNames: readonly string[]): boolean {
  const normalized = name.toLowerCase();
  return reservedNames.some(reserved => reserved.toLowerCase() === normalized);
}
