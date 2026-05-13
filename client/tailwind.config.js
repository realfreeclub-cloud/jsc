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
          DEFAULT: "#0F172A", // Dark Slate Blue
          dark: "#0B1121",
          light: "#1E293B",
        },
        gold: {
          DEFAULT: "#D4AF37", // Metallic Gold
          dark: "#AA8C2C",
          light: "#F3E5AB",
        },
        accent: "#EAB308", // Yellow 500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
