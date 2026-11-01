import {
  saveLocalProgress, loadLocalProgress, clearLocalProgress, pickNewerProgress, cloudSaveDue, savedAtMs,
  CLOUD_SAVE_MS, CLOUD_IDLE_MS,
} from './testProgressStore';

beforeEach(() => localStorage.clear());

describe('local copy', () => {
  it('round-trips and only for the same student', () => {
    expect(saveLocalProgress('u1', { userId: 'u1', questions: [1], savedAtMs: 5 })).toBe(true);
    expect(loadLocalProgress('u1')).toEqual({ userId: 'u1', questions: [1], savedAtMs: 5 });
    expect(loadLocalProgress('u2')).toBeNull();
    clearLocalProgress('u1');
    expect(loadLocalProgress('u1')).toBeNull();
  });

  it('reports a failed save so Firestore takes over', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(saveLocalProgress('u1', { userId: 'u1' })).toBe(false);
    spy.mockRestore();
  });
});

describe('pickNewerProgress', () => {
  it('prefers whichever copy was saved last', () => {
    const local = { savedAtMs: 2000 };
    const cloudOld = { savedAtMs: 1000 };
    const cloudNew = { lastSaved: { toMillis: () => 3000 } };
    expect(pickNewerProgress(local, cloudOld)).toBe(local);
    expect(pickNewerProgress(local, cloudNew)).toBe(cloudNew);
    expect(pickNewerProgress(null, cloudOld)).toBe(cloudOld);
    expect(pickNewerProgress(local, null)).toBe(local);
    expect(savedAtMs(null)).toBe(0);
  });
});

describe('cloudSaveDue', () => {
  const at = (since) => ({ now: 1e9, lastCloudWrite: 1e9 - since });

  it('always saves when the tab is hidden or left', () => {
    expect(cloudSaveDue({ force: true, localOk: true, changed: false, ...at(0) })).toBe(true);
  });

  it('copies changed answers to Firestore at most every few minutes', () => {
    expect(cloudSaveDue({ localOk: true, changed: true, ...at(CLOUD_SAVE_MS - 1) })).toBe(false);
    expect(cloudSaveDue({ localOk: true, changed: true, ...at(CLOUD_SAVE_MS) })).toBe(true);
  });

  it('refreshes the clock rarely when nothing changed', () => {
    expect(cloudSaveDue({ localOk: true, changed: false, ...at(CLOUD_SAVE_MS) })).toBe(false);
    expect(cloudSaveDue({ localOk: true, changed: false, ...at(CLOUD_IDLE_MS) })).toBe(true);
  });

  it('falls back to saving every change when there is no local copy', () => {
    expect(cloudSaveDue({ localOk: false, changed: true, ...at(1000) })).toBe(true);
    expect(cloudSaveDue({ localOk: false, changed: false, ...at(1000) })).toBe(false);
  });

  it('writes the first change straight away, so another device can resume early', () => {
    expect(cloudSaveDue({ localOk: true, changed: true, now: Date.now(), lastCloudWrite: 0 })).toBe(true);
  });
});
