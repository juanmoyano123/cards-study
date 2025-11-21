import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { colors, textStyles } from '../constants';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyLarge' | 'caption' | 'label' | 'button';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: keyof typeof textColors;
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  onPress?: () => void;
}

const textColors = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  inverse: colors.text.inverse,
  error: colors.error[500],
  success: colors.success[500],
  warning: colors.warning[500],
  info: colors.info[500],
  brand: colors.primary[500],
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  onPress,
}) => {
  const textStyle = [
    styles.base,
    textStyles[variant],
    { color: textColors[color] },
    { textAlign: align },
    style,
  ];

  return <RNText style={textStyle} onPress={onPress}>{children}</RNText>;
};

const styles = StyleSheet.create({
  base: {
    color: colors.text.primary,
  },
});
