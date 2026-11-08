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
function decoded(file: File, model: SkinModel) {
  return {
    texturePng: Uint8Array.from([1, file.name.length]), iconPng: Uint8Array.from([2, model === 'wide' ? 4 : 3]),
    iconUrl: `blob:icon-${file.name}-${model}`, width: 64, height: 64, model
  };
}

async function withWorkbench(
  run: (harness: {
    document: Document;
    query: <T extends Element = HTMLElement>(selector: string, scope?: ParentNode) => T;
    editors: () => HTMLElement[];
    active: () => HTMLElement;
    select: (index: number) => void;
    names: (value: string, editor?: HTMLElement) => void;
    model: (value: SkinModel, editor?: HTMLElement) => Promise<void>;
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
  const exported: SkinInput[][] = [];
  const services: Partial<WorkbenchServices> = {
    assetRoot: '/',
    fetch: (async input => String(input).includes('base-info.json')
      ? new Response(JSON.stringify({ skinCount: 175, playerAssetPaths: ['RP/textures/entity/player/slim/s001.png', 'RP/textures/morph_icons/minecraft/player/slim/s001.png'], reservedNames: ['DARK7MC', 'URBAN7MC', 'Dream', 'Steve', 'Alex'] }), { headers: { 'Content-Type': 'application/json' } })
      : new Response(Uint8Array.from([1, 2, 3]))) as typeof fetch,
    loadIconTemplates: async () => {},
    decodeSkin: async (file, model) => decoded(file, model ?? 'wide'),
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
  const active = () => {
    const visible = editors().filter(editor => !editor.hidden);
    assert.equal(visible.length, 1, 'only the selected skin should be editable');
    return visible[0];
  };
  const names = (value: string, editor = active()) => {
    const input = query<HTMLInputElement>('input[type="text"]', editor);
    input.value = value;
    input.dispatchEvent(new dom.Event('input', { bubbles: true }) as unknown as Event);
  };
  const model = async (value: SkinModel, editor = active()) => {
    const input = query<HTMLInputElement>(`input[type="radio"][value="${value}"]`, editor);
    assert.equal(input.disabled, false, 'model controls must be available before choosing one');
    input.checked = true;
    input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event);
    await flush();
  };
  const upload = async (name: string, editor = active()) => {
    const input = query<HTMLInputElement>('input[type="file"]', editor);
    const file = new File([Uint8Array.from([1, 2, 3])], name, { type: 'image/png' });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    input.dispatchEvent(new dom.Event('change', { bubbles: true }) as unknown as Event);
    await flush();
  };
  const select = (index: number) => {
    const button = document.querySelectorAll<HTMLButtonElement>('#skin-list .skin-select')[index];
    assert.ok(button, `Expected skin list item ${index}`);
    button.click();
  };
  const commit = () => {
    const button = query<HTMLButtonElement>('.commit-skin', active());
    assert.equal(button.disabled, false, 'a complete valid draft must be addable');
    button.click();
  };
  let cleanup: (() => void) | undefined;
  try {
    cleanup = mountWorkbench(query('#app'), services);
    await flush();
    await run({ document, query, editors, active, select, names, model, upload, commit, exported, revoked });
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
    const download = h.query<HTMLButtonElement>('#generate');
    assert.equal(download.disabled, false);
    assert.match(download.textContent ?? '', /Download addon/);
    download.click(); await flush();
    assert.deepEqual(h.exported, [[]]);
    assert.equal(h.query<HTMLAnchorElement>('#download-again').hidden, false);
    assert.equal(h.query<HTMLAnchorElement>('#download-again').download, 'modpack.mcaddon');
    assert.equal(h.editors().length, 0);
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('UnfinishedPlayer');
    assert.equal(download.disabled, false);
    download.click(); await flush();
    assert.deepEqual(h.exported, [[], []]);
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
  });
});

test('each item accepts one name, rejects typed or pasted lists, and can reuse the same skin in another item', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
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
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    clipboard.setData('text/plain', ' First Player\r\n');
    field.value = '';
    field.dispatchEvent(new win.ClipboardEvent('paste', { clipboardData: clipboard, cancelable: true, bubbles: true }));
    assert.equal(field.value, 'First Player', 'a single copied name may include surrounding whitespace');
    h.commit();
    assert.equal(h.query('.skin-row-meta').textContent, 'Wide');
    assert.equal(Boolean(h.document.querySelector('.names-count')), false);
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('Second Player'); await h.upload('same-skin.png'); h.commit();
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 2);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[0].map(skin => skin.names), [['First Player'], ['Second Player']]);
    assert.deepEqual(h.exported[0][0].texturePng, h.exported[0][1].texturePng);
  });
});

