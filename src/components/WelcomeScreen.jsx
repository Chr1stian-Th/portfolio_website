/**
 * WelcomeScreen — empty state shown when no tabs are open.
 */
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeScreen({ t }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'var(--hover)', color: 'var(--accent)' }}
      >
        <Sparkles size={24} />
      </div>
      <div
        className="mb-2 text-2xl"
        style={{ fontFamily: 'var(--font-serif)', color: 'var(--fg)' }}
      >
        {t.noTabsTitle}
      </div>
      <div
        className="text-sm"
        style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {t.noTabsHint}
      </div>
    </div>
  );
}
