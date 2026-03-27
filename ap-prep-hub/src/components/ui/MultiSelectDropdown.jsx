import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

/**
 * MultiSelectDropdown — tag-based multi-select with search filtering.
 *
 * Props:
 *   options   — [{ value, label }]
 *   selected  — [value1, value2, ...]
 *   onChange  — (newSelected: string[]) => void
 *   placeholder — text when nothing selected
 */
export default function MultiSelectDropdown({ options = [], selected = [], onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const remove = (value, e) => {
    e.stopPropagation();
    onChange(selected.filter(v => v !== value));
  };

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Reset highlight when search changes
  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  const handleListKeyDown = useCallback((e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = prev < filtered.length - 1 ? prev + 1 : 0;
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = prev > 0 ? prev - 1 : filtered.length - 1;
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      toggle(filtered[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }, [open, filtered, highlightedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedLabels = selected.map(v => {
    const opt = options.find(o => o.value === v);
    return opt ? opt.label : v;
  });

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger / Tags */}
      <div
        role="button"
        tabIndex={0}
        className={`w-full min-h-[44px] px-3 py-2 bg-base-800 border rounded-lg text-left flex flex-wrap items-center gap-1.5 transition-all cursor-pointer ${
          open ? 'border-content-muted ring-2 ring-content-muted/30' : 'border-border-strong hover:border-border'
        }`}
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); } }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
      >
        {selected.length === 0 ? (
          <span className="text-content-muted text-sm">{placeholder}</span>
        ) : (
          selectedLabels.map((label, i) => (
            <span
              key={selected[i]}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-base-800 border border-border-strong/30 rounded-md text-xs text-content-muted cursor-pointer"
              onClick={(e) => remove(selected[i], e)}
              aria-label={`Remove ${label}`}
            >
              {label}
              <X className="w-3 h-3 hover:text-content-primary transition-colors" strokeWidth={1.5} />
            </span>
          ))
        )}
        <ChevronDown className={`w-4 h-4 text-content-muted ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-base-800 border border-border rounded-lg shadow-floating overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border-subtle">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="w-full px-2 py-1.5 bg-base-800 border border-border-strong rounded text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-content-muted"
              onKeyDown={handleListKeyDown}
              aria-activedescendant={highlightedIndex >= 0 ? `msd-opt-${filtered[highlightedIndex]?.value}` : undefined}
            />
          </div>
          <div aria-live="polite" className="sr-only">
            {filtered.length} {filtered.length === 1 ? 'option' : 'options'} available
          </div>
          <ul ref={listRef} className="max-h-52 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-content-muted">No matches</li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = selected.includes(opt.value);
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li
                    key={opt.value}
                    id={`msd-opt-${opt.value}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                      isHighlighted
                        ? 'bg-base-750 text-content-primary'
                        : isSelected
                          ? 'bg-base-800 text-content-muted'
                          : 'text-content-secondary hover:bg-base-750'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-content-primary border-content-muted' : 'border-content-muted'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-base-950" strokeWidth={1.5} />}
                    </div>
                    <span>{opt.label}</span>
                  </li>
                );
              })
            )}
          </ul>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-border-subtle flex justify-between items-center">
              <span className="text-xs text-content-muted">{selected.length} selected</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-error-400 hover:text-error-300 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
