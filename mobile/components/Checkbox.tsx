import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize } from '../constants';

export type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps {
  checked: boolean;
  onPress: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: CheckboxSize;
  error?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
  hapticFeedback?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  description,
  disabled = false,
  size = 'md',
  error,
  style,
  accessibilityLabel,
  hapticFeedback = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
    ]).start();

    onPress(!checked);
  };

  const boxSize = {
    sm: 18,
    md: 22,
    lg: 26,
  }[size];

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  }[size];

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={styles.touchable}
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel || label}
      >
        <Animated.View
          style={[
            styles.checkbox,
            { width: boxSize, height: boxSize },
            checked && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
            error && styles.checkboxError,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {checked && (
            <Check size={iconSize} color={colors.white} strokeWidth={3} />
          )}
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

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxDisabled: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
  },
  checkboxError: {
    borderColor: colors.error[500],
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing[3],
    paddingTop: 1,
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
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error[500],
    marginTop: spacing[1],
    marginLeft: spacing[8],
  },
});
