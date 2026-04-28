/**
 * ============================================================================
 *  Content index
 * ============================================================================
 *
 *  Entries are auto-discovered: every `*.js` file inside `./entries/` is
 *  imported via Vite's `import.meta.glob` and its default export becomes a
 *  node in the tree. To add a page, drop a new file in `entries/` — no
 *  registration step.
 *
 *  Each entry is expected to look like:
 *
 *    {
 *      id:        'unique-kebab-case',
 *      folder:    'projects' | 'education' | 'personal' | undefined,
 *      order:     number,                 // sort order within its parent
 *      icon:      'graduation' | …,       // optional, see src/icons.js
 *      name:      { en, de },             // display name, no extension
 *      content:   { en, de },             // markdown body (omit for dynamic)
 *      dynamic?:  'readme',               // marks generated content
 *    }
 *
 *  Items with `folder` undefined sit at the root of the tree (next to the
 *  README). Items with a `folder` value are nested under the matching
 *  folder from `./folders.js`.
 * ============================================================================
 */
import { folders } from './folders.js';

// Vite turns this into a static dependency graph at build time.
const entryModules = {
  ...import.meta.glob('./entries/*.js',  { eager: true }),
  ...import.meta.glob('./entries/*.jsx', { eager: true }),
};

/** Flat list of all entry objects, with `type: 'file'` filled in. */
const entries = Object.values(entryModules)
  .map((m) => m.default)
  .filter(Boolean)
  .map((e) => ({ ...e, type: 'file' }));

/** Sort by `order` (default 999) then by display name (English). */
function bySortOrder(a, b) {
  const ao = a.order ?? 999;
  const bo = b.order ?? 999;
  if (ao !== bo) return ao - bo;
  return (a.name?.en ?? '').localeCompare(b.name?.en ?? '');
}

/** Build the full tree on demand (called whenever the language switches). */
export function buildTree() {
  const rootEntries = entries
    .filter((e) => !e.folder)
    .sort(bySortOrder);

  const folderNodes = folders
    .slice()
    .sort(bySortOrder)
    .map((f) => ({
      ...f,
      type: 'folder',
      children: entries
        .filter((e) => e.folder === f.id)
        .sort(bySortOrder),
    }));

  return {
    id: 'root',
    type: 'folder',
    name: { en: 'portfolio', de: 'portfolio' },
    children: [...rootEntries, ...folderNodes],
  };
}
