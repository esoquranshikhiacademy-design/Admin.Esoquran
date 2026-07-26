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
        // মূল সাইটের সাথে মিল রেখে - ইসলামিক থিম, সবুজ ও গোল্ড প্যালেট
        primary: {
          50: "#f0faf5",
          100: "#d9f2e3",
          200: "#b5e5cb",
          300: "#84d1ac",
          400: "#4fb587",
          500: "#2b9a6c",
          600: "#1c7d56",
          700: "#186447",
          800: "#164f3a",
          900: "#134231",
          950: "#08251b",
        },
        gold: {
          50: "#fdf9ed",
          100: "#f9eec9",
          200: "#f3dd93",
          300: "#edc75c",
          400: "#e8b134",
          500: "#d9971e",
          600: "#bd7717",
          700: "#985717",
          800: "#7d4519",
          900: "#6a3a19",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d5dae0",
          300: "#b0b9c4",
          400: "#8492a3",
          500: "#647588",
          600: "#4f5d6f",
          700: "#414c5b",
          800: "#38414d",
          900: "#1a1f26",
          950: "#0f1216",
        },
      },
      fontFamily: {
        arabic: ["var(--font-arabic)", "serif"],
        bengali: ["var(--font-bengali)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
