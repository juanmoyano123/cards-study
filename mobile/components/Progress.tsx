import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../constants';

export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  style,
  accessibilityLabel,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedValue = Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedValue,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedValue);
    }
  }, [clampedValue, animated]);

  const getColor = () => {
    const colorMap = {
      default: colors.neutral[500],
      primary: colors.primary[500],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
    };
    return colorMap[variant];
  };

  const height = Math.round({
    sm: 4,
    md: 8,
    lg: 12,
  }[size] || 8);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      {(label || showLabel) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showLabel && (
            <Text style={styles.percentage}>{Math.round(clampedValue)}%</Text>
          )}
        </View>
      )}
      <View
        style={[styles.track, { height, borderRadius: Math.round(height / 2) }]}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel || label || 'Progress'}
        accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              height,
              backgroundColor: getColor(),
              borderRadius: Math.round(height / 2),
            },
          ]}
        />
      </View>
    </View>
  );
};

// Circular Progress
interface ProgressCircleProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  label,
  style,
  accessibilityLabel,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = Math.round((size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const getColor = () => {
    const colorMap = {
      default: colors.neutral[500],
      primary: colors.primary[500],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
    };
    return colorMap[variant];
  };

  return (
    <View
      style={[styles.circleContainer, { width: size, height: size }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label || 'Progress'}
      accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
    >
      {/* Background circle */}
      <View
        style={[
          styles.circleTrack,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size / 2),
            borderWidth: strokeWidth,
          },
        ]}
      />

      {/* Progress circle using View rotation technique */}
      <View style={[styles.circleProgress, { width: size, height: size }]}>
        <View
          style={[
            styles.circleFill,
            {
              width: size,
              height: size,
              borderRadius: Math.round(size / 2),
              borderWidth: strokeWidth,
              borderColor: getColor(),
              borderTopColor: 'transparent',
              borderRightColor: clampedValue > 50 ? getColor() : 'transparent',
              borderBottomColor: clampedValue > 75 ? getColor() : 'transparent',
              transform: [{ rotate: `${(clampedValue / 100) * 360 - 90}deg` }],
            },
          ]}
        />
      </View>

      {/* Center content */}
      {showLabel && (
        <View style={styles.circleLabelContainer}>
          <Text style={styles.circleValue}>{Math.round(clampedValue)}%</Text>
          {label && <Text style={styles.circleLabel}>{label}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  percentage: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  track: {
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTrack: {
    position: 'absolute',
    borderColor: colors.neutral[200],
  },
  circleProgress: {
    position: 'absolute',
  },
  circleFill: {
    position: 'absolute',
  },
  circleLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  circleLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
});
