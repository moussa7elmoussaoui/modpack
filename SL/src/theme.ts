export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'skinlink-theme';

function normalizePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

/** Keeps the selected preference, operating-system appearance, and browser chrome in sync. */
export function setupTheme(select: HTMLSelectElement, onPreferenceChange?: (preference: ThemePreference) => void): () => void {
  let preference: ThemePreference = 'system';
  try {
    preference = normalizePreference(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Theme switching remains available when storage is blocked.
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const apply = () => {
    const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    themeColor?.setAttribute('content', theme === 'dark' ? '#171b1e' : '#f2f4f5');
    select.value = preference;
    onPreferenceChange?.(preference);
  };

  const onSelectionChange = () => {
    preference = normalizePreference(select.value);
    apply();
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // The current tab can still use the selected theme for this visit.
    }
  };
  const onSystemChange = () => {
    if (preference === 'system') apply();
  };
  const onStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    preference = normalizePreference(event.newValue);
    apply();
  };

  select.addEventListener('change', onSelectionChange);
  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorageChange);
  apply();

  return () => {
    select.removeEventListener('change', onSelectionChange);
    media.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorageChange);
  };
}
