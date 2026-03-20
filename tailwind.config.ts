/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,css}"],
  theme: {
    fontFamily: {
      sans: ["var(--font-inter)", "Inter", "sans-serif"],
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
        // Refined Luxury Beauty Palette
        primary: {
            DEFAULT: "#E88D8D", // A slightly more vibrant, 'Expensive' Rose
            hover: "#D67474",
            light: "#FFF0F0",
        },
        background: {
            DEFAULT: "#FAF9F6", // Pearl/Alabaster background (more modern than Cream)
            paper: "#FFFFFF",
        },
        text: {
            primary: "#2D2D2D", // Deep Charcoal instead of Navy for a softer, fashion-editor look
            secondary: "#8E8E8E",
            accent: "#E88D8D",
        },
        accent: {
            gold: "#C5A059", // Muted Satin Gold
            sage: "#A3C9A8",
            silk: "#F8F6F4", // New Silk accent for secondary surfaces
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-rainbow': 'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // Soft holographic feel
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};