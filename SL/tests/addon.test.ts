import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { generateAddon, type SkinInput } from '../src/lib/addon';
import { parseNames, readPngDimensions, validateAssignments, validateSkinDimensions } from '../src/lib/validation';
import { readReservedPlayerNames } from '../src/lib/name-policy';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const files: Record<string, Uint8Array> = {};
async function collect(directory: string, prefix: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    const archivePath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await collect(fullPath, archivePath);
    else if (entry.isFile()) files[archivePath] = new Uint8Array(await readFile(fullPath));
  }
}
await collect(path.join(repo, 'BP'), 'BP');
await collect(path.join(repo, 'RP'), 'RP');
const base = zipSync(files, { level: 0 });
const texture = files['RP/textures/entity/player/wide/dark7mc.png'];
const icon = files['RP/textures/morph_icons/minecraft/player/wide/dark7mc.png'];

function input(overrides: Partial<SkinInput> = {}): SkinInput {
  return { id: 'test_skin', names: ['Alice'], model: 'wide', texturePng: texture, iconPng: icon, ...overrides };
}

function uuidFactory(): () => string {
  let id = 0;
  return () => `12345678-1234-4234-8234-${String(++id).padStart(12, '0')}`;
}

function json(archive: Record<string, Uint8Array>, name: string): any {
  return JSON.parse(strFromU8(archive[name]));
}

