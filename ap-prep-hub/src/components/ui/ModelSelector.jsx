import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Cpu, Sparkles, Zap, Crown, LogIn } from 'lucide-react';
import geminiService from '../../services/geminiService';
import errorLogger from '../../utils/errorLogger';

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
export default function ModelSelector({ value, onChange, compact = false, className = '', dropUp = false }) {
  const [open, setOpen] = useState(false);
  const [hasPuter, setHasPuter] = useState(false);
  const ref = useRef(null);

  // Detect Puter availability (poll briefly on mount)
  // IMPORTANT: Only use geminiService.getPuter() which checks AUTHENTICATION,
  // not just SDK presence. window.puter.ai existing doesn't mean user is authed.
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      const puter = geminiService.getPuter();
      if (puter) { if (!cancelled) setHasPuter(true); return true; }
      return false;
    };
    if (check()) return;
    // Poll for up to 6s (token may take a moment to restore from localStorage)
    let attempts = 0;
    const iv = setInterval(() => {
      if (check() || ++attempts >= 6) clearInterval(iv);
    }, 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Re-check Puter availability when auth completes
  useEffect(() => {
    const handleAuthComplete = () => {
      setHasPuter(true);
      // If current model is Gemini fallback, switch to the best Puter model
      if (value === 'gemini-2.0-flash' && onChange) {
        onChange('claude-sonnet-4');
      }
    };
    window.addEventListener('apex:puterAuthComplete', handleAuthComplete);
    return () => window.removeEventListener('apex:puterAuthComplete', handleAuthComplete);
  }, [value, onChange]);

  // Handle Puter auth being cleared (from Developer Settings)
  useEffect(() => {
    const handleAuthCleared = () => {
      setHasPuter(false);
      // Force switch to Gemini fallback since Puter models are no longer available
      if (onChange) {
        onChange('gemini-2.0-flash');
      }
    };
    window.addEventListener('apex:puterAuthCleared', handleAuthCleared);
    return () => window.removeEventListener('apex:puterAuthCleared', handleAuthCleared);
  }, [onChange]);

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
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-base-800 hover:bg-base-750 border border-border text-xs sm:text-sm text-content-primary transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Cpu className="w-3.5 h-3.5 text-content-muted flex-shrink-0" strokeWidth={1.5} />
        <span className={compact ? 'hidden sm:inline' : ''}>{selected.label}</span>
        <ChevronDown className={`w-3 h-3 text-content-muted transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className={`absolute right-0 z-50 w-72 bg-base-800 border border-border rounded-md shadow-floating overflow-hidden animate-in fade-in duration-150 ${dropUp ? 'bottom-full mb-1 slide-in-from-bottom-2' : 'mt-1 slide-in-from-top-2'}`}>
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-xs font-medium text-content-muted">
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
                      ? 'bg-base-800 text-content-muted'
                      : 'text-content-secondary hover:bg-base-750'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-content-muted' : 'text-content-muted'}`} strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{model.label}</div>
                    <div className="text-xs text-content-muted truncate">{model.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-content-muted flex-shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
          {!hasPuter && (
            <div className="px-3 py-2.5 border-t border-border-subtle bg-base-850 space-y-2">
              <p className="text-xs text-warning-400/80">
                Connect Puter for 7+ free AI models including Claude & GPT-4
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  // Trigger Puter auth by clearing the skip flag and dispatching a custom event
                  try {
                    localStorage.removeItem('apex.puter.skipped');
                    localStorage.removeItem('apex.puter.skippedAt');
                  } catch (e) { errorLogger.debug('localStorage write failed (puter skip clear)', { error: e?.message }); }
                  window.dispatchEvent(new CustomEvent('apex:requestPuterAuth'));
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-base-800 hover:bg-content-primary/30 border border-content-muted/40 rounded-lg text-xs text-content-muted font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" strokeWidth={1.5} />
                Connect Puter Account
              </button>
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
    if (saved) {
      // If saved model is a Puter model but Puter isn't authenticated, fall back to Gemini
      const isPuterModel = PUTER_MODELS.some(m => m.value === saved);
      if (isPuterModel) {
        const hasPuter = !!geminiService.getPuter();
        if (!hasPuter) return 'gemini-2.0-flash';
      }
      return saved;
    }
  } catch (e) { errorLogger.debug('localStorage read failed (model selector)', { error: e?.message }); }
  // Default: only offer Puter models if user is authenticated (not just SDK loaded)
  const hasPuter = !!geminiService.getPuter();
  return hasPuter ? 'claude-sonnet-4' : 'gemini-2.0-flash';
}

/** Utility: persist selected model */
export function saveSelectedModel(modelValue) {
  try {
    localStorage.setItem('apex.ai.userModel', modelValue);
  } catch (e) { errorLogger.debug('localStorage write failed (model selector)', { error: e?.message }); }
  // Also update the geminiService live
  geminiService.setUserModel(modelValue);
}
