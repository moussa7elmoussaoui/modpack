/** A small Node entry point using exactly the same pack generator as the website. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateAddon } from '../src/lib/addon';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(app, 'public/assets');
const base = new Uint8Array(await readFile(path.join(assets, 'base-addon.zip')));
const skins = await Promise.all((['wide', 'slim'] as const).map(async (model, index) => ({
  id: `example_${model}`,
  names: index === 0 ? ['YourGamertag', 'AnotherPlayer'] : ['SlimPlayer'],
  model,
  texturePng: new Uint8Array(await readFile(path.join(assets, `examples/${model}.png`))),
  iconPng: new Uint8Array(await readFile(path.join(assets, `examples/${model}-icon.png`)))
})));
const addon = await generateAddon(base, skins, {}, console.log);
await mkdir(path.join(app, 'artifacts'), { recursive: true });
const output = path.join(app, 'artifacts/modpack.mcaddon');
await writeFile(output, addon);
console.log(`Created ${output} (${addon.length.toLocaleString()} bytes).`);
