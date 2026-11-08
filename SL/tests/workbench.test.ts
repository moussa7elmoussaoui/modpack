import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Window as DOMWindow } from 'happy-dom';
import { mountWorkbench, type WorkbenchServices } from '../src/workbench';
import type { SkinInput, SkinModel } from '../src/lib/addon';

// These are DOM behavior tests, not browser layout or screenshot tests.
const flush = async () => {
  await new Promise<void>(resolve => setImmediate(resolve));
  await new Promise<void>(resolve => setImmediate(resolve));
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
function decoded(file: File, model: SkinModel, height = 64) {
  return {
    texturePng: Uint8Array.from([1, file.name.length]), iconPng: Uint8Array.from([2, model === 'wide' ? 4 : 3]),
    iconUrl: `blob:icon-${file.name}-${model}`, width: 64, height, model
  };
}

async function withWorkbench(
  run: (harness: {
    document: Document;
    query: <T extends Element = HTMLElement>(selector: string, scope?: ParentNode) => T;
    editors: () => HTMLElement[];
    active: () => HTMLElement;
    dialog: () => HTMLDialogElement;
    close: () => void;
    openDraft: () => void;
    select: (index: number) => void;
    names: (value: string, editor?: HTMLElement) => void;
    upload: (name: string, editor?: HTMLElement) => Promise<void>;
    commit: () => void;
    exported: SkinInput[][];
    revoked: string[];
  }) => Promise<void>,
  overrides: Partial<WorkbenchServices> = {}
) {
  const dom = new DOMWindow({ url: 'http://skinlink.test/' });
  const document = dom.document as unknown as Document;
  document.head.innerHTML = '<meta name="theme-color" content="#f2f4f5">';
  document.body.innerHTML = '<div id="app"></div>';
  const globals: Record<string, unknown> = { window: dom, document,
    HTMLElement: dom.HTMLElement, HTMLInputElement: dom.HTMLInputElement,
    HTMLTextAreaElement: dom.HTMLTextAreaElement, Element: dom.Element, Node: dom.Node };
  const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  const oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
  const revoked: string[] = [];
  let urlSequence = 0;
  URL.createObjectURL = () => `blob:download-${++urlSequence}`;
  URL.revokeObjectURL = url => { revoked.push(url); };
  // Download clicks should not navigate the test DOM or request any network resource.
  dom.HTMLAnchorElement.prototype.click = () => {};
  // Exercise modal behavior without waiting for presentation-only exit animations.
  const matchMedia = dom.matchMedia.bind(dom);
  dom.matchMedia = media => {
    const result = matchMedia(media);
    if (media.includes('prefers-reduced-motion')) Object.defineProperty(result, 'matches', { value: true });
    return result;
  };
  const exported: SkinInput[][] = [];
  const services: Partial<WorkbenchServices> = {
    assetRoot: '/',
    fetch: (async input => String(input).includes('base-info.json')
      ? new Response(JSON.stringify({ skinCount: 175, playerAssetPaths: ['RP/textures/entity/player/slim/s001.png', 'RP/textures/morph_icons/minecraft/player/slim/s001.png'], reservedNames: ['DARK7MC', 'URBAN7MC', 'Dream', 'Steve', 'Alex'] }), { headers: { 'Content-Type': 'application/json' } })
      : new Response(Uint8Array.from([1, 2, 3]))) as typeof fetch,
    loadIconTemplates: async () => {},
    decodeSkin: async file => decoded(file, 'wide'),
    decodeSkinFace: async file => `blob:face-${file.name}`,
    generateAddon: async (_base, skins) => { exported.push(skins); return Uint8Array.from([4, 5, 6]); },
    ...overrides
  };
  const query = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T => {
    const found = scope.querySelector<T>(selector);
    assert.ok(found, `Expected DOM element ${selector}`);
    return found;
  };
  const editors = () => [...document.querySelectorAll<HTMLElement>('#skin-editors .skin-editor')];
  const dialog = () => query<HTMLDialogElement>('#skin-dialog');
  const active = () => {
    assert.equal(dialog().open, true, 'the editor must be inside the open popup');
    const visible = editors().filter(editor => !editor.hidden);
    assert.equal(visible.length, 1, 'only the selected skin should be editable');
    return visible[0];
  };
  const close = () => {
    if (dialog().open) query<HTMLButtonElement>('#close-editor').click();
    assert.equal(dialog().open, false, 'closing returns to the skin list');
  };
  const openDraft = () => {
    close();
    query<HTMLButtonElement>('#add-skin').click();
    assert.equal(dialog().open, true, 'Add skin opens the popup');
  };
  const names = (value: string, editor = active()) => {
    const input = query<HTMLInputElement>('input[type="text"]', editor);
    input.value = value;
    input.dispatchEvent(new dom.Event('input', { bubbles: true }) as unknown as Event);
  };
  const upload = async (name: string, editor = active()) => {
    const input = query<HTMLInputElement>('input[type="file"]', editor);
    const file = new File([Uint8Array.from([1, 2, 3])], name, { type: 'image/png' });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event);
    await flush();
  };
  const select = (index: number) => {
    close();
    const button = document.querySelectorAll<HTMLButtonElement>('#skin-list .edit-skin')[index];
    assert.ok(button, `Expected skin list item ${index}`);
    button.click();
  };
  const commit = () => {
    const button = query<HTMLButtonElement>('.commit-skin', active());
    assert.equal(button.disabled, false, 'only a complete valid skin can be committed');
    button.click();
    assert.equal(dialog().open, false, 'committing returns to the skin list');
  };
  let cleanup: (() => void) | undefined;
  try {
    cleanup = mountWorkbench(query('#app'), services);
    await flush();
    await run({ document, query, editors, active, dialog, close, openDraft, select, names, upload, commit, exported, revoked });
  } finally {
    cleanup?.();
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await dom.happyDOM.abort();
  }
}

