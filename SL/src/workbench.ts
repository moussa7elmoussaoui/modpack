import { decodeSkin, decodeSkinFace, loadIconTemplates } from './lib/icons';
import { generateAddon, type SkinInput, type SkinModel } from './lib/addon';
import { parseNames, validateAssignments } from './lib/validation';
import { setupThemeToggle } from './theme-toggle';
import { isReservedPlayerName } from './lib/name-policy';
import { allocatePlayerAssetPaths } from './lib/player-assets';

export interface WorkbenchServices {
  assetRoot: string;
  fetch: typeof fetch;
  decodeSkin: typeof decodeSkin;
  decodeSkinFace: typeof decodeSkinFace;
  loadIconTemplates: typeof loadIconTemplates;
  generateAddon: typeof generateAddon;
}
type DecodedSkin = Awaited<ReturnType<typeof decodeSkin>>;
interface SkinEntry {
  id: string;
  file: File | null;
  model: SkinModel | '';
  names: string;
  faceUrl: string;
  decoded: DecodedSkin | null;
  processing: boolean;
  readingFace: boolean;
  fileError: string;
  iconError: string;
  notice: string;
  revision: number;
  faceRevision: number;
  validationShown: boolean;
  element: HTMLElement;
  row: HTMLElement;
}

const upload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 14v6h16v-6"/></svg>';
const plus = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>';
const download = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>';
const trash = '<svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="trash-lid"><path d="M4 7h16M9 7V4h6v3"/></g><g class="trash-body"><path d="M6 7h12l-1 14H7ZM10 10v7m4-7v7"/></g></svg>';
const face = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16v16H4zM8 9h2v2H8zm6 0h2v2h-2zM8 16h8"/></svg>';
const player = '<svg class="placeholder-player" viewBox="0 0 64 96" aria-hidden="true"><path fill="currentColor" d="M20 2h24v24H20zM17 29h30v36H17zM3 29h11v36H3zm47 0h11v36H50zM17 68h13v26H17zm17 0h13v26H34z"/></svg>';

