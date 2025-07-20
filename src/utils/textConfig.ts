// Text style configurations for the game

// Base font family used throughout the game
export const BASE_FONT_FAMILY = 'Georgia, serif';

// Color constants for easy reference
export const TEXT_COLORS = {
  gold: '#CD853F',
  goldLight: '#FFD700',
  goldDark: '#A0522D',
  skyBlue: '#87CEEB',
  lavender: '#E6E6FA',
  white: '#FFFFFF',
  darkBrown: '#2F1B14',
  brown: '#8B4513',
  red: '#FF6347',
  green: '#228B22',
  title: '#D2691E',
} as const;

// Common text styles used across scenes
export const TEXT_STYLES = {
  // Title text (large, golden)
  title: {
    fontSize: '72px',
    fontFamily: BASE_FONT_FAMILY,
    color: TEXT_COLORS.title,
    align: 'center',
    padding: { x: 20, y: 15 },
    shadow: {
      offsetX: 3,
      offsetY: 3,
      color: '#000000',
      blur: 8,
      fill: true
    }
  },

  // Subtitle text
  subtitle: {
    fontSize: '36px',
    fontFamily: 'Georgia, serif',
    color: TEXT_COLORS.skyBlue,
    fontStyle: 'italic',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 2
  },

  // Button text
  buttonStart: {
    fontSize: '32px',
    fontFamily: BASE_FONT_FAMILY,
    color: TEXT_COLORS.goldLight,
    backgroundColor: TEXT_COLORS.brown,
    padding: { x: 25, y: 15 },
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000000',
      blur: 5,
      fill: true
    }
  },


  // Medium button text
  mediumButton: {
    fontSize: '22px',
    fontFamily: BASE_FONT_FAMILY,
    color: TEXT_COLORS.goldLight,
    backgroundColor: TEXT_COLORS.brown,
    textHoverColor: TEXT_COLORS.white,
    hoverBackgroundColor: TEXT_COLORS.goldDark,
    padding: { x: 25, y: 15 }
  },

  gameLabel: {
    fontSize: '20px',
    fontFamily: BASE_FONT_FAMILY,
    color: TEXT_COLORS.skyBlue,
    backgroundColor: TEXT_COLORS.darkBrown,
    padding: { x: 20, y: 15 }
  },

  // Instructions text
  instructions: {
    fontSize: '20px',
    fontFamily: BASE_FONT_FAMILY,
    align: 'center',
    backgroundColor: TEXT_COLORS.darkBrown,
    color: TEXT_COLORS.lavender,
    padding: { x: 20, y: 15 }
  },

  // Dialogue text
  dialogue: {
    fontSize: '22px',
    fontFamily: BASE_FONT_FAMILY,
    color: TEXT_COLORS.lavender,
    align: 'center',
    lineSpacing: 8
  },

  // Loading text
  loading: {
    fontSize: '18px',
    fontFamily: BASE_FONT_FAMILY,
    color: '#FFD700',
    align: 'center'
  },

  // Floating text for scores/effects
  floating: {
    fontSize: '20px',
    fontFamily: BASE_FONT_FAMILY,
    fontStyle: 'bold'
  },


  // Celebration text
  celebration: {
    fontSize: '24px',
    fontFamily: BASE_FONT_FAMILY,
    color: '#FFD700',
    fontStyle: 'bold',
    backgroundColor: '#2F1B14',
    padding: { x: 20, y: 10 },
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000000',
      blur: 4,
      fill: true
    }
  },
} as const;