test('the addon can be downloaded with no skins, including while an unfinished draft exists', async () => {
  await withWorkbench(async h => {
    assert.equal(Boolean(h.document.querySelector('#try-example')), false);
    assert.equal(h.dialog().open, false, 'the page starts with only the list and its actions');
    assert.ok(h.query('#add-skin'));
    assert.equal(h.document.querySelector('#editor-remove'), null, 'skins are removed from the list');
    const download = h.query<HTMLButtonElement>('#generate');
    assert.equal(download.disabled, false);
    assert.match(download.textContent ?? '', /Download addon/);
    download.click(); await flush();
    assert.deepEqual(h.exported, [[]]);
    assert.equal(h.query<HTMLAnchorElement>('#download-again').hidden, false);
    assert.equal(h.query<HTMLAnchorElement>('#download-again').download, 'modpack.mcaddon');
    assert.equal(h.editors().length, 0);
    h.openDraft(); h.names('UnfinishedPlayer');
    h.close();
    assert.equal(download.disabled, false);
    download.click(); await flush();
    assert.deepEqual(h.exported, [[], []]);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
  });
});

test('each item accepts one name, rejects typed or pasted lists, and can reuse the same skin in another item', async () => {
  await withWorkbench(async h => {
    h.openDraft();
    await h.upload('same-skin.png');
    const field = h.query<HTMLInputElement>('input[type="text"]', h.active());
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    for (const text of ['FirstPlayer, SecondPlayer', 'FirstPlayer, FirstPlayer']) {
      h.names(text); assert.equal(add.disabled, true);
      assert.equal(field.getAttribute('aria-invalid'), 'true');
    }
    const win = h.document.defaultView!;
    const clipboard = new win.DataTransfer();
    clipboard.setData('text/plain', 'FirstPlayer\r\nSecondPlayer\nThirdPlayer');
    field.value = '';
    field.dispatchEvent(new win.ClipboardEvent('paste', { clipboardData: clipboard, cancelable: true, bubbles: true }));
    assert.equal(add.disabled, true);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    clipboard.setData('text/plain', ' First Player\r\n');
    field.value = '';
    field.dispatchEvent(new win.ClipboardEvent('paste', { clipboardData: clipboard, cancelable: true, bubbles: true }));
    assert.equal(field.value, 'First Player', 'a single copied name may include surrounding whitespace');
    h.commit();
    assert.equal(h.query('.skin-row-meta').textContent, 'Wide');
    assert.equal(Boolean(h.document.querySelector('.names-count')), false);
    h.openDraft();
    h.names('Second Player'); await h.upload('same-skin.png'); h.commit();
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 2);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[0].map(skin => skin.names), [['First Player'], ['Second Player']]);
    assert.deepEqual(h.exported[0][0].texturePng, h.exported[0][1].texturePng);
  });
});