test('generates a complete addon with stable old skins, custom aliases, all controllers, and independent identities', async () => {
  const hostileName = '\");globalThis.INJECTED=true;//';
  const skins = [
    input({ names: ['Alice'] }),
    input({ id: 'second', names: ['Nova'], model: 'slim' }),
    input({ id: 'prototype', names: ['__proto__'], model: 'slim' }),
    input({ id: 'hostile', names: [hostileName], model: 'slim' }),
  ];
  const generated = unzipSync(await generateAddon(base, skins, { uuid: uuidFactory() }));
  const changed = new Set([
    'BP/scripts/data/player-skins.js', 'BP/entities/player.json', 'BP/manifest.json',
    'RP/entity/player.entity.json', 'RP/render_controllers/player.morph.render_controllers.json', 'RP/manifest.json',
  ]);
  for (const [name, bytes] of Object.entries(files)) {
    assert.ok(generated[name], `${name} must remain in the generated archive`);
    if (!changed.has(name)) assert.deepEqual(generated[name], bytes, `${name} must remain unchanged`);
  }
  assert.equal(Object.keys(generated).length, Object.keys(files).length + 8);
  const oldTextures = json(files, 'RP/entity/player.entity.json')['minecraft:client_entity'].description.textures;
  const newTextures = json(generated, 'RP/entity/player.entity.json')['minecraft:client_entity'].description.textures;
  const count = Object.keys(oldTextures).filter((key) => /^player_\d+$/.test(key)).length;
  assert.equal(count, 175);
  for (const [name, value] of Object.entries(oldTextures)) assert.equal(newTextures[name], value);
  assert.equal(newTextures.player_175, 'textures/entity/player/generated/wide/alice');
  assert.equal(newTextures.player_176, 'textures/entity/player/generated/slim/nova');
  const controllers = json(generated, 'RP/render_controllers/player.morph.render_controllers.json').render_controllers;
  assert.equal(Object.keys(controllers).length, 4);
  for (const controller of Object.values(controllers) as any[]) {
    assert.deepEqual(controller.arrays.textures['Array.textures'], Array.from({ length: 179 }, (_, index) => `Texture.player_${index}`));
  }
  assert.deepEqual(json(generated, 'BP/entities/player.json')['minecraft:entity'].description.properties['dark7mc:player_skin'].range, [0, 178]);
  assert.deepEqual(generated['RP/textures/entity/player/generated/wide/alice.png'], texture);
  assert.deepEqual(generated['RP/textures/morph_icons/minecraft/player/generated/slim/nova.png'], icon);

  const oldBp = json(files, 'BP/manifest.json');
  const oldRp = json(files, 'RP/manifest.json');
  const bp = json(generated, 'BP/manifest.json');
  const rp = json(generated, 'RP/manifest.json');
  const oldUuids = [oldBp.header.uuid, oldRp.header.uuid, ...oldBp.modules.map((module: any) => module.uuid), ...oldRp.modules.map((module: any) => module.uuid)];
  const newUuids = [bp.header.uuid, rp.header.uuid, ...bp.modules.map((module: any) => module.uuid), ...rp.modules.map((module: any) => module.uuid)];
  assert.equal(new Set(newUuids).size, 5);
  assert.ok(newUuids.every((uuid) => !oldUuids.includes(uuid)));
  assert.equal(bp.dependencies.find((dependency: any) => dependency.uuid)?.uuid, rp.header.uuid);
  assert.equal(rp.dependencies.find((dependency: any) => dependency.uuid)?.uuid, bp.header.uuid);
  assert.deepEqual(bp.dependencies.find((dependency: any) => dependency.uuid)?.version, rp.header.version);
  assert.deepEqual(rp.dependencies.find((dependency: any) => dependency.uuid)?.version, bp.header.version);
  for (const [oldManifest, manifest] of [[oldBp, bp], [oldRp, rp]] as const) {
    const expected = structuredClone(oldManifest);
    expected.header.uuid = manifest.header.uuid;
    expected.modules.forEach((module: any, index: number) => { module.uuid = manifest.modules[index].uuid; });
    expected.dependencies.forEach((dependency: any) => {
      if (dependency.uuid === oldBp.header.uuid) dependency.uuid = bp.header.uuid;
      if (dependency.uuid === oldRp.header.uuid) dependency.uuid = rp.header.uuid;
    });
    assert.deepEqual(manifest, expected, 'all metadata, API module requirements, capabilities, engine versions, and other manifest fields must survive');
  }

  const assignments = new Map<string, string>();
  let randomValue = 0.5;
  const context = vm.createContext({ Math: Object.assign(Object.create(Math), { random: () => randomValue }), world: {
    getDynamicProperty: (key: string) => assignments.get(key),
    setDynamicProperty: (key: string, value: string) => assignments.set(key, value),
  } });
  const executable = strFromU8(generated['BP/scripts/data/player-skins.js'])
    .replace(/^import .*?;\s*/m, '').replace(/^export /gm, '');
  vm.runInContext(`${executable}\nglobalThis.result = { playerSkins, getPlayerSkinIndex, getPlayerIconPath, randomCount: RANDOM_PLAYER_SKINS.length };`, context);
  const result = context.result;
  assert.equal(result.playerSkins.length, 179);
  assert.equal(result.randomCount, 173);
  assert.equal(result.getPlayerSkinIndex('Alice'), 175);
  assert.equal(result.getPlayerSkinIndex('DARK7MC'), 173, 'existing special identities retain their original assignments');
  assert.equal(result.getPlayerSkinIndex('URBAN7MC'), 174);
  assert.equal(result.getPlayerSkinIndex('Dream'), 152);
  assert.equal(result.getPlayerSkinIndex('Steve'), 0);
  assert.equal(result.getPlayerSkinIndex('Alex'), 151);
  assert.equal(result.getPlayerSkinIndex('Nova'), 176);
  assert.equal(result.getPlayerSkinIndex('__proto__'), 177);
  assert.equal(result.getPlayerSkinIndex(hostileName), 178);
  assert.equal(context.INJECTED, undefined, 'names remain data, never executable source');
  assert.equal(result.getPlayerIconPath(176), 'textures/morph_icons/minecraft/player/generated/slim/nova');
  const unknown = result.getPlayerSkinIndex('Unlisted visitor');
  assert.ok(unknown >= 0 && unknown < 173, 'unknown players must not randomly receive a custom skin');
  assert.equal(result.getPlayerSkinIndex('Unlisted visitor'), unknown, 'existing persistent assignment behavior remains');
  for (const [value, expected] of [[0, 0], [1 - Number.EPSILON, 172]]) {
    randomValue = value;
    assert.equal(result.getPlayerSkinIndex(undefined), expected, 'unnamed random selection stays within the original pool at both boundaries');
    assert.equal(result.getPlayerSkinIndex(`Random visitor ${value}`), expected, 'new visitors never randomly receive named-only or website skins');
    assert.equal(result.getPlayerSkinIndex('Alice'), 175, 'explicit website assignments stay outside random selection');
  }
});

