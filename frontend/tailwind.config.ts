import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#020205',
          card: '#0a0a0f',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        accent: {
          primary: '#06b6d4',
          secondary: '#3b82f6',
          alert: '#f43f5e',
          warn: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'Courier', 'monospace'],
        mono: ['"JetBrains Mono"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
