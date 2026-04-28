/**
 * Folder definitions.
 *
 * Each folder has:
 *   - id    : matches what entries set in their `folder` field
 *   - order : controls sidebar ordering (low = top)
 *   - name  : bilingual display name
 *
 * To add a folder, append a new entry here, then create entry files with
 * `folder: '<id>'` to populate it.
 */
export const folders = [
  { id: 'projects',  order: 1, name: { en: 'Projects',  de: 'Projekte'    } },
  { id: 'education', order: 2, name: { en: 'Education', de: 'Ausbildung'  } },
  { id: 'personal',  order: 3, name: { en: 'Personal',  de: 'Persönlich' } },
  { id: 'fun',       order: 4, name: { en: 'Fun',       de: 'Fun'}},
];
