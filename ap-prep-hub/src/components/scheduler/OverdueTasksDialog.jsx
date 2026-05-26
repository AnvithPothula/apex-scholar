import React from 'react';
import { Button } from '../ui/UIComponents';
import { useConfirm } from '../../contexts/ConfirmContext';

const formatLocalDateTimeInput = (date = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function OverdueTasksDialog({
  tasks,
  onReschedule,
  onDelete,
  onContinue,
  onCancel,
  deletingTaskRef,
}) {
  const confirm = useConfirm();
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-850 p-6 rounded-lg max-w-lg w-full mx-4 border border-border-strong">
        <h3 className="text-xl font-bold text-content-primary mb-4">
          Overdue Tasks Detected
        </h3>
        <p className="text-content-secondary mb-4">
          You have {tasks.length} overdue task(s). Would you like to reschedule them or remove them from your list?
        </p>

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {tasks.map((task) => {
            const deadline = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
            const daysOverdue = Math.ceil((new Date() - deadline) / (1000 * 60 * 60 * 24));

            return (
              <div key={task.id} className="p-3 bg-base-800 rounded border border-border-strong">
                <h4 className="font-medium text-content-primary">{task.name}</h4>
                <p className="text-sm text-content-muted">
                  Subject: {task.subject}
                </p>
                <p className="text-sm text-error-400">
                  Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} (Due: {deadline.toLocaleDateString()})
                </p>

                <div className="flex gap-2 mt-3">
                  <input
                    type="datetime-local"
                    className="flex-1 h-8 rounded border border-border-strong bg-base-800 px-2 text-sm text-content-primary"
                    min={formatLocalDateTimeInput()}
                    onChange={(e) => {
                      if (e.target.value) {
                        onReschedule(task, e.target.value);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (deletingTaskRef?.current === task.id) return;
                      const ok = await confirm({
                        title: 'Delete task?',
                        message: `Delete "${task.name}"? This can't be undone.`,
                        confirmText: 'Delete',
                      });
                      if (ok) {
                        if (deletingTaskRef) deletingTaskRef.current = task.id;
                        onDelete(task);
                        setTimeout(() => {
                          if (deletingTaskRef) deletingTaskRef.current = null;
                        }, 1000);
                      }
                    }}
                    className="text-error-400 border-error-500 hover:bg-error-900"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onContinue}
            className="flex-1 bg-content-primary hover:bg-content-primary"
          >
            Continue Scheduling
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
