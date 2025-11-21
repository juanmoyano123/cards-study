import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, lineHeight } from '../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number';
  success?: boolean;
  successText?: string;
  showCharacterCount?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  style,
  success,
  successText,
  showCharacterCount,
  accessibilityLabel,
  accessibilityHint,
  maxLength,
  value,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(type === 'password');
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    if (type === 'email') return 'none';
    return 'sentences';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          success && !hasError && styles.inputContainerSuccess,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={false}
          placeholderTextColor={colors.neutral[400]}
          editable={true}
          selectTextOnFocus={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          maxLength={maxLength}
          value={value}
          {...props}
        />

        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.passwordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
          >
            {isSecure ? (
              <EyeOff size={20} color={colors.neutral[500]} />
            ) : (
              <Eye size={20} color={colors.neutral[500]} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && type !== 'password' && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {success && !error && successText && (
        <Text style={styles.successText}>{successText}</Text>
      )}
      {helperText && !error && !successText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      {showCharacterCount && maxLength && (
        <Text style={styles.characterCount}>
          {(value as string)?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: 0.025,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.default,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error[500],
  },
  inputContainerSuccess: {
    borderColor: colors.success[500],
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    color: colors.text.primary,
  },
  leftIcon: {
    paddingLeft: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error[500],
    marginTop: spacing[1],
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.success[500],
    marginTop: spacing[1],
  },
  characterCount: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  passwordToggle: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: spacing[2],
  },
});
