import { convertIndexedToRgb, decode, encode } from 'fast-png';
import { readPngDimensions } from './validation';

export interface RgbaPng {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

/** fast-png 8 cannot unpack Adam7 scanlines whose samples are less than one byte. */
export function needsBrowserPngDecoder(bytes: Uint8Array): boolean {
  return bytes[24] < 8 && bytes[28] === 1;
}

/** Decode sample values directly, without color management or alpha premultiplication. */
export function decodePngRgba(bytes: Uint8Array): RgbaPng {
  const { width, height } = readPngDimensions(bytes);
  // Check before the codec allocates image buffers, including callers outside the UI.
  if (width > 128 || height > 128) throw new Error('PNG dimensions must not exceed 128 × 128.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let ended = false;
  for (let offset = 8; offset < bytes.length;) {
    if (offset + 12 > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const length = view.getUint32(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const type = view.getUint32(offset + 4);
    if (type === 0x49484452 && offset !== 8) throw new Error('The PNG contains multiple headers.');
    if (type === 0x49454e44) {
      if (length !== 0) throw new Error('The PNG contains an invalid end chunk.');
      ended = true; break;
    }
    offset = end;
  }
  if (!ended) throw new Error('The PNG is incomplete.');
  if (needsBrowserPngDecoder(bytes)) throw new Error('This packed interlaced PNG needs the browser decoder.');
  const decoded = decode(bytes, { checkCrc: true });
  if (decoded.width !== width || decoded.height !== height) throw new Error('The PNG contains inconsistent dimensions.');
  const pixels = new Uint8ClampedArray(width * height * 4);
  const indexed = bytes[25] === 3;
  const data = indexed ? convertIndexedToRgb(decoded) : decoded.data;
  const channels = indexed ? decoded.palette![0].length : decoded.channels;
  const depth = indexed ? 8 : decoded.depth;
  const max = (2 ** depth) - 1;
  const sample = (pixel: number, channel: number): number => {
    if (depth >= 8) return data[pixel * channels + channel];
    const rowBytes = Math.ceil(width * depth / 8);
    const x = pixel % width;
    return (data[Math.floor(pixel / width) * rowBytes + Math.floor(x * depth / 8)] >> (8 - depth - (x * depth % 8))) & max;
  };
  for (let pixel = 0; pixel < width * height; pixel++) {
    const target = pixel * 4;
    const r = sample(pixel, 0);
    const g = channels <= 2 ? r : sample(pixel, 1);
    const b = channels <= 2 ? r : sample(pixel, 2);
    const transparent = !indexed && decoded.transparency && (channels === 1
      ? r === decoded.transparency[0]
      : r === decoded.transparency[0] && g === decoded.transparency[1] && b === decoded.transparency[2]);
    const alpha = channels === 2 || channels === 4 ? sample(pixel, channels - 1) : transparent ? 0 : max;
    pixels[target] = Math.round(r * 255 / max);
    pixels[target + 1] = Math.round(g * 255 / max);
    pixels[target + 2] = Math.round(b * 255 / max);
    pixels[target + 3] = Math.round(alpha * 255 / max);
  }
  return { width, height, pixels };
}

/** Preserve the composer's exact RGBA bytes, including partially transparent pixels. */
export function encodePngRgba(width: number, height: number, pixels: Uint8Array | Uint8ClampedArray): Uint8Array {
  return encode({ width, height, data: pixels, channels: 4, depth: 8 });
}
