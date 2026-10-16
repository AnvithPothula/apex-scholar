/**
 * Theme colours are CSS variables holding hex values, which Tailwind can't
 * apply an opacity modifier to: `bg-warning-900/50` used to generate NO CSS at
 * all (about 300 classes rendered nothing). With a modifier, mix the variable
 * with transparent; without one, emit the plain variable exactly as before, so
 * browsers without color-mix() lose nothing they had.
 */
const tok = (cssVar) => ({ opacityValue }) => {
  if (opacityValue === undefined || String(opacityValue).startsWith('var(')) return `var(${cssVar})`;
  // Gradients ask for the 0% stop; plain `transparent` works in every browser.
  if (Number(opacityValue) === 0) return 'transparent';
  return `color-mix(in srgb, var(${cssVar}) calc(${opacityValue} * 100%), transparent)`;
};

/**
 * Semantic palettes define three roles: 400 text, 500 solid, 900 tint (the
 * tint flips light/dark with the theme). Other shades were used ~80 times and
 * generated nothing; alias each to the role it was reaching for.
 */
const semantic = (name) => {
  const v = (n) => tok(`--color-${name}-${n}`);
  return {
    200: v(400), 300: v(400), 400: v(400),
    500: v(500), 600: v(500), 700: v(500),
    800: v(900), 900: v(900),
  };
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '800' }],
        'h1': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h3': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '500' }],
        'label': ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.025em', fontWeight: '600' }],
        'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      colors: {
        base: {
          950: tok('--color-base-950'),
          900: tok('--color-base-900'),
          850: tok('--color-base-850'),
          800: tok('--color-base-800'),
          750: tok('--color-base-750'),
          700: tok('--color-base-750'), // alias: no 700 in the palette
        },
        border: {
          DEFAULT: tok('--color-border'),
          subtle: tok('--color-border-subtle'),
          strong: tok('--color-border-strong'),
        },
        content: {
          primary: tok('--color-text-primary'),
          secondary: tok('--color-text-secondary'),
          muted: tok('--color-text-muted'),
          disabled: tok('--color-text-disabled'),
        },
        primary: {
          300: tok('--color-primary-400'), // alias
          400: tok('--color-primary-400'),
          500: tok('--color-primary-500'),
          600: tok('--color-primary-600'),
          700: tok('--color-primary-700'),
          900: tok('--color-primary-900'),
          950: tok('--color-primary-950'),
        },
        accent: semantic('accent'),
        success: semantic('success'),
        warning: semantic('warning'),
        error: semantic('error'),
        info: semantic('info'),
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        raised: 'var(--shadow-raised)',
        floating: 'var(--shadow-floating)',
        none: 'none',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