test('a new skin stays outside the list until every field is valid and Add to list is clicked', async () => {
  const image = deferred<ReturnType<typeof decoded>>();
  await withWorkbench(async h => {
    assert.equal(h.editors().length, 0);
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false, 'the base addon can be downloaded without added skins');
    h.query<HTMLButtonElement>('#add-first-skin').click();
    assert.equal(h.editors().length, 1);
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    assert.equal(add.disabled, true, 'an empty draft cannot be added');
    h.names('DraftPlayer');
    assert.equal(add.disabled, true, 'a name alone is insufficient');
    await h.upload('draft.png');
    assert.equal(add.disabled, true, 'image processing must finish first');
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    image.resolve(decoded(new File([], 'draft.png'), 'wide'));
    await flush();
    assert.equal(add.disabled, false);
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0, 'finishing the form does not add automatically');
    h.commit();
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 1);
    assert.match(h.query('.skin-row-title').textContent ?? '', /DraftPlayer/);
    assert.match(h.query('.preview-toolbar', h.active()).textContent ?? '', /Morph menu icon/);
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false);
  }, { decodeSkin: async () => image.promise });
});

test('model controls stay hidden until a valid upload is processed, then reveal the detected Slim selection', async () => {
  const image = deferred<ReturnType<typeof decoded>>();
  const calls: (SkinModel | undefined)[] = [];
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    const editor = h.active();
    const reveal = h.query('.model-reveal', editor);
    const wide = h.query<HTMLInputElement>('input[value="wide"]', editor);
    const slim = h.query<HTMLInputElement>('input[value="slim"]', editor);
    assert.equal(reveal.getAttribute('aria-hidden'), 'true');
    assert.equal(reveal.hasAttribute('inert'), true);
    assert.equal(reveal.classList.contains('is-visible'), false);
    assert.equal(wide.checked, true, 'Wide is the internal default before import');
    assert.equal(slim.checked, false);
    assert.equal(wide.disabled, true);
    assert.equal(slim.disabled, true);
    h.names('AutomaticSlim');
    await h.upload('slim.png');
    assert.deepEqual(calls, [undefined], 'upload processing requests automatic model detection');
    assert.equal(reveal.getAttribute('aria-hidden'), 'true', 'unfinished decoding must not reveal model controls');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', editor).disabled, true);
    image.resolve(decoded(new File([], 'slim.png'), 'slim'));
    await flush();
    assert.equal(reveal.getAttribute('aria-hidden'), 'false');
    assert.equal(reveal.hasAttribute('inert'), false);
    assert.equal(reveal.classList.contains('is-visible'), true);
    assert.equal(wide.disabled, false);
    assert.equal(slim.disabled, false);
    assert.equal(wide.checked, false);
    assert.equal(slim.checked, true);
    assert.equal(editor.querySelectorAll('input[type="radio"]:checked').length, 1);
    h.commit();
    assert.equal(h.query('.skin-row-meta').textContent, 'Slim');
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'slim', 'automatic choice reaches the generated addon');
  }, { decodeSkin: async (_file, model) => { calls.push(model); return image.promise; } });
});

test('a manual model override remains visible and persists through name edits, selection changes, and export', async () => {
  const calls: { file: string; model: SkinModel | undefined }[] = [];
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('FirstPlayer'); await h.upload('first.png');
    assert.equal(h.query<HTMLInputElement>('input[value="slim"]', h.active()).checked, true);
    await h.model('wide');
    assert.equal(h.query('.model-reveal', h.active()).classList.contains('is-visible'), true);
    assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).checked, true);
    assert.match(h.query<HTMLImageElement>('.skin-preview', h.active()).src, /first\.png-wide$/);
    const callsBeforeName = calls.length;
    h.names('RenamedPlayer');
    assert.equal(calls.length, callsBeforeName, 'editing a name must not run detection again');
    h.commit();
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('SecondPlayer'); await h.upload('second.png'); h.commit();
    h.select(0);
    assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).checked, true);
    assert.equal(h.query('.skin-row-meta').textContent, 'Wide');
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.deepEqual(h.exported[0].map(skin => ({ model: skin.model, names: skin.names })), [
      { model: 'wide', names: ['RenamedPlayer'] }, { model: 'slim', names: ['SecondPlayer'] }
    ]);
    assert.deepEqual([...h.exported[0][0].iconPng], [2, 4], 'exported icon matches the manual Wide choice');
    assert.deepEqual(calls, [
      { file: 'first.png', model: undefined }, { file: 'first.png', model: 'wide' },
      { file: 'second.png', model: undefined }
    ]);
  }, { decodeSkin: async (file, model) => {
    calls.push({ file: file.name, model });
    return decoded(file, model ?? 'slim');
  } });
});

