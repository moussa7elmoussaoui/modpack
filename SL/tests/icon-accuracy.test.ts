import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { composeIcon, type IconTemplates } from '../src/lib/pixels';
import { decodePngRgba, encodePngRgba } from '../src/lib/png';
import { findRegressions, measureReferences, readReferences, type Measurement } from '../scripts/icon-references';

test('corrected icons retain their bundled consistency baseline and match every bundled PNG', async () => {
  const baseline: { bundled: Measurement[] } = JSON.parse(await readFile(new URL('./fixtures/icon-accuracy.json', import.meta.url), 'utf8'));
  const references = await readReferences();
  const templates: IconTemplates = JSON.parse(await readFile(new URL('../public/assets/icon-templates.json', import.meta.url), 'utf8'));
  const actual = measureReferences(references, templates);
  assert.ok(actual.length >= 175, 'the complete reference collection must be checked');
  assert.deepEqual(findRegressions(actual, baseline.bundled), [], 'generated icons must stay consistent with the bundled PNGs');
  for (const reference of references) {
    const skinBytes = await readFile(new URL(`../../RP/textures/entity/player/${reference.key}.png`, import.meta.url));
    const skin = decodePngRgba(skinBytes);
    const composed = composeIcon(templates[reference.model], skin.pixels, skin.width);
    const bundled = PNG.sync.read(await readFile(new URL(`../../RP/textures/morph_icons/minecraft/player/${reference.key}.png`, import.meta.url)));
    assert.equal(bundled.width, 128, `${reference.key}: bundled icon width`);
    assert.equal(bundled.height, 128, `${reference.key}: bundled icon height`);
    assert.deepEqual(new Uint8ClampedArray(bundled.data), composed, `${reference.key}: bundled icons must use the corrected model`);
    const encoded = encodePngRgba(128, 128, composed);
    const exported = PNG.sync.read(Buffer.from(encoded));
    assert.deepEqual(new Uint8ClampedArray(exported.data), composed, `${reference.key}: exporting must preserve all RGBA pixels`);
    for (let pixel = 0; pixel < 128; pixel++) {
      for (const offset of [pixel, 127 * 128 + pixel, pixel * 128, pixel * 128 + 127]) {
        assert.equal(composed[offset * 4 + 3], 0, `${reference.key}: the model must not clip the canvas edge`);
      }
    }
  }
});

test('calibration guard rejects a loss on any reference, even if the overall average improves', () => {
  const row: Measurement = { key: 'wide/example', fingerprint: 'same', pixelError: 100, exactVisiblePixelFraction: 0.99, silhouetteOverlap: 0.999 };
  assert.equal(findRegressions([{ ...row, pixelError: 101 }], [row]).length, 1);
  assert.equal(findRegressions([{ ...row, pixelError: 90, exactVisiblePixelFraction: 0.98 }], [row]).length, 1);
  assert.equal(findRegressions([{ ...row, pixelError: 90, silhouetteOverlap: 0.998 }], [row]).length, 1);
  assert.equal(findRegressions([{ ...row, fingerprint: 'changed' }], [row]).length, 1);
  assert.deepEqual(findRegressions([{ ...row, pixelError: 90, exactVisiblePixelFraction: 0.995 }], [row]), []);
});
