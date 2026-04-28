/**
 * Sidebar — left panel containing the file tree at top and a small bar
 * of action buttons (GitHub, LinkedIn, theme toggle, settings) at the
 * bottom.
 *
 * Edit the GitHub / LinkedIn URLs below to point to your own profiles.
 */
import React from 'react';
import {
  Sparkles, Github, Linkedin, Sun, Moon,
  Settings as SettingsIcon, FolderTree,
  Bookmark,
} from 'lucide-react';
import TreeNode from './TreeNode.jsx';

// ─────────────────────────────────────────────────────────────────────────────
//  Edit these to point at your own profiles.
// ─────────────────────────────────────────────────────────────────────────────
const GITHUB_URL   = 'https://github.com/Chr1stian-Th';
const LINKEDIN_URL = 'https://www.linkedin.com/in/christian-thimm-190397341/';

export default function Sidebar({
  tree, lang, expanded, toggleFolder, openFile, activeId,
  onSettings, theme, setTheme, t,
}) {
  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r"
      style={{
        width: 260,
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header / brand mark */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Bookmark size={13} style={{ color: 'var(--sidebar-bg)' }} />
        </div>
        <div
          className="text-[12px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {t.portfolio}
        </div>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div
          className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}
        >
          <FolderTree size={11} />
          <span>{t.structure}</span>
        </div>
        {tree.children.map((c) => (
          <TreeNode
            key={c.id}
            node={c}
            depth={0}
            lang={lang}
            expanded={expanded}
            toggleFolder={toggleFolder}
            openFile={openFile}
            activeId={activeId}
            theme={theme}
          />
        ))}
      </div>

      {/* Bottom action bar */}
      <div
        className="flex items-center gap-1 border-t px-2 py-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <SidebarButton href={GITHUB_URL}   icon={Github}   label={t.githubTip}   />
        <SidebarButton href={LINKEDIN_URL} icon={Linkedin} label={t.linkedinTip} />
        <div className="ml-auto flex items-center gap-1">
          <SidebarButton
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            icon={theme === 'dark' ? Sun : Moon}
            label={t.themeTip}
          />
          <SidebarButton
            onClick={onSettings}
            icon={SettingsIcon}
            label={t.settingsTip}
          />
        </div>
      </div>
    </aside>
  );
}

/** Small icon button used in the sidebar's bottom bar. */
function SidebarButton({ icon: Icon, label, href, onClick }) {
  const className =
    'flex h-8 w-8 items-center justify-center rounded-md transition-colors';
  const baseStyle = { color: 'var(--fg-muted)' };
  const handlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = 'var(--hover)';
      e.currentTarget.style.color = 'var(--fg)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--fg-muted)';
    },
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={baseStyle}
        title={label}
        aria-label={label}
        {...handlers}
      >
        <Icon size={15} />
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      className={className}
      style={baseStyle}
      title={label}
      aria-label={label}
      {...handlers}
    >
      <Icon size={15} />
    </button>
  );
}
