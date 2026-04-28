/**
 * Markdown — renders a markdown string as themed React JSX.
 *
 * Block parsing lives in `src/lib/markdown.js` (pure). This component
 * does inline parsing (bold/italic/code/links) and chooses how each
 * block looks.
 *
 * Supported syntax: # / ## / ### / ####, **bold**, *italic*, `code`,
 * fenced ``` blocks, > quotes, - / * lists, --- rules,
 * [link text](https://...).
 */
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { parseBlocks } from '../lib/markdown.js';

/** Inline tokenizer — returns an array of strings and React elements. */
function parseInline(text, keyPrefix = 'i', theme = 'light', headingLevel = 0) {
  const tokens = [];
  // Order matters: code first, so its inner contents aren't reparsed.
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyPrefix}-${i++}`;

    if (tok.startsWith('`')) {
      tokens.push(
        <code
          key={k}
          className="rounded px-1.5 py-0.5 text-[0.9em]"
          style={{
            backgroundColor: 'var(--code-bg)',
            color: 'var(--code-fg)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith('**')) {
      tokens.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*')) {
      tokens.push(<em key={k}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith('![')) {
      const im = tok.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (im) {
        const [srcLight, srcDark = srcLight] = im[2].split('|').map(s => s.trim());
        const src = theme === 'dark' ? srcDark : srcLight;
        const imgStyle = headingLevel > 0
          ? { height: '1em', width: 'auto', verticalAlign: 'middle', display: 'inline-block' }
          : undefined;
        tokens.push(
          <img key={k} src={src} alt={im[1]} className="inline-block max-w-full rounded" style={imgStyle} />,
        );
      }
    } else if (tok.startsWith('[')) {
      const lm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (lm) {
        tokens.push(
          <a
            key={k}
            href={lm[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {lm[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

function Gallery({ images, theme, setLightbox }) {
  const natural = images.some(im => im.natural);
  return (
    <div
      className="my-6 grid gap-1.5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
    >
      {images.map((img, j) => {
        const src = theme === 'dark' ? img.srcDark : img.srcLight;
        return (
          <button
            key={j}
            onClick={() => setLightbox({ src, alt: img.alt, images, currentIndex: j })}
            className="overflow-hidden rounded-md"
            style={natural ? { cursor: 'zoom-in' } : { aspectRatio: '1', cursor: 'zoom-in' }}
          >
            <img
              src={src}
              alt={img.alt}
              className={`w-full transition-transform duration-200 hover:scale-105 ${natural ? 'h-auto' : 'h-full object-cover'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Markdown({ text, theme = 'light' }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  const [lightbox, setLightbox] = useState(null); // { src, alt, images?, currentIndex? }

  const navigateLightbox = useCallback((dir) => {
    setLightbox(prev => {
      if (!prev?.images) return prev;
      const count = prev.images.length;
      const next = (prev.currentIndex + dir + count) % count;
      const img = prev.images[next];
      const src = theme === 'dark' ? img.srcDark : img.srcLight;
      return { ...prev, src, alt: img.alt, currentIndex: next };
    });
  }, [theme]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
      else if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, navigateLightbox]);

  return (
    <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--fg)' }}>
      {blocks.map((b, idx) => {
        const k = `b-${idx}`;

        if (b.kind === 'h') {
          const sizes   = ['', 'text-4xl',     'text-2xl',     'text-xl',     'text-lg'];
          const margins = ['', 'mb-6 mt-2',    'mb-3 mt-10',   'mb-2 mt-8',   'mb-2 mt-6'];
          const Tag = `h${b.level}`;
          return (
            <Tag
              key={k}
              className={`${sizes[b.level]} ${margins[b.level]} font-medium leading-tight tracking-tight`}
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: '"opsz" 36',
              }}
            >
              {parseInline(b.text, k, theme, b.level)}
            </Tag>
          );
        }

        if (b.kind === 'hr') {
          return (
            <hr
              key={k}
              className="my-10 border-0 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />
          );
        }

        if (b.kind === 'code') {
          return (
            <pre
              key={k}
              className="my-5 overflow-x-auto rounded-md p-4 text-[0.85em] leading-relaxed"
              style={{
                backgroundColor: 'var(--code-bg)',
                color: 'var(--code-fg)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <code>{b.text}</code>
            </pre>
          );
        }

        if (b.kind === 'quote') {
          return (
            <blockquote
              key={k}
              className="my-5 border-l-2 pl-5 italic"
              style={{
                borderColor: 'var(--accent)',
                color: 'var(--fg-muted)',
              }}
            >
              {parseInline(b.text, k, theme)}
            </blockquote>
          );
        }

        if (b.kind === 'ul') {
          return (
            <ul key={k} className="my-4 ml-1 space-y-1.5">
              {b.items.map((it, j) => (
                <li
                  key={`${k}-${j}`}
                  className="relative pl-5 leading-relaxed"
                  style={{ marginLeft: `${it.depth * 1.25}rem` }}
                >
                  <span
                    className="absolute left-0 top-[0.7em] h-1 w-1 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  {parseInline(it.text, `${k}-${j}`, theme)}
                </li>
              ))}
            </ul>
          );
        }

        if (b.kind === 'gallery') {
          return (
            <Gallery
              key={k}
              images={b.images}
              theme={theme}
              setLightbox={setLightbox}
            />
          );
        }

        if (b.kind === 'img') {
          const src = theme === 'dark' ? b.srcDark : b.srcLight;
          return (
            <figure key={k} className="my-6 text-center">
              <img
                src={src}
                alt={b.alt}
                className="mx-auto max-w-full rounded-md"
                style={b.natural ? {} : { maxHeight: '480px', objectFit: 'contain' }}
              />
              {b.alt && (
                <figcaption
                  className="mt-2 text-sm italic"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  {b.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        if (b.kind === 'table') {
          return (
            <div key={k} className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {b.headers.map((h, j) => (
                      <th
                        key={j}
                        className="border-b px-4 py-2 text-left font-medium"
                        style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
                      >
                        {parseInline(h, `${k}-h${j}`, theme)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border-b px-4 py-2"
                          style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
                        >
                          {parseInline(cell, `${k}-r${ri}c${ci}`, theme)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (b.kind === 'iframe') {
          const src = b.html.match(/src="([^"]+)"/)?.[1];
          const loading = b.html.match(/loading="([^"]+)"/)?.[1];
          const referrerPolicy = b.html.match(/referrerpolicy="([^"]+)"/)?.[1];
          const allowFullScreen = /allowfullscreen/i.test(b.html);
          return (
            <div key={k} className="my-6 overflow-hidden rounded-md" style={{ position: 'relative', height: '400px' }}>
              <iframe
                src={src}
                style={{ width: '100%', height: '100%', border: 0 }}
                allowFullScreen={allowFullScreen}
                loading={loading}
                referrerPolicy={referrerPolicy}
                title="Embedded map"
              />
            </div>
          );
        }

        // Default: paragraph
        return (
          <p key={k} className="my-4 leading-relaxed">
            {parseInline(b.text, k, theme)}
          </p>
        );
      })}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', cursor: 'zoom-out' }}
          onClick={() => setLightbox(null)}
        >
          {lightbox.images && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-2xl leading-none transition-colors hover:bg-white/20"
              style={{ color: 'white', cursor: 'default' }}
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[88vh] max-w-[90vw] rounded-lg object-contain"
            style={{ cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.images && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full text-2xl leading-none transition-colors hover:bg-white/20"
              style={{ color: 'white', cursor: 'default' }}
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              aria-label="Next image"
            >
              ›
            </button>
          )}
          {lightbox.alt && (
            <p className="mt-3 text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {lightbox.alt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
