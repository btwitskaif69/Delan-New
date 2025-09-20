/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Cormorant Garamond"', 'serif'],  // for headings, brand
        secondary: ['Montserrat', 'sans-serif'],     // for body, ui text
      },
    },
  },
  plugins: [],
};
