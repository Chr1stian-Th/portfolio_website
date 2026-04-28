/**
 * ContentView — renders the active tab's markdown into a comfortable
 * reading column. Looks up the node, picks the localized content (or
 * generates the README if `dynamic: 'readme'`).
 */
import React from 'react';
import Markdown from './Markdown.jsx';
import { findNode } from '../lib/tree.js';
import { generateReadme } from '../lib/readme.js';

export default function ContentView({ tree, activeId, lang, theme, accent }) {
  if (!activeId) return null;
  const node = findNode(tree, activeId);
  if (!node) return null;

  if (node.component) {
    const Component = node.component;
    return (
      <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
        <Component lang={lang} theme={theme} accent={accent} />
      </div>
    );
  }

  const content = node.dynamic === 'readme'
    ? generateReadme(tree, lang)
    : (node.content?.[lang] ?? '');

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-2xl px-10 py-16">
        <Markdown text={content} theme={theme} />
      </div>
    </div>
  );
}
