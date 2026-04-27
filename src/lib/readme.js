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
 *
 *   - AnotherFolder/
 *     - File2.md
 *
 *   ## About this site
 *   <description>
 *
 * Whenever an entry is added or removed, the listing updates automatically.
 */

import { i18n } from '../i18n/translations.js';
import { countTree } from './tree.js';

/**
 * Formats a tree node and all its children into README list lines.
 */
function formatTree(nodes, depth, lang) {
  return nodes.flatMap((node, index) => {
    if (node.dynamic) return [];

    const indent = '  '.repeat(depth);

    const label =
      node.type === 'folder'
        ? `**${node.name[lang]}/**`
        : `${node.name[lang]}.md`;

    const line = `${indent}- ${label}`;

    const children = node.children
      ? formatTree(node.children, depth + 1, lang)
      : [];

    // Add blank line between siblings
    const separator = index > 0 ? [''] : [];

    return [...separator, line, ...children];
  });
}

export function generateReadme(tree, lang) {
  const t = i18n[lang];
  const { folders, files } = countTree(tree);

  const structureLines = formatTree(tree.children ?? [], 0, lang);

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
    ...structureLines,
    '',
    `## ${t.aboutThisSite}`,
    '',
    t.readmeAbout,
    '',
  ].join('\n');
}