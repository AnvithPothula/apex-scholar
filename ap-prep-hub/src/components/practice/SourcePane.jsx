/**
 * SourcePane — the stimulus/source half of the two-pane test layout.
 *
 * The real digital AP exam puts source material on the left and the question +
 * answer choices on the right, each scrolling independently, so you never lose
 * sight of the source while reading the options. This app used to stack
 * everything in one column, which meant a student on a stimulus question had to
 * scroll away from the passage to see the choices — exactly what the real
 * interface is designed to prevent.
 *
 * These blocks were previously inline in TestPanel, nested *inside* the question
 * container. That nesting is why a CSS-only fix was impossible: grid only
 * positions direct children, so a grid on the outer container put the source and
 * the question in the same cell. Hoisting them here is the whole refactor.
 *
 * Renders nothing when there's no source material, so `hasSourceMaterial` can
 * gate the split layout without this component ever producing an empty pane.
 */

import React from 'react';

/** True when a question carries anything worth showing in its own pane. */
export function hasSourceMaterial(q) {
  if (!q) return false;
  return Boolean(
    (Array.isArray(q.sources) && q.sources.length > 0) ||
    q.passage ||
    (Array.isArray(q.documents) && q.documents.length > 0) ||
    q.stimulus
  );
}

export default function SourcePane({ currentQuestion, selectedDBQDocument, setSelectedDBQDocument }) {
  if (!hasSourceMaterial(currentQuestion)) return null;

  return (
    <div className="space-y-6">
      {/* Sources for Synthesis questions */}
      {currentQuestion?.sources && currentQuestion.sources.length > 0 && (
        <div className="p-6 bg-base-800 rounded-lg">
          <h4 className="font-medium text-content-secondary mb-4 text-xl">Sources:</h4>
          <div className="space-y-6">
            {currentQuestion.sources.map((source, index) => (
              <div key={index} className="border-l-4 border-success-500 pl-4">
                <div className="mb-2">
                  <span className="font-bold text-success-400">Source {String.fromCharCode(65 + index)}</span>
                  {source.title && (
                    <div className="text-sm text-content-secondary mt-1 font-medium">{source.title}</div>
                  )}
                  {source.source && (
                    <div className="text-sm text-content-muted mt-1">Source: {source.source}</div>
                  )}
                  {source.type && <div className="text-sm text-content-muted">Type: {source.type}</div>}
                </div>
                <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded">
                  {source.content || source.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passage for rhetorical analysis, poetry, or prose questions */}
      {currentQuestion?.passage && (
        <div className="p-6 bg-base-800 rounded-lg">
          <h4 className="font-medium text-content-secondary mb-4 text-xl">
            {currentQuestion.type === 'poetry-analysis' ? 'Poem:' :
             currentQuestion.type === 'prose-analysis' ? 'Passage:' :
             currentQuestion.type === 'rhetorical-analysis' ? 'Text:' :
             'Reading:'}
          </h4>
          {currentQuestion.passageInfo && (
            <div className="mb-4 text-sm text-content-muted">{currentQuestion.passageInfo}</div>
          )}
          <div className="text-content-secondary leading-relaxed bg-base-850/50 p-4 rounded font-serif">
            <pre className="whitespace-pre-wrap font-serif">{currentQuestion.passage}</pre>
          </div>
        </div>
      )}

      {/* Documents — DBQ gets a tabbed selector, everything else a plain list */}
      {currentQuestion?.documents && currentQuestion.documents.length > 0 && (
        <div>
          {currentQuestion.type === 'dbq' ? (
            <div className="space-y-4">
              <div className="p-4 bg-base-800 rounded-lg">
                <h4 className="font-medium text-content-secondary mb-4 text-lg">Historical Documents:</h4>
                <div className="flex flex-wrap gap-3 mb-4">
                  {currentQuestion.documents.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDBQDocument(selectedDBQDocument === index ? null : index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDBQDocument === index
                          ? 'bg-content-primary text-base-950 ring-2 ring-content-primary'
                          : 'bg-base-800 text-content-secondary hover:bg-base-750 border border-border-strong'
                      }`}
                    >
                      Document {String.fromCharCode(65 + index)}
                    </button>
                  ))}
                </div>

                {selectedDBQDocument !== null && currentQuestion.documents[selectedDBQDocument] && (
                  <div className="border-l-4 border-content-muted pl-4 bg-base-850/50 p-4 rounded">
                    <div className="mb-3">
                      <span className="font-bold text-content-primary">
                        Document {String.fromCharCode(65 + selectedDBQDocument)}
                      </span>
                      {currentQuestion.documents[selectedDBQDocument].source && (
                        <div className="text-sm text-content-muted mt-1">
                          Source: {currentQuestion.documents[selectedDBQDocument].source}
                        </div>
                      )}
                      {currentQuestion.documents[selectedDBQDocument].date && (
                        <div className="text-sm text-content-muted">
                          Date: {currentQuestion.documents[selectedDBQDocument].date}
                        </div>
                      )}
                    </div>
                    <div className="text-content-secondary italic leading-relaxed">
                      "{currentQuestion.documents[selectedDBQDocument].content}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-base-800 rounded-lg">
              <h4 className="font-medium text-content-secondary mb-4 text-lg">Supporting Documents:</h4>
              <div className="space-y-4">
                {currentQuestion.documents.map((doc, index) => (
                  <div key={index} className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
                    {doc.source && (
                      <div className="text-sm text-content-muted mb-2">
                        Source: {doc.source}
                        {doc.date && `, ${doc.date}`}
                      </div>
                    )}
                    <div className="text-content-secondary leading-relaxed">{doc.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standalone stimulus (MCQ/SAQ) when it isn't expressed as documents */}
      {currentQuestion?.stimulus && !currentQuestion?.documents && (() => {
        const stim = String(currentQuestion.stimulus || '');
        const sourceMatch = stim.match(/^\s*Source:\s*(.+?)\s*(?:\n|$)/i);
        const sourceLine = sourceMatch ? sourceMatch[1].trim() : null;
        const content = sourceMatch ? stim.replace(sourceMatch[0], '').trim() : stim;
        return (
          <div className="p-6 bg-base-800 rounded-lg">
            <h4 className="font-medium text-content-secondary mb-4 text-lg">Stimulus:</h4>
            {sourceLine && <div className="text-sm text-content-muted mb-2">Source: {sourceLine}</div>}
            <div className="border-l-4 border-success-500 pl-4 bg-base-850/50 p-4 rounded">
              <div className="text-content-secondary leading-relaxed italic">{content}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
