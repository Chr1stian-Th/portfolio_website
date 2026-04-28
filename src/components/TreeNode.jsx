/**
 * TreeNode — a single row in the sidebar's file tree, recursive.
 *
 * Folders toggle expanded/collapsed; files open in a tab.
 */
import React from 'react';
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
} from 'lucide-react';
import { iconMap } from '../icons.js';

function resolveIconColor(iconColor, theme) {
  if (!iconColor) return undefined;
  if (typeof iconColor === 'object') return iconColor[theme];
  return iconColor;
}

export default function TreeNode({
  node,
  depth,
  lang,
  expanded,
  toggleFolder,
  openFile,
  activeId,
  theme,
}) {
  const isFolder = node.type === 'folder';
  const isOpen = expanded.has(node.id);
  const isActive = activeId === node.id;

  const ext = node.component ? 'jsx' : 'md';

  const labelColor = isActive
    ? 'var(--accent)'
    : isFolder
      ? 'var(--folder-fg)'
      : 'var(--fg-muted)';

  // Pick the right icon: folder gets open/closed variants, files use the
  // schema's `icon` field with a sane default.
  const Icon = isFolder
    ? (isOpen ? FolderOpen : Folder)
    : (node.icon && iconMap[node.icon]) || FileText;

  const handleClick = () => {
    if (isFolder) toggleFolder(node.id);
    else openFile(node.id);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors duration-100"
        style={{
          paddingLeft: `${6 + depth * 12}px`,
          color: labelColor,
          backgroundColor: isActive ? 'var(--hover)' : 'transparent',
          fontFamily: 'var(--font-mono)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isFolder ? (
          isOpen
            ? <ChevronDown  size={12} className="shrink-0 opacity-60" />
            : <ChevronRight size={12} className="shrink-0 opacity-60" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon size={14} className="shrink-0" style={{ opacity: isFolder ? 0.85 : 0.7, ...(!isActive && resolveIconColor(node.iconColor, theme) && { color: resolveIconColor(node.iconColor, theme) }) }} />
        <span className="truncate">
          {node.name[lang]}{!isFolder && !node.hideExt && `.${ext}`}
        </span>
      </button>

      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              lang={lang}
              expanded={expanded}
              toggleFolder={toggleFolder}
              openFile={openFile}
              activeId={activeId}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}
