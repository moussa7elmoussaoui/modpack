import { setupTheme, type ThemePreference } from './theme';

const labels: Record<ThemePreference, string> = { system: 'System', light: 'Light', dark: 'Dark' };

/** An accessible theme picker whose open/close motion is controlled by CSS. */
export function setupThemeMenu(select: HTMLSelectElement, host: HTMLElement): () => void {
  const doc = host.ownerDocument, win = doc.defaultView!;
  const trigger = host.querySelector<HTMLButtonElement>('#theme-trigger')!;
  const menu = host.querySelector<HTMLElement>('#theme-menu')!;
  const current = host.querySelector<HTMLElement>('#theme-current')!;
  const options = [...menu.querySelectorAll<HTMLButtonElement>('[role="option"][data-theme-value]')];
  let open = false;

  const sync = (preference: ThemePreference) => {
    current.textContent = labels[preference];
    for (const option of options) option.setAttribute('aria-selected', String(option.dataset.themeValue === preference));
  };
  const setOpen = (next: boolean, restoreFocus = false) => {
    open = next;
    host.dataset.open = String(open);
    trigger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.toggleAttribute('inert', !open);
    if (!open && restoreFocus) trigger.focus();
  };
  const show = (index = options.findIndex(option => option.dataset.themeValue === select.value)) => {
    setOpen(true);
    options[Math.max(0, index)]?.focus();
  };
  const choose = (option: HTMLButtonElement) => {
    const value = option.dataset.themeValue;
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    select.value = value;
    select.dispatchEvent(new win.Event('change', { bubbles: true }));
    setOpen(false, true);
  };
  const onTriggerClick = () => open ? setOpen(false, true) : show();
  const onTriggerKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); show();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); show(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault(); setOpen(false, true);
    }
  };
  const onOptionClick = (event: Event) => {
    const option = options.find(option => option === event.currentTarget);
    if (option) choose(option);
  };
  const onMenuKey = (event: KeyboardEvent) => {
    if (!open) return;
    const index = options.findIndex(option => option === doc.activeElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next >= 0) {
      event.preventDefault(); options[next]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); if (index >= 0) choose(options[index]);
    } else if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); setOpen(false, true);
    } else if (event.key === 'Tab') {
      // Put focus back at the trigger so the browser's normal tab order continues.
      setOpen(false, true);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const match = options.find(option => labels[option.dataset.themeValue as ThemePreference]?.toLowerCase().startsWith(event.key.toLowerCase()));
      if (match) { event.preventDefault(); match.focus(); }
    }
  };
  const onOutsidePointer = (event: PointerEvent) => {
    if (open && event.target instanceof win.Node && !host.contains(event.target)) setOpen(false);
  };
  const onFocusOut = (event: FocusEvent) => {
    if (open && (!event.relatedTarget || (event.relatedTarget instanceof win.Node && !host.contains(event.relatedTarget)))) setOpen(false);
  };

  const cleanupTheme = setupTheme(select, sync);
  setOpen(false);
  trigger.addEventListener('click', onTriggerClick);
  trigger.addEventListener('keydown', onTriggerKey);
  menu.addEventListener('keydown', onMenuKey);
  host.addEventListener('focusout', onFocusOut);
  doc.addEventListener('pointerdown', onOutsidePointer);
  for (const option of options) option.addEventListener('click', onOptionClick);
  return () => {
    setOpen(false);
    cleanupTheme();
    trigger.removeEventListener('click', onTriggerClick);
    trigger.removeEventListener('keydown', onTriggerKey);
    menu.removeEventListener('keydown', onMenuKey);
    host.removeEventListener('focusout', onFocusOut);
    doc.removeEventListener('pointerdown', onOutsidePointer);
    for (const option of options) option.removeEventListener('click', onOptionClick);
  };
}
