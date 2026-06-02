import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/UIComponents';

const ConfirmContext = createContext(null);

/**
 * Promise-based confirmation dialog. Replaces blocking window.confirm() with a
 * non-blocking, on-brand modal.
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title, message, confirmText, destructive })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: opts.title || 'Are you sure?',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        destructive: opts.destructive !== false,
      });
    });
  }, []);

  const settle = useCallback((result) => {
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
    setState(null);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog state={state} onResult={settle} />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ state, onResult }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!state) return undefined;
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onResult(false); }
      else if (e.key === 'Enter') { e.preventDefault(); onResult(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, onResult]);

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-base-950/70 backdrop-blur-sm"
            onClick={() => onResult(false)}
            aria-hidden="true"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={state.title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-base-850 border border-border rounded-lg shadow-floating p-5"
          >
            <div className="flex items-start gap-3">
              {state.destructive && (
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-error-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error-400" strokeWidth={1.5} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-display font-semibold text-content-primary">{state.title}</h2>
                {state.message && (
                  <p className="mt-1 text-sm text-content-secondary whitespace-pre-line">{state.message}</p>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onResult(false)}>
                {state.cancelText}
              </Button>
              <Button
                ref={confirmRef}
                variant={state.destructive ? 'destructive' : 'default'}
                size="sm"
                onClick={() => onResult(true)}
              >
                {state.confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx.confirm;
}
