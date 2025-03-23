/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8ecae6',
          main: '#219ebc',
          dark: '#023047'
        },
        secondary: {
          light: '#ffb703',
          main: '#fb8500',
          dark: '#d76f00'
        }
      }
    },
  },
  plugins: [],
};
