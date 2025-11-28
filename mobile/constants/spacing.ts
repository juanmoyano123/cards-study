/**
 * StudyMaster Spacing System
 * Base unit: 4px
 * Maps to 8-point grid system
 */

export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Named spacing for common use cases
export const componentSpacing = {
  buttonPaddingVertical: spacing[3], // 12px
  buttonPaddingHorizontal: spacing[6], // 24px
  cardPadding: spacing[5], // 20px
  inputPadding: spacing[3], // 12px
  sectionPaddingVertical: spacing[8], // 32px
  sectionPaddingHorizontal: spacing[4], // 16px
  stackSpacing: spacing[4], // 16px between elements
  screenPadding: spacing[4], // 16px
  screenPaddingLarge: spacing[6], // 24px
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Type exports
export type Spacing = typeof spacing;
export type ComponentSpacing = typeof componentSpacing;
export type BorderRadius = typeof borderRadius;
