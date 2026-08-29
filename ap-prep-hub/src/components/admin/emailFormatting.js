/**
 * Toolbar insertions for the broadcast composer.
 *
 * Pure string surgery so it can be tested without a DOM: takes the current
 * value plus the selection and returns the new value and where the caret
 * should end up. The caller only has to write those back to the textarea.
 */

/** Wraps the selection, or inserts a placeholder when nothing is selected. */
export function applyWrap(value, start, end, marker, placeholder) {
  const v = String(value || '');
  const s = Math.max(0, Math.min(start ?? 0, v.length));
  const e = Math.max(s, Math.min(end ?? s, v.length));
  const selected = v.slice(s, e) || placeholder;
  const next = v.slice(0, s) + marker + selected + marker + v.slice(e);
  // Select the text between the markers so typing replaces the placeholder.
  return { value: next, selectionStart: s + marker.length, selectionEnd: s + marker.length + selected.length };
}

/** Prefixes every line of the selection (headings, bullets). */
export function applyLinePrefix(value, start, end, prefix) {
  const v = String(value || '');
  const s = Math.max(0, Math.min(start ?? 0, v.length));
  const e = Math.max(s, Math.min(end ?? s, v.length));
  const lineStart = v.lastIndexOf('\n', s - 1) + 1;
  const lineEnd = v.indexOf('\n', e) === -1 ? v.length : v.indexOf('\n', e);
  const block = v.slice(lineStart, lineEnd) || 'Text';
  const prefixed = block
    .split('\n')
    .map((l) => (l.startsWith(prefix) ? l : prefix + l))
    .join('\n');
  const next = v.slice(0, lineStart) + prefixed + v.slice(lineEnd);
  return { value: next, selectionStart: lineStart, selectionEnd: lineStart + prefixed.length };
}

/** Link insertion keeps the selected text as the label. */
export function applyLink(value, start, end) {
  const v = String(value || '');
  const s = Math.max(0, Math.min(start ?? 0, v.length));
  const e = Math.max(s, Math.min(end ?? s, v.length));
  const label = v.slice(s, e) || 'link text';
  const url = 'https://apex-scholar.com';
  const next = `${v.slice(0, s)}[${label}](${url})${v.slice(e)}`;
  // Put the caret on the URL — that is the part you always need to change.
  const urlStart = s + 1 + label.length + 2;
  return { value: next, selectionStart: urlStart, selectionEnd: urlStart + url.length };
}

/**
 * Insert an image at the caret, or turn the selection into the alt text.
 *
 * Alt text, not the URL, gets the placeholder treatment because most clients
 * block remote images by default — the alt is what a large share of recipients
 * will actually read.
 */
export function applyImage(value, start, end) {
  const v = String(value || '');
  const s = Math.max(0, Math.min(start ?? 0, v.length));
  const e = Math.max(s, Math.min(end ?? s, v.length));
  const alt = v.slice(s, e) || 'describe the image';
  const url = 'https://apex-scholar.com/og-image.png';
  const next = `${v.slice(0, s)}![${alt}](${url})${v.slice(e)}`;
  // Caret lands on the URL — the part that always has to be replaced.
  const urlStart = s + 2 + alt.length + 2;
  return { value: next, selectionStart: urlStart, selectionEnd: urlStart + url.length };
}
