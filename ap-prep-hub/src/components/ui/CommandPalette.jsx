import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Calendar, FileQuestion, Zap, Calculator, Settings, ArrowRight, Command } from 'lucide-react';
import { createPageUrl } from '../../utils/helpers';
import { getAvailableSubjects, getSubjectName } from '../../constants/comprehensiveCurriculum';
import { overlayVariants, modalVariants } from '../../utils/animations';

const PAGES = [
  { id: 'ai-tutors', name: 'AI Tutors', icon: Brain, path: createPageUrl('AITutors'), category: 'Pages' },
  { id: 'scheduler', name: 'Smart Scheduler', icon: Calendar, path: createPageUrl('SmartScheduler'), category: 'Pages' },
  { id: 'practice', name: 'Practice Tests', icon: FileQuestion, path: createPageUrl('PracticeTests'), category: 'Pages' },
  { id: 'flashcards', name: 'Flashcards', icon: Zap, path: createPageUrl('Flashcards'), category: 'Pages' },
  { id: 'solver', name: 'Problem Solver', icon: Calculator, path: createPageUrl('Solver'), category: 'Pages' },
  { id: 'settings', name: 'Settings', icon: Settings, path: createPageUrl('Settings'), category: 'Pages' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Build subject items lazily
  const subjectItems = useMemo(() =>
    getAvailableSubjects().map(key => ({
      id: `subject-${key}`,
      name: getSubjectName(key),
      icon: Brain,
      path: `${createPageUrl('AITutors')}/${key}`,
      category: 'Subjects',
    })),
  []);

  const allItems = useMemo(() => [...PAGES, ...subjectItems], [subjectItems]);

  const filtered = useMemo(() => {
    if (!query.trim()) return PAGES; // show pages by default
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when filtered results change
  useEffect(() => { setSelectedIndex(0); }, [filtered]);

  const select = useCallback((item) => {
    setOpen(false);
    navigate(item.path);
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      select(filtered[selectedIndex]);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-base-850 border border-border rounded-xl shadow-floating overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search strokeWidth={1.5} className="w-5 h-5 text-content-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, subjects..."
                className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-content-muted bg-base-800 border border-border rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-sm text-content-muted text-center">No results found</p>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-content-muted font-semibold">{category}</p>
                    {items.map((item) => {
                      const globalIdx = filtered.indexOf(item);
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => select(item)}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-sm transition-colors ${
                            globalIdx === selectedIndex
                              ? 'bg-base-750 text-content-primary'
                              : 'text-content-secondary hover:bg-base-800'
                          }`}
                        >
                          <Icon strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 truncate">{item.name}</span>
                          {globalIdx === selectedIndex && (
                            <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 text-content-muted" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-content-muted">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-base-800 border border-border rounded font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-base-800 border border-border rounded font-mono">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-base-800 border border-border rounded font-mono">esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small trigger button for the nav bar — shows Cmd+K hint */
export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-content-muted bg-base-800 border border-border rounded-md hover:border-border-strong transition-colors"
      aria-label="Search (Cmd+K)"
    >
      <Search strokeWidth={1.5} className="w-3.5 h-3.5" />
      <span>Search</span>
      <kbd className="flex items-center gap-0.5 text-[10px] font-mono">
        <Command strokeWidth={1.5} className="w-2.5 h-2.5" />K
      </kbd>
    </button>
  );
}
