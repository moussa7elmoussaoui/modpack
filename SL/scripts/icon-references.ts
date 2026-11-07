/** Development-only measurements against the original, unmodified addon icons. */
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { composeIcon, type IconTemplates } from '../src/lib/pixels';
import type { Calibration, Geometry } from './template';
import { bakeTemplate } from './template';

export type Model = 'wide' | 'slim';
export type Calibrations = Record<Model, Calibration>;
export interface Reference {
  key: string;
  model: Model;
  skin: PNG;
  expected: PNG;
  fingerprint: string;
}
export interface Metrics {
  silhouetteOverlap: number;
  exactVisiblePixelFraction: number;
  /** Premultiplied RGB absolute error plus three equally weighted alpha channels. */
  pixelError: number;
}
export interface Measurement extends Metrics { key: string; fingerprint: string }

export const fittingKeys = new Set([
  'wide/steve', 'wide/dark7mc', 'wide/dream', 'wide/chandler', 'wide/stampy',
  'slim/alex', 'slim/s001', 'slim/grian', 'slim/s047', 'slim/s129'
]);

export async function readReferences(): Promise<Reference[]> {
  const references: Reference[] = [];
  for (const model of ['wide', 'slim'] as const) {
    const directory = new URL(`../../RP/textures/entity/player/${model}/`, import.meta.url);
    for (const name of (await readdir(directory)).filter(name => name.endsWith('.png')).sort()) {
      const source = await readFile(new URL(name, directory));
      const expected = await readFile(new URL(`../../RP/textures/morph_icons/minecraft/player/${model}/${name}`, import.meta.url));
      const skin = PNG.sync.read(source), icon = PNG.sync.read(expected);
      if (icon.width !== 128 || icon.height !== 128) throw new Error(`Reference ${model}/${name} must be 128 × 128.`);
      references.push({ key: `${model}/${name.slice(0, -4)}`, model, skin, expected: icon,
        fingerprint: createHash('sha256').update(source).update(expected).digest('hex') });
    }
  }
  if (!references.length) throw new Error('No reference icons found.');
  return references;
}

export async function readModels(): Promise<Record<Model, Geometry>> {
  const data = JSON.parse(await readFile(new URL('../../RP/models/entity/player.morph.geo.json', import.meta.url), 'utf8'));
  const geometries = data['minecraft:geometry'] as (Geometry & { description: { identifier: string } })[];
  const wide = geometries.find(model => model.description.identifier === 'geometry.morph.player');
  const slim = geometries.find(model => model.description.identifier === 'geometry.morph.player.slim');
  if (!wide || !slim) throw new Error('The wide and slim morph player geometries are required.');
  return { wide, slim };
}

export function makeTemplates(models: Record<Model, Geometry>, calibrations: Calibrations): IconTemplates {
  return { version: 1, wide: bakeTemplate(models.wide, calibrations.wide), slim: bakeTemplate(models.slim, calibrations.slim) };
}

export function measurePixels(actual: Uint8Array | Uint8ClampedArray, expected: Uint8Array): Metrics {
  if (actual.length !== expected.length) throw new Error('Icon dimensions differ.');
  let union = 0, intersection = 0, exact = 0, pixelError = 0;
  for (let offset = 0; offset < actual.length; offset += 4) {
    const alpha = actual[offset + 3], expectedAlpha = expected[offset + 3];
    if (alpha || expectedAlpha) {
      union++;
      if (alpha && expectedAlpha) intersection++;
      if (alpha === expectedAlpha && actual[offset] === expected[offset] && actual[offset + 1] === expected[offset + 1] && actual[offset + 2] === expected[offset + 2]) exact++;
    }
    pixelError += Math.abs(alpha - expectedAlpha) * 3;
    for (let channel = 0; channel < 3; channel++) {
      pixelError += Math.abs(actual[offset + channel] * alpha / 255 - expected[offset + channel] * expectedAlpha / 255);
    }
  }
  return { silhouetteOverlap: union ? intersection / union : 1,
    exactVisiblePixelFraction: union ? exact / union : 1, pixelError };
}

export function measureReferences(references: Reference[], templates: IconTemplates): Measurement[] {
  return references.map(reference => ({ key: reference.key, fingerprint: reference.fingerprint,
    ...measurePixels(composeIcon(templates[reference.model], reference.skin.data, reference.skin.width), reference.expected.data) }));
}

export function summarize(measurements: Measurement[]) {
  return { count: measurements.length,
    meanExactVisiblePixelFraction: measurements.reduce((sum, row) => sum + row.exactVisiblePixelFraction, 0) / measurements.length,
    meanSilhouetteOverlap: measurements.reduce((sum, row) => sum + row.silhouetteOverlap, 0) / measurements.length,
    totalPixelError: measurements.reduce((sum, row) => sum + row.pixelError, 0) };
}

/** Require pixel agreement, silhouette overlap and color/alpha error to stay as good for every icon. */
export function findRegressions(actual: Measurement[], baseline: Measurement[]): string[] {
  const current = new Map(actual.map(row => [row.key, row]));
  return baseline.flatMap(old => {
    const row = current.get(old.key);
    if (!row) return [`${old.key}: reference is missing`];
    if (row.fingerprint !== old.fingerprint) return [`${old.key}: source skin or reference icon changed; review and refresh the benchmark`];
    const reasons: string[] = [];
    if (row.pixelError > old.pixelError + 1e-6) reasons.push('color/alpha error increased');
    if (row.exactVisiblePixelFraction + 1e-12 < old.exactVisiblePixelFraction) reasons.push('fewer visible pixels match');
    if (row.silhouetteOverlap + 1e-12 < old.silhouetteOverlap) reasons.push('silhouette overlap decreased');
    return reasons.length ? [`${old.key}: ${reasons.join(', ')}`] : [];
  });
}