test('a new skin stays outside the list until every field is valid and Add to list is clicked', async () => {
  const image = deferred<ReturnType<typeof decoded>>();
  await withWorkbench(async h => {
    assert.equal(h.editors().length, 0);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false, 'the base addon can be downloaded without added skins');
    h.query<HTMLButtonElement>('#add-skin').click();
    assert.equal(h.editors().length, 1);
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    assert.equal(add.disabled, true, 'an empty draft cannot be added');
    h.names('DraftPlayer');
    assert.equal(add.disabled, true, 'a name alone is insufficient');
    await h.upload('draft.png');
    assert.equal(add.disabled, true, 'image processing must finish first');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    image.resolve(decoded(new File([], 'draft.png'), 'wide'));
    await flush();
    assert.equal(add.disabled, false);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0, 'finishing the form does not add automatically');
    h.commit();
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    assert.match(h.query('.skin-row-title').textContent ?? '', /DraftPlayer/);
    h.select(0);
    assert.match(h.query('.preview-toolbar', h.active()).textContent ?? '', /Morph menu icon/);
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false);
  }, { decodeSkin: async () => image.promise });
});

test('adding a skin closes the popup without another draft and saved skins open only through Edit', async () => {
  await withWorkbench(async h => {
    h.openDraft();
    h.names('FirstPlayer'); await h.upload('first.png');
    const first = h.active();
    assert.equal(h.query('.model-summary', first).textContent?.trim(), 'Wide · Automatically selected');
    h.commit();

    assert.equal(h.dialog().open, false);
    assert.equal(h.editors().length, 1, 'adding does not create an unused next draft');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    assert.equal(h.query('#entry-count').textContent, '1');
    assert.equal(h.query('#summary-skins').textContent, '1');
    assert.equal(h.query('#summary-names').textContent, '1');
    const edit = h.query<HTMLButtonElement>('#skin-list .edit-skin');
    assert.equal(h.document.activeElement, edit, 'focus moves to the added skin');
    const rowContent = h.query<HTMLElement>('#skin-list .skin-row-content');
    rowContent.click();
    assert.equal(h.dialog().open, false, 'clicking the row does not open the popup');
    h.query<HTMLElement>('#skin-list .skin-list-item').click();
    assert.equal(h.dialog().open, false, 'clicking row whitespace is inert');
    assert.equal(rowContent.hasAttribute('tabindex'), false);
    assert.equal(h.document.querySelector('#skin-list .skin-select'), null);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[0].map(skin => ({ names: skin.names, model: skin.model })), [{ names: ['FirstPlayer'], model: 'wide' }]);

    edit.click();
    assert.equal(h.dialog().open, true);
    assert.equal(h.active(), first);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', first).value, 'FirstPlayer');
    assert.equal(h.query('.file-name', first).textContent, 'first.png');
    assert.equal(h.query<HTMLImageElement>('.skin-preview', first).getAttribute('src'), 'blob:icon-first.png-wide');
    assert.equal(h.query('.model-summary', first).textContent?.trim(), 'Wide · Automatically selected');
    assert.equal(h.query('.commit-skin', first).textContent?.trim(), 'Done');
    h.commit();
    assert.equal(h.document.activeElement, edit);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1, 'Done does not duplicate a saved skin');

    h.openDraft();
    const next = h.active();
    assert.notEqual(next.id, first.id);
    assert.equal(first.hidden, true);
    assert.equal(h.editors().length, 2);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', next).value, '');
    const file = h.query<HTMLInputElement>('input[type="file"]', next);
    assert.equal(h.document.activeElement, file, 'the new popup focuses the upload control');
    assert.equal(h.query('.file-name', next).textContent, 'Choose a skin PNG');
    assert.equal(h.query<HTMLImageElement>('.skin-preview', next).hidden, true);
    assert.equal(h.query('.model-summary', next).hidden, true);
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', next).disabled, true);
    h.names('SecondPlayer'); await h.upload('second.png');
    assert.equal(h.query('.model-summary', next).textContent?.trim(), 'Slim · Automatically selected');
    h.commit();
    assert.equal(h.dialog().open, false);
    assert.equal(h.editors().length, 2, 'both editors belong to saved skins');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 2);
    assert.equal(h.revoked.includes('blob:icon-first.png-wide'), false);
    assert.equal(h.revoked.includes('blob:icon-second.png-slim'), false);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[1].map(skin => ({ names: skin.names, model: skin.model })), [
      { names: ['FirstPlayer'], model: 'wide' }, { names: ['SecondPlayer'], model: 'slim' },
    ]);
  }, { decodeSkin: async file => decoded(file, file.name === 'first.png' ? 'wide' : 'slim') });
});

