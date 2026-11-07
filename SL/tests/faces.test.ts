import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { composeSkinFace, enlargeSkinFace } from '../src/lib/faces';
import { decodeSkinFace } from '../src/lib/icons';
import { encodePngRgba } from '../src/lib/png';

test('face thumbnails use the front face UVs and composite the hat without reversing pixels', () => {
  const skin = new Uint8ClampedArray(64 * 64 * 4);
  skin.set([20, 40, 60, 255], (8 * 64 + 8) * 4);
  skin.set([200, 100, 0, 128], (8 * 64 + 40) * 4);
  skin.set([50, 70, 90, 128], (8 * 64 + 41) * 4);
  skin.set([11, 22, 33, 255], (15 * 64 + 15) * 4);
  const face = composeSkinFace(skin, 64);
  assert.equal(face.width, 8);
  assert.equal(face.height, 8);
  assert.deepEqual([...face.pixels.subarray(0, 4)], [110, 70, 30, 255]);
  assert.deepEqual([...face.pixels.subarray(4, 8)], [50, 70, 90, 128]);
  assert.deepEqual([...face.pixels.subarray(-4)], [11, 22, 33, 255]);
  assert.deepEqual([...face.pixels.subarray(8, 12)], [0, 0, 0, 0]);
});

test('high-resolution and legacy skins retain their native face detail', () => {
  const hd = new Uint8ClampedArray(128 * 128 * 4);
  hd.set([12, 34, 56, 255], (16 * 128 + 16) * 4);
  hd.set([65, 43, 21, 255], (16 * 128 + 17) * 4);
  hd.set([101, 102, 103, 255], (31 * 128 + 95) * 4);
  const face = composeSkinFace(hd, 128);
  assert.equal(face.width, 16);
  assert.deepEqual([...face.pixels.subarray(0, 8)], [12, 34, 56, 255, 65, 43, 21, 255]);
  assert.deepEqual([...face.pixels.subarray(-4)], [101, 102, 103, 255]);
  const legacy = new Uint8ClampedArray(64 * 32 * 4);
  legacy.set([31, 45, 76, 255], (8 * 64 + 8) * 4);
  assert.deepEqual([...composeSkinFace(legacy, 64, 32).pixels.subarray(0, 4)], [31, 45, 76, 255]);
  assert.throws(() => composeSkinFace(legacy, 64), /Invalid skin pixels/);
});

test('face enlargement uses whole pixels and the prepared branding matches DARK7MC', async () => {
  const source = PNG.sync.read(await readFile(new URL('../../RP/textures/entity/player/wide/dark7mc.png', import.meta.url)));
  const native = composeSkinFace(source.data, source.width, source.height);
  const face = enlargeSkinFace(native, 128);
  const prepared = PNG.sync.read(await readFile(new URL('../public/assets/brand-face.png', import.meta.url)));
  assert.equal(prepared.width, 128);
  assert.equal(prepared.height, 128);
  assert.deepEqual(new Uint8ClampedArray(prepared.data), face.pixels);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const input = (Math.floor(y / 16) * 8 + Math.floor(x / 16)) * 4;
    const output = (y * 128 + x) * 4;
    assert.deepEqual(face.pixels.subarray(output, output + 4), native.pixels.subarray(input, input + 4));
  }
  assert.throws(() => enlargeSkinFace(native, 12), /whole-number scale/);
});

test('thumbnail decoding works before model selection and without loading isometric templates', async () => {
  const pixels = new Uint8ClampedArray(64 * 64 * 4);
  pixels.set([23, 45, 67, 255], (8 * 64 + 8) * 4);
  const file = new File([new Uint8Array(encodePngRgba(64, 64, pixels))], 'skin.png', { type: 'image/png' });
  const url = await decodeSkinFace(file);
  try {
    const decoded = PNG.sync.read(Buffer.from(await (await fetch(url)).arrayBuffer()));
    assert.equal(decoded.width, 8);
    assert.equal(decoded.height, 8);
    assert.deepEqual([...decoded.data.subarray(0, 4)], [23, 45, 67, 255]);
  } finally { URL.revokeObjectURL(url); }
});
