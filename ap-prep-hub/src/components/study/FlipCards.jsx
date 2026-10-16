import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, BookmarkPlus, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Save a Learn deck to the student's own flashcards: a new set they name, or
 * cards appended to a set they already have. Decks are fetched only when the
 * panel opens, and dataService is imported then too, so a pack that's only
 * being read never loads it.
 */
function SaveToSet({ cards, defaultName, subject }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('new');
  const [name, setName] = useState(defaultName);
  const [decks, setDecks] = useState(null);
  const [deckId, setDeckId] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const start = async () => {
    setOpen(true); setDone(null); setError('');
    if (!user || decks) return;
    const { default: dataService } = await import('../../services/dataService');
    const mine = await dataService.getUserFlashcardDecks(user.uid);
    setDecks(mine);
    if (mine.length) setDeckId(mine[0].id);
  };

  const save = async () => {
    const asDeck = cards.map((c) => ({ question: c.front, answer: c.back }));
    setBusy(true); setError('');
    try {
      const { default: dataService } = await import('../../services/dataService');
      if (mode === 'new') {
        const title = name.trim() || defaultName;
        await dataService.saveFlashcardDeck(user.uid, {
          title, subject: subject || 'General', cards: asDeck, cardCount: asDeck.length,
          difficulty: 'Custom', description: `Saved from Learn: ${defaultName}`, progress: 0,
          isManual: true, isPublic: false, creatorName: user.displayName || 'Anonymous',
        });
        setDone(`Saved ${asDeck.length} cards to a new set, “${title}”.`);
      } else {
        const added = await dataService.addCardsToDeck(deckId, asDeck);
        const title = decks.find((d) => d.id === deckId)?.title || 'your set';
        setDone(added ? `Added ${added} ${added === 1 ? 'card' : 'cards'} to “${title}”.` : `“${title}” already has these cards.`);
      }
      setOpen(false);
      setDecks(null); // refetch next time, so the new set shows up
    } catch {
      setError('Couldn\'t save just now. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const tab = (on) => `px-2.5 py-1 rounded-md text-body-sm ${on ? 'bg-base-750 text-content-primary' : 'text-content-muted hover:text-content-primary'}`;

  return (
    <div className="mt-2">
      {done && !open && (
        <p className="flex items-center gap-1.5 text-caption text-success-400">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />{done}
          <Link to="/flashcards" className="underline text-content-secondary ml-1">Open flashcards</Link>
        </p>
      )}
      {!open && (
        <button type="button" onClick={start} className="inline-flex items-center gap-1 text-caption text-content-muted hover:text-content-primary">
          <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" /> {done ? 'Save to another set' : 'Save to my flashcards'}
        </button>
      )}
      {open && !user && (
        <p className="text-body-sm text-content-secondary">
          <Link to="/login" className="text-primary-400 underline">Sign in for free</Link> to save these cards to your own flashcards.
          <button type="button" onClick={() => setOpen(false)} className="ml-2 text-content-muted underline">Cancel</button>
        </p>
      )}
      {open && user && (
        <div className="p-3 rounded-lg border border-border-strong bg-base-850 space-y-3">
          <div className="flex gap-1" role="group" aria-label="Where to save">
            <button type="button" aria-pressed={mode === 'new'} onClick={() => setMode('new')} className={tab(mode === 'new')}>New set</button>
            <button type="button" aria-pressed={mode === 'add'} onClick={() => setMode('add')} className={tab(mode === 'add')}>Add to a set</button>
          </div>
          {mode === 'new' ? (
            <label className="block">
              <span className="text-caption text-content-muted">Set name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
                className="mt-1 w-full px-2.5 py-1.5 rounded-md bg-base-800 border border-border text-body-sm text-content-primary" />
            </label>
          ) : decks === null ? (
            <p className="text-caption text-content-muted">Loading your sets…</p>
          ) : decks.length ? (
            <label className="block">
              <span className="text-caption text-content-muted">Your sets</span>
              <select value={deckId} onChange={(e) => setDeckId(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-md bg-base-800 border border-border text-body-sm text-content-primary">
                {decks.map((d) => <option key={d.id} value={d.id}>{d.title} ({d.cardCount ?? d.cards?.length ?? 0})</option>)}
              </select>
            </label>
          ) : (
            <p className="text-caption text-content-muted">You don&apos;t have any sets yet. Make a new one.</p>
          )}
          {error && <p className="text-caption text-warning-400">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={busy || (mode === 'add' && !deckId)}
              className="px-3 py-1.5 rounded-md bg-primary-500 text-base-950 text-body-sm font-medium disabled:opacity-40">
              {busy ? 'Saving…' : `Save ${cards.length} cards`}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-body-sm text-content-muted hover:text-content-primary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** A small deck of flip cards: tap a card to see the back. */
export default function FlipCards({ cards = [], deckName = 'Learn flashcards', subject }) {
  const [flipped, setFlipped] = useState({});
  const toggle = (i) => setFlipped((f) => ({ ...f, [i]: !f[i] }));
  return (
    <div className="my-5">
      <p className="text-label text-content-muted uppercase tracking-wide mb-2">Flashcards · tap to flip</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
          <button
            key={c.front}
            type="button"
            onClick={() => toggle(i)}
            aria-pressed={!!flipped[i]}
            className={`min-h-[84px] p-3.5 rounded-lg border text-left transition-colors ${flipped[i] ? 'border-primary-500 bg-base-800' : 'border-border-strong bg-base-850 hover:border-content-muted'}`}
          >
            <span className="block text-caption text-content-muted mb-1">{flipped[i] ? 'Answer' : 'Prompt'}</span>
            <span className="block text-body-sm text-content-primary">{flipped[i] ? c.back : c.front}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-x-4">
        {Object.values(flipped).some(Boolean) && (
          <button type="button" onClick={() => setFlipped({})} className="mt-2 inline-flex items-center gap-1 text-caption text-content-muted hover:text-content-secondary">
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Flip all back
          </button>
        )}
        <div className="flex-1 min-w-[12rem]"><SaveToSet cards={cards} defaultName={deckName} subject={subject} /></div>
      </div>
    </div>
  );
}
