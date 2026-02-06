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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'mango-sun': '#FFB84D',
        'mango-flesh': '#FFAA33',
        'mango-gold': '#FF9500',
        'mango-sunset': '#FF6B35',
        'cream-white': '#FFF8E7',
        'cream-vanilla': '#FFEFD5',
        'graham-tan': '#D4A574',
        'graham-brown': '#B8956A',
        'graham-dark': '#8B7355',
        'tropical-green': '#7CB342',
        'mint-fresh': '#4ECDC4',
        'sky-light': '#87CEEB',
      },
    },
  },
  plugins: [],
};
export default config;