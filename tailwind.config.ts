import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        anthracite: '#2C2C2C',
        sauge: {
          DEFAULT: '#8FAF8F',
          800: '#5A7B5A'
        },
        creme: '#F5F0E8',
        terracotta: '#C4704F',
        pierre: '#9E9E8C'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl: '0.875rem'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(44 44 44 / 0.06)',
        md: '0 4px 12px 0 rgb(44 44 44 / 0.08)'
      }
    }
  },
  plugins: []
}

export default config
