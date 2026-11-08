import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { decodeSkin } from '../src/lib/icons';

test('skin decoding detects real uploads, preserves textures, and honors later manual model choices', async t => {
  const templateBytes = await readFile(new URL('../public/assets/icon-templates.json', import.meta.url));
  const originalFetch = globalThis.fetch;
  const decoded: Awaited<ReturnType<typeof decodeSkin>>[] = [];
  globalThis.fetch = async (input, init) => {
    if (input === '/assets/icon-templates.json') {
      return new Response(new Uint8Array(templateBytes), { headers: { 'content-type': 'application/json' } });
    }
    return originalFetch(input, init);
  };
  async function decode(file: File, model?: 'wide' | 'slim') {
    const result = await decodeSkin(file, model);
    decoded.push(result);
    return result;
  }
  try {
    for (const [model, name] of [['wide', 'dark7mc'], ['slim', 's114'], ['slim', 's145']] as const) {
      await t.test(`${model}/${name}: auto selection matches an explicit model and keeps the original PNG bytes`, async () => {
        const source = await readFile(new URL(`../../RP/textures/entity/player/${model}/${name}.png`, import.meta.url));
        // A neutral filename ensures that only the uploaded pixels identify the model.
        const file = new File([new Uint8Array(source)], 'uploaded.png', { type: 'image/png' });
        const automatic = await decode(file);
        const explicit = await decode(file, model);
        assert.equal(automatic.model, model);
        assert.equal(explicit.model, model);
        assert.deepEqual(automatic.texturePng, new Uint8Array(source));
        assert.deepEqual(explicit.texturePng, new Uint8Array(source));
        const icon = PNG.sync.read(Buffer.from(automatic.iconPng));
        assert.equal(icon.width, 128);
        assert.equal(icon.height, 128);
        assert.deepEqual(icon.data, PNG.sync.read(Buffer.from(explicit.iconPng)).data);
        assert.ok(icon.data.some((channel, index) => index % 4 === 3 && channel > 0), 'the generated icon must contain visible pixels');
        assert.deepEqual(new Uint8Array(await (await originalFetch(automatic.iconUrl)).arrayBuffer()), automatic.iconPng, 'the preview/download URL must expose the generated PNG');

        const overrideModel = model === 'wide' ? 'slim' : 'wide';
        const overridden = await decode(file, overrideModel);
        assert.equal(overridden.model, overrideModel, 'an explicit choice must override pixel detection');
        assert.deepEqual(overridden.texturePng, new Uint8Array(source), 'changing geometry must preserve the texture');
        assert.notDeepEqual(PNG.sync.read(Buffer.from(overridden.iconPng)).data, icon.data, 'changing arm geometry must regenerate the icon');
      });
    }

    await t.test('a legacy PNG selects Wide, normalizes its texture, and still rejects an explicit Slim choice', async () => {
      const source = PNG.sync.read(await readFile(new URL('../../RP/textures/entity/player/wide/dark7mc.png', import.meta.url)));
      const legacy = new PNG({ width: 64, height: 32 });
      legacy.data = source.data.subarray(0, 64 * 32 * 4);
      const file = new File([new Uint8Array(PNG.sync.write(legacy))], 'uploaded.png', { type: 'image/png' });
      const automatic = await decode(file);
      const explicit = await decode(file, 'wide');
      assert.equal(automatic.model, 'wide');
      assert.equal(automatic.width, 64);
      assert.equal(automatic.height, 32);
      const texture = PNG.sync.read(Buffer.from(automatic.texturePng));
      assert.equal(texture.width, 64);
      assert.equal(texture.height, 64);
      assert.deepEqual(texture.data.subarray(0, legacy.data.length), legacy.data, 'conversion must preserve the original upper half');
      assert.ok(texture.data.subarray(legacy.data.length).some((channel, index) => index % 4 === 3 && channel > 0), 'conversion must create the missing modern limb pixels');
      const icon = PNG.sync.read(Buffer.from(automatic.iconPng));
      assert.equal(icon.width, 128);
      assert.equal(icon.height, 128);
      assert.deepEqual(icon.data, PNG.sync.read(Buffer.from(explicit.iconPng)).data);
      await assert.rejects(() => decodeSkin(file, 'slim'), /Legacy.*wide model/);
    });
  } finally {
    globalThis.fetch = originalFetch;
    for (const result of decoded) URL.revokeObjectURL(result.iconUrl);
  }
});
