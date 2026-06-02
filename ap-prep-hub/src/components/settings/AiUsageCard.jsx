import React, { useEffect, useState } from 'react';
import { Gauge, Infinity as InfinityIcon, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import aiUsageLimiter from '../../services/aiUsageLimiter';

/** One labelled usage meter (used / limit) with a colour-coded bar. */
function UsageMeter({ label, used, limit, remaining, resetAt }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = pct >= 100 ? 'bg-error-500' : pct >= 80 ? 'bg-warning-500' : 'bg-primary-500';
  const atLimit = remaining <= 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-content-secondary">{label}</span>
        <span className={atLimit ? 'text-error-400 font-medium' : 'text-content-primary'}>
          {remaining} left
          <span className="text-content-muted font-normal"> / {limit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-content-muted">
        {atLimit && resetAt
          ? `Limit reached — resets in ${aiUsageLimiter.humanizeUntil(resetAt)}`
          : resetAt
            ? `Resets in ${aiUsageLimiter.humanizeUntil(resetAt)}`
            : 'Full'}
      </div>
    </div>
  );
}

/**
 * Settings card showing the user's remaining AI usage. Reads the limiter's
 * non-mutating snapshot on mount and refreshes every 30s so countdowns (and
 * usage spent on other pages) stay current. Admins see an "unlimited" state.
 */
export default function AiUsageCard() {
  const [status, setStatus] = useState(null); // null = loading

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const s = await aiUsageLimiter.getUsageStatus();
        if (active) setStatus(s);
      } catch (e) { /* keep last known status */ }
    };
    refresh();
    const id = setInterval(refresh, 30000);
    // Refresh when the tab regains focus (usage may have changed elsewhere).
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return (
    <Card id="settings-usage" className="bg-base-850 border-border md:col-span-2 scroll-mt-32 lg:scroll-mt-20">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-content-primary text-lg sm:text-xl flex items-center gap-2">
          <Gauge className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
          AI Usage
          <span className="text-xs font-normal text-content-muted block mt-1 w-full">
            Free AI usage across tutors, solver, flashcards, and diagnostics.
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {!status ? (
          <div className="flex items-center gap-2 text-sm text-content-muted py-2">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> Loading usage…
          </div>
        ) : status.bypassed ? (
          <div className="flex items-center gap-2 text-sm text-success-400">
            <InfinityIcon className="w-4 h-4" strokeWidth={1.5} />
            Unlimited AI usage (admin account).
          </div>
        ) : (
          <div className="space-y-5">
            <UsageMeter
              label="AI requests (5-hour window)"
              used={status.general.fiveHour.used}
              limit={status.general.fiveHour.limit}
              remaining={status.general.fiveHour.remaining}
              resetAt={status.general.fiveHour.resetAt}
            />
            <UsageMeter
              label="AI requests (this week)"
              used={status.general.week.used}
              limit={status.general.week.limit}
              remaining={status.general.week.remaining}
              resetAt={status.general.week.resetAt}
            />
            <div className="pt-1 border-t border-border-subtle">
              <UsageMeter
                label="Practice tests (today)"
                used={status.test.used}
                limit={status.test.limit}
                remaining={status.test.remaining}
                resetAt={status.test.resetAt}
              />
            </div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Practice tests have their own daily limit and don't count against your AI request budget.
              Limits keep the free AI fast for everyone.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
