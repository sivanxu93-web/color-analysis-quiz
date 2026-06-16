/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,css}"],
  theme: {
    fontFamily: {
      sans: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      serif: ["var(--font-playfair)", "Playfair Display", "serif"],
      mono: [
        "Monaco",
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
    extend: {
      colors: {
        // Aura & Hue Design System Palette
        primary: {
            DEFAULT: "#C07A60", // Terracotta
            hover: "#884C35",   // Dark Terracotta
            light: "#F5ECE7",   // Surface Container
        },
        secondary: {
            DEFAULT: "#D4A5A5", // Dusty Rose
            hover: "#7B5455",   // Dark Dusty Rose
            light: "#FFDAD9",
        },
        background: {
            DEFAULT: "#FFF8F5", // Oat
            paper: "#FFFFFF",
        },
        text: {
            primary: "#2D2926", // Charcoal
            secondary: "#53433e", // Muted Charcoal
            accent: "#C07A60",  // Terracotta
        },
        accent: {
            gold: "#D4AF37",
            sage: "#156761", // Muted Teal (Tertiary in Stitch)
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-rainbow': 'linear-gradient(to right, #C07A60 0%, #D4A5A5 50%, #FFF8F5 100%)', // Aura themed gradient
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};