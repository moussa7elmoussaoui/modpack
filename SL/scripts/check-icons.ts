import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { composeIcon, type IconTemplates } from '../src/lib/pixels';
import { findRegressions, fittingKeys, measureReferences, readReferences, summarize, type Measurement } from './icon-references';

const references = await readReferences();
const templates: IconTemplates = JSON.parse(await readFile(new URL('../public/assets/icon-templates.json', import.meta.url), 'utf8'));
const baseline: { original: Measurement[]; improved: Measurement[] } = JSON.parse(await readFile(new URL('../tests/fixtures/icon-accuracy.json', import.meta.url), 'utf8'));
const measurements = measureReferences(references, templates);
const regressions = findRegressions(measurements, baseline.improved);
const summary = {
  original: summarize(baseline.original), current: summarize(measurements),
  fittingExamples: summarize(measurements.filter(row => fittingKeys.has(row.key))),
  remainingReferences: summarize(measurements.filter(row => !fittingKeys.has(row.key))), regressions
};
const selected = ['wide/technoblade', 'wide/ramboo', 'wide/chandler', 'slim/s047', 'slim/s079', 'slim/alex'];
// Columns follow selected; rows are original, generated, and an opaque difference map.
const sheet = new PNG({ width: selected.length * 256, height: 768 });
for (const [column, key] of selected.entries()) {
  const reference = references.find(row => row.key === key);
  if (!reference) continue;
  const actual = composeIcon(templates[reference.model], reference.skin.data, reference.skin.width);
  for (let y = 0; y < 384; y++) for (let x = 0; x < 128; x++) {
    const source = ((y % 128) * 128 + x) * 4, row = Math.floor(y / 128);
    const expected = reference.expected.data;
    let rgba: ArrayLike<number> = row === 0 ? expected.subarray(source, source + 4) : actual.subarray(source, source + 4);
    if (row === 2) {
      const changed = [0, 1, 2, 3].some(channel => expected[source + channel] !== actual[source + channel]);
      rgba = changed && (expected[source + 3] || actual[source + 3]) ? [255, 64, 128, 255] : [24, 28, 32, 255];
    }
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
      const target = ((y * 2 + dy) * sheet.width + column * 256 + x * 2 + dx) * 4;
      for (let channel = 0; channel < 4; channel++) sheet.data[target + channel] = rgba[channel];
    }
  }
}
const artifacts = new URL('../artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });
await writeFile(new URL('icon-accuracy.json', artifacts), `${JSON.stringify({ summary, comparisonColumns: selected, measurements }, null, 2)}\n`);
await writeFile(new URL('icon-accuracy.png', artifacts), PNG.sync.write(sheet));
console.log(JSON.stringify(summary, null, 2));
if (regressions.length) process.exitCode = 1;
