/**
 * Tiny markdown block parser.
 *
 * Splits a markdown string into an array of block descriptors, e.g.:
 *   [{ kind: 'h', level: 1, text: 'Hello' },
 *    { kind: 'p', text: 'A paragraph' },
 *    { kind: 'ul', items: ['one', 'two'] }, ...]
 *
 * Inline parsing (bold/italic/code/links) happens in the React component
 * because it produces JSX. Keeping block parsing pure makes it easy to
 * test or reuse outside React.
 *
 * Supported block kinds: h, hr, code, quote, ul, img, gallery, p
 *
 * Gallery: two or more consecutive image lines (no blank lines between) are
 * automatically grouped into a gallery block.
 */
export function parseBlocks(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks.
    if (line.trim() === '') { i++; continue; }

    // Image(s): consecutive image lines → gallery; single line → img.
    if (/^!\[/.test(line.trim())) {
      const images = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (!m) break;
        const [srcLight, srcDark = srcLight] = m[2].split('|').map(s => s.trim());
        images.push({ alt: m[1], srcLight, srcDark });
        i++;
      }
      out.push(images.length === 1
        ? { kind: 'img', ...images[0] }
        : { kind: 'gallery', images });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      out.push({ kind: 'h', level: h[1].length, text: h[2] });
      i++; continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      out.push({ kind: 'hr' });
      i++; continue;
    }

    // Fenced code block
    if (line.trim().startsWith('```')) {
      i++;
      const buf = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]); i++;
      }
      i++; // skip closing fence
      out.push({ kind: 'code', text: buf.join('\n') });
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        buf.push(lines[i].replace(/^>\s?/, '')); i++;
      }
      out.push({ kind: 'quote', text: buf.join(' ') });
      continue;
    }

    // Unordered list (supports indentation)
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];

      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)[-*]\s+(.*)$/);

        const indent = m[1].length;
        const depth = Math.floor(indent / 2); // assume 2 spaces per level

        items.push({
          text: m[2],
          depth
        });

        i++;
      }
      out.push({ kind: 'ul', items });
      continue;
    }

    // Paragraph — collect consecutive non-blank, non-block-marker lines.
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4}\s|>|-{3,}$|\s*[-*]\s|```|!\[)/.test(lines[i].trim())
    ) {
      buf.push(lines[i]); i++;
    }
    out.push({ kind: 'p', text: buf.join(' ') });
  }

  return out;
}
