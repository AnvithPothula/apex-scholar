import { useEffect, useState } from 'react';
import aiUsageLimiter, { USAGE_EVENT } from '../services/aiUsageLimiter';

/**
 * Live AI usage snapshot (see aiUsageLimiter.getUsageStatus). Refreshes after
 * every AI call anywhere in the app, on tab focus, and each minute so reset
 * countdowns move. null while loading.
 */
export default function useAiUsage() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;
    const refresh = () => aiUsageLimiter.getUsageStatus()
      .then((s) => { if (active) setStatus(s); })
      .catch(() => { /* keep last known status */ });
    refresh();
    const id = setInterval(refresh, 60000);
    window.addEventListener(USAGE_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener(USAGE_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return status;
}
