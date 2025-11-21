import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Text, Toast, LoadingOverlay } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing } from '../../constants';
import { useFormValidation, validators, getPasswordStrength } from '../../hooks/useFormValidation';

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              strengthStyles.bar,
              {
                backgroundColor: strength.score >= level * 2 - 1
                  ? strength.color
                  : colors.neutral[200],
              },
            ]}
          />
        ))}
      </View>
      <Text variant="caption" style={{ color: strength.color }}>
        {strength.label}
      </Text>
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    gap: spacing[2],
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
});

export default function SignUpScreen() {
  const { signUp, loading } = useAuthStore();
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  // Form validation setup
  const form = useFormValidation({
    name: {
      validators: [validators.required, validators.minLength(2)],
    },
    email: {
      validators: [validators.required, validators.email],
    },
    password: {
      validators: [validators.required, validators.password],
    },
    confirmPassword: {
      validators: [validators.required],
    },
  });

  // Custom validation for password match
  const passwordMatchError = useMemo(() => {
    if (!form.fields.confirmPassword?.touched) return undefined;
    if (form.values.confirmPassword && form.values.password !== form.values.confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  }, [form.values.password, form.values.confirmPassword, form.fields.confirmPassword?.touched]);

  const handleSignUp = async () => {
    // Validate all fields
    const isValid = form.validateAll();

    if (!isValid) {
      setToast({
        visible: true,
        message: 'Please fix the errors in the form',
        type: 'error',
      });
      return;
    }

    if (form.values.password !== form.values.confirmPassword) {
      setToast({
        visible: true,
        message: 'Passwords do not match',
        type: 'error',
      });
      return;
    }

    try {
      await signUp({
        email: form.values.email,
        password: form.values.password,
        name: form.values.name,
      });
      setToast({
        visible: true,
        message: 'Account created successfully!',
        type: 'success',
      });
      // Navigate to onboarding after short delay
      setTimeout(() => {
        router.replace('/(auth)/onboarding');
      }, 500);
    } catch (error: any) {
      setToast({
        visible: true,
        message: error.message || 'Sign up failed. Please try again.',
        type: 'error',
      });
    }
  };

  const handleLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <LoadingOverlay visible={loading} message="Creating your account..." />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" align="center">
            Create Account
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            Join StudyMaster to start learning smarter
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Your name"
            accessibilityLabel="Enter your name"
            accessibilityHint="Your display name for the app"
            {...form.getFieldProps('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Enter your email address"
            accessibilityHint="We'll use this to sign you in"
            {...form.getFieldProps('email')}
          />

          <View>
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              accessibilityLabel="Create a password"
              accessibilityHint="Must be at least 6 characters"
              {...form.getFieldProps('password')}
            />
            <PasswordStrengthIndicator password={form.values.password} />
          </View>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            accessibilityLabel="Confirm your password"
            accessibilityHint="Enter the same password again"
            {...form.getFieldProps('confirmPassword')}
            error={passwordMatchError || form.getFieldProps('confirmPassword').error}
          />

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            style={styles.signupButton}
            accessibilityLabel="Create account button"
            accessibilityHint="Tap to create your account"
          />

          <View style={styles.loginContainer}>
            <Text variant="body" color="secondary">
              Already have an account?{' '}
            </Text>
            <Text
              variant="body"
              color="brand"
              style={styles.loginLink}
              onPress={handleLogin}
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  header: {
    marginBottom: spacing[8],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: spacing[6],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  loginLink: {
    fontWeight: '600',
  },
});
