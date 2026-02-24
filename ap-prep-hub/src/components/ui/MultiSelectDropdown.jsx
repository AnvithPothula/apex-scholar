import React, { useState, useRef, useEffect } from 'react';
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
  const ref = useRef(null);
  const inputRef = useRef(null);

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

  const selectedLabels = selected.map(v => {
    const opt = options.find(o => o.value === v);
    return opt ? opt.label : v;
  });

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger / Tags */}
      <button
        type="button"
        className={`w-full min-h-[44px] px-3 py-2 bg-slate-800/50 border rounded-lg text-left flex flex-wrap items-center gap-1.5 transition-all ${
          open ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-600 hover:border-slate-500'
        }`}
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          selectedLabels.map((label, i) => (
            <span
              key={selected[i]}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-md text-xs text-blue-300"
            >
              {label}
              <button
                type="button"
                onClick={(e) => remove(selected[i], e)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-700">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 text-blue-300'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{opt.label}</span>
                  </li>
                );
              })
            )}
          </ul>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-400">{selected.length} selected</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
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
