/**
 * Import a deck by pasting a Quizlet export.
 *
 * Quizlet has no public read API, and scraping quizlet.com would breach their
 * terms — so this consumes the text their own exporter produces. That keeps the
 * feature entirely on the student's side of the line: they export their own
 * set, we parse what they paste.
 *
 * Parsing lives in utils/quizletImport.js (pure, unit-tested); this is only the
 * surface. The preview updates as you type so a wrong separator is obvious
 * before anything is saved, rather than after 200 broken cards land in Firestore.
 */

import React, { useState, useMemo } from 'react';
import { X, Upload, Loader2, ExternalLink } from 'lucide-react';
import { Button, Input } from '../ui/UIComponents';
import { parseQuizletExport, separatorLabel } from '../../utils/quizletImport';

const SEPARATORS = [
  { label: 'Detect automatically', value: '' },
  { label: 'Tab', value: '\t' },
  { label: 'Comma', value: ',' },
  { label: 'Dash ( - )', value: ' - ' },
  { label: 'Pipe ( | )', value: '|' },
];

export default function QuizletImport({ onClose, onImport, isSaving }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [separator, setSeparator] = useState('');

  const parsed = useMemo(
    () => parseQuizletExport(text, separator ? { termSeparator: separator } : {}),
    [text, separator]
  );

  const canImport = parsed.cards.length > 0 && title.trim() && !isSaving;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-base-850 rounded-lg border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-lg font-semibold text-content-primary">Import from Quizlet</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content-primary" aria-label="Close">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-body-sm text-content-secondary bg-base-800 rounded-lg p-4">
            <p className="text-content-primary mb-2">How to get your set out of Quizlet</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Open your set on <span className="text-content-primary">quizlet.com</span> (desktop — export isn't on mobile)</li>
              <li>Click the <strong>…</strong> menu next to the set title, then <strong>Export</strong></li>
              <li>Click <strong>Copy text</strong>, then paste it below</li>
            </ol>
            <p className="text-content-muted text-caption mt-2">
              Quizlet only lets you export sets you created yourself, not ones you copied from someone else.
            </p>
            <a
              href="https://help.quizlet.com/hc/en-us/articles/360034345672-Exporting-your-sets"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-400 hover:underline mt-2"
            >
              Quizlet's export guide <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </a>
          </div>

          <div>
            <label htmlFor="qz-title" className="block text-sm font-medium text-content-secondary mb-2">
              Deck name
            </label>
            <Input
              id="qz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AP Biology — Unit 3 Vocab"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="qz-text" className="block text-sm font-medium text-content-secondary mb-2">
              Pasted export
            </label>
            <textarea
              id="qz-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder={'osmosis\tthe movement of water across a membrane\nmitosis\tcell division producing two identical cells'}
              className="w-full bg-base-800 border border-border-strong rounded-lg p-3 text-body-sm text-content-primary font-mono focus:outline-none focus:ring-2 focus:ring-content-muted"
            />
          </div>

          <div>
            <label htmlFor="qz-sep" className="block text-sm font-medium text-content-secondary mb-2">
              Separator between term and definition
            </label>
            <select
              id="qz-sep"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full bg-base-800 border border-border-strong rounded-lg p-2.5 text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-content-muted"
            >
              {SEPARATORS.map((s) => (
                <option key={s.label} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Live preview. A wrong separator is obvious here instead of after
              200 broken cards are already saved. */}
          {text.trim() && (
            <div className="rounded-lg border border-border-strong bg-base-800 p-4">
              {parsed.cards.length === 0 ? (
                <p className="text-body-sm text-warning-400">
                  Couldn't find cards in that text. Try picking the separator manually above —
                  Quizlet's export uses whichever one you chose when you copied it.
                </p>
              ) : (
                <>
                  <p className="text-body-sm text-content-primary mb-2">
                    {parsed.cards.length} card{parsed.cards.length === 1 ? '' : 's'} found
                    {!separator && parsed.termSeparator && (
                      <span className="text-content-muted"> · detected {separatorLabel(parsed.termSeparator)}</span>
                    )}
                    {parsed.skipped > 0 && (
                      <span className="text-warning-400"> · {parsed.skipped} row{parsed.skipped === 1 ? '' : 's'} skipped</span>
                    )}
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {parsed.cards.slice(0, 5).map((c, i) => (
                      <div key={i} className="text-caption flex gap-2">
                        <span className="text-content-primary font-medium shrink-0 max-w-[40%] truncate">{c.front}</span>
                        <span className="text-content-muted shrink-0">→</span>
                        <span className="text-content-secondary truncate">{c.back}</span>
                      </div>
                    ))}
                    {parsed.cards.length > 5 && (
                      <p className="text-caption text-content-muted">…and {parsed.cards.length - 5} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!canImport}
            onClick={() => onImport({ title: title.trim(), cards: parsed.cards })}
          >
            {isSaving
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
              : <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />}
            Import {parsed.cards.length || ''} card{parsed.cards.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </div>
  );
}