test('automatic model detection is read-only and stays hidden until decoding succeeds', async () => {
  const image = deferred<ReturnType<typeof decoded>>();
  const argumentCounts: number[] = [];
  await withWorkbench(async h => {
    h.openDraft();
    const editor = h.active();
    const summary = h.query('.model-summary', editor);
    assert.equal(summary.hidden, true);
    assert.equal(summary.getAttribute('role'), 'status');
    assert.equal(editor.querySelector('input[type="radio"]'), null);
    assert.equal(editor.querySelector('.advanced-toggle'), null);
    assert.equal(editor.querySelector('.model-options'), null);
    h.names('AutomaticSlim');
    await h.upload('uploaded.png');
    assert.deepEqual(argumentCounts, [1], 'decoding receives only the file, never a geometry override');
    assert.equal(summary.hidden, true, 'a pending decode must not suggest a model');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', editor).disabled, true);
    image.resolve(decoded(new File([], 'uploaded.png'), 'slim'));
    await flush();
    assert.equal(summary.hidden, false);
    assert.equal(summary.textContent?.trim(), 'Slim · Automatically selected');
    h.commit();
    assert.equal(h.query('.skin-row-meta').textContent, 'Slim');
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'slim');
    assert.deepEqual([...h.exported[0][0].iconPng], [2, 3]);
  }, { decodeSkin: async (...args) => { argumentCounts.push(args.length); return image.promise; } });
});

test('a PNG uploaded before the base assets are ready is detected automatically when loading finishes', async () => {
  const metadata = deferred<Response>();
  const calls: string[] = [];
  await withWorkbench(async h => {
    h.openDraft(); h.names('WaitingForAssets'); await h.upload('waiting.png');
    const editor = h.active();
    assert.deepEqual(calls, [], 'the decoder waits for the templates and name policy');
    assert.equal(h.query('.model-summary', editor).hidden, true);
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', editor).disabled, true);
    metadata.resolve(new Response(JSON.stringify({ skinCount: 175, playerAssetPaths: [], reservedNames: ['Steve', 'Alex'] })));
    await flush();
    assert.deepEqual(calls, ['waiting.png']);
    assert.equal(h.query('.model-summary', editor).textContent?.trim(), 'Slim · Automatically selected');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', editor).disabled, false);
    h.commit();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'slim');
  }, {
    fetch: (async input => String(input).includes('base-info.json') ? metadata.promise : new Response(Uint8Array.from([1, 2, 3]))) as typeof fetch,
    decodeSkin: async file => { calls.push(file.name); return decoded(file, 'slim'); },
  });
});

