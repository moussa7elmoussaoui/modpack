import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { zipSync } from 'fflate';
import { PNG } from 'pngjs';
import { bakeTemplate, type Geometry } from './template';
import { composeIcon } from '../src/lib/pixels';
import { composeSkinFace, enlargeSkinFace } from '../src/lib/faces';
import { readReservedPlayerNames } from '../src/lib/name-policy';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.resolve(app, '..');
const output = path.join(app, 'public/assets');
await mkdir(path.join(output, 'examples'), { recursive: true });
const files: Record<string, Uint8Array> = {};
async function collect(directory: string) {
  for (const entry of (await readdir(path.join(base, directory), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await collect(relative);
    else if (entry.isFile()) files[relative] = new Uint8Array(await readFile(path.join(base, relative)));
  }
}
await collect('BP'); await collect('RP');
const fingerprint = createHash('sha256');
for (const [name, content] of Object.entries(files)) fingerprint.update(name).update(content);
const geometry = JSON.parse(new TextDecoder().decode(files['RP/models/entity/player.morph.geo.json']))['minecraft:geometry'] as Geometry[];
const calibration = JSON.parse(await readFile(path.join(app, 'scripts/icon-calibration.json'), 'utf8'));
const templates = { version: 1, wide: bakeTemplate(geometry[0], calibration.wide), slim: bakeTemplate(geometry[1], calibration.slim) };
await writeFile(path.join(output, 'icon-templates.json'), JSON.stringify(templates));
await writeFile(path.join(output, 'base-addon.zip'), zipSync(files, { level: 6 }));
const playerEntity = JSON.parse(new TextDecoder().decode(files['BP/entities/player.json']));
const skinCount = playerEntity['minecraft:entity'].description.properties['dark7mc:player_skin'].range[1] + 1;
const reservedNames = readReservedPlayerNames(new TextDecoder().decode(files['BP/scripts/data/player-skins.js']));
const playerAssetPaths = Object.keys(files).filter(path => /^RP\/textures\/(?:entity\/player|morph_icons\/minecraft\/player)\/.*\.png$/i.test(path));
await writeFile(path.join(output, 'base-info.json'), JSON.stringify({ fileCount: Object.keys(files).length, skinCount, reservedNames, playerAssetPaths, fingerprint: fingerprint.digest('hex'), createdAt: new Date().toISOString() }));
const brandSkin = PNG.sync.read(Buffer.from(files['RP/textures/entity/player/wide/dark7mc.png']));
const brandFace = enlargeSkinFace(composeSkinFace(brandSkin.data, brandSkin.width, brandSkin.height), 128);
const brandIcon = new PNG({ width: 128, height: 128 });
brandIcon.data = Buffer.from(brandFace.pixels);
await writeFile(path.join(output, 'brand-face.png'), PNG.sync.write(brandIcon));
for (const [model, name] of [['wide', 'steve'], ['slim', 'alex']] as const) {
  const bytes = files[`RP/textures/entity/player/${model}/${name}.png`];
  await writeFile(path.join(output, `examples/${model}.png`), bytes);
  const skin = PNG.sync.read(Buffer.from(bytes));
  const icon = new PNG({ width: 128, height: 128 });
  icon.data = Buffer.from(composeIcon(templates[model], skin.data, skin.width));
  await writeFile(path.join(output, `examples/${model}-icon.png`), PNG.sync.write(icon));
}
console.log(`SkinLink assets ready: ${Object.keys(files).length} addon files, ${skinCount} bundled skins, two fixed icon templates.`);
