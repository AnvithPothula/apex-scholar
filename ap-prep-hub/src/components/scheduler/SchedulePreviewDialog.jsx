import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/UIComponents';

/**
 * Shows a diff between the current schedule and a newly generated one,
 * letting the user confirm or cancel before overwriting.
 */
export default function SchedulePreviewDialog({
  currentSchedule,
  newSchedule,
  onConfirm,
  onCancel,
}) {
  const diff = useMemo(() => {
    const currentMap = new Map();
    const newMap = new Map();

    // Key by taskName + startTime + endTime so the diff catches changes to
    // session duration (same start, different end was previously treated
    // as "unchanged") and so two identical back-to-back sessions don't
    // collapse into one entry.
    const itemKey = (item) => {
      const start = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
      const endRaw = item.endTime || item.end || null;
      const end = endRaw
        ? (endRaw instanceof Date ? endRaw : new Date(endRaw))
        : null;
      const startStr = format(start, 'yyyy-MM-dd HH:mm');
      const endStr = end && !isNaN(end.getTime()) ? format(end, 'HH:mm') : '?';
      return `${item.task || item.taskName}::${startStr}::${endStr}`;
    };

    (currentSchedule || []).forEach(item => {
      if (item && item.startTime) currentMap.set(itemKey(item), item);
    });
    (newSchedule || []).forEach(item => {
      if (item && item.startTime) newMap.set(itemKey(item), item);
    });

    const added = [];
    const removed = [];
    const unchanged = [];

    newMap.forEach((item, key) => {
      if (currentMap.has(key)) {
        unchanged.push(item);
      } else {
        added.push(item);
      }
    });

    currentMap.forEach((item, key) => {
      if (!newMap.has(key)) {
        removed.push(item);
      }
    });

    return { added, removed, unchanged };
  }, [currentSchedule, newSchedule]);

  const formatItem = (item) => {
    const start = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
    return {
      name: item.task || item.taskName || 'Unnamed',
      date: format(start, 'EEE, MMM d'),
      time: format(start, 'h:mm a'),
      subject: item.subject || '',
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-850 p-6 rounded-lg max-w-lg w-full mx-4 border border-border-strong max-h-[80vh] flex flex-col">
        <h3 className="text-xl font-bold text-content-primary mb-2">
          Schedule Changes Preview
        </h3>
        <p className="text-content-secondary text-sm mb-4">
          {diff.added.length} added, {diff.removed.length} removed, {diff.unchanged.length} unchanged
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {diff.added.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-success-400 mb-2">
                + Added ({diff.added.length})
              </h4>
              <div className="space-y-1">
                {diff.added.map((item, i) => {
                  const f = formatItem(item);
                  return (
                    <div key={i} className="p-2 rounded bg-success-900/30 border-l-2 border-success-500 text-sm">
                      <span className="text-content-primary font-medium">{f.name}</span>
                      <span className="text-content-muted ml-2">{f.date} at {f.time}</span>
                      {f.subject && <span className="text-content-secondary ml-2">({f.subject})</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {diff.removed.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-error-400 mb-2">
                - Removed ({diff.removed.length})
              </h4>
              <div className="space-y-1">
                {diff.removed.map((item, i) => {
                  const f = formatItem(item);
                  return (
                    <div key={i} className="p-2 rounded bg-error-900/30 border-l-2 border-error-500 text-sm opacity-70">
                      <span className="text-content-primary font-medium line-through">{f.name}</span>
                      <span className="text-content-muted ml-2">{f.date} at {f.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {diff.unchanged.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-content-muted mb-2">
                Unchanged ({diff.unchanged.length})
              </h4>
              <div className="space-y-1">
                {diff.unchanged.slice(0, 5).map((item, i) => {
                  const f = formatItem(item);
                  return (
                    <div key={i} className="p-2 rounded bg-base-800 text-sm text-content-muted">
                      <span>{f.name}</span>
                      <span className="ml-2">{f.date} at {f.time}</span>
                    </div>
                  );
                })}
                {diff.unchanged.length > 5 && (
                  <p className="text-xs text-content-disabled pl-2">
                    ...and {diff.unchanged.length - 5} more unchanged sessions
                  </p>
                )}
              </div>
            </div>
          )}

          {diff.added.length === 0 && diff.removed.length === 0 && (
            <p className="text-content-muted text-center py-4">
              No changes detected — the schedule is the same.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-content-primary text-base-950 hover:opacity-90"
          >
            Apply Changes
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Keep Current
          </Button>
        </div>
      </div>
    </div>
  );
}
