import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Cpu, Sparkles, Zap, Crown } from 'lucide-react';
import geminiService from '../../services/geminiService';

/**
 * AI model definitions — Puter models (free, unlimited) plus Google Gemini fallback.
 * Each entry: { value, label, provider, icon, description }
 */
const PUTER_MODELS = [
  { value: 'claude-sonnet-4',          label: 'Claude Sonnet 4',          provider: 'Puter', icon: Crown,     description: 'Best for education — deep reasoning' },
  { value: 'gpt-4.1',                  label: 'GPT-4.1',                  provider: 'Puter', icon: Sparkles,  description: 'Excellent quality and speed' },
  { value: 'gpt-4o',                   label: 'GPT-4o',                   provider: 'Puter', icon: Sparkles,  description: 'Strong multimodal model' },
  { value: 'google/gemini-2.5-flash',  label: 'Gemini 2.5 Flash',        provider: 'Puter', icon: Zap,       description: 'Fast and reliable' },
  { value: 'claude-haiku-4-5',         label: 'Claude Haiku 4.5',        provider: 'Puter', icon: Zap,       description: 'Very fast responses' },
  { value: 'gpt-4.1-mini',            label: 'GPT-4.1 Mini',            provider: 'Puter', icon: Zap,       description: 'Lightweight and quick' },
  { value: 'google/gemini-2.0-flash',  label: 'Gemini 2.0 Flash',        provider: 'Puter', icon: Zap,       description: 'Efficient and cost-effective' },
];

const GEMINI_ONLY = [
  { value: 'gemini-2.0-flash',  label: 'Gemini Flash',  provider: 'Google', icon: Zap, description: 'Free tier — works without Puter' },
];

/**
 * ModelSelector — compact dropdown for choosing an AI model.
 * Detects Puter SDK availability and shows full list or just Gemini Flash.
 *
 * Props:
 *   value    — currently selected model value (string)
 *   onChange — (modelValue: string) => void
 *   compact  — if true, shows icon-only on mobile (default false)
 *   className — extra container classes
 */
export default function ModelSelector({ value, onChange, compact = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [hasPuter, setHasPuter] = useState(false);
  const ref = useRef(null);

  // Detect Puter availability (poll briefly on mount)
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      // Check if user is authenticated with Puter
      const puter = geminiService.getPuter();
      if (puter) { if (!cancelled) setHasPuter(true); return true; }
      // Also check if SDK is loaded but user not yet authed
      if (window.puter && window.puter.ai) { if (!cancelled) setHasPuter(true); return true; }
      return false;
    };
    if (check()) return;
    // Poll for up to 6s
    let attempts = 0;
    const iv = setInterval(() => {
      if (check() || ++attempts >= 6) clearInterval(iv);
    }, 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const models = hasPuter ? PUTER_MODELS : GEMINI_ONLY;
  const selected = models.find(m => m.value === value) || models[0];

  const handleSelect = useCallback((model) => {
    setOpen(false);
    if (onChange) onChange(model.value);
  }, [onChange]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600 text-xs sm:text-sm text-slate-200 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Cpu className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className={compact ? 'hidden sm:inline' : ''}>{selected.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-xs font-medium text-slate-400">
              {hasPuter ? 'AI Models (via Puter — free & unlimited)' : 'AI Model'}
            </p>
          </div>
          <ul className="py-1 max-h-64 overflow-y-auto" role="listbox">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = model.value === selected.value;
              return (
                <li
                  key={model.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(model)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{model.label}</div>
                    <div className="text-xs text-slate-500 truncate">{model.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
          {!hasPuter && (
            <div className="px-3 py-2 border-t border-slate-700 bg-slate-800/50">
              <p className="text-xs text-amber-400/80">
                Connect Puter for 7+ free AI models including Claude & GPT-4
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Utility: get default model value */
export function getDefaultModel() {
  try {
    const saved = localStorage.getItem('apex.ai.userModel');
    if (saved) return saved;
  } catch {}
  return 'claude-sonnet-4';
}

/** Utility: persist selected model */
export function saveSelectedModel(modelValue) {
  try {
    localStorage.setItem('apex.ai.userModel', modelValue);
  } catch {}
  // Also update the geminiService live
  geminiService.setUserModel(modelValue);
}
