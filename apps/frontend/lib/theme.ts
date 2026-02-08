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

  spacing: {
    section: {
      mobile: '3rem',
      tablet: '4rem',
      desktop: '5rem',
    },
    container: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem',
    },
  },

  zIndex: {
    background: 0,
    content: 10,
    navbar: 1000,
    modal: 2000,
  },

  gradients: {
    mango: 'linear-gradient(135deg, #FFB84D 0%, #FF9500 50%, #FF6B35 100%)',
    cream: 'linear-gradient(180deg, #FFF8E7 0%, #FFEFD5 100%)',
    tropical: 'linear-gradient(120deg, #7CB342 0%, #4ECDC4 100%)',
    sunset: 'linear-gradient(90deg, #FF6B35 0%, #FFB84D 50%, #87CEEB 100%)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export type Theme = typeof theme;