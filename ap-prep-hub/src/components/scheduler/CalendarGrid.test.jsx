import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { format } from 'date-fns';
import CalendarGrid from './CalendarGrid';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null })
}));

jest.mock('../../config/firestore', () => ({
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

  it('draws a break block between two sessions that have a real gap', () => {
    // The scheduler leaves a 15-minute buffer after every session and it was
    // invisible on the calendar. This is that buffer, made visible.
    const day = new Date(2026, 4, 13, 9, 0, 0);
    const key = format(day, 'yyyy-MM-dd');
    const at = (h, m) => new Date(2026, 4, 13, h, m, 0);

    act(() => {
      root.render(
        <CalendarGrid
          currentDate={day}
          viewMode="week"
          tasks={[]}
          onTaskClick={jest.fn()}
          getTasksForDate={(d) => (format(d, 'yyyy-MM-dd') === key
            ? [
                { id: 's1', name: 'Calc review', startTime: at(9, 0), endTime: at(10, 0) },
                { id: 's2', name: 'Bio reading', startTime: at(10, 15), endTime: at(11, 0) },
              ]
            : [])}
          onDateClick={jest.fn()}
        />
      );
    });

    expect(container.textContent).toContain('15 minute break');
    expect(container.textContent).toContain('Calc review');
    expect(container.textContent).toContain('Bio reading');
  });

  it('does not draw a break across a gap that is not a break', () => {
    // A five-hour hole is the school day, not a rest. Labelling it would be
    // worse than leaving it blank.
    const day = new Date(2026, 4, 13, 9, 0, 0);
    const key = format(day, 'yyyy-MM-dd');
    const at = (h, m) => new Date(2026, 4, 13, h, m, 0);

    act(() => {
      root.render(
        <CalendarGrid
          currentDate={day}
          viewMode="week"
          tasks={[]}
          onTaskClick={jest.fn()}
          getTasksForDate={(d) => (format(d, 'yyyy-MM-dd') === key
            ? [
                { id: 's1', name: 'Morning block', startTime: at(9, 0), endTime: at(10, 0) },
                { id: 's2', name: 'Evening block', startTime: at(15, 0), endTime: at(16, 0) },
              ]
            : [])}
          onDateClick={jest.fn()}
        />
      );
    });

    expect(container.textContent).toContain('Morning block');
    expect(container.textContent).not.toContain('break');
  });

  it('does not make a break clickable — there is no task behind it', () => {
    const day = new Date(2026, 4, 13, 9, 0, 0);
    const key = format(day, 'yyyy-MM-dd');
    const at = (h, m) => new Date(2026, 4, 13, h, m, 0);
    const onTaskClick = jest.fn();

    act(() => {
      root.render(
        <CalendarGrid
          currentDate={day}
          viewMode="week"
          tasks={[]}
          onTaskClick={onTaskClick}
          getTasksForDate={(d) => (format(d, 'yyyy-MM-dd') === key
            ? [
                { id: 's1', name: 'A', startTime: at(9, 0), endTime: at(10, 0) },
                { id: 's2', name: 'B', startTime: at(10, 20), endTime: at(11, 0) },
              ]
            : [])}
          onDateClick={jest.fn()}
        />
      );
    });

    const breakEl = [...container.querySelectorAll('[aria-label]')]
      .find((el) => el.getAttribute('aria-label') === '20 minute break');
    expect(breakEl).toBeTruthy();
    expect(breakEl.getAttribute('role')).toBeNull();
    act(() => { breakEl.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(onTaskClick).not.toHaveBeenCalled();
  });
});
