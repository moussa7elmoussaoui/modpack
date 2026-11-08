import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Window as DOMWindow } from 'happy-dom';
import { setupThemeToggle } from '../src/theme-toggle';

function withToggle(run: (environment: {
  button: HTMLButtonElement; select: HTMLSelectElement; document: Document;
  storage: (preference: string | null) => void; system: (dark: boolean) => void;
  saved: () => string | null; dispose: () => void;
}) => void, saved = 'system', dark = false) {
  const dom = new DOMWindow({ url: 'http://skinlink.test/' });
  const document = dom.document as unknown as Document;
  document.head.innerHTML = '<meta name="theme-color">';
  document.body.innerHTML = '<button id="toggle" type="button"></button><select hidden><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>';
  const media = Object.assign(new dom.EventTarget(), { matches: dark });
  Object.defineProperty(dom, 'matchMedia', { value: () => media });
  dom.localStorage.setItem('skinlink-theme', saved);
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: dom });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  const button = document.querySelector<HTMLButtonElement>('button')!;
  const select = document.querySelector<HTMLSelectElement>('select')!;
  let dispose = () => {};
  try {
    dispose = setupThemeToggle(select, button);
    run({ button, select, document, dispose,
      saved: () => dom.localStorage.getItem('skinlink-theme'),
      storage: newValue => dom.dispatchEvent(new dom.StorageEvent('storage', { key: 'skinlink-theme', newValue: newValue ?? undefined })),
      system: dark => { media.matches = dark; media.dispatchEvent(new dom.Event('change')); },
    });
  } finally {
    dispose();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
}

test('the icon button toggles the effective theme, updates its accessible action, and saves the choice', () => {
  withToggle(({ button, document, select, saved }) => {
    assert.equal(button.dataset.theme, 'light');
    assert.equal(button.getAttribute('aria-label'), 'Switch to dark mode');
    button.click();
    assert.equal(document.documentElement.dataset.theme, 'dark');
    assert.equal(button.dataset.theme, 'dark');
    assert.equal(button.getAttribute('aria-label'), 'Switch to light mode');
    assert.equal(button.title, 'Switch to light mode');
    assert.equal(select.value, 'dark'); assert.equal(saved(), 'dark');
    button.click();
    assert.equal(document.documentElement.dataset.theme, 'light');
    assert.equal(saved(), 'light');
  });
});

test('a saved theme controls the initial icon and the next click', () => {
  withToggle(({ button, document }) => {
    assert.equal(button.dataset.theme, 'dark');
    button.click();
    assert.equal(document.documentElement.dataset.theme, 'light');
  }, 'dark');
});

test('device appearance and other-tab changes keep the icon synchronized', () => {
  withToggle(({ button, document, system, storage }) => {
    system(true);
    assert.equal(button.dataset.theme, 'dark');
    button.click();
    system(false); system(true);
    assert.equal(button.dataset.theme, 'light', 'an explicit choice takes precedence over the device');
    storage('dark'); assert.equal(button.dataset.theme, 'dark');
    storage(null); system(false);
    assert.equal(button.dataset.theme, 'light');
    assert.equal(document.documentElement.dataset.theme, 'light');
  });
});

test('cleanup disconnects the toggle and preference listeners', () => {
  withToggle(({ button, document, storage, system, dispose }) => {
    dispose(); button.click(); storage('dark'); system(true);
    assert.equal(button.dataset.theme, 'light');
    assert.equal(document.documentElement.dataset.theme, 'light');
  });
});
