/**
 * StudyMaster Typography System
 * Perfect Fourth scale (1.333 ratio)
 * Inter for headings, System fonts for body
 */

export const fontFamily = {
  heading: 'Inter_700Bold',
  body: 'System',
  mono: 'JetBrainsMono_400Regular',
} as const;

// Font sizes (in pixels)
export const fontSize = {
  xs: 12,    // metadata, captions
  sm: 14,    // secondary text
  base: 16,  // body text (baseline)
  lg: 18,    // emphasis, CTAs
  xl: 21,    // h3, card titles
  '2xl': 28, // h2, section headers
  '3xl': 38, // h1, page titles
  '4xl': 50, // hero headlines
  '5xl': 67, // landing hero (desktop)
} as const;

// Line heights (multipliers)
export const lineHeight = {
  none: 1,
  tight: 1.25,     // Headings
  snug: 1.375,     // Card titles
  normal: 1.5,     // Body text
  relaxed: 1.75,   // Flashcard content
  loose: 2,        // Emphasis
} as const;

// Font weights
export const fontWeight = {
  thin: '100',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// Letter spacing (em units)
export const letterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
} as const;

// Text style presets
export const textStyles = {
  h1: {
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
  },
  // Special for flashcard content
  flashcard: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
} as const;

// Mobile adjustments (use smaller sizes on mobile)
export const mobileTextStyles = {
  h1: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  h2: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
} as const;

// Type exports
export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type FontWeight = typeof fontWeight;
export type LetterSpacing = typeof letterSpacing;
export type TextStyles = typeof textStyles;
