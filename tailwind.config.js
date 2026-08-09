/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: { DEFAULT: 'var(--background)' },
        foreground: { DEFAULT: 'var(--foreground)' },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: { DEFAULT: 'var(--border)' },
        input: { DEFAULT: 'var(--input)' },
        ring: { DEFAULT: 'var(--ring)' },
        // Domain-specific tokens
        'bg-deep': { DEFAULT: 'var(--bg-deep)' },
        'bg-base': { DEFAULT: 'var(--bg-base)' },
        'surface-1': { DEFAULT: 'var(--surface-1)' },
        'surface-2': { DEFAULT: 'var(--surface-2)' },
        'color-accent': { DEFAULT: 'var(--color-accent)' },
        'color-highlight': { DEFAULT: 'var(--color-highlight)' },
        success: { DEFAULT: 'var(--success)' },
        warning: { DEFAULT: 'var(--warning)' },
        danger: { DEFAULT: 'var(--danger)' },
        info: { DEFAULT: 'var(--info)' },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) * 0.5)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.5)',
        xl: 'calc(var(--radius) * 2)',
        '2xl': 'calc(var(--radius) * 3)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
        topbar: '56px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease forwards',
        'slide-up': 'slideUp 200ms ease forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
      backgroundImage: {
        'gradient-deep': 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-base) 100%)',
        'gradient-surface': 'linear-gradient(135deg, var(--surface-1) 0%, var(--surface-2) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-highlight) 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'glow': '0 0 20px rgba(142,182,155,0.15)',
        'modal': '0 20px 60px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};