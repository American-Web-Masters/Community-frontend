/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007FD4',
          50: '#E5F5FF',
          100: '#CCE8FF',
          200: '#99D1FF',
          300: '#66BAFF',
          400: '#33A3FF',
          500: '#007FD4',
          600: '#0066AA',
          700: '#004C80',
          800: '#003355',
          900: '#00192B',
        },
        accent: {
          DEFAULT: '#D3AF37',
          50: '#FBF8E8',
          100: '#F7F0D1',
          200: '#EFE1A3',
          300: '#E7D275',
          400: '#DFC147',
          500: '#D3AF37',
          600: '#A68B2C',
          700: '#7A6721',
          800: '#4D4316',
          900: '#211F0B',
        },
        text: {
          primary: '#000000',
          secondary: 'rgba(0, 0, 0, 0.42)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #007FD4 0%, #D3AF37 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #0066AA 0%, #A68B2C 100%)',
      },
    },
  },
  plugins: [],
}