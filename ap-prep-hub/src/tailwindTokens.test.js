// Theme colours are CSS variables; tailwind.config.js wraps them so opacity
// modifiers (bg-warning-900/50) generate CSS. They generated nothing before.
const { theme } = require('../tailwind.config');

const c = theme.extend.colors;

test('plain classes keep the bare variable', () => {
  expect(c.warning[900]({ opacityValue: 'var(--tw-bg-opacity)' })).toBe('var(--color-warning-900)');
  expect(c.base[850]({})).toBe('var(--color-base-850)');
});

test('opacity modifiers mix with transparent; gradient 0% stops stay plain', () => {
  expect(c.warning[900]({ opacityValue: '0.5' }))
    .toBe('color-mix(in srgb, var(--color-warning-900) calc(0.5 * 100%), transparent)');
  expect(c.success[400]({ opacityValue: '0' })).toBe('transparent');
});

test('shades the palette lacks alias to the role they reach for', () => {
  const v = (fn) => fn({});
  expect(v(c.error[300])).toBe('var(--color-error-400)');
  expect(v(c.success[700])).toBe('var(--color-success-500)');
  expect(v(c.warning[800])).toBe('var(--color-warning-900)');
});
