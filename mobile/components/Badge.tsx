import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../constants';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  outlined = false,
  icon,
  style,
  accessibilityLabel,
}) => {
  const getColors = () => {
    const colorMap = {
      default: {
        bg: colors.neutral[100],
        text: colors.neutral[700],
        border: colors.neutral[300],
      },
      neutral: {
        bg: colors.neutral[100],
        text: colors.neutral[700],
        border: colors.neutral[300],
      },
      primary: {
        bg: colors.primary[100],
        text: colors.primary[700],
        border: colors.primary[500],
      },
      success: {
        bg: colors.success[100],
        text: colors.success[700],
        border: colors.success[500],
      },
      warning: {
        bg: colors.warning[100],
        text: colors.warning[700],
        border: colors.warning[500],
      },
      error: {
        bg: colors.error[100],
        text: colors.error[700],
        border: colors.error[500],
      },
      info: {
        bg: colors.info[100],
        text: colors.info[700],
        border: colors.info[500],
      },
    };
    return colorMap[variant];
  };

  const variantColors = getColors();

  return (
    <View
      style={[
        styles.container,
        styles[size],
        {
          backgroundColor: outlined ? 'transparent' : variantColors.bg,
          borderColor: variantColors.border,
          borderWidth: outlined ? 1 : 0,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.label,
          styles[`${size}Text`],
          { color: variantColors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

// Dot Badge for notifications
interface DotBadgeProps {
  count?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  max?: number;
  showZero?: boolean;
  style?: ViewStyle;
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  count,
  variant = 'error',
  size = 'md',
  max = 99,
  showZero = false,
  style,
}) => {
  const shouldShow = count !== undefined ? (showZero || count > 0) : true;
  const displayCount = count !== undefined && count > max ? `${max}+` : count;

  if (!shouldShow) return null;

  const getBackgroundColor = () => {
    const colorMap = {
      default: colors.neutral[500],
      primary: colors.primary[500],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
      info: colors.info[500],
    };
    return colorMap[variant];
  };

  const dotSize = {
    sm: count !== undefined ? 16 : 8,
    md: count !== undefined ? 20 : 10,
    lg: count !== undefined ? 24 : 12,
  }[size];

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: getBackgroundColor(),
          minWidth: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          paddingHorizontal: count !== undefined ? spacing[1] : 0,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={count !== undefined ? `${count} notifications` : 'notification'}
    >
      {count !== undefined && (
        <Text style={[styles.dotText, styles[`${size}DotText`]]}>
          {displayCount}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingVertical: spacing[0.5],
    paddingHorizontal: spacing[2],
  },
  md: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
  },
  lg: {
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[4],
  },
  icon: {
    marginRight: spacing[1],
  },
  label: {
    fontWeight: '500',
  },
  smText: {
    fontSize: fontSize.xs,
  },
  mdText: {
    fontSize: fontSize.sm,
  },
  lgText: {
    fontSize: fontSize.base,
  },
  dot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    color: colors.white,
    fontWeight: '600',
  },
  smDotText: {
    fontSize: 10,
  },
  mdDotText: {
    fontSize: 11,
  },
  lgDotText: {
    fontSize: 12,
  },
});
