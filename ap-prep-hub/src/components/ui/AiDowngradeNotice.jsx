import { useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';

const NOTICE_KEY = 'apex.ai.downgradeNoticeShown';

/**
 * Listens for the one-time `apex:ai-downgraded` event that geminiService fires
 * when premium AI runs out of free usage for this browser. Shows a single
 * notice, in our own words, then never again. Renders nothing.
 *
 * Must be mounted inside ToastProvider.
 */
export default function AiDowngradeNotice() {
  const { toast } = useToast();

  useEffect(() => {
    const onDowngrade = () => {
      try {
        if (localStorage.getItem(NOTICE_KEY)) return; // already shown once
        localStorage.setItem(NOTICE_KEY, String(Date.now()));
      } catch (e) { /* localStorage blocked — show anyway */ }
      toast.info(
        "Heads up: you've been moved to our standard AI model for all AI features. Everything will keep working as normal.",
        { duration: 9000 }
      );
    };
    window.addEventListener('apex:ai-downgraded', onDowngrade);
    return () => window.removeEventListener('apex:ai-downgraded', onDowngrade);
  }, [toast]);

  return null;
}