test('automatic Wide and Slim choices persist through renaming, popup navigation, and export without decoding again', async () => {
  const calls: string[] = [];
  await withWorkbench(async h => {
    h.openDraft(); h.names('FirstPlayer'); await h.upload('wide.png');
    const first = h.active();
    assert.equal(h.query('.model-summary', first).textContent?.trim(), 'Wide · Automatically selected');
    h.names('RenamedPlayer'); h.commit();
    h.openDraft(); h.names('SecondPlayer'); await h.upload('slim.png'); h.commit();
    h.select(0);
    assert.equal(h.query('.model-summary', h.active()).textContent?.trim(), 'Wide · Automatically selected');
    assert.match(h.query<HTMLImageElement>('.skin-preview', h.active()).src, /wide\.png-wide$/);
    h.select(1);
    assert.equal(h.query('.model-summary', h.active()).textContent?.trim(), 'Slim · Automatically selected');
    assert.deepEqual(calls, ['wide.png', 'slim.png'], 'names and navigation do not rerun detection');
    h.close();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[0].map(skin => ({ model: skin.model, names: skin.names })), [
      { model: 'wide', names: ['RenamedPlayer'] }, { model: 'slim', names: ['SecondPlayer'] }
    ]);
    assert.deepEqual([...h.exported[0][0].iconPng], [2, 4]);
    assert.deepEqual([...h.exported[0][1].iconPng], [2, 3]);
  }, { decodeSkin: async file => {
    calls.push(file.name);
    return decoded(file, file.name === 'wide.png' ? 'wide' : 'slim');
  } });
});

test('replacing a saved skin clears the previous model and export waits for the newly detected model', async () => {
  const replacement = deferred<ReturnType<typeof decoded>>();
  const calls: string[] = [];
  await withWorkbench(async h => {
    h.openDraft(); h.names('ReplacementPlayer'); await h.upload('first.png'); h.commit();
    h.select(0);
    await h.upload('replacement.png');
    assert.equal(h.query('.model-summary', h.active()).hidden, true);
    assert.doesNotMatch(h.query('.skin-row-meta').textContent ?? '', /Wide|Slim/, 'the old Wide result is cleared during replacement');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    replacement.resolve(decoded(new File([], 'replacement.png'), 'slim')); await flush();
    assert.equal(h.query('.model-summary', h.active()).textContent?.trim(), 'Slim · Automatically selected');
    assert.equal(h.query('.skin-row-meta').textContent, 'Slim');
    h.commit();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'slim');
    assert.deepEqual(calls, ['first.png', 'replacement.png']);
  }, { decodeSkin: async file => {
    calls.push(file.name);
    return file.name === 'replacement.png' ? replacement.promise : decoded(file, 'wide');
  } });
});

test('legacy skins use Wide automatically and a modern replacement gets its own detected model', async () => {
  await withWorkbench(async h => {
    h.openDraft(); h.names('LegacyPlayer'); await h.upload('legacy.png');
    const editor = h.active();
    const summary = h.query('.model-summary', editor);
    assert.equal(summary.hidden, false);
    assert.equal(summary.textContent?.trim(), 'Wide · Legacy skin');
    assert.equal(editor.querySelector('input[type="radio"]'), null);
    h.commit();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'wide');
    h.select(0); await h.upload('modern.png');
    assert.equal(summary.hidden, false);
    assert.equal(summary.textContent?.trim(), 'Slim · Automatically selected');
    h.commit();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[1][0].model, 'slim');
    h.select(0); await h.upload('legacy-again.png');
    assert.equal(summary.textContent?.trim(), 'Wide · Legacy skin');
  }, { decodeSkin: async file => file.name.startsWith('legacy')
    ? decoded(file, 'wide', 32) : decoded(file, 'slim') });
});

test('invalid replacements clear the previous automatic result and cannot be added', async () => {
  await withWorkbench(async h => {
    h.openDraft(); h.names('InvalidUpload'); await h.upload('valid.png');
    assert.equal(h.query('.model-summary', h.active()).hidden, false);
    for (const file of ['not-a-skin.txt', 'corrupt.png']) {
      await h.upload(file);
      assert.equal(h.query('.model-summary', h.active()).hidden, true);
      assert.equal(h.active().querySelector('input[type="radio"]'), null);
      assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
      assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    }
  }, { decodeSkin: async file => {
    if (file.name === 'corrupt.png') throw new Error('The selected file is not a valid PNG image.');
    return decoded(file, 'wide');
  } });
});

test('individual icon downloads use the same named-file pattern and collision suffixes as the addon', async () => {
  await withWorkbench(async h => {
    h.openDraft(); await h.upload('source.png');
    h.names('s001');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 's001.png', 'original filenames occupy a separate folder');
    h.names('My Player');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 'my_player.png');
    h.commit();
    h.openDraft(); await h.upload('other.png'); h.names('MY_PLAYER');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 'my_player_2.png');
  });
});

