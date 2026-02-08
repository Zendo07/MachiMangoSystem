export const theme = {
  colors: {
    primary: {
      mangoSun: '#FFB84D',
      mangoFlesh: '#FFAA33',
      mangoGold: '#FF9500',
      mangoSunset: '#FF6B35',
    },
    secondary: {
      creamWhite: '#FFF8E7',
      creamVanilla: '#FFEFD5',
      grahamTan: '#D4A574',
      grahamBrown: '#B8956A',
      grahamDark: '#8B7355',
    },
    accent: {
      tropicalGreen: '#7CB342',
      mintFresh: '#4ECDC4',
      skyLight: '#87CEEB',
    },
    neutral: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    },
  },

  gradients: {
    mango: 'linear-gradient(135deg, #FFB84D 0%, #FF9500 50%, #FF6B35 100%)',
    cream: 'linear-gradient(180deg, #FFF8E7 0%, #FFEFD5 100%)',
    tropical: 'linear-gradient(120deg, #7CB342 0%, #4ECDC4 100%)',
    sunset: 'linear-gradient(90deg, #FF6B35 0%, #FFB84D 50%, #87CEEB 100%)',
  },

  shadows: {
    sm: '0 2px 8px rgba(255, 107, 53, 0.1)',
    md: '0 4px 16px rgba(255, 107, 53, 0.15)',
    lg: '0 12px 32px rgba(255, 107, 53, 0.2)',
    xl: '0 20px 48px rgba(255, 107, 53, 0.25)',
    glow: '0 0 24px rgba(255, 184, 77, 0.5)',
  },

  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },

  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    full: '9999px',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  typography: {
    fonts: {
      heading: "'Righteous', cursive",
      body: "'Outfit', sans-serif",
      handwritten: "'Caveat', cursive",
    },
  },
};

export type Theme = typeof theme;