test('replacing a skin detects its model again instead of carrying over the manual override', async () => {
  const replacement = deferred<ReturnType<typeof decoded>>();
  const calls: (SkinModel | undefined)[] = [];
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('ReplacementPlayer'); await h.upload('first.png');
    await h.model('wide');
    h.commit();
    await h.upload('replacement.png');
    assert.equal(h.query('.model-reveal', h.active()).getAttribute('aria-hidden'), 'true');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true, 'an unfinished replacement cannot be exported');
    replacement.resolve(decoded(new File([], 'replacement.png'), 'slim')); await flush();
    assert.equal(h.query<HTMLInputElement>('input[value="slim"]', h.active()).checked, true);
    assert.equal(h.query('.skin-row-meta').textContent, 'Slim');
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'slim');
    assert.deepEqual(calls, [undefined, 'wide', undefined]);
  }, { decodeSkin: async (file, model) => {
    calls.push(model);
    return file.name === 'replacement.png' ? replacement.promise : decoded(file, model ?? 'slim');
  } });
});

test('a late manual-model icon cannot overwrite a newer manual selection', async () => {
  const previousChoice = deferred<ReturnType<typeof decoded>>();
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('ChangedMyMind'); await h.upload('skin.png');
    await h.model('slim');
    assert.equal(h.query('.model-reveal', h.active()).getAttribute('aria-hidden'), 'false', 'model controls stay visible while rebuilding the icon');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    await h.model('wide');
    assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).checked, true);
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, false);
    previousChoice.resolve(decoded(new File([], 'skin.png'), 'slim')); await flush();
    assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).checked, true);
    assert.match(h.query<HTMLImageElement>('.skin-preview', h.active()).src, /skin\.png-wide$/);
    assert.ok(h.revoked.includes('blob:icon-skin.png-slim'));
    h.commit();
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported[0][0].model, 'wide');
  }, { decodeSkin: async (file, model) => model === 'slim' ? previousChoice.promise : decoded(file, model ?? 'wide') });
});

test('invalid uploads do not reveal model controls or enable Add', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('InvalidUpload');
    for (const file of ['not-a-skin.txt', 'corrupt.png']) {
      await h.upload(file);
      const reveal = h.query('.model-reveal', h.active());
      assert.equal(reveal.getAttribute('aria-hidden'), 'true');
      assert.equal(reveal.classList.contains('is-visible'), false);
      assert.equal(reveal.hasAttribute('inert'), true);
      assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).disabled, true);
      assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    }
  }, { decodeSkin: async () => { throw new Error('The selected file is not a valid PNG image.'); } });
});

test('individual icon downloads use the same named-file pattern and collision suffixes as the addon', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); await h.upload('source.png'); await h.model('slim');
    h.names('s001');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 's001.png', 'original filenames occupy a separate folder');
    h.names('My Player');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 'my_player.png');
    h.commit();
    h.query<HTMLButtonElement>('#add-skin').click(); await h.upload('other.png'); await h.model('slim'); h.names('MY_PLAYER');
    assert.equal(h.query<HTMLAnchorElement>('.download-icon', h.active()).download, 'my_player_2.png');
  });
});

test('an uploaded PNG and model still require a valid nonempty name before adding', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    await h.upload('no-name.png'); await h.model('slim');
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    assert.equal(add.disabled, true);
    h.names('  ,  '); assert.equal(add.disabled, true);
    h.names('x'.repeat(65)); assert.equal(add.disabled, true);
    h.names('ValidPlayer'); assert.equal(add.disabled, false);
    h.names(''); assert.equal(add.disabled, true);
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
  });
});

test('Add stays disabled until the reserved-name policy has loaded', async () => {
  const metadata = deferred<Response>();
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
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
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('FirstPlayer'); await h.upload('first.png'); h.commit();
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('SecondPlayer'); await h.upload('second.png'); await h.model('slim'); h.commit();
    h.select(0);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'FirstPlayer');
    assert.equal(h.query<HTMLInputElement>('input[value="wide"]', h.active()).checked, true);
    assert.match(h.query('.file-name', h.active()).textContent ?? '', /first\.png/);
    h.names('RenamedPlayer'); await h.upload('replacement.png'); await h.model('slim');
    h.select(1);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'SecondPlayer');
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('UnfinishedPlayer');
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 2);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 1);
    assert.deepEqual(h.exported[0].map(skin => ({ names: skin.names, model: skin.model })), [
      { names: ['RenamedPlayer'], model: 'slim' }, { names: ['SecondPlayer'], model: 'slim' }
    ]);
    assert.deepEqual([...h.exported[0][0].texturePng], [1, 'replacement.png'.length]);
  });
});

