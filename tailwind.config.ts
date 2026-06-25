import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base
        canvas:  '#050A14',
        surface: '#080F1E',
        panel:   '#0C1525',
        card:    '#101C30',
        'card-hover': '#132038',
        // Borders
        line:    '#1A2D47',
        'line-2':'#22385A',
        'line-3':'#2A4470',
        // Accent — electric indigo bleeding into violet
        accent: {
          50:  '#EEF0FF',
          100: '#D8DCFF',
          200: '#B4BCFF',
          300: '#8A95FF',
          400: '#6370FF',
          500: '#4550F0',  // primary
          600: '#3540D4',
          700: '#2730A8',
          800: '#1A2080',
          900: '#0F1460',
        },
        // Status
        gain:  '#00C896',
        'gain-dim': '#00291F',
        loss:  '#FF4D6A',
        'loss-dim': '#2D0010',
        warn:  '#F5A623',
        'warn-dim': '#2D1A00',
        info:  '#38BDF8',
        'info-dim': '#001A2D',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
      },
      boxShadow: {
        'glow-accent': '0 0 24px rgba(69,80,240,0.20)',
        'glow-gain':   '0 0 20px rgba(0,200,150,0.18)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-up': 'slideUp .25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
