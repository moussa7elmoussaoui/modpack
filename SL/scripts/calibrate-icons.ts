/** Fit a small sample, then reject any candidate that makes any reference worse. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { bakeTemplate, type Calibration } from './template';
import { composeIcon } from '../src/lib/pixels';
import { fittingKeys, findRegressions, makeTemplates, measurePixels, measureReferences, readModels, readReferences, summarize, type Calibrations } from './icon-references';

const settings = new URL('./icon-calibration.json', import.meta.url);
const current: Calibrations = JSON.parse(await readFile(settings, 'utf8'));
const models = await readModels(), references = await readReferences();
const before = measureReferences(references, makeTemplates(models, current));
const candidate: Calibrations = structuredClone(current);
for (const model of ['wide', 'slim'] as const) {
  const fitting = references.filter(reference => reference.model === model && fittingKeys.has(reference.key));
  if (!fitting.length) throw new Error(`No ${model} fitting examples found.`);
  const evaluate = (calibration: Calibration) => {
    const template = bakeTemplate(models[model], calibration);
    return fitting.reduce((total, reference) => total + measurePixels(composeIcon(template, reference.skin.data, reference.skin.width), reference.expected.data).pixelError, 0);
  };
  let best = { ...current[model] }, bestError = evaluate(best);
  for (const step of [0.002, 0.0005, 0.0001]) {
    for (let pass = 0; pass < 4; pass++) {
      const previousError = bestError;
      for (const key of ['scale', 'phaseY', 'phaseX'] as const) {
        const anchor = { ...best }, delta = key === 'scale' ? step : step * 10;
        for (let offset = -10; offset <= 10; offset++) {
          const trial = { ...anchor, [key]: Number((anchor[key] + offset * delta).toFixed(8)) };
          const error = evaluate(trial);
          if (error < bestError) { best = trial; bestError = error; }
        }
      }
      if (bestError === previousError) break;
    }
    console.log(`${model}: step ${step}, fitting error ${bestError}`);
  }
  candidate[model] = best;
}
const after = measureReferences(references, makeTemplates(models, candidate));
const regressions = findRegressions(after, before);
const improved = summarize(after).totalPixelError < summarize(before).totalPixelError - 1e-6;
const accepted = improved && regressions.length === 0;
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/icon-calibration-trial.json', import.meta.url), `${JSON.stringify({
  accepted, current, candidate, before: summarize(before), after: summarize(after), regressions, measurements: after
}, null, 2)}\n`);
if (accepted) {
  await writeFile(settings, `${JSON.stringify(candidate, null, 2)}\n`);
  console.log('Improved every checked criterion without regressions; calibration saved. Run npm run check:icons to rebuild and compare.');
} else {
  console.log(`Calibration unchanged: ${regressions.length ? `${regressions.length} reference regressions rejected` : 'no further improvement found'}. See artifacts/icon-calibration-trial.json.`);
}
