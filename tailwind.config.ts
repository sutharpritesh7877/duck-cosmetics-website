import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5D3A7A",
          hover: "#4A2D61",
          light: "#7B529E",
          dark: "#3B1E54",
        },
        lilac: {
          DEFAULT: "#F8F6FA",
          subtle: "#F4EFF8",
          border: "#EBE6F0",
          card: "#F8F6FA",
        },
        text: {
          dark: "#1A1A1A",
          gray: "#666666",
          muted: "#888888",
          light: "#9E9E9E",
        },
        surface: {
          white: "#FFFFFF",
          lilac: "#F8F6FA",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Bodoni MT", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "Montserrat", "sans-serif"],
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
