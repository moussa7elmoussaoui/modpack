import { validateSkinDimensions } from './validation';

// Base-arm texels used by Wide but left unused by the standard Slim UV layout.
// Coordinates are expressed in the 64-unit skin layout, before HD scaling.
const SLIM_PADDING = [
  [50, 16, 2, 4],
  [54, 20, 2, 12],
  [42, 48, 2, 4],
  [46, 52, 2, 12],
] as const;

/**
 * Estimate the arm model from transparent base-arm padding. A PNG does not
 * authoritatively identify its intended geometry: painted Slim padding or
 * transparent Wide arms can make either choice ambiguous. Keep manual choice
 * available. A transparent majority tolerates stray paint in otherwise Slim
 * padding; ties and fully painted padding use Wide. RGB values under zero
 * alpha do not affect the result, and partially transparent pixels are visible.
 */
export function detectSkinModel(pixels: Uint8Array | Uint8ClampedArray, width: number, height = width): 'wide' | 'slim' {
  validateSkinDimensions(width, height);
  if (pixels.length !== width * height * 4) throw new Error('Invalid skin pixels.');
  if (height === 32) return 'wide';

  const scale = width / 64;
  let transparent = 0, samples = 0;
  for (const [left, top, rectWidth, rectHeight] of SLIM_PADDING) {
    for (let y = top * scale; y < (top + rectHeight) * scale; y++) {
      for (let x = left * scale; x < (left + rectWidth) * scale; x++) {
        samples++;
        if (pixels[(y * width + x) * 4 + 3] === 0) transparent++;
      }
    }
  }
  return transparent > samples / 2 ? 'slim' : 'wide';
}
