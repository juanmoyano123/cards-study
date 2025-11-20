/**
 * StudyMaster Color Palette
 * Based on design system v1.0
 * All colors WCAG 2.1 AA compliant
 */

export const colors = {
  // Primary - Purple (Innovation & Academic)
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main brand color
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    500: '#10B981',
    700: '#059669',
  },

  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    700: '#D97706',
  },

  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    700: '#DC2626',
  },

  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    700: '#2563EB',
  },

  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  white: '#FFFFFF',
  black: '#000000',

  // Convenience aliases for common uses
  background: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

// Type for color values
export type ColorValue = string;
export type ColorPalette = typeof colors;
