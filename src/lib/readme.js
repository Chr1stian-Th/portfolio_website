/**
 * Generates the dynamic README markdown from the current file tree.
 *
 * The output looks like:
 *
 *   # README
 *   <intro>
 *
 *   ## Quick facts
 *   - N folders
 *   - M files
 *
 *   ## Structure
 *   - Folder/
 *     - File.md
 *   ...
 *
 *   ## About this site
 *   <description>
 *
 * Whenever an entry is added or removed, the listing updates automatically.
 */
import { i18n } from '../i18n/translations.js';
import { countTree } from './tree.js';

export function generateReadme(tree, lang) {
  const t = i18n[lang];
  const { folders, files } = countTree(tree);

  // Build the indented listing — skip the root and any dynamic entries
  // (so the README doesn't list itself).
  const lines = [];
  const walk = (n, depth) => {
    if (depth > 0 && !n.dynamic) {
      const indent = '  '.repeat(depth - 1);
      const label = n.type === 'folder'
        ? `**${n.name[lang]}/**`
        : `${n.name[lang]}.md`;
      lines.push(`${indent}- ${label}`);
    }
    if (n.children) n.children.forEach((c) => walk(c, depth + 1));
  };
  walk(tree, 0);

  return [
    '# README',
    '',
    t.readmeIntro,
    '',
    `## ${t.quickFacts}`,
    '',
    `- ${t.folderCount(folders)}`,
    `- ${t.fileCount(files)}`,
    '',
    `## ${t.structure}`,
    '',
    lines.join('\n'),
    '',
    `## ${t.aboutThisSite}`,
    '',
    t.readmeAbout,
    '',
  ].join('\n');
}
