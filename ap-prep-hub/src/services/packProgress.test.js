jest.mock('../config/firestore', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn() }));
// eslint-disable-next-line import/first
import { newer, readLocal, saveLocal } from './packProgress';

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
});
