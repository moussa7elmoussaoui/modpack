import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { centerPixels, composeIcon, normalizeLegacySkin, type IconTemplates, type IconTemplate } from '../src/lib/pixels';

test('canvas expansion rounds odd padding to the nearest even pixel on both axes', () => {
  for (const [size, padding] of [[125, 2], [123, 2], [121, 4]]) {
    const pixels = new Uint8ClampedArray(128 * 128 * 4);
    pixels.set([11, 22, 33, 255], 0);
    pixels.set([44, 55, 66, 255], ((size - 1) * 128 + size - 1) * 4);
    const centered = centerPixels(pixels, 128, 128);
    assert.deepEqual([...centered.subarray((padding * 128 + padding) * 4, (padding * 128 + padding) * 4 + 4)], [11, 22, 33, 255]);
    const end = ((padding + size - 1) * 128 + padding + size - 1) * 4;
    assert.deepEqual([...centered.subarray(end, end + 4)], [44, 55, 66, 255]);
  }
});

test('transparent outer layers reveal underlying skin pixels with fixed shading', () => {
  const template: IconTemplate = { width: 1, height: 1, offsets: [0, 6], samples: [1.1, 2.1, 0.5, 4.1, 5.1, 1] };
  const pixels = new Uint8ClampedArray(64 * 64 * 4);
  pixels.set([100, 80, 60, 255], (2 * 64 + 1) * 4);
  assert.deepEqual([...composeIcon(template, pixels, 64)], [50, 40, 30, 255]);
  pixels.set([200, 160, 120, 255], (5 * 64 + 4) * 4);
  assert.deepEqual([...composeIcon(template, pixels, 64)], [200, 160, 120, 255]);
  pixels.set([200, 160, 120, 128], (5 * 64 + 4) * 4);
  assert.deepEqual([...composeIcon(template, pixels, 64)], [125, 100, 75, 255]);
});

test('128 × 128 skins sample their own pixels without first reducing to 64 × 64', () => {
  const template: IconTemplate = { width: 1, height: 1, offsets: [0, 3], samples: [3.9, 6.9, 1] };
  const pixels = new Uint8ClampedArray(128 * 128 * 4);
  pixels.set([7, 29, 113, 255], (13 * 128 + 7) * 4);
  assert.deepEqual([...composeIcon(template, pixels, 128)], [7, 29, 113, 255]);
});

test('legacy skins preserve the source and mirror right limbs into modern left limbs', () => {
  const pixels = new Uint8ClampedArray(64 * 32 * 4);
  pixels.set([11, 22, 33, 255], (20 * 64 + 4) * 4);
  pixels.set([44, 55, 66, 255], (20 * 64 + 44) * 4);
  const converted = normalizeLegacySkin(pixels);
  assert.equal(converted.length, 64 * 64 * 4);
  assert.deepEqual(converted.subarray(0, pixels.length), pixels);
  assert.deepEqual([...converted.subarray((52 * 64 + 23) * 4, (52 * 64 + 23) * 4 + 4)], [11, 22, 33, 255]);
  assert.deepEqual([...converted.subarray((52 * 64 + 39) * 4, (52 * 64 + 39) * 4 + 4)], [44, 55, 66, 255]);
  assert.equal(converted[(40 * 64 + 40) * 4 + 3], 0, 'modern-only jacket area remains transparent');
});

test('fixed templates retain the existing wide/slim icon style across six reference skins', async () => {
  const templates: IconTemplates = JSON.parse(await readFile(new URL('../public/assets/icon-templates.json', import.meta.url), 'utf8'));
  for (const [model, names] of [['wide', ['steve', 'dark7mc', 'dream']], ['slim', ['alex', 's001', 'grian']]] as const) {
    assert.equal(templates[model].offsets.length, 128 * 128 + 1);
    for (const name of names) {
      const source = PNG.sync.read(await readFile(new URL(`../../RP/textures/entity/player/${model}/${name}.png`, import.meta.url)));
      const expected = PNG.sync.read(await readFile(new URL(`../../RP/textures/morph_icons/minecraft/player/${model}/${name}.png`, import.meta.url)));
      const actual = composeIcon(templates[model], source.data, source.width);
      let intersection = 0, union = 0, identical = 0;
      for (let pixel = 0; pixel < 128 * 128; pixel++) {
        const offset = pixel * 4, a = actual[offset + 3] > 0, b = expected.data[offset + 3] > 0;
        if (a || b) union++;
        if (a && b) intersection++;
        if (a && b && actual.subarray(offset, offset + 4).every((n, c) => n === expected.data[offset + c])) identical++;
      }
      assert.ok(intersection / union > 0.99, `${model}/${name}: silhouette should overlap the original by >99%`);
      assert.ok(identical / union > 0.98, `${model}/${name}: more than 98% of visible pixels should match the reference exactly`);
      for (let x = 0; x < 128; x++) {
        assert.equal(actual[x * 4 + 3], 0, 'top edge must not clip the model');
        assert.equal(actual[(127 * 128 + x) * 4 + 3], 0, 'bottom edge must not clip the model');
      }
    }
  }
});
