/**
 * TabBar — the horizontal strip of open files above the content area.
 *
 * Tabs can be:
 *   - clicked to activate
 *   - clicked on the X to close
 *   - dragged to reorder (HTML5 drag-and-drop)
 *
 * The drop indicator is a thin vertical bar in the accent color, shown
 * between the two tabs the dragged tab will land between.
 */
import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { iconMap } from '../icons.js';
import { findNode } from '../lib/tree.js';

function resolveIconColor(iconColor, theme) {
  if (!iconColor) return undefined;
  if (typeof iconColor === 'object') return iconColor[theme];
  return iconColor;
}

export default function TabBar({
  tabs, activeId, tree, lang, t, theme,
  onActivate, onClose, onReorder,
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  /** Compute drop index based on cursor x relative to a tab's midpoint. */
  const handleDragOver = (e, i) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const mid = r.left + r.width / 2;
    setDropIndex(e.clientX < mid ? i : i + 1);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedId == null || dropIndex == null) return;
    const fromIdx = tabs.findIndex((tb) => tb.id === draggedId);
    if (fromIdx < 0) return;
    let toIdx = dropIndex;
    if (toIdx > fromIdx) toIdx--; // adjust for the splice we're about to do
    if (fromIdx === toIdx) {
      setDraggedId(null); setDropIndex(null); return;
    }
    const next = tabs.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorder(next);
    setDraggedId(null);
    setDropIndex(null);
  };

  return (
    <div
      className="flex h-10 shrink-0 items-stretch overflow-x-auto border-b"
      style={{ backgroundColor: 'var(--tabbar-bg)', borderColor: 'var(--border)' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {tabs.map((tb, i) => (
        <React.Fragment key={tb.id}>
          {/* Drop indicator before this tab */}
          {dropIndex === i && draggedId && (
            <div
              className="w-0.5 self-stretch"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          <Tab
            tab={tb}
            tree={tree}
            isActive={tb.id === activeId}
            isDragging={tb.id === draggedId}
            lang={lang}
            t={t}
            theme={theme}
            onActivate={onActivate}
            onClose={onClose}
            onDragStart={() => setDraggedId(tb.id)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={() => { setDraggedId(null); setDropIndex(null); }}
          />
          {/* Drop indicator after the very last tab */}
          {dropIndex === i + 1 && i === tabs.length - 1 && draggedId && (
            <div
              className="w-0.5 self-stretch"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
        </React.Fragment>
      ))}
      <div className="flex-1" />
    </div>
  );
}

/** A single tab — owns its hover state so the close button can fade in. */
function Tab({
  tab, tree, isActive, isDragging, lang, t, theme,
  onActivate, onClose,
  onDragStart, onDragOver, onDragEnd,
}) {
  const [hovered, setHovered] = useState(false);

  const node = findNode(tree, tab.id);
  if (!node) return null;
  const Icon = (node.icon && iconMap[node.icon]) || FileText;
  const ext = node.component ? 'jsx' : 'md';

  // Close button fully visible on active tab, fades in on hover otherwise.
  const closeOpacity = isActive ? 0.8 : (hovered ? 0.6 : 0);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onClick={() => onActivate(tab.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex cursor-pointer items-center gap-2 border-r px-3 text-[12.5px] transition-colors"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: isActive
          ? 'var(--bg)'
          : (hovered ? 'var(--hover)' : 'transparent'),
        color: isActive ? 'var(--fg)' : 'var(--fg-muted)',
        opacity: isDragging ? 0.4 : 1,
        fontFamily: 'var(--font-mono)',
        minWidth: 0,
      }}
    >
      {/* Top accent indicator for active tab */}
      {isActive && (
        <span
          className="absolute left-0 right-0 top-0 h-px"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
      <Icon size={13} className="shrink-0" style={{ opacity: 0.8, ...(resolveIconColor(node.iconColor, theme) && { color: resolveIconColor(node.iconColor, theme) }) }} />
      <span className="truncate">{node.name[lang]}.{ext}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all"
        aria-label={t.closeTab}
        title={t.closeTab}
        style={{ opacity: closeOpacity, color: 'var(--fg-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--hover-strong)';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.opacity = String(closeOpacity);
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
