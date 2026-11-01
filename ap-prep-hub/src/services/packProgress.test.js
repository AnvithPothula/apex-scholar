jest.mock('../config/firestore', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(() => Promise.resolve()),
  collection: jest.fn(), documentId: jest.fn(), query: jest.fn(), where: jest.fn(), getDocs: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getDoc, getDocs } from 'firebase/firestore';
// eslint-disable-next-line import/first
import { newer, readLocal, saveLocal, saveRemote, loadAllPackProgress } from './packProgress';

const snapOf = (docs) => ({ forEach: (fn) => Object.entries(docs).forEach(([id, data]) => fn({ id, data: () => data })) });

describe('pack progress', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the more recently updated copy', () => {
    expect(newer({ updatedAt: 2 }, { updatedAt: 1 })).toEqual({ updatedAt: 2 });
    expect(newer({ updatedAt: 1 }, { updatedAt: 2 })).toEqual({ updatedAt: 2 });
    expect(newer(null, { updatedAt: 1 })).toEqual({ updatedAt: 1 });
    expect(newer(null, null)).toBeNull();
  });

  it('keeps accounts apart on one browser, but a guest’s progress carries into sign-in', () => {
    saveLocal(null, 'ap-x/unit-1', { updatedAt: 1, who: 'guest' });
    expect(readLocal('u1', 'ap-x/unit-1')).toEqual({ updatedAt: 1, who: 'guest' });
    saveLocal('u1', 'ap-x/unit-1', { updatedAt: 2, who: 'u1' });
    expect(readLocal('u1', 'ap-x/unit-1').who).toBe('u1');
    expect(readLocal('u2', 'ap-x/unit-1').who).toBe('guest');
    saveLocal('u2', 'ap-x/unit-1', { updatedAt: 3, who: 'u2' });
    expect(readLocal('u1', 'ap-x/unit-1').who).toBe('u1');
  });

  it('lists every pack with one query, not a read per pack, and reuses it', async () => {
    getDocs.mockResolvedValueOnce(snapOf({ 'pack_ap-x__unit-1': { updatedAt: 5, who: 'remote' } }));
    const slugs = ['ap-x/unit-1', 'ap-x/unit-2', 'ap-y/unit-1'];
    const first = await loadAllPackProgress('u9', slugs);
    expect(first).toEqual({ 'ap-x/unit-1': { updatedAt: 5, who: 'remote' } });
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(getDoc).not.toHaveBeenCalled();

    // A save from this tab updates the kept copy, so the list never goes stale
    // and the next visit to the list costs nothing.
    await saveRemote('u9', 'ap-y/unit-1', { updatedAt: 7 });
    const second = await loadAllPackProgress('u9', slugs);
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(second['ap-y/unit-1']).toEqual({ updatedAt: 7, slug: 'ap-y/unit-1' });
  });

  it('falls back to this device when the list read fails', async () => {
    getDocs.mockRejectedValueOnce(new Error('offline'));
    saveLocal('u10', 'ap-x/unit-1', { updatedAt: 1 });
    expect(await loadAllPackProgress('u10', ['ap-x/unit-1'])).toEqual({ 'ap-x/unit-1': { updatedAt: 1 } });
  });
});
