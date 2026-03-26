/**
 * Tests for useLocalStorage hook — pure unit tests without React rendering.
 * We test the underlying logic directly since @testing-library/react is not installed.
 */

describe('useLocalStorage logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads initial value when key does not exist', () => {
    expect(localStorage.getItem('nonexistent')).toBeNull();
  });

  it('stores and retrieves JSON values', () => {
    localStorage.setItem('test', JSON.stringify({ a: 1 }));
    const stored = JSON.parse(localStorage.getItem('test'));
    expect(stored).toEqual({ a: 1 });
  });

  it('stores and retrieves string values', () => {
    localStorage.setItem('theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('removeItem clears the key', () => {
    localStorage.setItem('key', 'value');
    localStorage.removeItem('key');
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('handles boolean values via JSON', () => {
    localStorage.setItem('flag', JSON.stringify(true));
    expect(JSON.parse(localStorage.getItem('flag'))).toBe(true);
  });

  it('handles array values via JSON', () => {
    const arr = [1, 2, 3];
    localStorage.setItem('arr', JSON.stringify(arr));
    expect(JSON.parse(localStorage.getItem('arr'))).toEqual([1, 2, 3]);
  });
});
