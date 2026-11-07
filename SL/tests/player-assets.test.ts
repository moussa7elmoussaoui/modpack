import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allocatePlayerAssetPaths, playerFileStem } from '../src/lib/player-assets';

test('named player filenames use lowercase and underscores with no application prefix', () => {
  assert.equal(playerFileStem('DARK7MC'), 'dark7mc');
  assert.equal(playerFileStem('My Player'), 'my_player');
  assert.equal(playerFileStem('My_Player-7'), 'my_player-7');
  assert.equal(playerFileStem('CON'), 'con_');
  assert.equal(playerFileStem('LPT1'), 'lpt1_');
  assert.match(playerFileStem('../../Bad\\Path:*?'), /^[a-z0-9_-]+$/);
  assert.match(playerFileStem('玩家'), /^[a-z0-9_-]+$/);
});

test('case and normalized-name collisions keep each skin distinct while aliases share one file', () => {
  const paths = allocatePlayerAssetPaths([
    { names: ['My Player', 'Second Alias'], model: 'wide' },
    { names: ['MY_PLAYER'], model: 'wide' },
    { names: ['My Player'], model: 'slim' },
  ], []);
  assert.deepEqual(paths, ['player/generated/wide/my_player', 'player/generated/wide/my_player_2', 'player/generated/slim/my_player']);
});

test('either an existing skin or icon reserves a filename, including differently cased paths', () => {
  const paths = allocatePlayerAssetPaths([{ names: ['s001'], model: 'slim' }], [
    'RP/textures/entity/player/slim/s001.png',
    'RP/textures/entity/player/generated/slim/s001.png',
    'RP/textures/morph_icons/minecraft/player/generated/slim/S001_2.PNG',
    'RP/textures/entity/player/generated/slim/s001_3.png',
  ]);
  assert.deepEqual(paths, ['player/generated/slim/s001_4']);
});

test('original player files are separate from generated files with the same basename', () => {
  const paths = allocatePlayerAssetPaths([{ names: ['s001'], model: 'slim' }], [
    'RP/textures/entity/player/slim/s001.png',
    'RP/textures/morph_icons/minecraft/player/slim/s001.png',
  ]);
  assert.deepEqual(paths, ['player/generated/slim/s001']);
});