test('named filenames stay safe and distinct without overwriting existing skins or icons', async () => {
  const extended = { ...files,
    'RP/textures/morph_icons/minecraft/player/wide/alice.png': icon,
    'RP/textures/morph_icons/minecraft/player/generated/wide/alice.png': icon,
    'RP/textures/entity/player/generated/wide/alice_2.png': texture,
  };
  const skins = [
    input(), input({ id: 'case_variant', names: ['ALICE'] }),
    input({ id: 'random_filename', names: ['s001'], model: 'slim' }),
    input({ id: 'unsafe_name', names: ['../../escape'] }),
    input({ id: 'spaced_filename', names: ['Mumbo_Jumbo'] }),
  ];
  const generated = unzipSync(await generateAddon(zipSync(extended, { level: 0 }), skins, { uuid: uuidFactory() }));
  const expectedPaths = ['player/generated/wide/alice_3', 'player/generated/wide/alice_4', 'player/generated/slim/s001', 'player/generated/wide/______escape', 'player/generated/wide/mumbo_jumbo'];
  const textures = json(generated, 'RP/entity/player.entity.json')['minecraft:client_entity'].description.textures;
  const registrations = JSON.parse(strFromU8(generated['BP/scripts/data/player-skins.js']).match(/const SKINLINK_SKINS = (.*);/)![1]);
  for (const [index, expected] of expectedPaths.entries()) {
    assert.deepEqual(generated[`RP/textures/entity/${expected}.png`], texture);
    assert.deepEqual(generated[`RP/textures/morph_icons/minecraft/${expected}.png`], icon);
    assert.equal(textures[`player_${175 + index}`], `textures/entity/${expected}`);
    assert.equal(registrations[index].texture, expected);
    assert.equal(registrations[index].icon, expected);
    assert.equal(registrations[index].name, skins[index].names[0], 'the linked name retains its exact spelling');
  }
  for (const [name, bytes] of Object.entries(extended)) {
    if (/^RP\/textures\//.test(name)) assert.deepEqual(generated[name], bytes, `${name}: original textures must survive`);
  }
});

test('downloads the complete addon without custom skins and preserves every non-manifest file', async () => {
  const generated = unzipSync(await generateAddon(base, [], { uuid: uuidFactory() }));
  assert.deepEqual(Object.keys(generated).sort(), Object.keys(files).sort(), 'an empty customization must not add or remove any files');
  for (const [name, bytes] of Object.entries(files)) {
    if (name !== 'BP/manifest.json' && name !== 'RP/manifest.json') {
      assert.deepEqual(generated[name], bytes, `${name} must remain byte-for-byte unchanged`);
    }
  }
  const bp = json(generated, 'BP/manifest.json'), rp = json(generated, 'RP/manifest.json');
  const oldBp = json(files, 'BP/manifest.json'), oldRp = json(files, 'RP/manifest.json');
  const oldIds = [oldBp.header.uuid, oldRp.header.uuid, ...oldBp.modules.map((module: any) => module.uuid), ...oldRp.modules.map((module: any) => module.uuid)];
  const newIds = [bp.header.uuid, rp.header.uuid, ...bp.modules.map((module: any) => module.uuid), ...rp.modules.map((module: any) => module.uuid)];
  assert.equal(new Set(newIds).size, newIds.length);
  assert.ok(newIds.every(id => !oldIds.includes(id)), 'the download receives independent pack identities');
  for (const [oldManifest, manifest] of [[oldBp, bp], [oldRp, rp]] as const) {
    const expected = structuredClone(oldManifest);
    expected.header.uuid = manifest.header.uuid;
    expected.modules.forEach((module: any, index: number) => { module.uuid = manifest.modules[index].uuid; });
    expected.dependencies.forEach((dependency: any) => {
      if (dependency.uuid === oldBp.header.uuid) dependency.uuid = bp.header.uuid;
      if (dependency.uuid === oldRp.header.uuid) dependency.uuid = rp.header.uuid;
    });
    assert.deepEqual(manifest, expected, 'original pack names and metadata survive; only identities and matching dependency identities change');
  }
  await assert.rejects(generateAddon(base, [], { uuid: () => '12345678-1234-4234-8234-000000000001' }), /unique pack identifiers/);
});

test('protected base identities cannot be overridden, including capitalization variants or a direct export call', async () => {
  const reserved = readReservedPlayerNames(strFromU8(files['BP/scripts/data/player-skins.js']));
  assert.equal(reserved.length, 25);
  for (const name of reserved) {
    assert.match(validateAssignments([input({ names: [name] })], reserved).join('\n'), /reserved by the base addon/);
    assert.match(validateAssignments([input({ names: [name.toLowerCase()] })], reserved).join('\n'), /reserved by the base addon/);
  }
  for (const name of ['DARK7MC', 'urban7mc', 'Dream', 'gRiAn', 'Steve', 'alex']) {
    await assert.rejects(generateAddon(base, [input({ names: [name] })]), /reserved by the base addon/);
  }
  const extended = { ...files };
  extended['BP/scripts/data/player-skins.js'] = strToU8(strFromU8(extended['BP/scripts/data/player-skins.js']).replace('["Steve", 0]', '["NewProtectedName", 0]'));
  await assert.rejects(generateAddon(zipSync(extended, { level: 0 }), [input({ names: ['newprotectedname'] })]), /reserved by the base addon/, 'protection must be derived from the actual archive rather than a fixed list');
});

test('rejects duplicate names, unsafe identifiers, absent names, and incorrect images before packaging', async () => {
  assert.deepEqual(parseNames('  Player One  '), ['Player One']);
  assert.deepEqual(parseNames('   '), []);
  assert.equal(validateAssignments([input(), input({ id: 'second' })]).length, 1);
  assert.ok(validateAssignments([input({ id: '../escape' })]).length);
  assert.ok(validateAssignments([input({ names: [] })]).length);
  assert.ok(validateAssignments([input({ names: [' Alice'] })]).length);
  await assert.rejects(generateAddon(base, [input({ model: '' as SkinInput['model'] })]), /choose Wide or Slim/);
  await assert.rejects(generateAddon(base, [input({ model: 'unknown' as SkinInput['model'] })]), /choose Wide or Slim/);
  await assert.rejects(generateAddon(base, [input({ names: [] })]), /exactly one player name/);
  await assert.rejects(generateAddon(base, [input({ names: ['Alice', 'Bob'] })]), /exactly one player name/);
  await assert.rejects(generateAddon(base, [input({ names: ['Alice', 'Alice'] })]), /exactly one player name/);
  await assert.rejects(generateAddon(base, [input({ names: ['Alice, Bob'] })]), /without commas/);
  await assert.rejects(generateAddon(base, [input({ names: ['Alice\nBob'] })]), /control characters/);
  assert.equal(validateAssignments([input({ names: ['Alice'] }), input({ id: 'second', names: ['alice'] })]).length, 0, 'name matching follows the addon’s case-sensitive behavior');
  await assert.rejects(generateAddon(base, [input(), input({ id: 'second' })]), /assigned to both/);
  await assert.rejects(generateAddon(base, [input(), input({ names: ['Bob'] })]), /identifier is invalid or duplicated/);
  await assert.rejects(generateAddon(base, [input({ texturePng: new Uint8Array([1, 2, 3]) })]), /valid PNG/);
  await assert.rejects(generateAddon(base, [input({ iconPng: texture })]), /128×128/);
  assert.throws(() => validateSkinDimensions(256, 256), /64×64/);
  assert.doesNotThrow(() => validateSkinDimensions(64, 32));
  assert.doesNotThrow(() => validateSkinDimensions(128, 128));
  assert.deepEqual(readPngDimensions(icon), { width: 128, height: 128 });
});

test('validates the full PNG signature and IHDR instead of accepting renamed or truncated images', () => {
  const signatureCorrupted = new Uint8Array(texture);
  signatureCorrupted[7] = 0;
  assert.throws(() => readPngDimensions(signatureCorrupted), /valid PNG/);
  assert.throws(() => readPngDimensions(texture.subarray(0, 24)), /valid PNG/);
  const headerCorrupted = new Uint8Array(texture);
  headerCorrupted[12] = 0;
  assert.throws(() => readPngDimensions(headerCorrupted), /size information/);
  const zeroWidth = new Uint8Array(texture);
  zeroWidth.fill(0, 16, 20);
  assert.throws(() => readPngDimensions(zeroWidth), /invalid dimensions/);
});

test('fails clearly when base registrations drift rather than producing a broken pack', async () => {
  const incompatible = { ...files };
  const controllers = json(incompatible, 'RP/render_controllers/player.morph.render_controllers.json');
  Object.values<any>(controllers.render_controllers)[0].arrays.textures['Array.textures'].pop();
  incompatible['RP/render_controllers/player.morph.render_controllers.json'] = strToU8(JSON.stringify(controllers));
  await assert.rejects(generateAddon(zipSync(incompatible, { level: 0 }), [input()]), /render-controller texture ordering/);
  const missing = { ...files };
  delete missing['BP/scripts/data/player-skins.js'];
  await assert.rejects(generateAddon(zipSync(missing, { level: 0 }), [input()]), /missing BP\/scripts\/data\/player-skins.js/);
  await assert.rejects(generateAddon(new Uint8Array([1, 2, 3]), [input()]), /base addon could not be read/);
});

test('rejects a UUID provider that would create colliding pack identities', async () => {
  await assert.rejects(generateAddon(base, [input()], { uuid: () => '12345678-1234-4234-8234-000000000001' }), /unique pack identifiers/);
});
