import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Window as DOMWindow } from 'happy-dom';
import { setupThemeMenu } from '../src/theme-menu';

function withMenu(run: (environment: {
  document: Document;
  host: HTMLElement;
  trigger: HTMLButtonElement;
  menu: HTMLElement;
  select: HTMLSelectElement;
  option: (value: string) => HTMLButtonElement;
  key: (element: HTMLElement, key: string) => KeyboardEvent;
  storage: (value: string | null) => void;
  system: (dark: boolean) => void;
  pointerOutside: () => void;
  dispose: () => void;
}) => void, saved = 'system') {
  const dom = new DOMWindow({ url: 'http://skinlink.test/' });
  const document = dom.document as unknown as Document;
  document.head.innerHTML = '<meta name="theme-color" content="#f2f4f5">';
  document.body.innerHTML = `
    <span id="theme-label">Theme</span>
    <div id="theme-dropdown" class="theme-dropdown" data-open="false">
      <button id="theme-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="theme-menu" aria-labelledby="theme-label theme-current"><span id="theme-current">System</span></button>
      <div id="theme-menu" role="listbox" aria-labelledby="theme-label" aria-hidden="true" inert>
        <button type="button" role="option" tabindex="-1" data-theme-value="system">System<span aria-hidden="true">✓</span></button>
        <button type="button" role="option" tabindex="-1" data-theme-value="light">Light<span aria-hidden="true">✓</span></button>
        <button type="button" role="option" tabindex="-1" data-theme-value="dark">Dark<span aria-hidden="true">✓</span></button>
      </div>
    </div>
    <select id="theme-preference" hidden><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
    <button id="outside" type="button">Outside</button>`;
  const media = Object.assign(new dom.EventTarget(), { matches: false });
  Object.defineProperty(dom, 'matchMedia', { value: () => media });
  dom.localStorage.setItem('skinlink-theme', saved);
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: dom });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  const host = document.querySelector<HTMLElement>('#theme-dropdown')!;
  const trigger = document.querySelector<HTMLButtonElement>('#theme-trigger')!;
  const menu = document.querySelector<HTMLElement>('#theme-menu')!;
  const select = document.querySelector<HTMLSelectElement>('#theme-preference')!;
  let dispose = () => {};
  try {
    dispose = setupThemeMenu(select, host);
    run({ document, host, trigger, menu, select, dispose,
      option: value => menu.querySelector<HTMLButtonElement>(`[data-theme-value="${value}"]`)!,
      key: (element, key) => {
        const event = new dom.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        element.dispatchEvent(event as unknown as Event);
        return event as unknown as KeyboardEvent;
      },
      storage: newValue => { dom.dispatchEvent(new dom.StorageEvent('storage', { key: 'skinlink-theme', newValue: newValue ?? undefined })); },
      system: dark => { media.matches = dark; media.dispatchEvent(new dom.Event('change')); },
      pointerOutside: () => document.body.dispatchEvent(new dom.PointerEvent('pointerdown', { bubbles: true }) as unknown as Event),
    });
  } finally {
    dispose();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else Reflect.deleteProperty(globalThis, 'document');
  }
}

test('theme picker opens at the selected option and applies a clicked choice', () => {
  withMenu(({ document, host, trigger, menu, select, option }) => {
    assert.equal(document.querySelector('#theme-current')!.textContent, 'Dark');
    assert.equal(option('dark').getAttribute('aria-selected'), 'true');
    assert.equal(menu.hasAttribute('inert'), true);
    trigger.click();
    assert.equal(host.dataset.open, 'true');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.getAttribute('aria-hidden'), 'false');
    assert.equal(menu.hasAttribute('inert'), false);
    assert.equal(document.activeElement === option('dark'), true);
    option('light').click();
    assert.equal(select.value, 'light');
    assert.equal(document.documentElement.dataset.theme, 'light');
    assert.equal(document.querySelector('#theme-current')!.textContent, 'Light');
    assert.equal(option('light').getAttribute('aria-selected'), 'true');
    assert.equal(host.dataset.open, 'false');
    assert.equal(menu.getAttribute('aria-hidden'), 'true');
    assert.equal(menu.hasAttribute('inert'), true);
    assert.equal(document.activeElement === trigger, true);
  }, 'dark');
});

test('theme picker supports arrows, endpoints, typeahead, Enter and Escape', () => {
  withMenu(({ document, host, trigger, option, key, select }) => {
    key(trigger, 'ArrowDown');
    assert.equal(document.activeElement === option('system'), true);
    key(option('system'), 'ArrowDown');
    assert.equal(document.activeElement === option('light'), true);
    key(option('light'), 'End');
    assert.equal(document.activeElement === option('dark'), true);
    key(option('dark'), 'Home');
    assert.equal(document.activeElement === option('system'), true);
    key(option('system'), 'd');
    assert.equal(document.activeElement === option('dark'), true);
    key(option('dark'), 'Enter');
    assert.equal(select.value, 'dark');
    key(trigger, 'ArrowUp');
    key(option('dark'), 'Escape');
    assert.equal(host.dataset.open, 'false');
    assert.equal(select.value, 'dark', 'Escape does not alter the preference');
    assert.equal(document.activeElement === trigger, true);
  });
});

test('Tab, outside clicks and focus leaving dismiss the picker without trapping focus', () => {
  withMenu(({ document, host, trigger, option, key, pointerOutside }) => {
    trigger.click();
    const tab = key(option('system'), 'Tab');
    assert.equal(tab.defaultPrevented, false);
    assert.equal(host.dataset.open, 'false');
    trigger.click(); pointerOutside();
    assert.equal(host.dataset.open, 'false');
    trigger.click();
    const outside = document.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    assert.equal(host.dataset.open, 'false');
    assert.equal(document.activeElement === outside, true);
  });
});

test('theme picker stays synchronized with System appearance and changes from another tab', () => {
  withMenu(({ document, select, option, system, storage }) => {
    system(true);
    assert.equal(document.documentElement.dataset.theme, 'dark');
    assert.equal(document.querySelector('#theme-current')!.textContent, 'System');
    storage('light');
    assert.equal(select.value, 'light');
    assert.equal(document.querySelector('#theme-current')!.textContent, 'Light');
    assert.equal(option('light').getAttribute('aria-selected'), 'true');
    storage(null);
    assert.equal(select.value, 'system');
    assert.equal(document.querySelector('#theme-current')!.textContent, 'System');
    assert.equal(document.documentElement.dataset.theme, 'dark');
  });
});

test('theme picker cleanup removes interaction and theme listeners', () => {
  withMenu(({ document, host, trigger, option, select, storage, dispose }) => {
    trigger.click(); dispose();
    assert.equal(host.dataset.open, 'false');
    trigger.click();
    assert.equal(host.dataset.open, 'false');
    option('dark').click(); storage('dark');
    assert.equal(select.value, 'system');
    assert.equal(document.documentElement.dataset.theme, 'light');
  });
});
