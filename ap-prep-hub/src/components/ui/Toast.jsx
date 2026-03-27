import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const iconMap = {
  success: <CheckCircle className="w-4 h-4 text-success-400" strokeWidth={1.5} />,
  error: <AlertCircle className="w-4 h-4 text-error-400" strokeWidth={1.5} />,
  warning: <AlertTriangle className="w-4 h-4 text-warning-400" strokeWidth={1.5} />,
  info: <Info className="w-4 h-4 text-info-400" strokeWidth={1.5} />,
};

const borderMap = {
  success: 'border-l-success-400',
  error: 'border-l-error-400',
  warning: 'border-l-warning-400',
  info: 'border-l-info-400',
};

const progressColorMap = {
  success: 'bg-success-400',
  error: 'bg-error-400',
  warning: 'bg-warning-400',
  info: 'bg-info-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="alert"
            aria-label={`${toast.type} notification: ${toast.message}`}
            className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 bg-base-800 border border-border rounded-md shadow-floating border-l-4 ${borderMap[toast.type] || borderMap.info}`}
          >
            <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type] || iconMap.info}</div>
            <p className="text-sm text-content-primary flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-content-muted hover:text-content-primary transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>

            {/* Auto-dismiss progress bar */}
            {toast.duration > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-base-750">
                <div
                  className={`h-full ${progressColorMap[toast.type] || progressColorMap.info} opacity-60`}
                  style={{
                    animation: `toast-shrink ${toast.duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
