/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f5',
          100: '#d9ede7',
          200: '#b5ddd3',
          300: '#87c4b6',
          400: '#4da492',
          500: '#268574',
          600: '#155e52', // Deep Forest / Tropical Green Primary
          700: '#114c42',
          800: '#0e3d36',
          900: '#0b2d28',
          DEFAULT: '#155e52',
        },
        terracotta: {
          50: '#fdf5f2',
          100: '#fae8e2',
          200: '#f5d2c6',
          300: '#ecb19e',
          400: '#e0886f',
          500: '#d95c3a', // Warm Terracotta / Coral Accent
          600: '#c14726',
          700: '#9f361a',
          800: '#822f19',
          900: '#6c2918',
          DEFAULT: '#d95c3a',
        },
        warmOrange: {
          DEFAULT: '#e8893a',
          50: '#fef7ee',
          100: '#fdedd6',
          500: '#e8893a',
          600: '#ca6e22',
        },
        sand: {
          50: '#FAF8F3', // Warm off-white / light cream
          100: '#F4EFE6',
          200: '#EAE2D2',
          300: '#DDD2BD',
          400: '#C7B99D',
          500: '#A7977A',
        },
        charcoal: {
          DEFAULT: '#17332F', // Deep green-black text
          900: '#17332F',
          800: '#244440',
          700: '#355752',
          600: '#4F706B',
          500: '#6D8C87',
          400: '#96B0AB',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(21, 94, 82, 0.04), 0 1px 2px rgba(21, 94, 82, 0.02)',
        'card': '0 4px 14px 0 rgba(23, 51, 47, 0.04), 0 1px 3px 0 rgba(23, 51, 47, 0.02)',
        'card-hover': '0 10px 25px -3px rgba(21, 94, 82, 0.08), 0 4px 6px -2px rgba(21, 94, 82, 0.03)',
        'modal': '0 20px 25px -5px rgba(17, 76, 66, 0.12), 0 10px 10px -5px rgba(17, 76, 66, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
