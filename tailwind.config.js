/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: '#16a34a',
        primary: { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        secondary: { DEFAULT: '#0ea5e9', light: '#38bdf8' },
        surface: {
          DEFAULT: '#f0fdf4',
          card: '#ffffff',
          hover: '#dcfce7',
          border: '#d1fae5',
          muted: '#f0fdf4',
        },
        txt: {
          DEFAULT: '#1a2e1a',
          secondary: '#4b5563',
          muted: '#9ca3af',
        },
        accent: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
          dim: '#15803d',
        },
        forest: {
          DEFAULT: '#14532d',
          dark: '#052e16',
          mid: '#15803d',
          light: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'mountain': '0 8px 32px 0 rgb(5 46 22 / 0.25)',
      },
    },
  },
  plugins: [],
}
