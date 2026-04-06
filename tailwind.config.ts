import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:  '#FAF8F5',
        surface: '#F4F1EC',
        raised:  '#EDEAE3',
        border:  '#DDD9D0',
        muted:   '#C8C3B8',

        sage: {
          50:  '#F2F5F0',
          100: '#E4EBE0',
          200: '#C6D6BE',
          300: '#A4BE99',
          400: '#7DA370',
          500: '#5C8651',
          600: '#4A6D41',
          700: '#385432',
          800: '#263B22',
          900: '#142214',
        },

        dblue: {
          50:  '#F0F3F7',
          100: '#DDE4EE',
          200: '#BAC8DC',
          300: '#94AACA',
          400: '#6E8CB5',
          500: '#4F739F',
          600: '#3D5A82',
          700: '#2D4365',
          800: '#1E2D46',
          900: '#101828',
        },

        sand: {
          100: '#F5EFE0',
          200: '#E8D9B8',
          300: '#D9C08A',
          400: '#C9A55E',
          500: '#B87333',
        },

        ink: {
          DEFAULT:   '#2C2A27',
          secondary: '#6B6760',
          tertiary:  '#A09C96',
        },

        success: '#4E8C5A',
        warning: '#B87333',
        danger:  '#B34D4D',
        info:    '#4F739F',
      },

      fontFamily: {
        display: ['var(--font-lora)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-2xl': ['4rem',     { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'display-xl':  ['3.25rem',  { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'display-lg':  ['2.5rem',   { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'display-md':  ['1.875rem', { lineHeight: '1.2',  letterSpacing: '-0.025em' }],
        'display-sm':  ['1.5rem',   { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
        'body-lg':     ['1.125rem', { lineHeight: '1.75' }],
        'body-base':   ['1rem',     { lineHeight: '1.75' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.6' }],
        'body-xs':     ['0.75rem',  { lineHeight: '1.5' }],
      },

      borderRadius: {
        'card':    '0.875rem',
        'card-lg': '1.25rem',
        'pill':    '9999px',
        lg:  '0.875rem',
        md:  '0.625rem',
        sm:  '0.375rem',
      },

      boxShadow: {
        'card':         '0 1px 2px rgba(92,134,81,0.05), 0 4px 12px rgba(44,42,39,0.07), 0 16px 32px rgba(44,42,39,0.04)',
        'card-hover':   '0 2px 4px rgba(92,134,81,0.08), 0 8px 24px rgba(44,42,39,0.10), 0 24px 48px rgba(44,42,39,0.06)',
        'elevated':     '0 2px 8px rgba(92,134,81,0.08), 0 12px 32px rgba(44,42,39,0.10)',
        'floating':     '0 4px 12px rgba(92,134,81,0.10), 0 20px 48px rgba(44,42,39,0.14), 0 1px 2px rgba(44,42,39,0.06)',
        'input':        '0 1px 2px rgba(44,42,39,0.05) inset, 0 0 0 1px rgba(44,42,39,0.10)',
        'input-focus':  '0 0 0 3px rgba(92,134,81,0.18), 0 1px 2px rgba(44,42,39,0.05) inset',
        'button':       '0 1px 2px rgba(92,134,81,0.18), 0 4px 8px rgba(92,134,81,0.12)',
        'button-hover': '0 2px 4px rgba(92,134,81,0.22), 0 8px 16px rgba(92,134,81,0.16)',
      },

      backgroundImage: {
        'gradient-hero':    'radial-gradient(ellipse 80% 60% at 65% 15%, rgba(92,134,81,0.12) 0%, transparent 55%), radial-gradient(ellipse 55% 70% at 5% 85%, rgba(79,115,159,0.08) 0%, transparent 50%), radial-gradient(ellipse 40% 40% at 95% 95%, rgba(184,115,51,0.05) 0%, transparent 45%)',
        'gradient-cta':     'linear-gradient(135deg, #3A5E30 0%, #5C8651 40%, #4F739F 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #F0EDE6 0%, #E8E4DC 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(244,241,236,0.5) 100%)',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%':           { transform: 'translateY(-5px)', opacity: '1' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      animation: {
        'bounce-dot':  'bounce-dot 1.2s ease-in-out infinite',
        'fade-up':     'fade-up 0.5s cubic-bezier(0.0, 0, 0.2, 1) both',
        'fade-in':     'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
