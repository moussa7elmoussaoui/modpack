import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { decodeSkin, decodeSkinFace } from '../src/lib/icons';
import { composeIcon, type IconTemplates } from '../src/lib/pixels';

async function withPreparedTemplates(run: (
  decode: (file: File) => ReturnType<typeof decodeSkin>, templates: IconTemplates
) => Promise<void>) {
  const templateBytes = await readFile(new URL('../public/assets/icon-templates.json', import.meta.url));
  const templates: IconTemplates = JSON.parse(templateBytes.toString('utf8'));
  const originalFetch = globalThis.fetch;
  const decoded: Awaited<ReturnType<typeof decodeSkin>>[] = [];
  globalThis.fetch = async (input, init) => {
    if (input === '/assets/icon-templates.json') {
      return new Response(new Uint8Array(templateBytes), { headers: { 'content-type': 'application/json' } });
    }
    return originalFetch(input, init);
  };
  try {
    await run(async file => {
      const result = await decodeSkin(file);
      decoded.push(result);
      return result;
    }, templates);
  } finally {
    globalThis.fetch = originalFetch;
    for (const result of decoded) URL.revokeObjectURL(result.iconUrl);
  }
}

function pngFile(width: number, height: number, transparent = false): File {
  const image = new PNG({ width, height });
  for (let index = 0; index < image.data.length; index += 4) {
    image.data.set([(index * 31) % 251, (index * 17) % 239, (index * 7) % 227, transparent ? 0 : 255], index);
  }
  return new File([new Uint8Array(PNG.sync.write(image))], 'uploaded.png', { type: 'image/png' });
}

test('automatic decoding selects the reference geometry and preserves uploaded texture and icon pixels', async t => {
  await withPreparedTemplates(async (decode, templates) => {
    for (const [model, name] of [['wide', 'dark7mc'], ['slim', 's114'], ['slim', 's145']] as const) {
      await t.test(model + '/' + name + ': neutral upload filename does not affect automatic selection', async () => {
        const source = await readFile(new URL('../../RP/textures/entity/player/' + model + '/' + name + '.png', import.meta.url));
        const file = new File([new Uint8Array(source)], 'uploaded.png', { type: 'image/png' });
        const automatic = await decode(file);
        assert.equal(automatic.model, model);
        assert.deepEqual(automatic.texturePng, new Uint8Array(source));
        const input = PNG.sync.read(source);
        const icon = PNG.sync.read(Buffer.from(automatic.iconPng));
        assert.equal(icon.width, 128);
        assert.equal(icon.height, 128);
        assert.deepEqual(new Uint8ClampedArray(icon.data), composeIcon(templates[model], input.data, input.width), 'automatic selection must use the correct reference geometry');
        assert.ok(icon.data.some((channel, index) => index % 4 === 3 && channel > 0));
        assert.deepEqual(new Uint8Array(await (await fetch(automatic.iconUrl)).arrayBuffer()), automatic.iconPng, 'the preview/download URL exposes the exact generated PNG');
      });
    }

    await t.test('a legacy PNG automatically selects Wide and fills the missing modern limbs', async () => {
      const source = PNG.sync.read(await readFile(new URL('../../RP/textures/entity/player/wide/dark7mc.png', import.meta.url)));
      const legacy = new PNG({ width: 64, height: 32 });
      legacy.data = source.data.subarray(0, 64 * 32 * 4);
      const file = new File([new Uint8Array(PNG.sync.write(legacy))], 'uploaded.png', { type: 'image/png' });
      const automatic = await decode(file);
      assert.equal(automatic.model, 'wide');
      assert.equal(automatic.width, 64);
      assert.equal(automatic.height, 32);
      const texture = PNG.sync.read(Buffer.from(automatic.texturePng));
      assert.equal(texture.width, 64);
      assert.equal(texture.height, 64);
      assert.deepEqual(texture.data.subarray(0, legacy.data.length), legacy.data, 'normalizing legacy skins preserves the original upper half');
      assert.ok(texture.data.subarray(legacy.data.length).some((channel, index) => index % 4 === 3 && channel > 0), 'normalization creates missing modern limb pixels');
      const icon = PNG.sync.read(Buffer.from(automatic.iconPng));
      assert.deepEqual(new Uint8ClampedArray(icon.data), composeIcon(templates.wide, texture.data, 64));
    });
  });
});

test('upload validation checks the skin file format without claiming to recognize the artwork', async () => {
  await withPreparedTemplates(async decode => {
    const arbitrary = pngFile(64, 64);
    const result = await decode(arbitrary);
    assert.equal(result.model, 'wide');
    assert.deepEqual(result.texturePng, new Uint8Array(await arbitrary.arrayBuffer()), 'a correctly sized arbitrary picture remains a technically usable texture');
    await assert.rejects(() => decode(pngFile(32, 32)), /Use a/);
    await assert.rejects(() => decode(pngFile(64, 64, true)), /completely transparent/);
    await assert.rejects(() => decode(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png')), /smaller than 2 MB/);
    await assert.rejects(() => decode(new File(['This is not PNG data.'], 'renamed.png')), /valid PNG/);
    const broken = new Uint8Array(await arbitrary.arrayBuffer());
    broken[29] ^= 1;
    await assert.rejects(() => decode(new File([broken], 'broken.png')), /CRC/i);
  });
});

test('packed Adam7 uploads cannot bypass PNG integrity checks through the browser fallback', async () => {
  const packed = new Uint8Array(await pngFile(64, 64).arrayBuffer());
  packed[24] = 1;
  packed[25] = 0;
  packed[28] = 1;
  // Changing IHDR without recomputing its CRC creates a malformed packed Adam7
  // input. Both entry points must reject it before attempting browser image APIs.
  const file = new File([packed], 'packed.png', { type: 'image/png' });
  await assert.rejects(() => decodeSkin(file), /CRC/i);
  await assert.rejects(() => decodeSkinFace(file), /CRC/i);
});
