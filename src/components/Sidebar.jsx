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
  Bookmark, ChevronLeft, ChevronRight,
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
  sidebarOpen, onToggleSidebar,
}) {
  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r overflow-hidden"
      style={{
        width: sidebarOpen ? 260 : 48,
        transition: 'width 200ms ease',
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header / brand mark */}
      <div
        className="flex items-center border-b py-3 shrink-0"
        style={{
          borderColor: 'var(--border)',
          padding: sidebarOpen ? '12px 16px' : '8px',
          justifyContent: sidebarOpen ? undefined : 'center',
        }}
      >
        {/* Brand — fades out while collapsing */}
        <div
          className="flex items-center gap-2 flex-1 overflow-hidden cursor-pointer"
          onClick={onToggleSidebar}
          style={{
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 120ms ease',
            pointerEvents: sidebarOpen ? undefined : 'none',
          }}
        >
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Bookmark size={13} style={{ color: 'var(--sidebar-bg)' }} />
          </div>
          <div
            className="text-[12px] font-medium uppercase tracking-wider truncate"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {t.portfolio}
          </div>
        </div>

        {/* Toggle button */}
        <SidebarButton
          onClick={onToggleSidebar}
          icon={sidebarOpen ? ChevronLeft : ChevronRight}
          label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        />
      </div>

      {/* File tree — hidden when collapsed */}
      {sidebarOpen && (
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
      )}

      {/* Bottom action bar */}
      <div
        className="border-t shrink-0"
        style={{
          borderColor: 'var(--border)',
          display: 'flex',
          flexDirection: sidebarOpen ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          padding: sidebarOpen ? '8px' : '8px 8px',
          gap: '4px',
          transition: 'flex-direction 200ms ease',
        }}
      >
        <SidebarButton href={GITHUB_URL}   icon={Github}   label={t.githubTip}   />
        <SidebarButton href={LINKEDIN_URL} icon={Linkedin} label={t.linkedinTip} />
        <div style={{ marginLeft: sidebarOpen ? 'auto' : undefined, display: 'flex', flexDirection: sidebarOpen ? 'row' : 'column', gap: '4px' }}>
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
