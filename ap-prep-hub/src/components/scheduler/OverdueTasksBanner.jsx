import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '../ui/UIComponents';

const formatLocalDateTimeInput = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Non-blocking inline banner showing overdue tasks.
 * Users can expand to see details, reschedule, delete, or dismiss.
 */
export default function OverdueTasksBanner({
  tasks,
  onReschedule,
  onDelete,
  onDismiss,
  deletingTaskRef,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="mb-4 rounded-lg border border-warning-400/30 bg-warning-900/20 overflow-hidden">
      {/* Collapsed header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-400" strokeWidth={1.5} />
          <span className="text-sm font-medium text-warning-400">
            {tasks.length} overdue task{tasks.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-content-muted">— tap to manage</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-content-muted hover:text-content-primary transition-colors"
            aria-label="Dismiss overdue banner"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Expanded task list */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto border-t border-warning-400/20">
          {tasks.map((task) => {
            const deadline = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline);
            const daysOverdue = Math.ceil((new Date() - deadline) / (1000 * 60 * 60 * 24));

            return (
              <div key={task.id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{task.name}</p>
                  <p className="text-xs text-error-400">
                    {daysOverdue}d overdue ({task.subject})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="datetime-local"
                    className="h-7 rounded border border-border-strong bg-base-800 px-1.5 text-xs text-content-primary w-40"
                    min={formatLocalDateTimeInput()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      if (e.target.value) {
                        onReschedule(task, e.target.value);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deletingTaskRef?.current === task.id) return;
                      if (window.confirm(`Delete "${task.name}"?`)) {
                        if (deletingTaskRef) deletingTaskRef.current = task.id;
                        onDelete(task);
                        setTimeout(() => {
                          if (deletingTaskRef) deletingTaskRef.current = null;
                        }, 1000);
                      }
                    }}
                    className="text-error-400 border-error-500 hover:bg-error-900 text-xs h-7 px-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
