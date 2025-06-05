/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.{html,js}",
    "./**/*.{html,js}" // This will include HTML files in any directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 