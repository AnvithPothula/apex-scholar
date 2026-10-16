import React from 'react';
import { Gauge, Infinity as InfinityIcon, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/UIComponents';
import aiUsageLimiter, { TASK_COST, TASK_LABELS, GENERAL_5H_LIMIT } from '../../services/aiUsageLimiter';
import useAiUsage from '../../hooks/useAiUsage';

/** One labelled usage meter (% used) with a colour-coded bar. */
function UsageMeter({ label, pct, atLimit, resetAt, detail }) {
  const barColor = pct >= 100 ? 'bg-error-500' : pct >= 80 ? 'bg-warning-500' : 'bg-primary-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-content-secondary">{label}</span>
        <span className={atLimit ? 'text-error-400 font-medium' : 'text-content-primary'}>
          {detail || `${pct}% used`}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-base-800 overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-content-muted">
        {atLimit && resetAt
          ? `Limit reached. Resets in ${aiUsageLimiter.humanizeUntil(resetAt)}`
          : resetAt
            ? `Resets in ${aiUsageLimiter.humanizeUntil(resetAt)}`
            : 'Nothing used yet'}
      </div>
    </div>
  );
}

// Share of a signed-in 5-hour window, to one decimal when under 1%.
const pctOf5h = (points) => {
  const p = (points / GENERAL_5H_LIMIT) * 100;
  return `${p < 1 ? p.toFixed(1) : Math.round(p * 10) / 10}%`;
};

/**
 * Settings card showing AI usage as % of the 5-hour and weekly limits, live
 * (useAiUsage refreshes after every AI call). Admins see an "unlimited" state.
 */
export default function AiUsageCard() {
  const status = useAiUsage(); // null = loading

  return (
    <Card id="settings-usage" className="bg-base-850 border-border md:col-span-2 scroll-mt-32 lg:scroll-mt-20">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-content-primary text-lg sm:text-xl flex flex-wrap items-center gap-x-2">
          <Gauge className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
          AI Usage
          <span className="text-xs font-normal text-content-muted block mt-1 w-full">
            Every AI feature uses a share of your limits. Practice tests have their own.
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
              label="5-hour limit"
              pct={status.general.fiveHour.pct}
              atLimit={status.general.fiveHour.remaining <= 0}
              resetAt={status.general.fiveHour.resetAt}
            />
            <UsageMeter
              label="Weekly limit"
              pct={status.general.week.pct}
              atLimit={status.general.week.remaining <= 0}
              resetAt={status.general.week.resetAt}
            />
            <div className="pt-1 border-t border-border-subtle">
              <UsageMeter
                label="Practice tests (today)"
                pct={Math.round((status.test.used / status.test.limit) * 100)}
                detail={`${status.test.used} of ${status.test.limit} used`}
                atLimit={status.test.remaining <= 0}
                resetAt={status.test.resetAt}
              />
            </div>
            <details className="text-xs text-content-muted">
              <summary className="cursor-pointer text-content-secondary">How much each AI action uses</summary>
              <ul className="mt-2 space-y-1">
                {Object.keys(TASK_COST).map((k) => (
                  <li key={k} className="flex justify-between gap-3">
                    <span>{TASK_LABELS[k]}</span>
                    <span className="text-content-secondary tabular-nums">{pctOf5h(TASK_COST[k])} of 5 hours</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">Bigger jobs, like a whole flashcard deck, use more than a quick answer. The weekly limit is five 5-hour windows.</p>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
