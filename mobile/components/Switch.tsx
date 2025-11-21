import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize } from '../constants';

export type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: SwitchSize;
  style?: ViewStyle;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
  style,
  accessibilityLabel,
  hapticFeedback = true,
}) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  const dimensions = {
    sm: { width: 36, height: 20, thumb: 16, padding: 2 },
    md: { width: 48, height: 26, thumb: 22, padding: 2 },
    lg: { width: 60, height: 32, thumb: 28, padding: 2 },
  }[size];

  const thumbTranslate = dimensions.width - dimensions.thumb - dimensions.padding * 2;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onValueChange(!value);
  };

  const thumbPosition = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [dimensions.padding, thumbTranslate + dimensions.padding],
  });

  const backgroundColor = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral[300], colors.primary[500]],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.touchable}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={accessibilityLabel || label}
      >
        <Animated.View
          style={[
            styles.track,
            {
              width: dimensions.width,
              height: dimensions.height,
              borderRadius: dimensions.height / 2,
              backgroundColor,
            },
            disabled && styles.trackDisabled,
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: dimensions.thumb,
                height: dimensions.thumb,
                borderRadius: dimensions.thumb / 2,
                transform: [{ translateX: thumbPosition }],
              },
              disabled && styles.thumbDisabled,
            ]}
          />
        </Animated.View>

        {(label || description) && (
          <View style={styles.labelContainer}>
            {label && (
              <Text
                style={[
                  styles.label,
                  styles[`${size}Label`],
                  disabled && styles.labelDisabled,
                ]}
              >
                {label}
              </Text>
            )}
            {description && (
              <Text
                style={[styles.description, disabled && styles.labelDisabled]}
              >
                {description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    justifyContent: 'center',
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbDisabled: {
    backgroundColor: colors.neutral[100],
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing[3],
  },
  label: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  smLabel: {
    fontSize: fontSize.sm,
  },
  mdLabel: {
    fontSize: fontSize.base,
  },
  lgLabel: {
    fontSize: fontSize.lg,
  },
  labelDisabled: {
    color: colors.text.tertiary,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});
