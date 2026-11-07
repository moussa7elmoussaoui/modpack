import { composeIcon, normalizeLegacySkin, type IconTemplates } from './pixels';
import { readPngDimensions, validateSkinDimensions } from './validation';
import { decodePngRgba, encodePngRgba, needsBrowserPngDecoder } from './png';
import { composeSkinFace } from './faces';

let templates: IconTemplates | undefined;
let loading: Promise<void> | undefined;

export function loadIconTemplates(): Promise<void> {
  if (templates) return Promise.resolve();
  if (!loading) loading = fetch(`${import.meta.env.BASE_URL}assets/icon-templates.json`)
    .then(async response => {
      if (!response.ok) throw new Error('Icon templates could not be loaded. Refresh the page to try again.');
      const data: IconTemplates = await response.json();
      if (data.version !== 1 || !data.wide || !data.slim) throw new Error('Unsupported icon template version.');
      templates = data;
    }).catch(error => { loading = undefined; throw error; });
  return loading;
}

// Keep support for packed Adam7 PNGs that fast-png 8 does not decode correctly.
async function decodePackedInterlacedPng(file: File, width: number, height: number): Promise<Uint8ClampedArray> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Your browser does not support image processing.');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height).data;
  } finally { URL.revokeObjectURL(url); }
}

async function readSkin(file: File) {
  if (file.size > 2 * 1024 * 1024) throw new Error('Choose a PNG smaller than 2 MB.');
  const source = new Uint8Array(await file.arrayBuffer());
  const { width, height } = readPngDimensions(source);
  validateSkinDimensions(width, height);
  const pixels = needsBrowserPngDecoder(source)
    ? await decodePackedInterlacedPng(file, width, height)
    : decodePngRgba(source).pixels;
  if (!pixels.some((channel, index) => index % 4 === 3 && channel > 0)) throw new Error('This skin is completely transparent.');
  return { source, width, height, pixels };
}

/** A straight face thumbnail is independent of arm model and the isometric templates. */
export async function decodeSkinFace(file: File): Promise<string> {
  const skin = await readSkin(file);
  const face = composeSkinFace(skin.pixels, skin.width, skin.height);
  const png = encodePngRgba(face.width, face.height, face.pixels);
  return URL.createObjectURL(new Blob([new Uint8Array(png)], { type: 'image/png' }));
}

export async function decodeSkin(file: File, model: 'wide' | 'slim'): Promise<{
  texturePng: Uint8Array; iconPng: Uint8Array; iconUrl: string; width: number; height: number;
}> {
  const skin = await readSkin(file);
  const { source, width, height } = skin;
  if (height === 32 && model === 'slim') throw new Error('Legacy 64 × 32 skins use the wide model. Choose Wide.');
  await loadIconTemplates();
  let pixels = skin.pixels;
  let texturePng: Uint8Array = source;
  if (height === 32) {
    pixels = normalizeLegacySkin(pixels);
    texturePng = encodePngRgba(64, 64, pixels);
  }
  const output = composeIcon(templates![model], pixels, width);
  const iconPng = encodePngRgba(128, 128, output);
  return { texturePng, iconPng, iconUrl: URL.createObjectURL(new Blob([new Uint8Array(iconPng)], { type: 'image/png' })), width, height };
}
