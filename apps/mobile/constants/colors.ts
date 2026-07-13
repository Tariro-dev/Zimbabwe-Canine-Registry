/**
 * Zimbabwe Canine Registry — ZCR Design Tokens
 * Black obsidian base with premium gold accents.
 * Both light and dark use the same dark palette — ZCR is a dark-first app.
 */

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#DFC277';
const NEAR_BLACK = '#0D0D0D';
const DARK_CARD = '#1A1A1A';
const DARK_SURFACE = '#262626';
const DARK_BORDER = '#2D2D2D';
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_MUTED = '#7A7A7A';

const zcr = {
  text: TEXT_PRIMARY,
  tint: GOLD,
  background: NEAR_BLACK,
  foreground: TEXT_PRIMARY,
  card: DARK_CARD,
  cardForeground: TEXT_PRIMARY,
  primary: GOLD,
  primaryForeground: NEAR_BLACK,
  secondary: DARK_SURFACE,
  secondaryForeground: TEXT_PRIMARY,
  muted: DARK_SURFACE,
  mutedForeground: TEXT_MUTED,
  accent: GOLD_LIGHT,
  accentForeground: NEAR_BLACK,
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  border: DARK_BORDER,
  input: DARK_CARD,
  success: '#22C55E',
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