export function mountWorkbench(app: HTMLElement, overrides: Partial<WorkbenchServices> = {}): () => void {
  const services: WorkbenchServices = { assetRoot: '/', fetch: (...args) => fetch(...args), decodeSkin, decodeSkinFace, loadIconTemplates, generateAddon, ...overrides };
  const doc = app.ownerDocument;
  const win = doc.defaultView!;
  app.innerHTML = `
    <header class="site-header"><div class="header-inner">
      <a class="brand" href="${services.assetRoot}" aria-label="SkinLink home"><img class="brand-face" src="${services.assetRoot}assets/brand-face.png" alt="" width="40" height="40"><span>SkinLink<span class="brand-dot">.</span></span></a>
      <div class="header-actions"><div class="local-badge"><span class="status-dot"></span>Made in your browser</div><button id="theme-toggle" class="theme-toggle" type="button" aria-label="Switch to dark mode" title="Switch to dark mode"><svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg><svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg></button><select id="theme-preference" hidden aria-hidden="true" tabindex="-1"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
    </div></header>
    <main class="page-shell">
      <section class="page-intro"><div><p class="eyebrow">YOUR PLAYER SKIN WORKBENCH</p><h1>Your skins. One addon.</h1></div><p class="intro-copy">Build your lineup, link player names, and make it yours.</p></section>
      <div class="workspace">
        <aside class="skin-sidebar" aria-labelledby="skins-heading">
          <div class="sidebar-heading"><h2 id="skins-heading">Your skins</h2><span class="count-pill" id="entry-count">0</span></div>
          <button id="add-skin" class="add-skin" type="button">${plus}<span>New skin</span></button>
          <ul id="skin-list" class="skin-list" aria-label="Added skins"></ul>
          <p id="list-empty" class="list-empty" hidden>No skins added yet. Complete a skin, then click Add to list.</p>
          <p class="sidebar-note">Select a skin to edit it. Your files and player names stay in this browser tab.</p>
        </aside>
        <div class="workspace-main">
          <section class="editor-panel" aria-labelledby="selected-title">
            <div class="editor-heading"><div><h2 id="selected-title">Skin details</h2><p id="selected-description">Choose a PNG, its model, and the player names it belongs to.</p></div><button id="editor-remove" class="text-button editor-remove" type="button">${trash}<span>Remove</span></button></div>
            <div id="skin-editors"></div>
            <div id="editor-empty" class="editor-empty" hidden><h3>Add your first skin</h3><p>Choose a PNG, then set its player model and player name.</p><button id="add-first-skin" class="add-skin" type="button">${plus}Add skin</button></div>
          </section>
          <section class="export-panel" aria-labelledby="export-heading">
            <div class="export-heading"><h2 id="export-heading">Your addon, ready to play.</h2><p>The complete addon with every skin in your lineup.</p><dl class="pack-summary"><div><dt>Ready skins</dt><dd id="summary-skins">0</dd></div><div><dt>Player names</dt><dd id="summary-names">0</dd></div></dl></div>
            <div class="export-actions"><button id="generate" class="generate-button" type="button" disabled>${download}<span>Download addon</span></button><p id="export-hint" class="export-hint">Download the addon, or add skins to customize it.</p></div>
            <div id="base-status" class="base-status" role="status"><span class="status-dot loading-dot"></span><span id="base-status-text">Preparing the base addon…</span><button id="retry-base" type="button" hidden>Retry</button></div>
            <div id="export-feedback" class="export-feedback" role="status" aria-live="polite" hidden></div><a id="download-again" class="download-again" hidden>Download addon again ${download}</a>
          </section>
        </div>
      </div>
      <footer class="page-footer"><span>SkinLink · Made for your next adventure.</span><span>For Minecraft Bedrock Edition</span></footer>
    </main>`;
  const byId = <T extends HTMLElement = HTMLElement>(id: string) => app.querySelector<T>(`#${id}`)!;
  const cleanupTheme = setupThemeToggle(byId<HTMLSelectElement>('theme-preference'), byId<HTMLButtonElement>('theme-toggle'));
  const entries: SkinEntry[] = [];
  let draft: SkinEntry | null = null;
  let selected: SkinEntry | null = null;
  let sequence = 0, baseRevision = 0;
  let base: Uint8Array | null = null;
  let templatesReady = false, busy = false, disposed = false;
  let reservedNames: string[] | null = null;
  let basePlayerAssetPaths: string[] = [];
  let exportUrl = '';
  const feedback = byId('export-feedback'), again = byId<HTMLAnchorElement>('download-again');
  const generate = byId<HTMLButtonElement>('generate');
  const q = <T extends HTMLElement = HTMLElement>(entry: SkinEntry, selector: string) => entry.element.querySelector<T>(selector)!;
  const title = (entry: SkinEntry) => parseNames(entry.names)[0] || entry.file?.name.replace(/\.png$/i, '') || `Skin ${entry.id.slice(3)}`;
  const working = (entry: SkinEntry) => entry.processing || entry.readingFace;
  const allEntries = () => draft ? [...entries, draft] : entries;
  const active = (entry: SkinEntry) => !disposed && (entries.includes(entry) || draft === entry);
  const revoke = (url: string | undefined) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); };
  function clearIcon(entry: SkinEntry) { revoke(entry.decoded?.iconUrl); entry.decoded = null; }
  function disposeEntry(entry: SkinEntry) { entry.revision++; entry.faceRevision++; clearIcon(entry); revoke(entry.faceUrl); entry.faceUrl = ''; }
  function clearExport() {
    revoke(exportUrl); exportUrl = ''; again.hidden = true; again.removeAttribute('href');
    feedback.hidden = true; feedback.textContent = '';
  }
  function setFeedback(message: string, error = false) {
    feedback.hidden = false; feedback.textContent = message;
    feedback.classList.toggle('is-error', error); feedback.setAttribute('role', error ? 'alert' : 'status');
  }
  function namesIssue(entry: SkinEntry): string {
    const names = parseNames(entry.names);
    if (!names.length) return entry.validationShown ? 'Enter a player name.' : '';
    if (/[,\r\n]/.test(entry.names)) return 'Use exactly one player name per item. Add another item to use this skin for another player.';
    if (names.some(name => name.length > 64 || /[\u0000-\u001f\u007f]/.test(name))) return 'Use names with 1–64 characters and no control characters.';
    const reserved = names.find(name => reservedNames && isReservedPlayerName(name, reservedNames));
    if (reserved) return `“${reserved}” belongs to a built-in skin and cannot be reassigned.`;
    const duplicate = names.find(name => entries.some(other => other !== entry && parseNames(other.names).includes(name)));
    return duplicate ? `“${duplicate}” is already linked to another skin. Each name can belong to one skin.` : '';
  }
  function issues(entry: SkinEntry) {
    return {
      file: entry.fileError || entry.iconError || (entry.validationShown && !entry.file ? 'Choose a skin PNG.' : '') || (entry.validationShown && entry.file && entry.model && !entry.decoded && !working(entry) && templatesReady ? 'The icon is not ready. Choose the skin PNG again.' : ''),
      model: entry.validationShown && !entry.model ? 'Choose Wide or Slim.' : '',
      names: namesIssue(entry),
    };
  }
  function ready(entry: SkinEntry): boolean {
    return Boolean(templatesReady && reservedNames && entry.decoded && entry.model && parseNames(entry.names).length && !namesIssue(entry) && !entry.fileError && !entry.iconError && !working(entry));
  }
  function render() {
    if (disposed) return;
    const locked = busy;
    const displayed = allEntries();
    const assetPaths = allocatePlayerAssetPaths(displayed.map(entry => ({ names: parseNames(entry.names), model: entry.model || 'wide' })), basePlayerAssetPaths);
    const readyCount = entries.filter(ready).length;
    byId('entry-count').textContent = String(entries.length);
    byId('summary-skins').textContent = String(readyCount);
    byId('summary-names').textContent = String(new Set(entries.flatMap(entry => parseNames(entry.names))).size);
    byId('list-empty').hidden = entries.length > 0;
    byId('editor-empty').hidden = Boolean(selected);
    byId<HTMLButtonElement>('editor-remove').disabled = locked || !selected;
    byId('editor-remove').hidden = !selected;
    byId('selected-title').textContent = selected ? title(selected) : 'Skin details';
    byId('selected-description').textContent = selected === draft && draft ? 'Complete the details, then click Add to list.' : selected ? 'Changes are kept as you edit. Select another skin whenever you like.' : 'Create a skin to start your lineup.';
    byId('editor-remove').querySelector('span')!.textContent = selected === draft && draft ? 'Cancel' : 'Remove';
    byId('editor-remove').setAttribute('aria-label', selected === draft && draft ? 'Cancel new skin' : 'Remove selected skin');
    byId('editor-remove').classList.toggle('is-removal', Boolean(selected && selected !== draft));
    byId('add-skin').querySelector('span')!.textContent = draft ? 'Continue new skin' : 'New skin';
    for (const id of ['add-skin', 'add-first-skin']) byId<HTMLButtonElement>(id).disabled = locked;
    byId<HTMLButtonElement>('retry-base').disabled = locked;
    generate.disabled = locked || !base || !templatesReady || entries.some(entry => !ready(entry));
    generate.querySelector('span')!.textContent = busy ? 'Preparing your addon…' : entries.length ? 'Generate addon' : 'Download addon';
    generate.classList.toggle('is-busy', busy);
    byId('export-hint').textContent = busy ? 'Keep this tab open while your addon is built.' : draft ? 'Only skins added to your list are included. Click Add to list to include this new skin.' : !entries.length ? 'Download the addon, or add skins to customize it.' : readyCount === entries.length ? `${readyCount} ${readyCount === 1 ? 'skin' : 'skins'} ready. Download and open in Minecraft.` : 'Finish each skin’s PNG, model, and player name.';
    for (const [index, entry] of displayed.entries()) {
      const errors = issues(entry);
      entry.element.hidden = entry !== selected;
      entry.element.classList.toggle('is-processing', working(entry));
      entry.element.setAttribute('aria-busy', String(working(entry)));
      entry.row.classList.toggle('is-selected', entry === selected);
      const select = entry.row.querySelector<HTMLButtonElement>('.skin-select')!;
      select.setAttribute('aria-pressed', String(entry === selected));
      select.setAttribute('aria-label', `Edit ${title(entry)}`);
      entry.row.querySelector<HTMLElement>('.skin-row-title')!.textContent = title(entry);
      entry.row.querySelector<HTMLElement>('.skin-row-meta')!.textContent = entry.model ? entry.model === 'wide' ? 'Wide' : 'Slim' : 'Choose model';
      const status = entry.row.querySelector<HTMLElement>('.skin-row-status')!;
      const hasError = Boolean(errors.file || errors.model || errors.names);
      status.textContent = working(entry) ? 'Preparing…' : hasError ? 'Needs attention' : ready(entry) ? 'Ready' : 'Incomplete';
      status.classList.toggle('is-error', hasError); status.classList.toggle('is-ready', ready(entry));
      const thumbnail = entry.row.querySelector<HTMLImageElement>('.skin-face')!;
      thumbnail.hidden = !entry.faceUrl;
      if (entry.faceUrl && thumbnail.getAttribute('src') !== entry.faceUrl) thumbnail.src = entry.faceUrl;
      if (!entry.faceUrl) thumbnail.removeAttribute('src');
      entry.row.querySelector<HTMLElement>('.face-placeholder')!.hidden = Boolean(entry.faceUrl);
      const remove = entry.row.querySelector<HTMLButtonElement>('.remove-list-skin')!;
      remove.disabled = locked; remove.setAttribute('aria-label', `Remove ${title(entry)}`);
      entry.element.querySelectorAll<HTMLInputElement>('input').forEach(control => { control.disabled = locked; });
      q<HTMLInputElement>(entry, 'input[type="file"]').setAttribute('aria-invalid', String(Boolean(errors.file)));
      q(entry, '.upload-field').classList.toggle('is-invalid', Boolean(errors.file));
      q(entry, '.file-name').textContent = entry.file?.name ?? 'Choose a skin PNG';
      q(entry, '.file-meta').textContent = entry.decoded ? `${entry.decoded.width} × ${entry.decoded.height} · Click to replace` : entry.file ? entry.model ? 'Click to replace the PNG' : 'PNG selected · choose a model' : 'Browse or drop a file here';
      q(entry, '.model-field').classList.toggle('is-invalid', Boolean(errors.model));
      entry.element.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => { radio.checked = radio.value === entry.model; radio.setAttribute('aria-invalid', String(Boolean(errors.model))); });
      q<HTMLInputElement>(entry, 'input[type="text"]').setAttribute('aria-invalid', String(Boolean(errors.names)));
      for (const field of ['file', 'model', 'names'] as const) {
        const error = q(entry, `.${field}-error`); error.hidden = !errors[field]; error.textContent = errors[field];
      }
      const preview = q<HTMLImageElement>(entry, '.skin-preview');
      preview.hidden = !entry.decoded;
      if (entry.decoded && preview.getAttribute('src') !== entry.decoded.iconUrl) preview.src = entry.decoded.iconUrl;
      if (!entry.decoded) preview.removeAttribute('src');
      q(entry, '.preview-placeholder').hidden = Boolean(entry.decoded);
      q(entry, '.preview-caption').textContent = working(entry) ? 'Preparing your icon…' : entry.decoded ? 'The icon shown for this skin in the morph menu.' : 'Your icon appears after you choose a PNG and model.';
      const iconLink = q<HTMLAnchorElement>(entry, '.download-icon'); iconLink.hidden = !entry.decoded;
      if (entry.decoded) { iconLink.href = entry.decoded.iconUrl; iconLink.download = `${assetPaths[index].split('/').at(-1)}.png`; }
      else iconLink.removeAttribute('href');
      iconLink.setAttribute('aria-disabled', String(locked)); iconLink.tabIndex = locked ? -1 : 0;
      q(entry, '.entry-notice').hidden = !entry.notice; q(entry, '.entry-notice').textContent = entry.notice;
      q(entry, '.draft-actions').hidden = entry !== draft;
      q<HTMLButtonElement>(entry, '.commit-skin').disabled = locked || !ready(entry);
      q(entry, '.draft-hint').textContent = working(entry) ? 'Preparing the skin and its icon…' : !reservedNames ? 'Loading the built-in name rules…' : ready(entry) ? 'Ready to add to your skin list.' : 'Choose a PNG, a model, and one available player name.';
    }
  }
  function selectEntry(entry: SkinEntry, focus = false) {
    selected = entry; render();
    if (focus) entry.row.querySelector<HTMLButtonElement>('.skin-select')!.focus();
  }
  async function processEntry(entry: SkinEntry) {
    const revision = ++entry.revision;
    clearIcon(entry); entry.iconError = ''; entry.processing = false; clearExport();
    if (!entry.file || !entry.model || !templatesReady || entry.fileError) { render(); return; }
    entry.processing = true; render();
    try {
      const decoded = await services.decodeSkin(entry.file, entry.model);
      if (!active(entry) || revision !== entry.revision) { revoke(decoded.iconUrl); return; }
      entry.decoded = decoded;
    } catch (error) {
      if (active(entry) && revision === entry.revision) entry.iconError = error instanceof Error ? error.message : 'Could not create this skin’s icon.';
    } finally {
      if (active(entry) && revision === entry.revision) { entry.processing = false; render(); }
    }
  }
  async function processFace(entry: SkinEntry) {
    const revision = ++entry.faceRevision;
    revoke(entry.faceUrl); entry.faceUrl = '';
    if (!entry.file) return;
    entry.readingFace = true; render();
    try {
      const url = await services.decodeSkinFace(entry.file);
      if (!active(entry) || revision !== entry.faceRevision) { revoke(url); return; }
      entry.faceUrl = url;
    } catch (error) {
      if (active(entry) && revision === entry.faceRevision) entry.fileError = error instanceof Error ? error.message : 'Could not read this PNG.';
    } finally {
      if (active(entry) && revision === entry.faceRevision) { entry.readingFace = false; render(); }
    }
  }
  async function setFile(entry: SkinEntry, file: File) {
    if (busy || disposed) return;
    entry.file = file; entry.fileError = ''; entry.iconError = ''; entry.notice = '';
    entry.revision++; entry.faceRevision++; entry.processing = false; entry.readingFace = false;
    clearIcon(entry); revoke(entry.faceUrl); entry.faceUrl = ''; clearExport();
    if (file.size > 2 * 1024 * 1024) entry.fileError = 'Choose a skin PNG smaller than 2 MB.';
    else if (!file.name.toLowerCase().endsWith('.png') || (file.type && file.type !== 'image/png')) entry.fileError = 'Choose a PNG skin file.';
    if (entry.fileError) { render(); return; }
    await Promise.all([processFace(entry), processEntry(entry)]);
  }
  function removeEntry(entry: SkinEntry) {
    if (busy || !active(entry)) return;
    const index = entries.indexOf(entry);
    disposeEntry(entry);
    if (entry === draft) draft = null;
    else entries.splice(index, 1);
    entry.row.remove(); entry.element.remove();
    if (selected === entry) selected = entries[Math.max(0, Math.min(index, entries.length - 1))] ?? draft;
    clearExport(); render();
    if (selected && selected !== draft) selected.row.querySelector<HTMLButtonElement>('.skin-select')!.focus();
    else byId<HTMLButtonElement>('add-skin').focus();
  }
  function addEntry(): SkinEntry {
    if (draft) { selectEntry(draft); return draft; }
    const id = `sl_${++sequence}`;
    const element = doc.createElement('article'), row = doc.createElement('li');
    element.id = `${id}_editor`; element.className = 'skin-editor'; element.setAttribute('aria-label', `Skin ${sequence} editor`);
    row.className = 'skin-list-item';
    row.innerHTML = `<button class="skin-select" type="button" aria-controls="${id}_editor" aria-pressed="false"><img class="skin-face" alt="" width="24" height="24" hidden><span class="face-placeholder">${face}</span><span class="skin-row-copy"><strong class="skin-row-title"></strong><span class="skin-row-details"><small class="skin-row-meta"></small><span class="skin-row-status"></span></span></span></button><button class="remove-list-skin icon-button" type="button">${trash}</button>`;
    element.innerHTML = `
      <div class="editor-body"><div class="entry-fields">
        <label class="upload-field" for="${id}_file"><span class="upload-icon">${upload}</span><span class="file-label"><strong class="file-name">Choose a skin PNG</strong><span class="file-meta">Browse or drop a file here</span></span><span class="browse-tag">Browse</span><input id="${id}_file" class="file-input" type="file" accept="image/png,.png" aria-label="Skin PNG" aria-describedby="${id}_formats ${id}_file_error"></label>
        <p id="${id}_formats" class="supported-formats">64 × 64 or 128 × 128 PNG · Legacy 64 × 32 uses Wide · Up to 2 MB</p><p id="${id}_file_error" class="field-error file-error" hidden></p>
        <fieldset class="model-field" aria-describedby="${id}_model_error"><legend>Player model <span>Required</span></legend><div class="model-options">${(['wide', 'slim'] as const).map(model => `<label><input type="radio" name="${id}_model" value="${model}"><span class="model-choice"><span><strong>${model === 'wide' ? 'Wide' : 'Slim'}</strong><small>${model === 'wide' ? '4' : '3'}-pixel arms</small></span><span class="radio-dot"></span></span></label>`).join('')}</div><p id="${id}_model_error" class="field-error model-error" hidden></p></fieldset>
        <div class="names-field"><label for="${id}_names">Player name</label><input id="${id}_names" type="text" placeholder="YourGamertag" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="${id}_names_help ${id}_names_error"><div id="${id}_names_help" class="field-help"><span>Match the in-game spelling and capitalization. To reuse this skin, add another item.</span></div><p id="${id}_names_error" class="field-error names-error" hidden></p></div>
      </div><div class="preview-column"><div class="preview-toolbar"><span>Morph menu icon</span><span>128 × 128 PNG</span></div><div class="preview-stage"><div class="preview-placeholder">${player}</div><img class="skin-preview" alt="Generated morph menu icon on its square canvas" width="128" height="128" hidden></div><p class="preview-caption"></p><a class="download-icon text-button" hidden>${download}Download icon</a></div></div><p class="entry-notice" role="status" hidden></p>`;
    const entry: SkinEntry = { id, file: null, model: '', names: '', faceUrl: '', decoded: null, processing: false, readingFace: false, fileError: '', iconError: '', notice: '', revision: 0, faceRevision: 0, validationShown: false, element, row };
    draft = entry;
    const actions = doc.createElement('div'); actions.className = 'draft-actions';
    actions.innerHTML = `<p class="draft-hint" id="${id}_draft_hint"></p><button class="add-skin commit-skin" type="button" disabled aria-describedby="${id}_draft_hint">${plus}<span>Add to list</span></button>`;
    element.append(actions); byId('skin-editors').append(element);
    actions.querySelector<HTMLButtonElement>('.commit-skin')!.addEventListener('click', () => {
      if (busy || entry !== draft || !ready(entry)) return;
      draft = null; entries.push(entry); entry.validationShown = true;
      byId('skin-list').append(row); clearExport(); selectEntry(entry, true);
    });
    row.querySelector<HTMLButtonElement>('.skin-select')!.addEventListener('click', () => selectEntry(entry));
    row.querySelector<HTMLButtonElement>('.remove-list-skin')!.addEventListener('click', () => removeEntry(entry));
    row.querySelector<HTMLButtonElement>('.skin-select')!.addEventListener('keydown', event => {
      const current = entries.indexOf(entry);
      const index = event.key === 'ArrowDown' ? Math.min(entries.length - 1, current + 1) : event.key === 'ArrowUp' ? Math.max(0, current - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 : -1;
      if (index >= 0) { event.preventDefault(); selectEntry(entries[index], true); }
    });
    const fileInput = q<HTMLInputElement>(entry, 'input[type="file"]');
    fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (file) { fileInput.value = ''; void setFile(entry, file); } });
    element.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(radio => radio.addEventListener('change', () => {
      if (!busy && radio.checked) { entry.model = radio.value as SkinModel; void processEntry(entry); }
    }));
    const names = q<HTMLInputElement>(entry, 'input[type="text"]');
    names.addEventListener('input', () => { if (!busy) { entry.names = names.value; clearExport(); render(); } });
    names.addEventListener('paste', event => {
      const text = event.clipboardData?.getData('text/plain');
      if (busy || !text || !/[\r\n]/.test(text)) return;
      event.preventDefault();
      // Keep a pasted list visibly invalid instead of joining its names into one.
      names.setRangeText(text.trim().replace(/[\r\n]+/g, ', '), names.selectionStart ?? names.value.length, names.selectionEnd ?? names.value.length, 'end');
      entry.names = names.value; clearExport(); render();
    });
    q<HTMLAnchorElement>(entry, '.download-icon').addEventListener('click', event => { if (busy) event.preventDefault(); });
    const dropZone = q(entry, '.upload-field');
    dropZone.addEventListener('dragover', event => { event.preventDefault(); if (!busy) dropZone.classList.add('is-dragging'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'));
    dropZone.addEventListener('drop', event => {
      event.preventDefault(); dropZone.classList.remove('is-dragging');
      if (busy) return;
      const files = event.dataTransfer?.files;
      if (!files?.length) return;
      if (files.length > 1) { entry.notice = 'Drop one PNG per skin. Use Add skin for another entry.'; render(); return; }
      fileInput.value = ''; void setFile(entry, files[0]);
    });
    selectEntry(entry); clearExport(); return entry;
  }
  async function loadBase() {
    const revision = ++baseRevision;
    base = null; templatesReady = false; reservedNames = null; basePlayerAssetPaths = [];
    byId('base-status').classList.remove('is-error', 'is-ready');
    byId('base-status-text').textContent = 'Preparing the base addon…'; byId('retry-base').hidden = true; render();
    try {
      const [bytes, , meta] = await Promise.all([
        services.fetch(`${services.assetRoot}assets/base-addon.zip`).then(response => { if (!response.ok) throw new Error('The base addon could not be loaded. Please retry.'); return response.arrayBuffer(); }),
        services.loadIconTemplates(),
        services.fetch(`${services.assetRoot}assets/base-info.json`).then(response => { if (!response.ok) throw new Error('Could not load the built-in name rules. Please retry.'); return response.json(); }),
      ]);
      if (disposed || revision !== baseRevision) return;
      if (!Array.isArray(meta?.reservedNames) || !meta.reservedNames.length || !meta.reservedNames.every((name: unknown) => typeof name === 'string')) throw new Error('The built-in name rules are missing. Refresh the prepared assets and retry.');
      if (!Array.isArray(meta.playerAssetPaths) || !meta.playerAssetPaths.every((path: unknown) => typeof path === 'string')) throw new Error('The player asset information is missing. Refresh the prepared assets and retry.');
      reservedNames = meta.reservedNames;
      basePlayerAssetPaths = meta.playerAssetPaths;
      base = new Uint8Array(bytes); templatesReady = true;
      byId('base-status').classList.add('is-ready');
      byId('base-status-text').textContent = meta?.skinCount ? `Base addon ready · ${meta.skinCount} original skins included` : 'Base addon ready';
      for (const entry of allEntries()) if (entry.file && entry.model) void processEntry(entry);
    } catch (error) {
      if (disposed || revision !== baseRevision) return;
      byId('base-status').classList.add('is-error'); byId('base-status-text').textContent = error instanceof Error ? error.message : 'Could not load the addon.';
      byId('retry-base').hidden = false;
    }
    render();
  }
  function addAndFocus() { if (!busy) q<HTMLInputElement>(addEntry(), 'input[type="file"]').focus(); }
  byId('add-skin').addEventListener('click', addAndFocus);
  byId('add-first-skin').addEventListener('click', addAndFocus);
  byId('editor-remove').addEventListener('click', () => { if (selected) removeEntry(selected); });
  byId('retry-base').addEventListener('click', () => { void loadBase(); });
  generate.addEventListener('click', async () => {
    if (busy || !base || !templatesReady || entries.some(working)) return;
    clearExport(); entries.forEach(entry => { entry.validationShown = true; }); render();
    const invalid = entries.find(entry => !ready(entry));
    if (invalid) {
      selectEntry(invalid);
      const errors = issues(invalid);
      q<HTMLElement>(invalid, errors.file ? 'input[type="file"]' : errors.model ? 'input[type="radio"]' : 'input[type="text"]').focus();
      setFeedback(`Finish ${title(invalid)} before generating. Check the highlighted fields.`, true); return;
    }
    const assignments = entries.map(entry => ({ id: entry.id, names: parseNames(entry.names), model: entry.model as SkinModel }));
    const errors = assignments.length ? validateAssignments(assignments, reservedNames ?? []) : [];
    if (errors.length) { setFeedback(errors.join('\n'), true); return; }
    busy = true; render(); setFeedback(entries.length ? 'Adding all your skins and icons…' : 'Preparing your addon…');
    try {
      const skins: SkinInput[] = entries.map((entry, index) => ({ ...assignments[index], texturePng: entry.decoded!.texturePng, iconPng: entry.decoded!.iconPng }));
      const bytes = await services.generateAddon(base, skins, {}, message => { if (!disposed) setFeedback(message); });
      if (disposed) return;
      exportUrl = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' }));
      again.href = exportUrl; again.download = 'modpack.mcaddon'; again.hidden = false; again.click();
      setFeedback('Your addon is ready. Open the .mcaddon in Minecraft and activate both packs in your world.');
    } catch (error) { if (!disposed) setFeedback(error instanceof Error ? error.message : 'Could not build the addon. Please try again.', true); }
    finally { busy = false; render(); }
  });
  function cleanup() {
    if (disposed) return;
    disposed = true; baseRevision++; cleanupTheme(); revoke(exportUrl);
    allEntries().forEach(disposeEntry);
    win.removeEventListener('beforeunload', cleanup);
  }
  win.addEventListener('beforeunload', cleanup);
  void loadBase();
  return cleanup;
}
