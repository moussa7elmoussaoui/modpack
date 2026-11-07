/** Fixed-view pixel composition. Geometry, projection and animation are absent at runtime. */
export interface IconTemplate {
  width: number;
  height: number;
  /** One span per output pixel into samples (three floats per surface). */
  offsets: number[];
  /** Back-to-front [u, v, lighting], UVs expressed in the 64-unit skin layout. */
  samples: number[];
}

export interface IconTemplates {
  version: 1;
  wide: IconTemplate;
  slim: IconTemplate;
}

export function composeIcon(template: IconTemplate, skin: Uint8Array | Uint8ClampedArray, size: number): Uint8ClampedArray {
  if ((size !== 64 && size !== 128) || skin.length !== size * size * 4) {
    throw new Error('The icon composer needs a 64 × 64 or 128 × 128 RGBA skin.');
  }
  const output = new Uint8ClampedArray(template.width * template.height * 4);
  const factor = size / 64;
  for (let pixel = 0; pixel < template.width * template.height; pixel++) {
    let alpha = 0, red = 0, green = 0, blue = 0;
    for (let sample = template.offsets[pixel]; sample < template.offsets[pixel + 1]; sample += 3) {
      const x = Math.min(size - 1, Math.max(0, Math.floor(template.samples[sample] * factor)));
      const y = Math.min(size - 1, Math.max(0, Math.floor(template.samples[sample + 1] * factor)));
      const source = (y * size + x) * 4;
      const sourceAlpha = skin[source + 3] / 255;
      if (sourceAlpha < 0.01) continue;
      const shade = template.samples[sample + 2];
      red = skin[source] * shade * sourceAlpha + red * (1 - sourceAlpha);
      green = skin[source + 1] * shade * sourceAlpha + green * (1 - sourceAlpha);
      blue = skin[source + 2] * shade * sourceAlpha + blue * (1 - sourceAlpha);
      alpha = sourceAlpha + alpha * (1 - sourceAlpha);
    }
    if (alpha > 0) {
      const target = pixel * 4;
      output[target] = red / alpha;
      output[target + 1] = green / alpha;
      output[target + 2] = blue / alpha;
      output[target + 3] = alpha * 255;
    }
  }
  return centerPixels(output, template.width, template.height);
}

/** Round half-pixel padding to the nearest even integer, as in the reference canvas expansion. */
function roundPadding(value: number): number {
  const lower = Math.floor(value);
  return value === lower + 0.5 ? lower + lower % 2 : Math.round(value);
}

/** Integer copy only: center the nontransparent content without scaling or filtering. */
export function centerPixels(pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (pixels[(y * width + x) * 4 + 3]) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return pixels;
  const offsetX = roundPadding((width - (right - left + 1)) / 2) - left;
  const offsetY = roundPadding((height - (bottom - top + 1)) / 2) - top;
  const result = new Uint8ClampedArray(pixels.length);
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const source = (y * width + x) * 4;
    const target = ((y + offsetY) * width + x + offsetX) * 4;
    result.set(pixels.subarray(source, source + 4), target);
  }
  return result;
}

/** Mirror a legacy right limb into the unused left-limb area of a modern skin. */
export function normalizeLegacySkin(input: Uint8Array | Uint8ClampedArray): Uint8ClampedArray {
  if (input.length !== 64 * 32 * 4) throw new Error('Invalid legacy skin pixels.');
  const output = new Uint8ClampedArray(64 * 64 * 4);
  output.set(input);
  const copy = (sx: number, sy: number, width: number, height: number, dx: number, dy: number) => {
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const source = ((sy + y) * 64 + sx + width - 1 - x) * 4;
      output.set(input.subarray(source, source + 4), ((dy + y) * 64 + dx + x) * 4);
    }
  };
  for (const [sourceX, targetX] of [[0, 16], [40, 32]]) {
    copy(sourceX + 4, 16, 4, 4, targetX + 4, 48);
    copy(sourceX + 8, 16, 4, 4, targetX + 8, 48);
    copy(sourceX + 8, 20, 4, 12, targetX, 52);
    copy(sourceX + 4, 20, 4, 12, targetX + 4, 52);
    copy(sourceX, 20, 4, 12, targetX + 8, 52);
    copy(sourceX + 12, 20, 4, 12, targetX + 12, 52);
  }
  return output;
}
