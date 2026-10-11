/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clarity: {
          canvas: '#F7F9FA',
          card: '#FFFFFF',
          border: '#E5E7EB',
          borderDark: '#CBD5E1',
          text: '#1E293B',
          muted: '#64748B',
          green: '#58CC02',
          greenDark: '#46A302',
          greenLight: '#EAF9E7',
          blue: '#1CB0F6',
          blueDark: '#1899D6',
          blueLight: '#EAF7FF',
          gold: '#FF9600',
          goldDark: '#E58700',
          goldLight: '#FFF7E6',
          red: '#FF4B4B',
          redDark: '#EA2B2B',
          redLight: '#FEECEC',
          purple: '#CE82FF',
          purpleDark: '#A545EE',
          purpleLight: '#F8EFFF',
        },
        warm: {
          50: '#F7F9FA',
          100: '#FFFFFF',
          200: '#E5E7EB',
          300: '#CBD5E1',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Nunito"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Nunito"', 'Georgia', 'serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 0 #CBD5E1',
        'tactile': '0 4px 0 0 #CBD5E1',
        'tactile-green': '0 4px 0 0 #46A302',
        'tactile-blue': '0 4px 0 0 #1899D6',
        'tactile-gold': '0 4px 0 0 #E58700',
        'tactile-red': '0 4px 0 0 #EA2B2B',
        'soft': '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 8px 24px -4px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
    },
  },
  plugins: [],
}

