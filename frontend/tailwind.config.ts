import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primaryYellow: '#FFE135',
        primaryGreen: '#7CB342',
        primaryOrange: '#FF8C00',
        darkBg: '#8B4513',
        darkGreen: '#228B22',
        lightGreen: '#90EE90',
        skyBlue: '#87CEEB',
        sunYellow: '#FFD700',
        brownDark: '#654321',
        brownDarker: '#4A2511',
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
