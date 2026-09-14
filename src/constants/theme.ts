export const THEME = {
  colors: {
    background: '#0a0c10',
    backgroundDark: '#05070a',
    surface: '#12161f',
    surfaceLight: '#1b2230',
    surfaceBorder: '#273347',
    surfaceHover: '#232c3d',

    // Primary Accents - Moonlight & Shadow
    primary: '#48cae4',
    primaryGlow: 'rgba(72, 202, 228, 0.4)',
    moonlight: '#90e0ef',
    moonlightDim: '#0077b6',

    // Secondary Accents - Blood / Crimson
    crimson: '#e63946',
    crimsonGlow: 'rgba(230, 57, 70, 0.4)',
    crimsonDark: '#9b111e',
    danger: '#ff4d6d',

    // Gold / Lantern Amber
    gold: '#fca311',
    goldGlow: 'rgba(252, 163, 17, 0.35)',
    goldLight: '#ffd166',

    // Spirit / Void Purple
    voidPurple: '#7209b7',
    spiritTeal: '#5bc0be',

    // Neutrals
    white: '#f8f9fa',
    textPrimary: '#edf2f4',
    textSecondary: '#8d99ae',
    textMuted: '#55657e',
    border: '#222b3a',
    overlay: 'rgba(5, 7, 10, 0.85)',
    modalOverlay: 'rgba(3, 5, 8, 0.92)',

    // Health / Energy
    health: '#e63946',
    healthBackground: '#3a0c10',
    energy: '#48cae4',
    energyBackground: '#0b2b38',
    xp: '#a06cd5',
    xpBackground: '#281738',

    // Rarity
    common: '#adb5bd',
    rare: '#48cae4',
    epic: '#b5179e',
    legendary: '#fca311',
  },
  shadows: {
    glowMoonlight: {
      shadowColor: '#48cae4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 6,
    },
    glowCrimson: {
      shadowColor: '#e63946',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 6,
    },
    glowGold: {
      shadowColor: '#fca311',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  typography: {
    fontFamilyTitle: 'System',
    fontFamilyBody: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 40,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};
