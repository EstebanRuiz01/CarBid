/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "animate-fadeIn",
  ],
  theme: {
    extend: {
      colors: {
        'color-bronw1': '#5E503F',
        'color-white1': '#F2F4F3',
      },
    },
  },
  plugins: [],
}

