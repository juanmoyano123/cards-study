/**
 * Skeleton Loading Component
 * Animated placeholder for loading states
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.default,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const containerStyle = [
    styles.skeleton,
    {
      width,
      height,
      borderRadius: radius,
    },
    style,
  ];

  return (
    <Animated.View
      style={[containerStyle, { opacity }] as any}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    />
  );
};

// Preset skeleton components
interface SkeletonTextProps {
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1 }) => (
  <View>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={24} width="70%" style={{ marginBottom: 12 }} />
    <SkeletonText lines={2} />
  </View>
);

// Skeleton for stats cards on dashboard
export const SkeletonStats: React.FC = () => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Skeleton height={38} width={40} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width={60} />
    </View>
    <View style={styles.statItem}>
      <Skeleton height={38} width={40} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width={60} />
    </View>
  </View>
);

// Skeleton for avatar
interface SkeletonAvatarProps {
  size?: number;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({ size = 80 }) => (
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
  />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  cardSkeleton: {
    padding: spacing[5],
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
});

export default Skeleton;
