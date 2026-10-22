import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { formatCode } from "../BP/scripts/script_block/code-formatter.js";
import { escapeViewerText, highlightCode } from "../BP/scripts/script_block/syntax-highlighter.js";
import { MinecraftColor as color } from "../BP/scripts/script_block/utils/minecraft-color.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const stripColors = text => text.replace(/\u00a7[0-9a-z]/gi, "");
const fixtures = [
  '(()=>{const a={x:1,y:[2,3]};return a.y.map((n)=>n*2);})()',
  '(()=>{const r=/https?:\\/\\/[^/]+/gi;return r.test("https://example.com");})()',
  '(()=>{const name="Alex";return `Hello ${`${name}!`} \\n`;})()',
  '(()=>{function read(){return\n{value:1};}return read();})()',
  '(()=>{let a=1,b=2;a\n++b;return [a,b];})()',
  '(()=>{const a={nested:{value:3}};return a?.nested?.value??0;})()',
  '(()=>{class Counter{#value=1;read(){return this.#value;}}return new Counter().read();})()',
  '(()=>{const x=0xff+0b10+0o7+1_000;return [x,String(123n)];})()',
  '(()=>{const f=({a=1,...rest}={})=>[a,rest];return f({a:2,b:3});})()',
  '(()=>{function tag(parts){return parts.raw[0];}return tag`\\n\\u00a7c`;})()',
  '(()=>{/* keep this comment */const text="\u00a7cHello";// keep this too\nreturn text;})()',
  '(async()=>{const f=async(x)=>{return await Promise.resolve(x+1);};return await f(2);})()',
];

test("formatting is readable, idempotent, and preserves representative behavior", async () => {
  assert.equal(formatCode('if(true){foo();}'), 'if (true) {\n  foo();\n}');
  for (const source of fixtures) {
    const formatted = formatCode(source);
    assert.equal(formatCode(formatted), formatted, source);
    const before = await vm.runInNewContext(source, {}, { timeout: 1000 });
    const after = await vm.runInNewContext(formatted, {}, { timeout: 1000 });
    assert.deepEqual(JSON.stringify(after), JSON.stringify(before), source);
  }
});

test("formatting never evaluates player code and preserves actual section signs", () => {
  assert.equal(formatCode('throw new Error("Do not execute");'), 'throw new Error("Do not execute");');
  const formatted = formatCode('player.sendMessage("\u00a7cHello");');
  assert(formatted.includes('\u00a7cHello'));
  assert(!formatted.includes('\u0019'));
});

test("invalid or oversized formatting is rejected", () => {
  for (const source of ['const x=;', 'const x="unfinished', 'if(true){', 'const r=/[/;']) {
    assert.throws(() => formatCode(source), SyntaxError);
  }
  const nearLimit = 'const items=[' + '1,'.repeat(12000) + '0];';
  assert(Buffer.byteLength(nearLimit) < 32767);
  assert.throws(() => formatCode(nearLimit), /storage limit/);
});

test("highlighting uses distinct Dark+ token categories and nested template expressions", () => {
  const result = highlightCode('const greet=(name)=>{return `Hello ${world.getPlayers().length}!`;} // note');
  assert(result.includes(color.blue + 'const' + color.reset));
  assert(result.includes(color.yellow + 'greet' + color.reset));
  assert(result.includes(color.materialAmethyst + 'return' + color.reset));
  assert(result.includes(color.materialCopper + 'Hello ' + color.reset));
  assert(result.includes(color.yellow + 'getPlayers' + color.reset));
  assert(result.includes(color.aqua + 'length' + color.reset));
  assert(result.includes(color.materialEmerald + '// note' + color.reset));
  assert(highlightCode('const r=/a+[b/]/gi;').includes(color.red + '/a+[b/]/gi' + color.reset));
});

