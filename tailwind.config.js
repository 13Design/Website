/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08080a',
          900: '#0c0c0e',
          850: '#111113',
          800: '#161619',
          750: '#1c1c20',
          700: '#242428',
          600: '#2e2e34',
          500: '#3c3c44',
        },
        bone: {
          50: '#f4f2ec',
          100: '#ece9e1',
          200: '#ddd9cf',
          300: '#bfb9ac',
          400: '#928d81',
          500: '#6e6a60',
        },
        ember: {
          300: '#f5a878',
          400: '#f0895b',
          500: '#e8744c',
          600: '#c95c36',
          700: '#a34a2b',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'tightest': '-0.045em',
        'tighter2': '-0.03em',
      },
      maxWidth: {
        'edge': '1240px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /* Each part starts scattered (its own --dx/--dy/--dr), snaps into
           place, holds, then drifts back. Offsets live on the element so one
           keyframe drives every block. */
        snap: {
          '0%, 10%': {
            transform: 'translate(var(--dx), var(--dy)) rotate(var(--dr))',
            opacity: '0.45',
          },
          '38%, 76%': {
            transform: 'translate(0, 0) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate(var(--dx), var(--dy)) rotate(var(--dr))',
            opacity: '0.45',
          },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.9s ease both',
        'page-in': 'page-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        snap: 'snap 7s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [],
};
