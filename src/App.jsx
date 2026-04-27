/**
 * ============================================================================
 *  App — top-level component
 * ============================================================================
 *
 *  Owns all session state (theme, language, accent, font size, open tabs,
 *  expanded folders, settings modal visibility) and writes the active
 *  theme tokens onto the root element as CSS custom properties.
 *
 *  Note on persistence: state is intentionally session-only. To persist
 *  preferences across reloads, wire each `useState` initializer to read
 *  from `localStorage` and add a corresponding `useEffect` to write on
 *  change.
 * ============================================================================
 */
import React, { useState, useMemo } from 'react';

import Sidebar        from './components/Sidebar.jsx';
import TabBar         from './components/TabBar.jsx';
import ContentView    from './components/ContentView.jsx';
import StatusBar      from './components/StatusBar.jsx';
import SettingsPanel  from './components/SettingsPanel.jsx';
import WelcomeScreen  from './components/WelcomeScreen.jsx';

import { i18n }                          from './i18n/translations.js';
import { themes, accents, fontSizes, fonts } from './styles/theme.js';
import { buildTree }                     from './content/index.js';
import { findNode }                      from './lib/tree.js';
import { generateReadme }                from './lib/readme.js';

export default function App() {
  // ─────────────────── State ─────────────────────────────────────────────
  const [theme,        setTheme]        = useState('dark');
  const [lang,         setLang]         = useState('en');
  const [accent,       setAccent]       = useState('terracotta');
  const [fontSize,     setFontSize]     = useState('md');
  const [openTabs,     setOpenTabs]     = useState([{ id: 'readme' }]);
  const [activeId,     setActiveId]     = useState('readme');
  const [expanded,     setExpanded]     = useState(
    new Set(['projects', 'education', 'personal']),
  );
  const [showSettings, setShowSettings] = useState(false);

  const t = i18n[lang];

  // The tree is rebuilt on every render — cheap, since it's just a few
  // dozen objects, and it ensures that adding a new entry file shows up
  // immediately in dev.
  const tree = useMemo(() => buildTree(), []);

  // ─────────────────── Actions ───────────────────────────────────────────
  const toggleFolder = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openFile = (id) => {
    setOpenTabs((prev) =>
      prev.find((tb) => tb.id === id) ? prev : [...prev, { id }],
    );
    setActiveId(id);
  };

  const closeTab = (id) => {
    setOpenTabs((prev) => {
      const idx = prev.findIndex((tb) => tb.id === id);
      const next = prev.filter((tb) => tb.id !== id);
      if (id === activeId) {
        // Activate the previous neighbor, or the next one, or none.
        if (next.length === 0) setActiveId(null);
        else setActiveId(next[Math.max(0, idx - 1)].id);
      }
      return next;
    });
  };

  // ─────────────────── Theme tokens → CSS custom properties ──────────────
  const accentColor = accents[accent][theme];
  const rootStyle = {
    ...themes[theme],
    '--accent':      accentColor,
    '--font-mono':   fonts.mono,
    '--font-serif':  fonts.serif,
    backgroundColor: 'var(--bg)',
    color:           'var(--fg)',
    fontSize:        fontSizes[fontSize].base,
  };

  // ─────────────────── Active content (for status bar word count) ────────
  const activeNode = activeId ? findNode(tree, activeId) : null;
  const activeContent = activeNode
    ? (activeNode.dynamic === 'readme'
        ? generateReadme(tree, lang)
        : (activeNode.content?.[lang] ?? ''))
    : '';

  // ─────────────────── Render ────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full overflow-hidden" style={rootStyle}>
      <Sidebar
        tree={tree}
        lang={lang}
        expanded={expanded}
        toggleFolder={toggleFolder}
        openFile={openFile}
        activeId={activeId}
        onSettings={() => setShowSettings(true)}
        theme={theme}
        setTheme={setTheme}
        t={t}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TabBar
          tabs={openTabs}
          activeId={activeId}
          tree={tree}
          lang={lang}
          t={t}
          onActivate={setActiveId}
          onClose={closeTab}
          onReorder={setOpenTabs}
        />
        <div className="flex-1 overflow-hidden">
          {openTabs.length === 0
            ? <WelcomeScreen t={t} />
            : <ContentView tree={tree} activeId={activeId} lang={lang} />
          }
        </div>
        <StatusBar
          tree={tree}
          activeId={activeId}
          lang={lang}
          content={activeContent}
        />
      </div>

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}      setTheme={setTheme}
        lang={lang}        setLang={setLang}
        accent={accent}    setAccent={setAccent}
        fontSize={fontSize} setFontSize={setFontSize}
        t={t}
      />
    </div>
  );
}
