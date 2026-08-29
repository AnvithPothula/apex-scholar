import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Share2, Download, X } from 'lucide-react';
import {
  CARD_W, CARD_H, scoreColor, scoreCardLines, shareCaption, scoreCardFilename,
} from '../../utils/scoreCard';

/**
 * Draws the shareable card.
 *
 * Canvas rather than an HTML screenshot library: no dependency, and the image
 * is identical on every device, which matters when the thing being shared is a
 * number a student is claiming about themselves.
 */
function draw(ctx, lines) {
  const C = {
    bg: '#0a0a0a', card: '#171717', border: '#2e2e2e',
    text: '#ededef', secondary: '#a0a0a8', muted: '#7d7d86', teal: '#2dd4bf',
  };

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Inset panel
  const pad = 60;
  ctx.fillStyle = C.card;
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  const r = 40;
  const x = pad, y = pad, w = CARD_W - pad * 2, h = CARD_H - pad * 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const cx = CARD_W / 2;
  ctx.textAlign = 'center';

  ctx.fillStyle = C.teal;
  ctx.font = '600 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('APEX SCHOLAR', cx, 190);

  ctx.fillStyle = C.text;
  ctx.font = '700 56px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  wrap(ctx, lines.subject, cx, 290, w - 120, 66);

  ctx.fillStyle = scoreColor(lines.score);
  ctx.font = '800 300px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(String(lines.score), cx, 640);

  ctx.fillStyle = C.secondary;
  ctx.font = '500 40px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(lines.verdict, cx, 710);

  ctx.fillStyle = C.muted;
  ctx.font = '400 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(`${lines.composite}  ·  ${lines.percent}`, cx, 775);

  if (lines.next) {
    ctx.fillStyle = C.teal;
    ctx.font = '500 34px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillText(lines.next, cx, 840);
  }

  // The disclaimer sits INSIDE the frame, above the wordmark, so a crop that
  // removes it also removes the score.
  ctx.fillStyle = C.muted;
  ctx.font = '400 26px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  wrap(ctx, lines.disclaimer, cx, 935, w - 140, 34);

  ctx.fillStyle = C.secondary;
  ctx.font = '500 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText('apex-scholar.com', cx, 1005);
}

/** Long subject names ("AP English Language and Composition") must not clip. */
function wrap(ctx, text, cx, top, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, top + i * lineHeight));
}

export default function ScoreCard({ subject, result, onClose }) {
  const canvasRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const lines = scoreCardLines({ subject, result });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lines) return;
    draw(canvas.getContext('2d'), lines);
  }, [lines]);

  const toBlob = useCallback(
    () => new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png')),
    []
  );

  const download = useCallback(async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scoreCardFilename(subject);
    a.click();
    // Revoking immediately can cancel the download in Safari.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [subject, toBlob]);

  const share = useCallback(async () => {
    setBusy(true);
    setNote('');
    try {
      const blob = await toBlob();
      const file = new File([blob], scoreCardFilename(subject), { type: 'image/png' });
      // canShare({files}) is the only reliable test — navigator.share exists on
      // desktop Chrome but rejects files, which would look like a crash.
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareCaption(lines) });
      } else {
        await download();
        setNote('Saved the image — your browser can’t share files directly.');
      }
    } catch (err) {
      // AbortError just means the student closed the share sheet.
      if (err && err.name !== 'AbortError') setNote('Could not share. Try downloading instead.');
    } finally {
      setBusy(false);
    }
  }, [subject, lines, toBlob, download]);

  if (!lines) return null;

  return (
    <div className="rounded-md border border-border bg-base-850 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-body font-medium text-content-primary">Share your estimate</h3>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close share card"
            className="text-content-muted hover:text-content-primary">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={CARD_W}
        height={CARD_H}
        aria-label={`Score card: ${lines.subject}, estimated ${lines.score} out of 5`}
        className="w-full max-w-[320px] mx-auto block rounded-md border border-border-subtle"
      />

      <div className="flex gap-2 mt-3 justify-center">
        <button type="button" onClick={share} disabled={busy}
          className="inline-flex items-center gap-1.5 text-body-sm rounded-md border border-border px-3 py-1.5 text-content-primary hover:bg-base-800 disabled:opacity-50">
          <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Share
        </button>
        <button type="button" onClick={download}
          className="inline-flex items-center gap-1.5 text-body-sm rounded-md border border-border px-3 py-1.5 text-content-primary hover:bg-base-800">
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Download
        </button>
      </div>
      {note && <p className="text-caption text-content-muted text-center mt-2">{note}</p>}
    </div>
  );
}
