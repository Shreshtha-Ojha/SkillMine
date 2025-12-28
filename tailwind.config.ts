import { Config } from "tailwindcss";

/** @type {Config} */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'mine': {
          'gold': '#D4AF37',
          'gold-light': '#E5C76B',
          'gold-dark': '#B8960C',
          'offwhite': '#FAF9F6',
          'charcoal': '#36454F',
          'charcoal-light': '#4A5D6A',
          'emerald': '#50C878',
          'emerald-dark': '#3DA35D',
          'ivory': '#FFFFF0',
          'bg': '#0a0908',
        },
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      fontFamily: {
        bebas: ["Bebas Neue", "sans-serif"],
        bionix: ["Bionix", "sans-serif"],
        moon: ['"MOONGETTI"'],
        sfText: ['"SF Pro Text"', "Arial", "sans-serif"],
        Sfpro: ['"Sfpro"'],
        Manrope: ['"Manrope"'],
        Acme: ['"Acme"'],
      },
    },
  },
  plugins: [],
};
export default config;