test('an uploaded PNG and model still require a valid nonempty name before adding', async () => {
  await withWorkbench(async h => {
    h.openDraft();
    await h.upload('no-name.png');
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    assert.equal(add.disabled, true);
    h.names('  ,  '); assert.equal(add.disabled, true);
    h.names('x'.repeat(65)); assert.equal(add.disabled, true);
    h.names('ValidPlayer'); assert.equal(add.disabled, false);
    h.names(''); assert.equal(add.disabled, true);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
  });
});

test('Add stays disabled until the reserved-name policy has loaded', async () => {
  const metadata = deferred<Response>();
  await withWorkbench(async h => {
    h.openDraft();
    h.names('CustomPlayer'); await h.upload('policy.png');
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    assert.equal(add.disabled, true, 'names cannot be accepted before the protected list is known');
    metadata.resolve(new Response(JSON.stringify({ skinCount: 175, playerAssetPaths: ['RP/textures/entity/player/slim/s001.png', 'RP/textures/morph_icons/minecraft/player/slim/s001.png'], reservedNames: ['DARK7MC', 'URBAN7MC', 'Dream', 'Steve', 'Alex'] })));
    await flush();
    assert.equal(add.disabled, false);
    h.names('dArK7mC');
    assert.equal(add.disabled, true);
  }, { fetch: (async input => String(input).includes('base-info.json') ? metadata.promise : new Response(Uint8Array.from([1, 2, 3]))) as typeof fetch });
});

test('selecting added skins preserves edits and export includes all added entries but excludes an unfinished draft', async () => {
  await withWorkbench(async h => {
    h.openDraft();
    h.names('FirstPlayer'); await h.upload('first.png'); h.commit();
    h.openDraft();
    h.names('SecondPlayer'); await h.upload('second.png'); h.commit();
    h.select(0);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'FirstPlayer');
    assert.equal(h.query('.model-summary', h.active()).textContent?.trim(), 'Wide · Automatically selected');
    assert.match(h.query('.file-name', h.active()).textContent ?? '', /first\.png/);
    h.names('RenamedPlayer'); await h.upload('replacement.png');
    h.select(1);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'SecondPlayer');
    h.openDraft(); h.names('UnfinishedPlayer');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 2);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 1);
    assert.deepEqual(h.exported[0].map(skin => ({ names: skin.names, model: skin.model })), [
      { names: ['RenamedPlayer'], model: 'wide' }, { names: ['SecondPlayer'], model: 'wide' }
    ]);
    assert.deepEqual([...h.exported[0][0].texturePng], [1, 'replacement.png'.length]);
  });
});

test('reserved existing names are rejected case-insensitively before adding and during edits', async () => {
  await withWorkbench(async h => {
    h.openDraft(); await h.upload('protected.png');
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    const expectedMessages: Record<string, string> = {
      DARK7MC: '“DARK7MC” is reserved for a built-in skin. Choose a different player name.',
      DARK7Mc: '“DARK7Mc” differs only in capitalization from the built-in name “DARK7MC”. This name is reserved regardless of capitalization.',
      Dream: '“Dream” is reserved for a built-in skin. Choose a different player name.',
      dReAm: '“dReAm” differs only in capitalization from the built-in name “Dream”. This name is reserved regardless of capitalization.',
    };
    for (const name of ['DARK7MC', 'DARK7Mc', 'dark7mc', 'Urban7mc', 'Dream', 'dReAm', 'STEVE', 'alex', 'NormalPlayer, DREAM']) {
      h.names(name);
      assert.equal(add.disabled, true, name + ' must not override a bundled special name');
      assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).getAttribute('aria-invalid'), 'true');
      if (expectedMessages[name]) assert.equal(h.query('.names-error', h.active()).textContent, expectedMessages[name]);
    }
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    h.names('OriginalPlayer'); h.commit();
    h.select(0);
    h.names('URBAN7MC');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 0);
    h.names('OriginalPlayer');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false);
  });
});

