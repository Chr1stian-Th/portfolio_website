/**
 * ============================================================================
 *  Theme tokens
 * ============================================================================
 *
 *  Edit these to retune the look. App.jsx writes the active theme's values
 *  as CSS custom properties on the root element, so any component reading
 *  `var(--bg)`, `var(--accent)`, etc. picks them up automatically.
 *
 *  To add a new accent: drop another entry into `accents` with `light`,
 *  `dark`, and bilingual `label` fields. It will show up in the settings
 *  swatches automatically.
 * ============================================================================
 */

/** Light & dark palettes — warm cream + deep ink, IDE-flavored. */
export const themes = {
  light: {
    '--bg':            '#faf7f2',
    '--sidebar-bg':    '#f3eee5',
    '--tabbar-bg':     '#ede7da',
    '--statusbar-bg':  '#e8e0d0',
    '--fg':            '#1a1814',
    '--fg-muted':      '#6b655a',
    '--fg-faint':      '#9a9385',
    '--border':        '#dfd6c4',
    '--hover':         '#e8e0d0',
    '--hover-strong':  '#dcd2bc',
    '--code-bg':       '#ede7da',
    '--code-fg':       '#3d3a32',
  },
  dark: {
    '--bg':            '#14130f',
    '--sidebar-bg':    '#0e0d0a',
    '--tabbar-bg':     '#100f0c',
    '--statusbar-bg':  '#0a0908',
    '--fg':            '#e8e2d4',
    '--fg-muted':      '#9c9684',
    '--fg-faint':      '#6b6557',
    '--border':        '#26231d',
    '--hover':         '#1d1b16',
    '--hover-strong':  '#2a2720',
    '--code-bg':       '#1d1b16',
    '--code-fg':       '#d4cfc0',
  },
};

/** Selectable accent colors — one value per theme for proper contrast. */
export const accents = {
  terracotta: { light: '#b8744d', dark: '#e09373', label: { en: 'Terracotta', de: 'Terrakotta' } },
  emerald:    { light: '#059669', dark: '#34d399', label: { en: 'Emerald',    de: 'Smaragd'    } },
  sky:        { light: '#0284c7', dark: '#38bdf8', label: { en: 'Sky',        de: 'Himmel'     } },
  rose:       { light: '#e11d48', dark: '#fb7185', label: { en: 'Rose',       de: 'Rose'       } },
  violet:     { light: '#7c3aed', dark: '#a78bfa', label: { en: 'Violet',     de: 'Violett'    } },
};

/** Reading-size presets — applied to the root font-size. */
export const fontSizes = {
  sm: { base: '15px' },
  md: { base: '17px' },
  lg: { base: '19px' },
};

/** Font stacks — referenced via `var(--font-mono)` and `var(--font-serif)`. */
export const fonts = {
  mono:  "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  serif: "'Newsreader', Georgia, 'Times New Roman', serif",
};
