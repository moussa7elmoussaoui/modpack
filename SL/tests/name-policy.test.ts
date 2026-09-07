import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';
import { isReservedPlayerName, readReservedPlayerNames } from '../src/lib/name-policy';

const script = await readFile(new URL('../../BP/scripts/data/player-skins.js', import.meta.url), 'utf8');

test('static reserved-name discovery matches every real addon mapping without evaluating browser code', () => {
  const context = vm.createContext({ world: {} });
  vm.runInContext(`${script.replace(/^import .*?;\s*/m, '').replace(/^export /gm, '')}\nglobalThis.names = Object.keys(PLAYER_SKIN_BY_NAME);`, context);
  assert.deepEqual(readReservedPlayerNames(script).sort(), Array.from(context.names as string[]).sort());
  for (const name of ['DARK7MC', 'urban7mc', 'dReAm', 'grian', 'Steve', 'ALEX']) assert.equal(isReservedPlayerName(name, readReservedPlayerNames(script)), true);
  assert.equal(isReservedPlayerName('OrdinaryPlayer', readReservedPlayerNames(script)), false);
});

test('reserved-name discovery includes new literal and mapped names and rejects unsupported computed mappings', () => {
  const source = script.replace('"Dream",', '"Dream", "Future Creator",').replace('["DARK7MC",', '["Future Literal",');
  const names = readReservedPlayerNames(source);
  assert.ok(names.includes('Future Creator'));
  assert.ok(names.includes('Future Literal'));
  assert.throws(() => readReservedPlayerNames(script.replace('["DARK7MC",', '[SOME_COMPUTED_NAME,')), /incompatible/);
  assert.throws(() => readReservedPlayerNames(script.replace('...YOUTUBER_NAMES.map', '...getNames().map')), /incompatible/);
  assert.throws(() => readReservedPlayerNames(script.replace('[name, 2 + SLIM_SKINS.length + index]', '[name, 2 + SLIM_SKINS.length + index] && ["Hidden name", 0]')), /incompatible/);
  assert.throws(() => readReservedPlayerNames(script.replace('const YOUTUBER_NAMES = [', 'const YOUTUBER_NAMES = getNames([')), /incompatible/);
  assert.throws(() => readReservedPlayerNames(script.replace('const PLAYER_SKIN_BY_NAME', 'const OLD_PLAYER_SKIN_BY_NAME')), /incompatible/);
});