test('duplicate names identify matching entries, follow renames, and block adding or exporting', async () => {
  await withWorkbench(async h => {
    h.openDraft();
    h.names('skin'); await h.upload('one.png'); h.commit();
    h.openDraft();
    h.names('skin'); await h.upload('two.png');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    assert.equal(h.query('.names-error', h.active()).textContent, '“skin” is already in your list. Choose a different player name.');
    h.names('skiN');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    assert.equal(h.query('.names-error', h.active()).textContent, '“skiN” differs only in capitalization from “skin”, which is already in your list. Choose a different player name.');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    h.select(0); h.names('renamedSkin');
    h.openDraft();
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, false, 'renaming the existing entry releases its previous name');
    h.names('RENAMEDSKIN');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    assert.equal(h.query('.names-error', h.active()).textContent, '“RENAMEDSKIN” differs only in capitalization from “renamedSkin”, which is already in your list. Choose a different player name.');
    h.names('DifferentPlayer'); h.commit();
    h.select(1);
    h.names('renamedSkin');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
    assert.equal(h.query('.names-error', h.active()).textContent, '“renamedSkin” is already in your list. Choose a different player name.');
    h.names('DifferentPlayer'); h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 1);
  });
});

test('case variants block adding and conflicting edits across models while preserving entered spelling', async () => {
  for (const model of ['wide', 'slim'] as const) {
    await withWorkbench(async h => {
      h.openDraft();
      h.names('Player'); await h.upload('one.png'); h.commit();
      h.openDraft();
      await h.upload('two.png');
      for (const name of ['PlayER', 'PLAYER', 'player']) {
        h.names(name);
        const editor = h.active();
        assert.equal(h.query<HTMLButtonElement>('.commit-skin', editor).disabled, true);
        assert.equal(h.query<HTMLInputElement>('input[type="text"]', editor).value, name);
        assert.equal(h.query<HTMLInputElement>('input[type="text"]', editor).getAttribute('aria-invalid'), 'true');
        assert.equal(h.query('.names-error', editor).textContent, `“${name}” differs only in capitalization from “Player”, which is already in your list. Choose a different player name.`);
      }
      assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
      h.names('OtherPlayer'); h.commit();
      h.select(1);
      h.names('pLaYeR');
      assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
      h.query<HTMLButtonElement>('#generate').click(); await flush();
      assert.equal(h.exported.length, 0);
      h.names('OtherPlayer');
      h.select(0); h.names('oThErPlAyEr');
      assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true, 'editing an earlier entry also checks later entries');
      h.names('pLaYeR');
      assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false, 'changing only an entry’s own capitalization is allowed');
      h.query<HTMLButtonElement>('#generate').click(); await flush();
      assert.deepEqual(h.exported[0].map(skin => skin.names), [['pLaYeR'], ['OtherPlayer']]);
    }, { decodeSkin: async file => decoded(file, file.name === 'two.png' ? model : 'wide') });
  }
});

test('Add resumes an unfinished draft after X dismissal and editing a saved skin', async () => {
  await withWorkbench(async h => {
    h.openDraft(); h.names('SavedPlayer'); await h.upload('saved.png'); h.commit();
    h.openDraft();
    h.names('DraftInProgress'); await h.upload('draft.png');
    const editor = h.active();
    const closeDraft = h.query<HTMLButtonElement>('#close-editor');
    closeDraft.click();
    assert.equal(h.dialog().open, false);
    assert.equal(h.document.activeElement, h.query('#add-skin'));
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    h.openDraft();
    assert.equal(h.active(), editor, 'X dismissal preserves the same unfinished draft');
    h.close();
    h.select(0);
    h.openDraft();
    assert.equal(h.active().id, editor.id);
    assert.equal(h.editors().length, 2);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'DraftInProgress');
    assert.equal(h.query('.file-name', h.active()).textContent, 'draft.png');
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    assert.equal(h.document.querySelector('#continue-skin'), null);
    assert.ok(h.query('#add-skin'));
  });
});