test("all source formatting sequences are visible, including malformed and long previews", () => {
  const codes = [...'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(code => '\u00a7' + code).join('');
  const sources = [
    'player.sendMessage("' + codes + '"); // ' + codes,
    '/* ' + codes + ' */ const a=`' + codes + '${1+2}`;',
    'const broken="' + codes,
    '\u00a7cHello',
    'const x=1;'.repeat(2200) + '// ' + codes,
  ];
  for (const source of sources) {
    assert.equal(stripColors(highlightCode(source)), escapeViewerText(source));
    assert(highlightCode(source).length <= 32767);
  }
  const oversized = highlightCode('// \u00a7c' + 'x'.repeat(40000));
  assert(oversized.length <= 32767);
  assert(!oversized.includes('\u00a7'));
  assert(oversized.includes('Preview shortened'));
});

test("unfinished JavaScript and Unicode text remain readable", () => {
  const sources = ['/* unfinished', '`Hello ${', 'const r=/unterminated', 'const x="escape\\', 'const \u03c0=1_000n;', 'const face="\ud83d\ude00";'];
  for (const source of sources) assert.equal(stripColors(highlightCode(source)), source);
});

async function menuSession(code, responses, failWrites = false) {
  const shown = [];
  const properties = new Map([['Interpreter::overworld,1,2,3', code]]);
  const errors = [];
  const context = vm.createContext({ console: { error: message => errors.push(message) } });
  class Form {
    constructor() { this.buttons = []; }
    title(value) { this.heading = value; return this; }
    body(value) { this.message = value; return this; }
    button(value) { this.buttons.push(value); return this; }
    textField(label, placeholder, options) { this.defaultValue = options.defaultValue; return this; }
    submitButton(value) { this.submit = value; return this; }
    async show() { shown.push(this); return responses.shift() ?? { canceled: true }; }
  }
  const world = {
    getDynamicProperty: key => properties.get(key),
    setDynamicProperty(key, value) {
      if (failWrites) throw new Error('Storage unavailable');
      if (value === undefined) properties.delete(key);
      else properties.set(key, value);
    },
  };
  const cache = new Map();
  function load(identifier) {
    if (cache.has(identifier)) return cache.get(identifier);
    let module;
    if (identifier === '@minecraft/server-ui') {
      module = new vm.SyntheticModule(['ActionFormData', 'ModalFormData'], function () {
        this.setExport('ActionFormData', Form);
        this.setExport('ModalFormData', Form);
      }, { context, identifier });
    } else if (identifier === '@minecraft/server') {
      module = new vm.SyntheticModule(['world'], function () { this.setExport('world', world); }, { context, identifier });
    } else {
      module = new vm.SourceTextModule(fs.readFileSync(identifier, 'utf8'), { context, identifier });
    }
    cache.set(identifier, module);
    return module;
  }
  const menu = load(path.join(root, 'BP/scripts/script_block/ui/script-block-menu.js'));
  await menu.link((specifier, parent) => load(specifier.startsWith('.') ? path.resolve(path.dirname(parent.identifier), specifier) : specifier));
  await menu.evaluate();
  return {
    menu: menu.namespace, shown, properties, errors,
    block: { location: { x: 1, y: 2, z: 3 }, dimension: { id: 'overworld' } },
    player: { sendMessage: message => errors.push(message) },
    saved: () => properties.get('Interpreter::overworld,1,2,3'),
  };
}

test("Format runs immediately, saves on success, and OK returns to the updated viewer", async () => {
  const session = await menuSession('if(true){foo();}', [{ selection: 1 }, { selection: 0 }]);
  await session.menu.showScriptBlockMenu(session.block, session.player);
  assert.deepEqual(session.shown.map(form => form.heading), ['Script Block', 'Format Script Block', 'Script Block']);
  assert.deepEqual(session.shown[0].buttons, ['Clear', 'Format', 'Edit']);
  assert.deepEqual(session.shown[1].buttons, ['OK']);
  assert.equal(session.shown[1].message, 'Code formatted.');
  assert.equal(session.saved(), 'if (true) {\n  foo();\n}');
  assert.equal(stripColors(session.shown[2].message), session.saved());
  assert.deepEqual(session.errors, []);
});

test("Format failure keeps original code and uses the same single OK action", async () => {
  for (const [source, failWrites] of [['const broken=;', false], ['if(true){foo();}', true]]) {
    const session = await menuSession(source, [{ selection: 1 }, { selection: 0 }], failWrites);
    await session.menu.showScriptBlockMenu(session.block, session.player);
    assert.equal(session.saved(), source);
    assert.deepEqual(session.shown[1].buttons, ['OK']);
    assert(session.shown[1].message.includes('Your original code was kept.'));
    assert.equal(session.shown[2].heading, 'Script Block');
  }
});

test("already formatted code shows the result dialog without writing", async () => {
  const source = 'const value = 1;';
  const session = await menuSession(source, [{ selection: 1 }], true);
  await session.menu.showScriptBlockMenu(session.block, session.player);
  assert.equal(session.shown[1].message, 'Code is already formatted.');
  assert.equal(session.saved(), source);
});

test("Edit opens saved formatted code and ordinary Save leaves input untouched", async () => {
  const input = 'if(true){player.sendMessage("\u00a7cHello");}';
  const session = await menuSession('const value = 1;', [{ selection: 2 }, { formValues: [input] }]);
  await session.menu.showScriptBlockMenu(session.block, session.player);
  assert.equal(session.shown[1].defaultValue, 'const value = 1;');
  assert.equal(session.shown[1].submit, 'Save');
  assert.equal(session.saved(), input);
});

test("Clear still requires confirmation and Cancel preserves saved code", async () => {
  for (const selection of [0, 1]) {
    const session = await menuSession('const value = 1;', [{ selection: 0 }, { selection }]);
    await session.menu.showScriptBlockMenu(session.block, session.player);
    assert.equal(session.shown[1].heading, 'Clear Script Block?');
    assert.deepEqual(session.shown[1].buttons, ['Clear code', 'Cancel']);
    assert.equal(session.saved(), selection === 0 ? undefined : 'const value = 1;');
  }
});

test("UI routes the result to the shared compact dialog and positions fixed-size buttons", () => {
  const ui = JSON.parse(fs.readFileSync(path.join(root, 'RP/ui/script_block.json'), 'utf8'));
  const routing = JSON.parse(fs.readFileSync(path.join(root, 'RP/ui/server_form.json'), 'utf8'));
  const controls = ui.script_block_long_form_switch.controls;
  assert(controls.some(control => 'script_block_confirmation@script_block.script_block_dialog' in control));
  const result = controls.find(control => 'script_block_format_result@script_block.script_block_dialog' in control)['script_block_format_result@script_block.script_block_dialog'];
  assert.deepEqual(result.$script_block_actions_size, [84, 20]);
  const dialog = ui['script_block_dialog@script_block.script_block_window'];
  assert.deepEqual(dialog.min_size, [205, 166]);
  assert.deepEqual(dialog.max_size, [205, 166]);
  const buttons = ui.script_block_preview_buttons.controls.map(control => Object.values(control)[0]);
  assert.deepEqual(buttons.map(button => button.collection_index), [0, 1, 2]);
  assert.deepEqual(buttons.map(button => button.anchor_to), ['left_middle', 'right_middle', 'right_middle']);
  assert.deepEqual(ui['script_block_text_button@common_buttons.light_text_button'].size, [80, 20]);
  assert(JSON.stringify(routing).includes("#title_text != 'Format Script Block'"));
});
