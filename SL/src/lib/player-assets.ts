interface NamedPlayerSkin {
  names: readonly string[];
  model: 'wide' | 'slim';
}

/** Match the addon's named-player filenames while keeping arbitrary names safe in paths. */
export function playerFileStem(name: string): string {
  const stem = name.toLowerCase().replaceAll(' ', '_').replace(/[^a-z0-9_-]/g, '_') || 'player';
  // Keep names such as CON usable when Minecraft extracts the pack on Windows.
  return /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(stem) ? `${stem}_` : stem;
}

/** Allocate one shared texture/icon path per skin without overwriting either existing file. */
export function allocatePlayerAssetPaths(skins: readonly NamedPlayerSkin[], existingPaths: Iterable<string>): string[] {
  const occupied = new Set(Array.from(existingPaths, path => path.toLowerCase()));
  return skins.map(skin => {
    const stem = playerFileStem(skin.names[0] || 'player');
    let path = `player/generated/${skin.model}/${stem}`, suffix = 2;
    const texture = () => `RP/textures/entity/${path}.png`;
    const icon = () => `RP/textures/morph_icons/minecraft/${path}.png`;
    while (occupied.has(texture().toLowerCase()) || occupied.has(icon().toLowerCase())) {
      path = `player/generated/${skin.model}/${stem}_${suffix++}`;
    }
    occupied.add(texture().toLowerCase()); occupied.add(icon().toLowerCase());
    return path;
  });
}
