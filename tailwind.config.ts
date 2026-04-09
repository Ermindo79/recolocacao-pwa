/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1A1A18',
          2: '#3D3D3A',
          3: '#6B6B67',
          4: '#9A9A95',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          2: '#F2F2EF',
          3: '#E8E8E4',
        },
        accent: {
          DEFAULT: '#1C3D5A',
          2: '#2A5A82',
          lt: '#E8F0F7',
        },
        warm: {
          DEFAULT: '#C4884A',
          lt: '#FAF0E6',
        },
        brand: {
          danger: '#C0392B',
          'danger-lt': '#FDF0EE',
          success: '#1A6B45',
          'success-lt': '#EBF5F0',
          warn: '#9A6B1A',
          'warn-lt': '#FDF5E6',
        },
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      borderWidth: {
        'thin': '0.5px',
      },
    },
  },
  plugins: [],
}
