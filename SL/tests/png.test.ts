import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { zlibSync } from 'fflate';
import { PNG } from 'pngjs';
import { encode } from 'fast-png';
import { decodePngRgba, encodePngRgba, needsBrowserPngDecoder } from '../src/lib/png';

function chunk(type: string, bytes: Uint8Array): Buffer {
  const result = Buffer.alloc(bytes.length + 12);
  result.writeUInt32BE(bytes.length);
  result.write(type, 4);
  result.set(bytes, 8);
  let crc = 0xffffffff;
  for (const byte of result.subarray(4, -4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}

function fixture(width: number, height: number, depth: number, type: number, rows: number[], extra: [string, number[]][] = []): Uint8Array {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4);
  header[8] = depth; header[9] = type;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    ...extra.map(([name, data]) => chunk(name, Uint8Array.from(data))),
    chunk('IDAT', zlibSync(Uint8Array.from(rows))), chunk('IEND', new Uint8Array())
  ]);
}

test('PNG I/O preserves exact RGB values at every alpha, including zero', () => {
  const pixels = new Uint8ClampedArray(16 * 16 * 4);
  for (let i = 0; i < 256; i++) pixels.set([31, 123, 237, i], i * 4);
  const png = encodePngRgba(16, 16, pixels);
  assert.deepEqual(decodePngRgba(png).pixels, pixels);
  assert.deepEqual(new Uint8ClampedArray(PNG.sync.read(Buffer.from(png)).data), pixels);
});

test('packed palette and grayscale PNGs preserve colors, row padding and transparency', () => {
  const indexed = fixture(3, 2, 2, 3, [0, 0b00011000, 0, 0b10010000], [
    ['PLTE', [17, 33, 49, 101, 121, 141, 200, 210, 220]], ['tRNS', [255, 7, 0]]
  ]);
  assert.deepEqual([...decodePngRgba(indexed).pixels], [
    17, 33, 49, 255, 101, 121, 141, 7, 200, 210, 220, 0,
    200, 210, 220, 0, 101, 121, 141, 7, 17, 33, 49, 255
  ]);
  const gray = fixture(3, 2, 2, 0, [0, 0b00011000, 0, 0b11100100], [['tRNS', [0, 1]]]);
  assert.deepEqual([...decodePngRgba(gray).pixels], [
    0, 0, 0, 255, 85, 85, 85, 0, 170, 170, 170, 255,
    255, 255, 255, 255, 170, 170, 170, 255, 85, 85, 85, 0
  ]);
});

test('16-bit transparency is compared before reducing samples to eight bits', () => {
  const png = fixture(2, 1, 16, 0, [0, 0x12, 0x34, 0x12, 0x35], [['tRNS', [0x12, 0x34]]]);
  assert.deepEqual([...decodePngRgba(png).pixels], [18, 18, 18, 0, 18, 18, 18, 255]);
  const grayAlpha = fixture(2, 1, 8, 4, [0, 47, 1, 129, 127]);
  assert.deepEqual([...decodePngRgba(grayAlpha).pixels], [47, 47, 47, 1, 129, 129, 129, 127]);
});

test('eight-bit Adam7 input decodes losslessly; unsupported packed Adam7 is detected', () => {
  const pixels = Uint8Array.from({ length: 8 * 8 * 4 }, (_, i) => i % 251);
  const png = encode({ width: 8, height: 8, data: pixels, channels: 4 }, { interlace: 'Adam7' });
  assert.deepEqual(decodePngRgba(png).pixels, new Uint8ClampedArray(pixels));
  const packed = fixture(1, 1, 1, 0, [0, 0]);
  packed[28] = 1;
  assert.equal(needsBrowserPngDecoder(packed), true);
});

test('invalid CRC and oversized PNG headers are rejected', () => {
  const png = encodePngRgba(1, 1, Uint8Array.from([11, 22, 33, 44]));
  const broken = png.slice(); broken[29] ^= 1;
  assert.throws(() => decodePngRgba(broken), /CRC/i);
  const oversized = png.slice(); new DataView(oversized.buffer).setUint32(16, 16384);
  assert.throws(() => decodePngRgba(oversized), /dimensions/);
  const secondHeader = Buffer.concat([png.subarray(0, 33), png.subarray(8)]);
  assert.throws(() => decodePngRgba(secondHeader), /multiple headers/);
  assert.throws(() => decodePngRgba(png.subarray(0, -12)), /incomplete/);
});

test('browser PNG codec agrees with the reference decoder for every bundled skin', async () => {
  let count = 0;
  for (const model of ['wide', 'slim']) {
    const directory = new URL(`../../RP/textures/entity/player/${model}/`, import.meta.url);
    for (const name of (await readdir(directory)).filter(name => name.endsWith('.png'))) {
      const bytes = await readFile(new URL(name, directory));
      const reference = PNG.sync.read(bytes);
      const actual = decodePngRgba(bytes);
      assert.equal(actual.width, reference.width, `${model}/${name}: width`);
      assert.equal(actual.height, reference.height, `${model}/${name}: height`);
      assert.deepEqual(actual.pixels, new Uint8ClampedArray(reference.data), `${model}/${name}: raw RGBA pixels`);
      count++;
    }
  }
  assert.ok(count >= 175, `expected the complete reference collection, got ${count}`);
});
