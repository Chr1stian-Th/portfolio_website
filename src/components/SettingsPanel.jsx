/**
 * SettingsPanel — modal overlay with theme / accent / font-size / language.
 *
 * To add a new setting, drop a new <SettingsRow> inside an existing
 * <SettingsSection> (or add a new section). Wire the value through to the
 * App component's state.
 */
import React from 'react';
import {
  X, Sun, Moon, Settings as SettingsIcon, Globe, Palette, Check,
} from 'lucide-react';
import { accents } from '../styles/theme.js';

export default function SettingsPanel({
  open, onClose,
  theme, setTheme,
  lang, setLang,
  accent, setAccent,
  fontSize, setFontSize,
  t,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--fg)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon size={15} style={{ color: 'var(--accent)' }} />
            <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {t.settings}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--fg-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label={t.close}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-5 py-5" style={{ fontFamily: 'var(--font-mono)' }}>
          {/* Appearance */}
          <SettingsSection title={t.appearance} icon={Palette}>
            <SettingsRow label={t.theme}>
              <SegmentedControl
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'light', label: t.light, icon: Sun },
                  { value: 'dark',  label: t.dark,  icon: Moon },
                ]}
              />
            </SettingsRow>
            <SettingsRow label={t.accentColor}>
              <div className="flex gap-2">
                {Object.entries(accents).map(([key, a]) => (
                  <button
                    key={key}
                    onClick={() => setAccent(key)}
                    className="relative h-7 w-7 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: theme === 'dark' ? a.dark : a.light,
                      boxShadow: accent === key
                        ? `0 0 0 2px var(--bg), 0 0 0 4px ${theme === 'dark' ? a.dark : a.light}`
                        : 'none',
                    }}
                    title={a.label[lang]}
                    aria-label={a.label[lang]}
                  >
                    {accent === key && (
                      <Check
                        size={12}
                        className="absolute inset-0 m-auto"
                        style={{ color: '#fff' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow label={t.fontSize}>
              <SegmentedControl
                value={fontSize}
                onChange={setFontSize}
                options={[
                  { value: 'sm', label: t.sm },
                  { value: 'md', label: t.md },
                  { value: 'lg', label: t.lg },
                ]}
              />
            </SettingsRow>
          </SettingsSection>

          {/* Language */}
          <SettingsSection title={t.language} icon={Globe}>
            <SettingsRow>
              <SegmentedControl
                value={lang}
                onChange={setLang}
                full
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'de', label: 'Deutsch' },
                ]}
              />
            </SettingsRow>
          </SettingsSection>

          {/* About */}
          <div
            className="border-t pt-4 text-[11px]"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-faint)' }}
          >
            {t.aboutLine}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div
        className="mb-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest"
        style={{ color: 'var(--fg-faint)' }}
      >
        <Icon size={11} />
        <span>{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingsRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label && (
        <div className="text-[12.5px]" style={{ color: 'var(--fg-muted)' }}>
          {label}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

function SegmentedControl({ value, onChange, options, full = false }) {
  return (
    <div
      className={`flex rounded-md p-0.5 ${full ? 'w-full' : ''}`}
      style={{ backgroundColor: 'var(--hover)' }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-center gap-1.5 rounded px-2.5 py-1 text-[12px] transition-all ${full ? 'flex-1' : ''}`}
            style={{
              backgroundColor: active ? 'var(--bg)' : 'transparent',
              color: active ? 'var(--fg)' : 'var(--fg-muted)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {Icon && <Icon size={12} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
