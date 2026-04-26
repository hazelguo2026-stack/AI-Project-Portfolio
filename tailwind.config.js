/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f6bbf',
          600: '#2D4A8A',
          700: '#1e3a7a',
          800: '#1e317a',
          900: '#1e2d6e',
        },
        accent: '#F5A623',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
}
