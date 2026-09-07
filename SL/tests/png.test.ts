import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { zlibSync } from 'fflate';
import { PNG } from 'pngjs';
import { encode } from 'fast-png';
import { decodePngRgba, encodePngRgba, needsBrowserPngDecoder, stripPngAnimation, validatePngImageData, validatePngStructure } from '../src/lib/png';

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

function fixture(width: number, height: number, depth: number, type: number, rows: number[], extra: [string, number[]][] = [], interlace = 0): Uint8Array {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4);
  header[8] = depth; header[9] = type; header[12] = interlace;
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
  const packed = fixture(1, 1, 1, 0, [0, 0], [], 1);
  assert.equal(needsBrowserPngDecoder(packed), true);
});

test('shared structure validation accepts valid packed Adam7 PNGs without decoding or changing their bytes', () => {
  // A 1x1 Adam7 image contains only its first pass: one filter byte and one packed sample byte.
  const packed = fixture(1, 1, 1, 0, [0, 0x80], [['tEXt', [75, 101, 121, 0, 86]]], 1);
  const before = Uint8Array.from(packed);
  assert.equal(needsBrowserPngDecoder(packed), true);
  assert.deepEqual([...PNG.sync.read(Buffer.from(packed)).data], [255, 255, 255, 255], 'the packed fixture must be a decodable image');
  assert.doesNotThrow(() => validatePngStructure(packed));
  assert.deepEqual(Uint8Array.from(packed), before);
  assert.throws(() => decodePngRgba(packed), /needs the browser decoder/);
  const padded = Buffer.concat([Buffer.from([1, 2, 3]), Buffer.from(packed), Buffer.from([4, 5])]);
  assert.doesNotThrow(() => validatePngStructure(padded.subarray(3, -2)), 'typed-array offsets must be respected');
  assert.doesNotThrow(() => validatePngStructure(Buffer.concat([packed, Buffer.from([6, 7])])), 'retain support for bytes after IEND');
});

test('shared structure validation rejects corrupt packed Adam7 headers, data, ancillary chunks, and end checksums', () => {
  const packed = fixture(1, 1, 1, 0, [0, 0x80], [['tEXt', [75, 101, 121, 0, 86]]], 1);
  const view = new DataView(packed.buffer, packed.byteOffset, packed.byteLength);
  const checked: string[] = [];
  for (let offset = 8; offset < packed.length;) {
    const end = offset + view.getUint32(offset) + 12;
    const name = String.fromCharCode(...packed.subarray(offset + 4, offset + 8));
    const broken = Uint8Array.from(packed);
    broken[end - 1] ^= 1;
    assert.throws(() => validatePngStructure(broken), /CRC/, `${name} CRC must be checked before browser decoding`);
    checked.push(name); offset = end;
  }
  assert.deepEqual(checked, ['IHDR', 'tEXt', 'IDAT', 'IEND']);
});

test('shared structure validation rejects malformed packed Adam7 containers before browser decoding', () => {
  const packed = fixture(1, 1, 1, 0, [0, 0x80], [], 1);
  const signature = Uint8Array.from(packed); signature[0] = 0;
  assert.throws(() => validatePngStructure(signature), /not a valid PNG/);
  const invalidHeader = Uint8Array.from(packed); new DataView(invalidHeader.buffer).setUint32(8, 12);
  assert.throws(() => validatePngStructure(invalidHeader), /invalid header/);
  const secondHeader = Buffer.concat([packed.subarray(0, 33), packed.subarray(8)]);
  assert.throws(() => validatePngStructure(secondHeader), /multiple headers/);
  assert.throws(() => validatePngStructure(packed.subarray(0, -1)), /truncated chunk/);
  assert.throws(() => validatePngStructure(packed.subarray(0, 37)), /truncated chunk/);
  assert.throws(() => validatePngStructure(packed.subarray(0, -12)), /incomplete/);
  const invalidEnd = Buffer.concat([packed.subarray(0, -12), chunk('IEND', Uint8Array.from([0]))]);
  assert.throws(() => validatePngStructure(invalidEnd), /invalid end chunk/);
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

test('small compressed PNGs cannot expand beyond the scanlines declared by IHDR', () => {
  const expected = (64 * 4 + 1) * 64;
  const rows = new Uint8Array(expected + 8 * 1024 * 1024);
  rows.fill(255, 0, expected);
  for (let y = 0; y < 64; y++) rows[y * (64 * 4 + 1)] = 0;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(64); header.writeUInt32BE(64, 4); header[8] = 8; header[9] = 6;
  const oversized = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', zlibSync(rows)), chunk('IEND', new Uint8Array())
  ]);
  assert.ok(oversized.length < 16 * 1024, 'the compressed upload is tiny despite its excess inflated data');
  assert.throws(() => validatePngImageData(oversized), /image data expands beyond/);
  assert.throws(() => decodePngRgba(oversized), /image data expands beyond/);
  assert.throws(() => validatePngImageData(fixture(3, 2, 8, 0, [0, 1, 2, 3, 0, 4, 5])), /does not match its dimensions/);
});

