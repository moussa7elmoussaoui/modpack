import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setupTheme } from '../src/theme';

class SelectStub extends EventTarget {
  value = '';
  choose(value: string) {
    this.value = value;
    this.dispatchEvent(new Event('change'));
  }
}

class MediaStub extends EventTarget {
  constructor(public matches: boolean) { super(); }
  change(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

function withTheme(
  options: { saved?: string | null; systemDark?: boolean; storageBlocked?: boolean },
  run: (environment: {
    select: SelectStub;
    media: MediaStub;
    root: { dataset: Record<string, string>; style: { colorScheme: string } };
    meta: { content: string };
    saved: () => string | null;
    storage: (key: string | null, newValue: string | null) => void;
    dispose: () => void;
  }) => void,
) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let saved = options.saved ?? null;
  const root = { dataset: {} as Record<string, string>, style: { colorScheme: '' } };
  const meta = { content: '', setAttribute(_name: string, content: string) { this.content = content; } };
  const select = new SelectStub();
  const media = new MediaStub(options.systemDark ?? false);
  const windowStub = Object.assign(new EventTarget(), {
    localStorage: {
      getItem(key: string) {
        assert.equal(key, 'skinlink-theme');
        if (options.storageBlocked) throw new Error('Storage is blocked');
        return saved;
      },
      setItem(key: string, value: string) {
        assert.equal(key, 'skinlink-theme');
        if (options.storageBlocked) throw new Error('Storage is blocked');
        saved = value;
      },
    },
    matchMedia(query: string) {
      assert.equal(query, '(prefers-color-scheme: dark)');
      return media;
    },
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: windowStub });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { documentElement: root, querySelector: () => meta },
  });
  let dispose = () => {};
  try {
    dispose = setupTheme(select as unknown as HTMLSelectElement);
    run({
      select, media, root, meta, saved: () => saved, dispose,
      storage: (key, newValue) => {
        const event = Object.assign(new Event('storage'), { key, newValue });
        windowStub.dispatchEvent(event);
      },
    });
  } finally {
    dispose();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
}

test('a remembered choice takes precedence over the operating system and updates browser chrome', () => {
  withTheme({ saved: 'light', systemDark: true }, ({ select, media, root, meta, saved }) => {
    assert.equal(select.value, 'light');
    assert.equal(root.dataset.theme, 'light');
    assert.equal(root.style.colorScheme, 'light');
    assert.equal(meta.content, '#f2f4f5');
    media.change(false);
    media.change(true);
    assert.equal(root.dataset.theme, 'light');
    select.choose('dark');
    assert.equal(root.dataset.theme, 'dark');
    assert.equal(root.style.colorScheme, 'dark');
    assert.equal(meta.content, '#171b1e');
    assert.equal(saved(), 'dark');
  });
});

test('System follows appearance changes and can be restored after an explicit choice', () => {
  withTheme({ saved: 'unrecognized', systemDark: false }, ({ select, media, root, saved }) => {
    assert.equal(select.value, 'system');
    assert.equal(root.dataset.theme, 'light');
    media.change(true);
    assert.equal(root.dataset.theme, 'dark');
    select.choose('light');
    media.change(false);
    media.change(true);
    assert.equal(root.dataset.theme, 'light');
    select.choose('system');
    assert.equal(saved(), 'system');
    assert.equal(root.dataset.theme, 'dark');
    media.change(false);
    assert.equal(root.dataset.theme, 'light');
  });
});

test('blocked browser storage does not prevent theme changes for the current visit', () => {
  withTheme({ storageBlocked: true, systemDark: true }, ({ select, media, root }) => {
    assert.equal(select.value, 'system');
    assert.equal(root.dataset.theme, 'dark');
    assert.doesNotThrow(() => select.choose('light'));
    assert.equal(root.dataset.theme, 'light');
    media.change(false);
    media.change(true);
    assert.equal(root.dataset.theme, 'light');
    select.choose('system');
    assert.equal(root.dataset.theme, 'dark');
  });
});

test('other tabs synchronize the theme preference and clearing storage restores System', () => {
  withTheme({ saved: 'light', systemDark: true }, ({ select, root, storage }) => {
    storage('another-setting', 'dark');
    assert.equal(root.dataset.theme, 'light');
    storage('skinlink-theme', 'dark');
    assert.equal(select.value, 'dark');
    assert.equal(root.dataset.theme, 'dark');
    storage(null, null);
    assert.equal(select.value, 'system');
    assert.equal(root.dataset.theme, 'dark');
    storage('skinlink-theme', 'light');
    assert.equal(root.dataset.theme, 'light');
  });
});

test('cleanup disconnects selection, system, and cross-tab listeners', () => {
  withTheme({ systemDark: false }, ({ select, media, root, storage, saved, dispose }) => {
    dispose();
    select.choose('dark');
    media.change(true);
    storage('skinlink-theme', 'dark');
    assert.equal(root.dataset.theme, 'light');
    assert.equal(saved(), null);
  });
});
