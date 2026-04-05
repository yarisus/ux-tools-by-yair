/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./app.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        space: ["Nunito", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#E8EDFF",
          100: "#D7DFFF",
          500: "#213196",
          600: "#1B287A",
          700: "#152061"
        }
      }
    }
  }
};
