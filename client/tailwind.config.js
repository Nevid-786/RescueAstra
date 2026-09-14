/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cmd: {
          bg: '#f8fafc',
          panel: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          'border-bright': '#cbd5e1',
          cyan: '#0284c7',
          blue: '#2563eb',
          amber: '#d97706',
          red: '#dc2626',
          green: '#10b981',
          purple: '#8b5cf6',
          'text-primary': '#0f172a',
          'text-secondary': '#475569',
          'text-muted': '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