test('bounded validation handles split IDAT, stored blocks, and malformed compressed streams', () => {
  const image = fixture(3, 2, 8, 0, [0, 1, 2, 3, 0, 4, 5, 6]);
  const compressed = zlibSync(Uint8Array.from([0, 1, 2, 3, 0, 4, 5, 6]), { level: 0 });
  const split = Buffer.concat([
    image.subarray(0, 33),
    ...Array.from(compressed, value => chunk('IDAT', Uint8Array.from([value]))),
    chunk('IDAT', new Uint8Array()), chunk('IEND', new Uint8Array())
  ]);
  assert.deepEqual(decodePngRgba(split).pixels, decodePngRgba(image).pixels);
  const badAdler = compressed.slice(); badAdler[badAdler.length - 1] ^= 1;
  const invalid = (data: Uint8Array) => Buffer.concat([image.subarray(0, 33), chunk('IDAT', data), chunk('IEND', new Uint8Array())]);
  assert.throws(() => validatePngImageData(invalid(badAdler)), /compressed-data checksum/);
  assert.throws(() => validatePngImageData(invalid(compressed.subarray(0, -6))));
});

test('exact bounded scanline sizes include tiny Adam7 passes, odd dimensions, and HD 16-bit pixels', () => {
  const packed = fixture(1, 1, 1, 0, [0, 0x80], [], 1);
  assert.doesNotThrow(() => validatePngImageData(packed), 'empty Adam7 passes contribute no filter bytes');
  assert.throws(() => validatePngImageData(fixture(1, 1, 1, 0, [0, 0x80, 0], [], 1)), /expands beyond/);
  const oddPixels = Uint8Array.from({ length: 5 * 3 * 4 }, (_, index) => index * 3 % 251);
  assert.deepEqual(decodePngRgba(encode({ width: 5, height: 3, data: oddPixels, channels: 4 }, { interlace: 'Adam7' })).pixels, new Uint8ClampedArray(oddPixels));
  const hd = Uint16Array.from({ length: 128 * 128 * 4 }, (_, index) => index * 137 % 65536);
  const expected = Uint8ClampedArray.from(hd, value => Math.round(value * 255 / 65535));
  assert.deepEqual(decodePngRgba(encode({ width: 128, height: 128, data: hd, channels: 4, depth: 16 })).pixels, expected);
});

test('unused compressed metadata is bounded across chunks without changing raw pixels', () => {
  const profile = Buffer.concat([Buffer.from('profile\0\0'), zlibSync(new Uint8Array(256).fill(123))]);
  const base = fixture(1, 1, 8, 4, [0, 47, 127]);
  const withProfile = Buffer.concat([base.subarray(0, 33), chunk('iCCP', profile), base.subarray(33)]);
  assert.deepEqual(decodePngRgba(withProfile).pixels, decodePngRgba(base).pixels, 'unused ICC profile handling must not color-manage raw samples');
  const excessiveProfile = Buffer.concat([Buffer.from('profile\0\0'), zlibSync(new Uint8Array(4 * 1024 * 1024 + 1))]);
  const excessive = Buffer.concat([base.subarray(0, 33), chunk('iCCP', excessiveProfile), base.subarray(33)]);
  assert.throws(() => validatePngImageData(excessive), /metadata expands beyond/);
  const text = Buffer.concat([Buffer.from('text\0\0'), zlibSync(new Uint8Array(2 * 1024 * 1024 + 1))]);
  const combined = Buffer.concat([base.subarray(0, 33), chunk('zTXt', text), chunk('zTXt', text), base.subarray(33)]);
  assert.throws(() => validatePngImageData(combined), /metadata expands beyond/);
});

