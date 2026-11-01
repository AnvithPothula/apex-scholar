import { recordPracticeTest } from './activityTracker';
import achievementsService from './achievementsService';

jest.mock('./achievementsService', () => ({ __esModule: true, default: { trackActivity: jest.fn(async () => []) } }));
jest.mock('./dataService', () => ({ __esModule: true, default: { saveStudySession: jest.fn(async () => {}) } }));

describe('recordPracticeTest', () => {
  beforeEach(() => achievementsService.trackActivity.mockClear());
  const activities = () => achievementsService.trackActivity.mock.calls.map((c) => c[1]);

  it('counts a real practice test toward the test achievements', async () => {
    await recordPracticeTest('u1', { subject: 'AP Biology', scorePercent: 80 });
    expect(activities()).toContain('complete_practice_test');
  });

  it('gives the start check and diagnostics study credit but not test credit', async () => {
    await recordPracticeTest('u1', { subject: 'AP Biology', kind: 'diagnostic' });
    await recordPracticeTest('u1', { subject: 'AP Biology', kind: 'start-check' });
    expect(activities()).not.toContain('complete_practice_test');
    expect(activities()).toContain('study_session');
  });
});
