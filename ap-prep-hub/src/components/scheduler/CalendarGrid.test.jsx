import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { format } from 'date-fns';
import CalendarGrid from './CalendarGrid';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null })
}));

jest.mock('../../config/firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock('../../constants/apExamDates', () => ({
  getUpcomingExamsSync: () => []
}));

describe('CalendarGrid', () => {
  let container;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('renders week tasks that use SmartScheduler startTime/endTime fields', () => {
    const taskDate = new Date(2026, 4, 13, 9, 0, 0);
    const taskEnd = new Date(2026, 4, 13, 10, 0, 0);
    const taskDateKey = format(taskDate, 'yyyy-MM-dd');

    act(() => {
      root.render(
        <CalendarGrid
          currentDate={taskDate}
          viewMode="week"
          tasks={[]}
          onTaskClick={jest.fn()}
          getTasksForDate={(day) => (
            format(day, 'yyyy-MM-dd') === taskDateKey
              ? [{
                  id: 'session-1',
                  taskId: 'task-1',
                  name: 'Calculus Review',
                  subject: 'AP Calculus',
                  startTime: taskDate.toISOString(),
                  endTime: taskEnd.toISOString(),
                  difficulty: 'Medium'
                }]
              : []
          )}
        />
      );
    });

    expect(container.textContent).toContain('Calculus Review');
    expect(container.textContent).toContain('AP Calculus');
  });
});