test('browser decoding can use the static default image without APNG animation chunks', () => {
  const base = fixture(1, 1, 8, 4, [0, 47, 127], [['tEXt', [75, 101, 121, 0, 86]]]);
  const original = Uint8Array.from(base);
  assert.equal(stripPngAnimation(base), base, 'static PNGs reuse their existing bytes');
  const control = Buffer.alloc(8); control.writeUInt32BE(2);
  const frame = Buffer.alloc(26); frame.writeUInt32BE(1, 4); frame.writeUInt32BE(1, 8);
  const nextFrame = Buffer.from(frame); nextFrame.writeUInt32BE(1);
  const frameData = Buffer.concat([Buffer.from([0, 0, 0, 2]), zlibSync(Uint8Array.from([0, 12, 255]))]);
  const profile = chunk('iCCP', Buffer.concat([Buffer.from('profile\0\0'), zlibSync(new Uint8Array(256))]));
  const animated = Buffer.concat([
    base.subarray(0, 33), profile, chunk('acTL', control), chunk('fcTL', frame),
    base.subarray(33, -12), chunk('fcTL', nextFrame), chunk('fdAT', frameData), base.subarray(-12), Buffer.from([6, 7])
  ]);
  const before = Uint8Array.from(animated);
  validatePngImageData(animated);
  const stripped = stripPngAnimation(animated);
  const expected = Buffer.concat([base.subarray(0, 33), profile, base.subarray(33), Buffer.from([6, 7])]);
  assert.deepEqual(stripped, new Uint8Array(expected), 'static chunks, text, color profile and pixel data remain verbatim');
  assert.deepEqual(decodePngRgba(stripped).pixels, decodePngRgba(base).pixels);
  assert.deepEqual(new Uint8Array(animated), before, 'the original uploaded texture keeps its animation bytes');
  assert.deepEqual(new Uint8Array(base), original);
});

test('palette and transparency metadata cannot allocate beyond their PNG format bounds', () => {
  const indexed = (palette: number[]) => fixture(1, 1, 1, 3, [0, 0], [['PLTE', palette]]);
  for (const palette of [[], [1], new Array(771).fill(1), new Array(9).fill(1)]) {
    assert.throws(() => validatePngImageData(indexed(palette)), /invalid palette/);
  }
  const duplicate = fixture(1, 1, 1, 3, [0, 0], [['PLTE', [1, 2, 3]], ['PLTE', [4, 5, 6]]]);
  assert.throws(() => validatePngImageData(duplicate), /invalid palette/);
  assert.throws(() => validatePngImageData(fixture(1, 1, 1, 3, [0, 0])), /missing its palette/);
  assert.throws(() => validatePngImageData(fixture(1, 1, 8, 0, [0, 1], [['tRNS', [0, 1, 0, 2]]])), /invalid transparency/);
  assert.throws(() => validatePngImageData(fixture(1, 1, 8, 2, [0, 1, 2, 3], [['tRNS', [0, 1]]])), /invalid transparency/);
  assert.throws(() => validatePngImageData(fixture(1, 1, 1, 3, [0, 0], [['PLTE', [1, 2, 3]], ['tRNS', [255, 0]]])), /invalid transparency/);
  const repeatedTransparency = fixture(1, 1, 8, 0, [0, 1], [['tRNS', [0, 1]], ['tRNS', [0, 1]]]);
  assert.throws(() => validatePngImageData(repeatedTransparency), /invalid transparency/);
  const maximumPalette = Array.from({ length: 768 }, (_, index) => index % 256);
  assert.doesNotThrow(() => validatePngImageData(fixture(1, 1, 8, 3, [0, 255], [['PLTE', maximumPalette], ['tRNS', new Array(256).fill(255)]])), 'maximum-size legal palettes remain supported');
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
