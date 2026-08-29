import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import AIBusyNotice from '../components/ui/AIBusyNotice';
import { waitSecondsFor, formatWait } from '../services/aiRetry';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const addToast = useCallback((message, { type = 'info', duration = 4000, ariaLabel } = {}) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration, ariaLabel }]);
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        timers.current.delete(id);
      }, duration);
      timers.current.set(id, timeoutId);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, opts) => addToast(msg, { type: 'success', ...opts }),
    error: (msg, opts) => addToast(msg, { type: 'error', duration: 6000, ...opts }),
    warning: (msg, opts) => addToast(msg, { type: 'warning', ...opts }),
    info: (msg, opts) => addToast(msg, { type: 'info', ...opts }),

    /**
     * Rate-limit notice with a live countdown.
     *
     * Every page used to build its own string — "please wait 60 seconds" — from
     * a number that was already stale when the toast rendered, and the toast
     * then vanished after six seconds while the student was still waiting.
     * This one counts down and stays until dismissed.
     */
    aiBusy: (seconds, { reason, attempt = 1 } = {}) =>
      addToast(<AIBusyNotice compact seconds={seconds} attempt={attempt} reason={reason} />, {
        type: 'warning',
        duration: 0,
        ariaLabel: `The AI is busy. Try again in ${formatWait(waitSecondsFor(attempt, seconds))}.`,
      }),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
