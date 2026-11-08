import { convertIndexedToRgb, decode, encode } from 'fast-png';
import { Unzlib } from 'fflate';
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

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});

/** Check container integrity before either the direct or browser PNG decoder runs. */
export function validatePngStructure(bytes: Uint8Array): void {
  readPngDimensions(bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let ended = false;
  for (let offset = 8; offset < bytes.length;) {
    if (offset + 12 > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const length = view.getUint32(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error('The PNG contains a truncated chunk.');
    const type = view.getUint32(offset + 4);
    if (type === 0x49484452 && offset !== 8) throw new Error('The PNG contains multiple headers.');
    let crc = 0xffffffff;
    for (let index = offset + 4; index < end - 4; index++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[index]) & 0xff];
    }
    if (((crc ^ 0xffffffff) >>> 0) !== view.getUint32(end - 4)) throw new Error('The PNG contains an invalid chunk CRC.');
    if (type === 0x49454e44) {
      if (length !== 0) throw new Error('The PNG contains an invalid end chunk.');
      ended = true; break;
    }
    offset = end;
  }
  if (!ended) throw new Error('The PNG is incomplete.');
}

const ADAM7_PASSES = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]] as const;
const MAX_METADATA_BYTES = 4 * 1024 * 1024;

function scanlineBytes(bytes: Uint8Array): number {
  const { width, height } = readPngDimensions(bytes);
  const depth = bytes[24], color = bytes[25];
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[color];
  const validDepth = color === 0 ? [1, 2, 4, 8, 16].includes(depth)
    : color === 3 ? [1, 2, 4, 8].includes(depth) : [8, 16].includes(depth);
  if (!channels || !validDepth || bytes[26] !== 0 || bytes[27] !== 0 || bytes[28] > 1) throw new Error('The PNG has an unsupported image header.');
  const row = (columns: number) => Math.ceil(columns * channels * depth / 8) + 1;
  if (bytes[28] === 0) return row(width) * height;
  return ADAM7_PASSES.reduce((total, [x, y, dx, dy]) => {
    const columns = Math.max(0, Math.ceil((width - x) / dx));
    const rows = Math.max(0, Math.ceil((height - y) / dy));
    return total + (columns && rows ? row(columns) * rows : 0);
  }, 0);
}

/** Small compressed pushes bound staging allocations; reject excess before the codec's full inflate. */
function inflateBounded(parts: readonly Uint8Array[], maximum: number, label: string): number {
  let length = 0, a = 1, b = 0;
  const stream = new Unzlib(chunk => {
    length += chunk.length;
    if (length > maximum) throw new Error(`The PNG ${label} expands beyond its allowed size.`);
    for (const value of chunk) { a = (a + value) % 65521; b = (b + a) % 65521; }
  });
  // A 256-byte compressed push can expand by only a bounded amount, independent
  // of the file's total compressed size. Do not use fflate's fixed `out` buffer:
  // it silently truncates oversized output instead of rejecting it.
  for (const part of parts) {
    for (let offset = 0; offset < part.length; offset += 256) stream.push(part.subarray(offset, offset + 256));
  }
  stream.push(new Uint8Array(), true);
  const tail = new Uint8Array(4);
  let remaining = 4;
  for (let index = parts.length - 1; index >= 0 && remaining; index--) {
    const part = parts[index], take = Math.min(remaining, part.length);
    remaining -= take; tail.set(part.subarray(part.length - take), remaining);
  }
  if (remaining || new DataView(tail.buffer).getUint32(0) !== (((b << 16) | a) >>> 0)) throw new Error(`The PNG ${label} has an invalid compressed-data checksum.`);
  return length;
}

