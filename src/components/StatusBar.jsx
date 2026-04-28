/**
 * StatusBar — bottom strip à la VS Code.
 * Shows breadcrumb path, current language, and a word count for the
 * active file's content.
 */
import React from 'react';
import { i18n } from '../i18n/translations.js';
import { findNode, getPath } from '../lib/tree.js';

export default function StatusBar({ tree, activeId, lang, content }) {
  const path = activeId ? getPath(tree, activeId) : null;
  const node = activeId ? findNode(tree, activeId) : null;
  const ext = node?.component ? 'jsx' : 'md';
  const wordCount = content
    ? content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div
      className="flex h-6 shrink-0 items-center justify-between border-t px-3 text-[11px]"
      style={{
        backgroundColor: 'var(--statusbar-bg)',
        borderColor: 'var(--border)',
        color: 'var(--fg-faint)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        {node ? (
          <span className="truncate">
            {path && path.length > 0 && path.map((p) => p[lang]).join(' / ') + ' / '}
            <span style={{ color: 'var(--fg-muted)' }}>
              {node.name[lang]}.{ext}
            </span>
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>{ext}</span>
        <span>{lang.toUpperCase()}</span>
        {node && <span>{wordCount} {i18n[lang].words}</span>}
      </div>
    </div>
  );
}
