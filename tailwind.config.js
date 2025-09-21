// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',  // Make sure to include all relevant files
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Cormorant Garamond"', 'serif'],
        secondary: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
