import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../constants';
import * as Haptics from 'expo-haptics';

interface RatingButtonsProps {
  nextIntervals: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  onRate: (rating: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
}

interface RatingButtonConfig {
  rating: 1 | 2 | 3 | 4;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RATING_CONFIGS: RatingButtonConfig[] = [
  {
    rating: 1,
    label: 'Again',
    color: colors.error[700],
    bgColor: colors.error[50],
    borderColor: colors.error[200],
  },
  {
    rating: 2,
    label: 'Hard',
    color: colors.warning[700],
    bgColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  {
    rating: 3,
    label: 'Good',
    color: colors.success[700],
    bgColor: colors.success[50],
    borderColor: colors.success[200],
  },
  {
    rating: 4,
    label: 'Easy',
    color: colors.info[700],
    bgColor: colors.info[50],
    borderColor: colors.info[200],
  },
];

function RatingButton({
  config,
  interval,
  onPress,
  disabled,
}: {
  config: RatingButtonConfig;
  interval: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale }],
          },
        ]}
      >
        <Text
          style={[
            styles.buttonLabel,
            { color: config.color },
          ]}
        >
          {config.label}
        </Text>
        <Text
          style={[
            styles.intervalText,
            { color: config.color },
          ]}
        >
          {interval}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function RatingButtons({
  nextIntervals,
  onRate,
  disabled,
}: RatingButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How well did you remember?</Text>
      <View style={styles.buttonsRow}>
        {RATING_CONFIGS.map((config) => (
          <RatingButton
            key={config.rating}
            config={config}
            interval={nextIntervals[config.rating]}
            onPress={() => onRate(config.rating)}
            disabled={disabled}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: '600' }}>Again:</Text> Forgot completely
        </Text>
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: '600' }}>Hard:</Text> Remembered with difficulty
        </Text>
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: '600' }}>Good:</Text> Remembered well
        </Text>
        <Text style={styles.legendText}>
          <Text style={{ fontWeight: '600' }}>Easy:</Text> Instant recall
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  button: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  intervalText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  legend: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing[1],
  },
  legendText: {
    fontSize: 11,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