test('reserved existing names are rejected case-insensitively before adding and during edits', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); await h.upload('protected.png');
    const add = h.query<HTMLButtonElement>('.commit-skin', h.active());
    for (const name of ['DARK7MC', 'dark7mc', 'Urban7mc', 'dReAm', 'STEVE', 'alex', 'NormalPlayer, DREAM']) {
      h.names(name);
      assert.equal(add.disabled, true, name + ' must not override a bundled special name');
      assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).getAttribute('aria-invalid'), 'true');
    }
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    h.names('OriginalPlayer'); h.commit();
    h.names('URBAN7MC');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
    h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 0);
    h.names('OriginalPlayer');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, false);
  });
});

test('duplicate names block adding a draft and block exporting conflicting edits', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('SamePlayer'); await h.upload('one.png'); h.commit();
    h.query<HTMLButtonElement>('#add-skin').click();
    h.names('SamePlayer'); await h.upload('two.png'); await h.model('slim');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 1);
    h.names('DifferentPlayer'); h.commit();
    h.names('SamePlayer');
    assert.equal(h.query<HTMLButtonElement>('#generate').disabled, true);
    h.names('DifferentPlayer'); h.query<HTMLButtonElement>('#generate').click(); await flush();
    assert.equal(h.exported.length, 1);
  });
});

test('new-skin navigation resumes the existing draft rather than creating list entries', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('DraftInProgress');
    const editor = h.active();
    h.query<HTMLButtonElement>('#add-skin').click();
    assert.equal(h.active().id, editor.id);
    assert.equal(h.editors().length, 1);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'DraftInProgress');
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
  });
});

test('cancelling a draft releases its images and leaves a compact empty state with no Undo', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-first-skin').click();
    h.names('CancelMe'); await h.upload('cancel.png');
    assert.equal(h.query('#editor-remove').classList.contains('is-removal'), false, 'draft cancellation has its own button style');
    h.query<HTMLButtonElement>('#editor-remove').click();
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    assert.equal(h.query<HTMLElement>('#editor-empty').hidden, false);
    assert.equal(h.editors().length, 0);
    assert.equal(Boolean(h.document.querySelector('#editor-empty > svg')), false);
    assert.equal(Boolean(h.document.querySelector('#undo-remove')), false);
    assert.ok(h.revoked.includes('blob:face-cancel.png'));
    assert.ok(h.revoked.includes('blob:icon-cancel.png-wide'));
  });
});

test('removing an unselected added skin keeps the current editor selected', async () => {
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('FirstPlayer'); await h.upload('one.png'); h.commit();
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('SecondPlayer'); await h.upload('two.png'); await h.model('slim'); h.commit();
    assert.equal(h.query('#editor-remove').classList.contains('is-removal'), true, 'added skins use the transparent removal control');
    h.query<HTMLButtonElement>('#skin-list .remove-list-skin').click();
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 1);
    assert.equal(h.query<HTMLInputElement>('input[type="text"]', h.active()).value, 'SecondPlayer');
  });
});

test('a late icon result cannot overwrite a replacement skin or prematurely enable Add', async () => {
  const old = deferred<ReturnType<typeof decoded>>();
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); h.names('LatestSkin');
    await h.upload('old.png');
    assert.equal(h.query<HTMLButtonElement>('.commit-skin', h.active()).disabled, true);
    await h.upload('new.png');
    assert.equal(h.query<HTMLImageElement>('.skin-preview', h.active()).getAttribute('src'), 'blob:icon-new.png-slim');
    old.resolve(decoded(new File([], 'old.png'), 'wide')); await flush();
    assert.equal(h.query<HTMLImageElement>('.skin-preview', h.active()).getAttribute('src'), 'blob:icon-new.png-slim');
    assert.equal(h.query<HTMLInputElement>('input[value="slim"]', h.active()).checked, true, 'stale automatic detection must not change the newer model');
    assert.ok(h.revoked.includes('blob:icon-old.png-wide'));
    h.commit(); assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 1);
  }, { decodeSkin: async (file, model) => file.name === 'old.png' ? old.promise : decoded(file, model ?? 'slim') });
});

test('a late face result cannot resurrect a cancelled draft', async () => {
  const face = deferred<string>();
  await withWorkbench(async h => {
    h.query<HTMLButtonElement>('#add-skin').click(); await h.upload('cancelled.png');
    h.query<HTMLButtonElement>('#editor-remove').click();
    face.resolve('blob:face-cancelled.png'); await flush();
    assert.equal(h.document.querySelectorAll('#skin-list .skin-select').length, 0);
    assert.equal(h.editors().length, 0);
    assert.ok(h.revoked.includes('blob:face-cancelled.png'));
  }, { decodeSkinFace: async () => face.promise });
});
