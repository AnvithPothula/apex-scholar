import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Cpu, Sparkles, Zap, Crown, LogIn } from 'lucide-react';
import geminiService, { DEFAULT_PUTER_MODEL } from '../../services/geminiService';
import errorLogger from '../../utils/errorLogger';

/**
 * Models a student can pick. Puter models run on the student's own Puter
 * account (ids from developer.puter.com/ai/models, vendor-prefixed; the
 * bare ids used before 2026-10 had been retired, so every request failed
 * over to the proxy). The standard model is Apex Scholar's own Gemini proxy
 * and is always offered, connected or not.
 * Each entry: { value, label, provider, icon, description }
 */
const PUTER_MODELS = [
  { value: DEFAULT_PUTER_MODEL,          label: 'Claude Sonnet 5.5', provider: 'Puter', icon: Crown,    description: 'Careful, step-by-step explanations' },
  { value: 'openai/gpt-5.5',             label: 'GPT-5.5',           provider: 'Puter', icon: Sparkles, description: 'Strong all-round model' },
  { value: 'google/gemini-3.8-flash',    label: 'Gemini 3.8 Flash',  provider: 'Puter', icon: Zap,      description: 'Fast, good with images' },
  { value: 'anthropic/claude-haiku-5-5', label: 'Claude Haiku 5.5',  provider: 'Puter', icon: Zap,      description: 'Very fast' },
  { value: 'openai/gpt-5.4-mini',        label: 'GPT-5.4 Mini',      provider: 'Puter', icon: Zap,      description: 'Light and quick' },
];

// The proxy decides which Gemini model serves each task; this value means
// "Apex Scholar's choice" (see geminiService's proxy note).
const STANDARD = { value: 'gemini-2.0-flash', label: 'Standard', provider: 'Apex Scholar', icon: Zap, description: "Apex Scholar's own AI (Gemini)" };
const KNOWN = new Set([...PUTER_MODELS, STANDARD].map((m) => m.value));
// Only a pick from the current list counts; older saved ids don't.
const savedPick = () => {
  try {
    const v = localStorage.getItem('apex.ai.userModel');
    return KNOWN.has(v) ? v : null;
  } catch (e) { return null; }
};

/**
 * ModelSelector — compact dropdown for choosing an AI model.
 * Shows the standard model, plus the Puter models once a Puter account is connected.
 *
 * Props:
 *   value    — currently selected model value (string)
 *   onChange — (modelValue: string) => void
 *   compact  — if true, shows icon-only below the lg breakpoint (default false)
 *   className — extra container classes
 */
export default function ModelSelector({ value, onChange, compact = false, className = '', dropUp = false }) {
  const [open, setOpen] = useState(false);
  const [hasPuter, setHasPuter] = useState(false);
  const ref = useRef(null);

  // Latest value/onChange without restarting the poll below on every render.
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  // Detect Puter availability (poll briefly on mount)
  // IMPORTANT: Only use geminiService.getPuter() which checks AUTHENTICATION,
  // not just SDK presence. window.puter.ai existing doesn't mean user is authed.
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      const puter = geminiService.getPuter();
      if (puter) {
        if (!cancelled) {
          setHasPuter(true);
          // getDefaultModel() ran before the Puter token finished restoring, so
          // it showed the standard model while requests went to Puter. Correct
          // it, unless the student actually picked the standard model.
          const { value: v, onChange: cb } = latest.current;
          if (v === STANDARD.value && !savedPick() && cb) cb(DEFAULT_PUTER_MODEL);
        }
        return true;
      }
      return false;
    };
    if (check()) return;
    // The SDK loads at idle (public/index.html) and announces itself; a fixed
    // 6-second poll used to miss it on slow networks.
    window.addEventListener('apex:puterReady', check);
    return () => { cancelled = true; window.removeEventListener('apex:puterReady', check); };
  }, []);

  // Re-check Puter availability when auth completes
  useEffect(() => {
    const handleAuthComplete = () => {
      setHasPuter(true);
      // Just connected: start on the default Puter model unless they picked the standard one.
      if (value === STANDARD.value && !savedPick() && onChange) {
        onChange(DEFAULT_PUTER_MODEL);
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
        onChange(STANDARD.value);
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

  const models = hasPuter ? [...PUTER_MODELS, STANDARD] : [STANDARD];
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
        aria-label={`AI model: ${selected.label}`}
      >
        <Cpu className="w-3.5 h-3.5 text-content-muted flex-shrink-0" strokeWidth={1.5} />
        {/* lg, not sm. The only compact caller (AI Tutors) gains a 320px inline
            sidebar at md, so a label that reappeared at sm left the composer
            118px wide on iPad portrait. Wait for the width to actually exist. */}
        <span className={compact ? 'hidden lg:inline' : ''}>{selected.label}</span>
        <ChevronDown className={`w-3 h-3 text-content-muted transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className={`absolute right-0 z-50 w-72 bg-base-800 border border-border rounded-md shadow-floating overflow-hidden animate-in fade-in duration-150 ${dropUp ? 'bottom-full mb-1 slide-in-from-bottom-2' : 'mt-1 slide-in-from-top-2'}`}>
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-xs font-medium text-content-muted">
              {hasPuter ? 'AI model (Puter models use your Puter account)' : 'AI model'}
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
              <p className="text-xs text-content-muted">
                Connect your own Puter account to choose Claude, GPT and other models.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
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

/**
 * Pretty name for a model id. Falls back to the raw id, because the id that
 * actually served a request is often one the picker never lists (the proxy's
 * fallback chain) — and showing the true id beats showing a wrong friendly name.
 */
export function getModelLabel(value) {
  if (!value) return null;
  const known = [...PUTER_MODELS, STANDARD].find(m => m.value === value);
  return known ? known.label : String(value).replace(/^(models\/|google\/)/, '');
}

/** Utility: get default model value */
export function getDefaultModel() {
  const hasPuter = !!geminiService.getPuter();
  const saved = savedPick();
  // A saved Puter pick only applies while the account is connected.
  if (saved && (hasPuter || saved === STANDARD.value)) return saved;
  return hasPuter ? DEFAULT_PUTER_MODEL : STANDARD.value;
}

/** Utility: persist selected model */
export function saveSelectedModel(modelValue) {
  try {
    localStorage.setItem('apex.ai.userModel', modelValue);
  } catch (e) { errorLogger.debug('localStorage write failed (model selector)', { error: e?.message }); }
  // Also update the geminiService live
  geminiService.setUserModel(modelValue);
}
