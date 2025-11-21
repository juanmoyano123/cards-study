import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, lineHeight } from '../constants';

interface TextareaProps extends Omit<TextInputProps, 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
  showCharacterCount?: boolean;
  success?: boolean;
  successText?: string;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  rows = 4,
  showCharacterCount,
  success,
  successText,
  style,
  inputStyle,
  accessibilityLabel,
  accessibilityHint,
  maxLength,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const minHeight = rows * (fontSize.base * lineHeight.normal);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          { minHeight },
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          success && !hasError && styles.inputContainerSuccess,
        ]}
      >
        <TextInput
          style={[styles.input, { minHeight: minHeight - spacing[3] * 2 }, inputStyle]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          maxLength={maxLength}
          value={value}
          {...props}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.messageContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && !error && successText && (
            <Text style={styles.successText}>{successText}</Text>
          )}
          {helperText && !error && !successText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>

        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.characterCount,
              (value as string)?.length >= maxLength && styles.characterCountMax,
            ]}
          >
            {(value as string)?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
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
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.default,
    backgroundColor: colors.white,
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
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing[1],
  },
  messageContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error[500],
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.success[500],
  },
  characterCount: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing[2],
  },
  characterCountMax: {
    color: colors.error[500],
  },
});
