import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './frontend/pages/**/*.{html,js}',
    './frontend/assets/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primaryYellow: '#FFE135',
        primaryGreen: '#7CB342',
        primaryOrange: '#FF8C00',

        // Background Colors
        darkBg: '#8B4513',
        darkGreen: '#228B22',
        lightGreen: '#90EE90',
        skyBlue: '#87CEEB',

        // Accent Colors
        sunYellow: '#FFD700',
        brownDark: '#654321',
        brownDarker: '#4A2511',
      },
      fontFamily: {
        heading: ['Fredoka', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      borderRadius: {
        sm: '10px',
        md: '15px',
        lg: '20px',
        xl: '30px',
        full: '50px',
      },
      boxShadow: {
        sm: '0 2px 10px rgba(0, 0, 0, 0.1)',
        md: '0 5px 20px rgba(0, 0, 0, 0.15)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.2)',
        xl: '0 25px 60px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