test('Escape closes the popup and restores focus to the Add or Edit trigger', async () => {
  await withWorkbench(async h => {
    const dismissWithEscape = () => {
      // Browsers translate Escape into the dialog cancel event; Happy DOM has no native keyboard default actions.
      const event = new h.document.defaultView!.Event('cancel', { cancelable: true });
      h.dialog().dispatchEvent(event);
      assert.equal(event.defaultPrevented, true, 'the popup handles cancellation before its exit animation');
      assert.equal(h.dialog().open, false);
    };
    h.openDraft(); h.names('EscapePlayer');
    const draft = h.active();
    dismissWithEscape();
    assert.equal(h.document.activeElement, h.query('#add-skin'));
    h.openDraft();
    assert.equal(h.active(), draft);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', draft).value, 'EscapePlayer');
    await h.upload('escape.png'); h.commit();
    h.select(0);
    const edit = h.query('#skin-list .edit-skin');
    dismissWithEscape();
    assert.equal(h.document.activeElement, edit);
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
  });
});

test('removing the last saved skin releases its images and leaves the empty list visible', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('RemoveMe'); await h.upload('remove.png'); h.commit();
    assert.equal(h.document.querySelector('#editor-remove'), null);
    h.query<HTMLButtonElement>('#skin-list .remove-list-skin').click();
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    assert.equal(h.dialog().open, false, 'removing from the list never opens the editor');
    assert.equal(h.editors().length, 0);
    assert.equal(h.document.activeElement, h.query('#add-skin'));
    assert.equal(h.query<HTMLElement>('#list-empty').hidden, false);
    assert.equal(h.query('#entry-count').textContent, '0');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false);
    assert.equal(Boolean(h.document.querySelector('#editor-empty > svg')), false);
    assert.equal(Boolean(h.document.querySelector('#undo-remove')), false);
    assert.ok(h.revoked.includes('blob:face-remove.png'));
    assert.ok(h.revoked.includes('blob:icon-remove.png-wide'));
  });
});

test('removing another skin keeps saved edits intact without opening the popup', async () => {
  await withWorkbench(async h => {
    h.openDraft(); h.names('FirstPlayer'); await h.upload('one.png'); h.commit();
    h.openDraft(); h.names('SecondPlayer'); await h.upload('two.png'); h.commit();
    h.select(1);
    h.names('RenamedSecondPlayer'); h.close();
    assert.equal(h.document.querySelector('#editor-remove'), null, 'removal is only available in the list');
    h.query<HTMLButtonElement>('#skin-list .remove-list-skin').click();
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
    assert.equal(h.dialog().open, false);
    h.select(0);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'RenamedSecondPlayer');
  });
});

test('a late icon result cannot overwrite a replacement skin or prematurely enable Add', async () => {
  const old = deferred<ReturnType<typeof decoded>>();
  await withWorkbench(async h => {
    h.openDraft(); h.names('LatestSkin');
    await h.upload('old.png');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    await h.upload('new.png');
    assert.equal(h.query<HTMLImageElement>('.skin-preview', h.active()).getAttribute('src'), 'blob:icon-new.png-slim');
    old.resolve(decoded(new File([], 'old.png'), 'wide')); await flush();
    assert.equal(h.query<HTMLImageElement>('.skin-preview', h.active()).getAttribute('src'), 'blob:icon-new.png-slim');
    assert.equal(h.query('.model-summary', h.active()).textContent?.trim(), 'Slim · Automatically selected', 'stale automatic detection must not change the newer model');
    assert.ok(h.revoked.includes('blob:icon-old.png-wide'));
    h.commit(); assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 1);
  }, { decodeSkin: async file => file.name === 'old.png' ? old.promise : decoded(file, 'slim') });
});

test('a late face result cannot resurrect a skin removed from the list', async () => {
  const face = deferred<string>();
  await withWorkbench(async h => {
    h.openDraft(); h.names('RemovedPlayer'); await h.upload('original.png'); h.commit();
    h.select(0); await h.upload('removed.png');
    h.close();
    h.query<HTMLButtonElement>('#skin-list .remove-list-skin').click();
    face.resolve('blob:face-removed.png'); await flush();
    assert.equal(h.document.querySelectorAll('#skin-list .edit-skin').length, 0);
    assert.equal(h.editors().length, 0);
    assert.equal(h.dialog().open, false);
    assert.ok(h.revoked.includes('blob:face-removed.png'));
  }, { decodeSkinFace: async file => file.name === 'removed.png' ? face.promise : `blob:face-${file.name}` });
});
