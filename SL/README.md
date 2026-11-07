# SkinLink

SkinLink builds a personalized Minecraft Bedrock `.mcaddon` from the addon in the sibling `BP` and `RP` folders. For each skin, upload a PNG, choose Wide or Slim, and enter the exact player names that should use it. Multiple names can share one skin. Names are case-sensitive and can be separated by commas or line breaks.

The app uses TypeScript, HTML, and CSS with Vite. Skin processing, icon generation, and addon packaging happen in the browser. Skin files and entered names are not sent to a server. Visitors need neither Node.js nor Blockbench; Node.js is only needed to develop or build the website.

The interface uses the addon's Omnitrix colors: charcoal, metallic grays, and cyan accents. The header's animated Theme menu offers System, Light, and Dark, with keyboard navigation and Escape to close. System follows the device setting; explicit choices are remembered in the browser. Theme changes leave uploaded skins and entered names in place. Controls and panels use subtle transitions that respect the device's reduced-motion setting. Scrollbars use the browser defaults.

The lineup starts empty. New skin opens a draft; its Add to list button stays disabled until the PNG, explicit Wide/Slim choice, and linked names are valid and image processing is complete. Only clicking Add to list adds the skin to the lineup. Cancel discards the draft. You can return to an unfinished draft with Continue new skin while editing other entries. Select an added entry to change its PNG, model, or names; those edits are kept as you work. Each added entry shows its face in the list. The selected skin has a square icon preview and an individual PNG download. Generate addon includes only entries already added to the list. Skins are kept in the current tab rather than saved across page reloads. The header and browser icon use DARK7MC's face from the addon.

Names already assigned by the base addon are protected, including DARK7MC, URBAN7MC, the YouTubers, Steve, and Alex. Protection also rejects capitalization variants. The rules are derived from the bundled addon's actual name mapping during asset preparation and checked again against the archive during generation; custom names otherwise retain the addon's case-sensitive matching.

## Run locally

Use a recent Node.js LTS release supported by Vite 7 (Node 22.12 or newer is suitable). From this folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Download addon works immediately after the base assets load, even with an empty skin list. To customize it, upload skins, enter their player names, select their models, and click Add to list. Every custom entry needs a skin and at least one name. Each name can appear in only one skin entry. Uploading a file does not infer its arm model: Wide or Slim is always your choice. Unfinished drafts are excluded from downloads.

```sh
npm test
npm run build
npm run preview
```

`npm run example` also generates `artifacts/modpack.mcaddon` without a browser, using the same pack generator and the prepared Steve/Alex examples. Its linked names are `YourGamertag`, `AnotherPlayer`, and `SlimPlayer`.

Tests cover pixel composition and generation of the full addon, including player-name mappings, texture aliases, render controllers, pack identity, validation, and preservation of other assets. The build runs TypeScript checks and writes the production website to `dist/`. The preview command serves that production build locally.

## Base addon and deployment

`npm run prepare:assets` reads `../BP` and `../RP` and writes the base addon archive, icon templates, example images, and base information under `public/assets/`. The development, test, and build commands run this preparation step automatically. Run it again after updating the sibling addon folders. It reads the original addon and writes only inside `SL`.

Deploy all of `dist/` to a static web host, including its `assets/` directory. The published site includes the prepared base addon; visitors do not have to upload a base pack. No backend or database is required. Serve the app over HTTP for local development or HTTPS for a published site; opening `index.html` directly from the filesystem is not supported. If deploying under a subdirectory, set Vite's base path when building, for example `npm run build -- --base=/skinlink/`.

Downloads contain the complete behavior and resource packs with new skin and icon files. Existing bundled skin indices and name assignments stay intact. Website-added skins are named assignments outside the random-skin pool, just like DARK7MC and URBAN7MC; random selection continues to choose only from the original pool. Original `BP` and `RP` files are never modified. Every generated addon receives fresh pack and module UUIDs, with its dependency references updated together, so separate downloads import as separate addon variants rather than replacing the original pack automatically.

With no added skins, the download contains the original addon assets and scripts with fresh pack identities; skin registrations and name assignments remain unchanged.

