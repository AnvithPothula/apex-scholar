import React from 'react';
import { Button } from '../ui/UIComponents';

export default function BlackoutConflictDialog({
  conflicts,
  onOverride,
  onOverrideAll,
  onKeepBlackouts,
}) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-850 p-6 rounded-lg max-w-lg w-full mx-4 border border-border-strong max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-content-primary mb-4">
          Schedule Conflicts Detected
        </h3>
        <p className="text-content-secondary mb-4">
          The following tasks have urgent deadlines that conflict with your blackout periods.
          Would you like to override these blackouts just this once to fit in these urgent tasks?
        </p>

        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {conflicts.map((conflict, index) => {
            if (!conflict) return null;

            return (
              <div key={index} className="p-4 bg-base-800 rounded border border-border-strong">
                <h4 className="font-medium text-content-primary mb-2">{conflict.taskName || 'Unknown Task'}</h4>
                <p className="text-sm text-content-muted mb-2">
                  Due: {conflict.deadline ? new Date(conflict.deadline).toLocaleString() : 'No deadline'}
                </p>

                <div className="mb-3">
                  <p className="text-sm text-warning-400 font-medium mb-1">Conflicting blackout periods:</p>
                  {conflict.conflictingBlackouts && conflict.conflictingBlackouts.length > 0 ? (
                    conflict.conflictingBlackouts.map((blackout, bIndex) => (
                      <div key={bIndex} className="text-sm text-warning-400 ml-2 mb-1 p-2 bg-warning-900 rounded">
                        <span className="font-medium">{blackout.blackoutName || blackout.name || 'Unknown Blackout'}</span>
                        <br />
                        <span className="text-xs text-warning-400">
                          {blackout.timeRange || blackout.range || 'No time range'} on {blackout.day || 'unknown day'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-warning-400 ml-2 p-2 bg-warning-900 rounded">
                      <span className="font-medium">{conflict.conflictingBlackout?.name || conflict.conflictingBlackout?.blackoutName || 'Unknown Blackout'}</span>
                      <br />
                      <span className="text-xs text-warning-400">
                        {conflict.conflictingBlackout?.timeRange || 'No time range'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onOverride(conflict, true)}
                    className="bg-success-500 hover:bg-success-500 text-base-950"
                  >
                    Override for This Task
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOverride(conflict, false)}
                    className="text-error-400 border-error-500 hover:bg-error-900"
                  >
                    Skip This Task
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onOverrideAll}
            className="flex-1 bg-success-500 hover:bg-success-500"
          >
            Override All Conflicts ({conflicts.length})
          </Button>
          <Button
            variant="outline"
            onClick={onKeepBlackouts}
            className="flex-1"
          >
            Keep Blackouts
          </Button>
        </div>
      </div>
    </div>
  );
}
