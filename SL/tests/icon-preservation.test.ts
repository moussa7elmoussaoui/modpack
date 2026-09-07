import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PNG } from 'pngjs';
import { decodeSkin, decodeSkinFace } from '../src/lib/icons';
import { iconCases } from './helpers/icon-cases';

interface Baseline {
  cases: Record<string, { model: string; width: number; height: number; texture: string; icon: string; face: string }>;
}

test('every bundled, HD, and legacy skin retains its original icon pixels, face pixels, texture bytes, and detected model', async () => {
  const baseline: Baseline = JSON.parse(await readFile(new URL('./fixtures/icon-output-baseline.json', import.meta.url), 'utf8'));
  const templates = new Uint8Array(await readFile(new URL('../public/assets/icon-templates.json', import.meta.url)));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    assert.equal(input, '/assets/icon-templates.json');
    return new Response(templates, { headers: { 'content-type': 'application/json' } });
  };
  const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
  try {
    const cases = await iconCases();
    assert.equal(cases.filter(entry => !entry.id.startsWith('derived/')).length, 175);
    assert.deepEqual(cases.map(entry => entry.id).sort(), Object.keys(baseline.cases).sort());
    for (const entry of cases) {
      const [icon, faceUrl] = await Promise.all([decodeSkin(entry.file), decodeSkinFace(entry.file)]);
      try {
        const facePng = new Uint8Array(await (await originalFetch(faceUrl)).arrayBuffer());
        assert.equal(icon.model, entry.model, entry.id);
        assert.deepEqual({
          model: icon.model, width: icon.width, height: icon.height,
          texture: hash(icon.texturePng), icon: hash(PNG.sync.read(Buffer.from(icon.iconPng)).data),
          face: hash(PNG.sync.read(Buffer.from(facePng)).data),
        }, baseline.cases[entry.id], `${entry.id}: output must match the captured pre-fix baseline`);
      } finally { URL.revokeObjectURL(icon.iconUrl); URL.revokeObjectURL(faceUrl); }
    }
  } finally { globalThis.fetch = originalFetch; }
});