Website downloads are named `modpack.mcaddon`. The original manifest names and translation files are preserved, so Minecraft shows the names defined by the base addon, currently `DARK7MC Modpack [BP]` and `DARK7MC Modpack [RP]`. Generated player icons belong to the morph menu; the original behavior/resource pack icons are preserved.

Custom skin and morph-icon filenames follow the named-player pattern: the first linked name becomes lowercase with spaces replaced by underscores, such as `My Player` → `my_player.png`. Generated skins go in `RP/textures/entity/player/generated/wide/` or `generated/slim/`, with matching icons under `RP/textures/morph_icons/minecraft/player/generated/wide/` or `generated/slim/`. Original assets keep their existing folders. Other linked names share the same skin files. Characters unsuitable for filenames are replaced with underscores, and a numeric suffix such as `_2` prevents collisions within the generated folders. Individual icon downloads use the same filenames as the addon.

## Icon generation

Two fixed templates represent the bundled wide and slim player geometry in the bob pose at time `0:00`, with an isometric camera, fixed scale, and fixed shading. Template preparation performs the geometry calculations once. For each uploaded skin, the browser uses the baked pixel-to-texture mappings and overlapping surfaces to compose a transparent `128×128` icon. It does not load a 3D model, run an animation, use WebGL, or take a screenshot for each skin.

The calibration settings are in `scripts/icon-calibration.json`. Icon templates are rebuilt from them during asset preparation. They include both sides of each cube face, matching the default Blockbench Bedrock material when transparent outer layers reveal the opposite surface. Canvas padding rounds half-pixel offsets to the nearest even integer, matching the existing reference icons, without smoothing or stretching the image.

`npm run check:icons` rebuilds the templates and compares every matching skin/icon pair in the addon (currently 175). It writes `artifacts/icon-accuracy.json` and `artifacts/icon-accuracy.png`. In the image, the rows are original, generated, and differences highlighted in pink; column names are in the JSON. Measurements count exact RGBA agreement over the union of visible pixels, silhouette overlap, and absolute premultiplied color/alpha error. Transparent background pixels do not inflate the agreement percentage.

`tests/fixtures/icon-accuracy.json` records both the original generator's measurements and the improved results, with source fingerprints. Tests reject a regression on any reference rather than accepting a better average at the expense of another skin. They also verify that PNG export preserves the composed RGBA pixels. If you intentionally replace a reference skin or icon, review its comparison and refresh the corresponding benchmark entry.

`npm run calibrate:icons` searches scale and pixel placement using ten fitting examples, then checks the candidate against all references. It saves the settings only if the total error falls and no individual icon loses exact pixel agreement or silhouette overlap, or gains color/alpha error. Rejected candidates leave the settings unchanged. The trial report is `artifacts/icon-calibration-trial.json`; run `npm run check:icons` afterward to rebuild the templates.

PNG decoding and encoding use raw sample values so browser color conversion and alpha premultiplication do not alter the measured pixels. Square skin textures remain byte-for-byte unchanged in the addon. Uncommon interlaced PNGs with packed 1/2/4-bit samples retain a browser decoding fallback because the current PNG codec cannot decode that combination correctly; their export still uses the direct encoder.

The projection and pixel-mapping implementation is independent. Reference behavior comes from Blockbench's [camera presets](https://github.com/JannisX11/blockbench/blob/master/js/preview/preview.ts), [Bedrock coordinate conventions](https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js), and [face lighting](https://github.com/JannisX11/blockbench/blob/master/js/shaders/texture.vert.glsl). Blockbench is not a runtime dependency.

Supported skins are `64×64` and `128×128` PNGs using the standard wide or slim UV layout. Legacy `64×32` skins are accepted with the Wide model and expanded to the modern `64×64` layout before packaging. Files must be 2 MB or smaller. Completely transparent skins are rejected.

Custom geometry, Character Creator accessories, capes, and other skin layouts are outside this version's scope. Partially transparent texture layers can differ from Blockbench's material and depth behavior. Icons target consistency with the bundled references rather than identical PNG bytes. The generated archive is checked structurally and through tests, but importing and running it in Minecraft has not been tested here. The base addon's Minecraft version requirements and experimental API requirements still apply.
