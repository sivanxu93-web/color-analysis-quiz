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
        // New Palette based on 'Color Analysis App' aesthetic
        primary: {
            DEFAULT: "#D67474", // Dusty Rose
            hover: "#C05F5F",
            light: "#FADADD",
        },
        background: {
            DEFAULT: "#FFFBF7", // Warm Cream
            paper: "#FFFFFF",
        },
        text: {
            primary: "#1A1A2E", // Soft Black/Navy
            secondary: "#6B6B7F",
            accent: "#D67474",
        },
        accent: {
            gold: "#D4AF37",
            sage: "#A3C9A8",
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