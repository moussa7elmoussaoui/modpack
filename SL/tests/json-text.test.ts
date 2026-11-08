import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editJsonText } from '../src/lib/json-text';

test('targeted changes retain every unrelated character, including CRLF and numeric spellings', () => {
  const source = ' \r\n{\r\n\t"number": 6.0,\r\n\t"manifest": { "uuid" : "old" },\r\n\t"textures": { "player_0": "original" \r\n\t},\r\n\t"array": [ "original" \r\n\t]\r\n}  ';
  const actual = editJsonText(source, [
    { kind: 'replace', path: ['manifest', 'uuid'], value: 'new' },
    { kind: 'appendMembers', path: ['textures'], entries: [['player_1', 'generated']] },
    { kind: 'appendItems', path: ['array'], items: ['generated'] },
  ]);
  const expected = source.replace('"old"', '"new"')
    .replace('"player_0": "original"', '"player_0": "original","player_1":"generated"')
    .replace('[ "original"', '[ "original","generated"');
  assert.equal(actual, expected);
  assert.deepEqual(JSON.parse(actual), { number: 6, manifest: { uuid: 'new' }, textures: { player_0: 'original', player_1: 'generated' }, array: ['original', 'generated'] });
});

test('paths target decoded property names without confusing repeated fields or strings', () => {
  const source = String.raw`{"range":[0,174],"decoy":{"range":[0,7]},"controllers":{"Array.textures":["range"]},"escaped\\key":{"\u0075uid":"old"}}`;
  const actual = editJsonText(source, [
    { kind: 'replace', path: ['range', 1], value: 175 },
    { kind: 'replace', path: ['escaped\\key', 'uuid'], value: 'new' },
    { kind: 'appendItems', path: ['controllers', 'Array.textures'], items: ['new'] },
  ]);
  assert.equal(actual, source.replace('[0,174]', '[0,175]').replace('"old"', '"new"').replace('["range"]', '["range","new"]'));
});

test('empty containers retain their existing interior whitespace after additions', () => {
  assert.equal(editJsonText('{"object": { \r\n\t }, "array": [ \t\n]}', [
    { kind: 'appendMembers', path: ['object'], entries: [['added', 1]] },
    { kind: 'appendItems', path: ['array'], items: ['added', { value: true }] },
  ]), '{"object": {"added":1 \r\n\t }, "array": ["added",{"value":true} \t\n]}');
});

test('prototype-shaped keys remain ordinary data and appended names and values are escaped', () => {
  const source = '{"__proto__":{"uuid":"old"},"constructor":{"uuid":"keep"},"new":{}}';
  const key = 'quote"\\\n';
  const value = 'value"\\\r\n';
  const actual = editJsonText(source, [
    { kind: 'replace', path: ['__proto__', 'uuid'], value: 'new' },
    { kind: 'appendMembers', path: ['new'], entries: [['__proto__', 1], [key, value]] },
  ]);
  const parsed = JSON.parse(actual);
  assert.equal(parsed.__proto__.uuid, 'new');
  assert.equal(parsed.constructor.uuid, 'keep');
  assert.equal(Object.hasOwn(parsed.new, '__proto__'), true);
  assert.equal(parsed.new.__proto__, 1);
  assert.equal(parsed.new[key], value);
  assert.equal(Object.getPrototypeOf(parsed.new), Object.prototype);
});

test('edits use original offsets even when earlier replacements grow or shrink', () => {
  assert.equal(editJsonText('[ "old", { "old":"long value" }, 2 ]', [
    { kind: 'replace', path: [0], value: 'a much longer replacement' },
    { kind: 'replace', path: [1, 'old'], value: 'x' },
    { kind: 'replace', path: [2], value: 3 },
    { kind: 'appendItems', path: [], items: [4] },
  ]), '[ "a much longer replacement", { "old":"x" }, 3,4 ]');
});

test('untouched precise numbers and escaped string tokens are never reserialized', () => {
  const source = '{ "precise":900719925474099312345, "exponent":6.0e+2, "escaped":"\\/\\u0041" }\r\n';
  assert.equal(editJsonText(source, [{ kind: 'appendMembers', path: [], entries: [['added', true]] }]), source.replace('"\\/\\u0041"', '"\\/\\u0041","added":true'));
  assert.equal(editJsonText(source, []), source);
  assert.equal(editJsonText(source, [{ kind: 'appendMembers', path: [], entries: [] }]), source);
});

test('duplicate source keys and duplicate member additions fail instead of targeting ambiguously', () => {
  assert.throws(() => editJsonText('{"x":1,"\\u0078":2}', []), /duplicate property/);
  assert.throws(() => editJsonText('{"x":1}', [{ kind: 'appendMembers', path: [], entries: [['x', 2]] }]), /duplicate new property/);
  assert.throws(() => editJsonText('{}', [{ kind: 'appendMembers', path: [], entries: [['x', 1], ['x', 2]] }]), /duplicate new property/);
});

test('invalid JSON, incompatible paths and wrong container types are rejected', () => {
  assert.throws(() => editJsonText('{"x":1,}', []), /not valid JSON/);
  for (const path of [['missing'], ['array', '0'], ['array', -1], ['array', 0.5], ['object', 0]]) {
    assert.throws(() => editJsonText('{"array":[1],"object":{"0":2}}', [{ kind: 'replace', path, value: 0 }]), /missing or incompatible path/);
  }
  assert.throws(() => editJsonText('[]', [{ kind: 'appendMembers', path: [], entries: [] }]), /expected an object/);
  assert.throws(() => editJsonText('{}', [{ kind: 'appendItems', path: [], items: [] }]), /expected an array/);
});

test('overlapping replacements and repeated insertion positions are rejected', () => {
  assert.throws(() => editJsonText('{"x":[1]}', [
    { kind: 'replace', path: ['x'], value: [] },
    { kind: 'replace', path: ['x', 0], value: 2 },
  ]), /overlapping changes/);
  assert.throws(() => editJsonText('{"x":[1]}', [
    { kind: 'replace', path: ['x'], value: [] },
    { kind: 'appendItems', path: ['x'], items: [2] },
  ]), /overlapping changes/);
  assert.throws(() => editJsonText('[1]', [
    { kind: 'appendItems', path: [], items: [2] },
    { kind: 'appendItems', path: [], items: [3] },
  ]), /overlapping changes/);
});

test('new values reject unsupported values instead of silently changing or discarding data', () => {
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  const values: unknown[] = [undefined, Infinity, NaN, -Infinity, 1n, Symbol('value'), () => 1,
    { omitted: undefined }, [undefined], new Array(1), new Date(), cyclic, { [Symbol('key')]: 1 }];
  for (const value of values) assert.throws(() => editJsonText('{"x":0}', [{ kind: 'replace', path: ['x'], value }]), /Cannot edit addon JSON/);
});

test('new negative zero values retain their sign, including inside newly inserted structures', () => {
  const actual = editJsonText('{"existing":1,"nested":[]}', [
    { kind: 'replace', path: ['existing'], value: -0 },
    { kind: 'appendItems', path: ['nested'], items: [{ number: -0 }, [-0]] },
  ]);
  assert.equal(actual, '{"existing":-0,"nested":[{"number":-0},[-0]]}');
  const parsed = JSON.parse(actual);
  assert.ok(Object.is(parsed.existing, -0));
  assert.ok(Object.is(parsed.nested[0].number, -0));
  assert.ok(Object.is(parsed.nested[1][0], -0));
});
