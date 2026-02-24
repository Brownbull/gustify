import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4a7c59', light: '#6b9e7a', dark: '#35593f' },
        secondary: { DEFAULT: '#5b8fa8', light: '#7db5cc', dark: '#3d6e85' },
        accent: { DEFAULT: '#e8a87c', light: '#f0c4a4', dark: '#d48a5a' },
        surface: { DEFAULT: '#f5f0e8', light: '#faf7f2', dark: '#e8e0d0' },
      },
    },
  },
  plugins: [],
} satisfies Config
