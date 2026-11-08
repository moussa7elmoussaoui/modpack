import type { SkinModel } from './addon';
import { isReservedPlayerName } from './name-policy';

export interface SkinAssignment {
  id: string;
  names: string[];
  model: SkinModel;
}

/** Each item has one player name; spaces within that name are preserved. */
export function parseNames(text: string): string[] {
  const name = text.trim();
  return name ? [name] : [];
}

export function validateAssignments(entries: SkinAssignment[], reservedNames: readonly string[] = []): string[] {
  const errors: string[] = [];
  const names = new Map<string, number>();
  const ids = new Set<string>();
  if (entries.length === 0) errors.push('Add at least one skin before generating your addon.');

  entries.forEach((entry, index) => {
    const label = `Skin ${index + 1}`;
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(entry.id) || ids.has(entry.id)) {
      errors.push(`${label}: the skin identifier is invalid or duplicated. Remove this entry and add it again.`);
    }
    ids.add(entry.id);
    if (entry.model !== 'wide' && entry.model !== 'slim') {
      errors.push(`${label}: choose Wide or Slim.`);
    }
    if (entry.names.length !== 1) errors.push(`${label}: enter exactly one player name per item. Add another item to use the same skin for another player.`);
    entry.names.forEach((name) => {
      if (name !== name.trim() || name.length === 0 || name.length > 64 || /[,\u0000-\u001f\u007f]/.test(name)) {
        errors.push(`${label}: use one player name with 1–64 characters, without commas, control characters, or leading/trailing spaces.`);
        return;
      }
      if (isReservedPlayerName(name, reservedNames)) {
        errors.push(`${label}: “${name}” is reserved by the base addon. Choose a different player name.`);
      }
      const normalized = name.toLowerCase();
      const previous = names.get(normalized);
      if (previous !== undefined && previous !== index) {
        errors.push(`“${name}” is assigned to both skin ${previous + 1} and skin ${index + 1}. Assign each name to one skin, regardless of capitalization.`);
      }
      names.set(normalized, index);
    });
  });
  return [...new Set(errors)];
}

export function validateSkinDimensions(width: number, height: number): void {
  if (!((width === 64 && (height === 64 || height === 32)) || (width === 128 && height === 128))) {
    throw new Error('Use a 64×64 or 128×128 PNG skin. Legacy 64×32 skins are also supported with the Wide model.');
  }
}

/** Reads the PNG IHDR without relying on browser or Node image APIs. */
export function readPngDimensions(data: Uint8Array): { width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (data.length < 33 || signature.some((value, index) => data[index] !== value)) {
    throw new Error('The selected file is not a valid PNG image.');
  }
  if (data[12] !== 73 || data[13] !== 72 || data[14] !== 68 || data[15] !== 82) {
    throw new Error('The PNG image is missing its size information.');
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (view.getUint32(8) !== 13) throw new Error('The PNG image has an invalid header.');
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (!width || !height) throw new Error('The PNG image has invalid dimensions.');
  return { width, height };
}