/** Bound decoded image data and unused metadata before direct or browser decoding. */
export function validatePngImageData(bytes: Uint8Array): void {
  const { width, height } = readPngDimensions(bytes);
  if (width > 128 || height > 128) throw new Error('PNG dimensions must not exceed 128 × 128.');
  validatePngStructure(bytes);
  const expected = scanlineBytes(bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const image: Uint8Array[] = [];
  let metadataBytes = 0, paletteEntries = 0, hasTransparency = false;
  for (let offset = 8; offset < bytes.length;) {
    const length = view.getUint32(offset), type = view.getUint32(offset + 4);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 0x49454e44) break;
    if (type === 0x49444154 && length) image.push(data);
    if (type === 0x504c5445) {
      if (paletteEntries || !length || length % 3 || length > 768 || (bytes[25] === 3 && length / 3 > 2 ** bytes[24])) throw new Error('The PNG has an invalid palette.');
      paletteEntries = length / 3;
    }
    if (type === 0x74524e53) {
      const color = bytes[25];
      if (hasTransparency || (color === 0 ? length !== 2 : color === 2 ? length !== 6 : color === 3 ? !paletteEntries || length > paletteEntries : true)) throw new Error('The PNG has invalid transparency data.');
      hasTransparency = true;
    }
    if (type === 0x69434350 || type === 0x7a545874 || type === 0x69545874) {
      const keywordEnd = data.indexOf(0);
      if (keywordEnd < 1 || keywordEnd > 79) throw new Error('The PNG has invalid compressed metadata.');
      let start = keywordEnd + 2;
      let compressed = true;
      if (type === 0x69545874) {
        const flag = data[keywordEnd + 1];
        if ((flag !== 0 && flag !== 1) || data[keywordEnd + 2] !== 0) throw new Error('The PNG has invalid compressed metadata.');
        compressed = flag === 1;
        const languageEnd = data.indexOf(0, keywordEnd + 3);
        const translatedEnd = languageEnd < 0 ? -1 : data.indexOf(0, languageEnd + 1);
        if (translatedEnd < 0) throw new Error('The PNG has invalid compressed metadata.');
        start = translatedEnd + 1;
      } else if (data[keywordEnd + 1] !== 0) throw new Error('The PNG has invalid compressed metadata.');
      metadataBytes += compressed ? inflateBounded([data.subarray(start)], MAX_METADATA_BYTES - metadataBytes, 'metadata') : data.length - start;
      if (metadataBytes > MAX_METADATA_BYTES) throw new Error('The PNG metadata expands beyond its allowed size.');
    }
    offset += length + 12;
  }
  if (bytes[25] === 3 && !paletteEntries) throw new Error('The PNG is missing its palette.');
  if (!image.length || inflateBounded(image, expected, 'image data') !== expected) throw new Error('The PNG image data does not match its dimensions.');
}

const ICC_PROFILE_CHUNKS = new Set([0x69434350]);
const ANIMATION_CHUNKS = new Set([0x6163544c, 0x6663544c, 0x66644154]);

/** Only called after chunk bounds and CRCs have already been checked. */
function filterPngChunks(bytes: Uint8Array, excluded: ReadonlySet<number>): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts = [bytes.subarray(0, 8)];
  let removed = false;
  for (let offset = 8; offset < bytes.length;) {
    const end = offset + view.getUint32(offset) + 12, type = view.getUint32(offset + 4);
    if (excluded.has(type)) removed = true;
    else parts.push(bytes.subarray(offset, end));
    offset = end;
    if (type === 0x49454e44) {
      if (offset < bytes.length) parts.push(bytes.subarray(offset));
      break;
    }
  }
  if (!removed) return bytes;
  const output = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

/** Match the direct decoder's static default image without feeding animation frames to Image. */
export function stripPngAnimation(bytes: Uint8Array): Uint8Array {
  return filterPngChunks(bytes, ANIMATION_CHUNKS);
}

/** Decode sample values directly, without color management or alpha premultiplication. */
export function decodePngRgba(bytes: Uint8Array): RgbaPng {
  const { width, height } = readPngDimensions(bytes);
  // Check before the codec allocates image buffers, including callers outside the UI.
  if (width > 128 || height > 128) throw new Error('PNG dimensions must not exceed 128 × 128.');
  validatePngImageData(bytes);
  if (needsBrowserPngDecoder(bytes)) throw new Error('This packed interlaced PNG needs the browser decoder.');
  // fast-png otherwise inflates ICC profiles even though this raw decoder never uses them.
  const decoded = decode(filterPngChunks(bytes, ICC_PROFILE_CHUNKS), { checkCrc: true });
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
