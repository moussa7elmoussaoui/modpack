import { setupTheme } from './theme';

/** Follow the device initially, then remember the theme chosen with the icon button. */
export function setupThemeToggle(select: HTMLSelectElement, button: HTMLButtonElement): () => void {
  const doc = button.ownerDocument;
  const sync = () => {
    const theme = doc.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    button.dataset.theme = theme;
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  const cleanupTheme = setupTheme(select, sync);
  const toggle = () => {
    select.value = doc.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    select.dispatchEvent(new doc.defaultView!.Event('change', { bubbles: true }));
  };
  button.addEventListener('click', toggle);
  return () => { button.removeEventListener('click', toggle); cleanupTheme(); };
}
