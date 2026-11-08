import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { detectSkinModel } from '../src/lib/skin-model';

function opaqueSkin(size = 64): Uint8ClampedArray {
  return new Uint8ClampedArray(size * size * 4).fill(255);
}

function alphaRect(pixels: Uint8ClampedArray, size: number, x: number, y: number, width: number, height: number, alpha: number): void {
  const scale = size / 64;
  for (let row = y * scale; row < (y + height) * scale; row++) {
    for (let column = x * scale; column < (x + width) * scale; column++) {
      pixels[(row * size + column) * 4 + 3] = alpha;
    }
  }
}

function slimSkin(size = 64): Uint8ClampedArray {
  const pixels = opaqueSkin(size);
  // Transparent space beside both base arms, including the top/bottom faces.
  alphaRect(pixels, size, 50, 16, 2, 4, 0);
  alphaRect(pixels, size, 54, 20, 2, 12, 0);
  alphaRect(pixels, size, 42, 48, 2, 4, 0);
  alphaRect(pixels, size, 46, 52, 2, 12, 0);
  return pixels;
}

test('pixel detection matches every bundled Wide and Slim skin without any name or file lookup in the detector', async () => {
  let checked = 0;
  for (const model of ['wide', 'slim'] as const) {
    const directory = new URL(`../../RP/textures/entity/player/${model}/`, import.meta.url);
    for (const filename of (await readdir(directory)).filter(name => name.endsWith('.png'))) {
      const skin = PNG.sync.read(await readFile(new URL(filename, directory)));
      assert.equal(detectSkinModel(skin.data, skin.width, skin.height), model, `${model}/${filename}`);
      checked++;
    }
  }
  assert.ok(checked >= 175, 'the complete bundled reference collection must be checked');
});

test('Wide and Slim detection supports both pixel buffer types and ignores unrelated outer-layer transparency', () => {
  const wide = opaqueSkin();
  alphaRect(wide, 64, 40, 32, 16, 16, 0); // Right sleeve overlay only.
  alphaRect(wide, 64, 48, 48, 16, 16, 0); // Left sleeve overlay only.
  assert.equal(detectSkinModel(wide, 64), 'wide');
  assert.equal(detectSkinModel(new Uint8Array(opaqueSkin()), 64), 'wide');
  assert.equal(detectSkinModel(new Uint8Array(slimSkin()), 64), 'slim');
});

test('Slim padding tolerates stray paint and counts alpha rather than hidden RGB', () => {
  const skin = slimSkin();
  assert.equal(detectSkinModel(skin, 64), 'slim', 'white RGB beneath zero alpha remains transparent');
  alphaRect(skin, 64, 50, 16, 1, 1, 255);
  assert.equal(detectSkinModel(skin, 64), 'slim', 'one painted pixel must not change the model');
  alphaRect(skin, 64, 50, 16, 2, 4, 255);
  assert.equal(detectSkinModel(skin, 64), 'slim', 'eight painted padding pixels remain a Slim majority');
});

test('ties default to Wide and any nonzero alpha is visible', () => {
  for (const alpha of [1, 127, 254, 255]) {
    const skin = slimSkin();
    alphaRect(skin, 64, 50, 16, 2, 4, alpha);
    alphaRect(skin, 64, 54, 20, 2, 12, alpha);
    assert.equal(detectSkinModel(skin, 64), 'wide', `32/64 visible diagnostic pixels with alpha ${alpha}`);
    skin[(16 * 64 + 50) * 4 + 3] = 0;
    assert.equal(detectSkinModel(skin, 64), 'slim', '33/64 transparent diagnostic pixels form a majority');
  }
});

test('128 by 128 detection scales the regions and inspects every native pixel', () => {
  assert.equal(detectSkinModel(opaqueSkin(128), 128), 'wide');
  const skin = slimSkin(128);
  assert.equal(detectSkinModel(skin, 128), 'slim');
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    if (x % 2 || y % 2) skin[(y * 128 + x) * 4 + 3] = 255;
  }
  assert.equal(detectSkinModel(skin, 128), 'wide', 'sampling only the top-left of each HD block would incorrectly choose Slim');
});

test('legacy skins always select Wide and detection never rewrites the input pixels', () => {
  const legacy = new Uint8Array(64 * 32 * 4);
  assert.equal(detectSkinModel(legacy, 64, 32), 'wide');
  const skin = slimSkin();
  const before = skin.slice();
  assert.equal(detectSkinModel(skin, 64), 'slim');
  assert.deepEqual(skin, before);
});

test('detection rejects unsupported dimensions and malformed RGBA buffers before reading pixels', () => {
  for (const [width, height] of [[32, 32], [128, 64], [64, 0], [NaN, 64]]) {
    assert.throws(() => detectSkinModel(new Uint8Array(), width, height), /Use a/);
  }
  assert.throws(() => detectSkinModel(new Uint8Array(64 * 64 * 4 - 1), 64), /Invalid skin pixels/);
  assert.throws(() => detectSkinModel(new Uint8Array(128 * 128 * 4 + 1), 128), /Invalid skin pixels/);
  assert.throws(() => detectSkinModel(new Uint8Array(64 * 32 * 4 - 1), 64, 32), /Invalid skin pixels/);
});
