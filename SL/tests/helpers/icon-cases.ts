import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PNG } from 'pngjs';
import type { SkinModel } from '../../src/lib/addon';

export interface IconCase {
  id: string;
  file: File;
  model: SkinModel;
}

/** Actual bundled skins plus deterministic HD and legacy versions of known skins. */
export async function iconCases(): Promise<IconCase[]> {
  const cases: IconCase[] = [];
  for (const model of ['wide', 'slim'] as const) {
    const directory = new URL(`../../../RP/textures/entity/player/${model}/`, import.meta.url);
    for (const name of (await readdir(directory)).filter(name => name.endsWith('.png')).sort()) {
      const source = new Uint8Array(await readFile(new URL(name, directory)));
      cases.push({ id: `${model}/${name}`, file: new File([source], 'uploaded.png', { type: 'image/png' }), model });
    }
  }
  for (const [model, name] of [['wide', 'dark7mc'], ['slim', 's114']] as const) {
    const original = cases.find(entry => entry.id === `${model}/${name}.png`)!;
    assert.ok(original);
    const source = PNG.sync.read(Buffer.from(await original.file.arrayBuffer()));
    assert.equal(source.width, 64); assert.equal(source.height, 64);
    const hd = new PNG({ width: 128, height: 128 });
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const offset = (Math.floor(y / 2) * 64 + Math.floor(x / 2)) * 4;
      hd.data.set(source.data.subarray(offset, offset + 4), (y * 128 + x) * 4);
    }
    cases.push({ id: `derived/hd-${model}`, file: new File([new Uint8Array(PNG.sync.write(hd))], 'uploaded.png', { type: 'image/png' }), model });
    if (model === 'wide') {
      const legacy = new PNG({ width: 64, height: 32 });
      legacy.data = source.data.subarray(0, 64 * 32 * 4);
      cases.push({ id: 'derived/legacy-wide', file: new File([new Uint8Array(PNG.sync.write(legacy))], 'uploaded.png', { type: 'image/png' }), model });
    }
  }
  return cases;
}
