/**
 * Zimbabwe Canine Registry — ZCR Design Tokens
 * Black obsidian base with premium gold accents.
 * Both light and dark use the same dark palette — ZCR is a dark-first app.
 */

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E5D096'; // Brighter, more metallic
const GOLD_DARK = '#A6893A';  // Deeper bronze for gradients
const NEAR_BLACK = '#050505'; // Even darker for higher contrast
const DARK_CARD = '#121212';
const DARK_SURFACE = '#1A1A1A';
const DARK_BORDER = '#262626';
const TEXT_PRIMARY = '#FDFCFB'; // Slightly off-white for elegance
const TEXT_MUTED = '#888888';

const zcr = {
  text: TEXT_PRIMARY,
  tint: GOLD,
  background: NEAR_BLACK,
  foreground: TEXT_PRIMARY,
  card: DARK_CARD,
  cardForeground: TEXT_PRIMARY,
  primary: GOLD,
  primaryDark: GOLD_DARK,
  primaryLight: GOLD_LIGHT,
  primaryForeground: '#000000',
  secondary: DARK_SURFACE,
  secondaryForeground: TEXT_PRIMARY,
  muted: DARK_SURFACE,
  mutedForeground: TEXT_MUTED,
  accent: GOLD_LIGHT,
  accentForeground: '#000000',
  destructive: '#FF4D4D',
  destructiveForeground: '#FFFFFF',
  border: DARK_BORDER,
  input: DARK_CARD,
  success: '#10B981',
  warning: '#F59E0B',
  surface: DARK_CARD,
  surfaceRaised: DARK_SURFACE,
};

const colors = {
  light: zcr,
  dark: zcr,
  radius: 12,
};

export default colors;
