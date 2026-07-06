import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0d3d2e",
          DEFAULT: "#12503c",
          mint: "#8fd6b4",
          mintDark: "#6ec99a",
          cream: "#f5f2ea",
        },
        status: {
          open: "#c98a1f",
          review: "#2563a6",
          resolved: "#1f7a4d",
          pending: "#9333ea",
          rejected: "#b91c1c",
        },
      },
      fontFamily: {
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
