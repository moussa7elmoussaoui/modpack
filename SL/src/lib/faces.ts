import { validateSkinDimensions } from './validation';

export interface SkinFace {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

/** Front of the head, with its hat layer, at the skin's native pixel resolution. */
export function composeSkinFace(skin: Uint8Array | Uint8ClampedArray, width: number, height = width): SkinFace {
  validateSkinDimensions(width, height);
  if (skin.length !== width * height * 4) throw new Error('Invalid skin pixels.');
  const factor = width / 64, size = 8 * factor;
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const base = ((8 * factor + y) * width + 8 * factor + x) * 4;
    const overlay = ((8 * factor + y) * width + 40 * factor + x) * 4;
    const baseAlpha = skin[base + 3] / 255, overlayAlpha = skin[overlay + 3] / 255;
    const alpha = overlayAlpha + baseAlpha * (1 - overlayAlpha);
    const output = (y * size + x) * 4;
    if (alpha > 0) {
      for (let channel = 0; channel < 3; channel++) {
        pixels[output + channel] = (skin[overlay + channel] * overlayAlpha + skin[base + channel] * baseAlpha * (1 - overlayAlpha)) / alpha;
      }
      pixels[output + 3] = alpha * 255;
    }
  }
  return { width: size, height: size, pixels };
}

/** Expand a face by whole pixels; used for the site's PNG favicon and branding. */
export function enlargeSkinFace(face: SkinFace, size: number): SkinFace {
  if (!Number.isInteger(size) || size < face.width || size % face.width !== 0 || face.width !== face.height) {
    throw new Error('A face can only be enlarged by a whole-number scale.');
  }
  const factor = size / face.width, pixels = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const source = (Math.floor(y / factor) * face.width + Math.floor(x / factor)) * 4;
    pixels.set(face.pixels.subarray(source, source + 4), (y * size + x) * 4);
  }
  return { width: size, height: size, pixels };
}
