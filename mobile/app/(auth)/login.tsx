import React, { useState } from 'react';
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
import { useFormValidation, validators } from '../../hooks/useFormValidation';

export default function LoginScreen() {
  const { signIn, loading } = useAuthStore();
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  // Form validation setup
  const form = useFormValidation({
    email: {
      validators: [validators.required, validators.email],
    },
    password: {
      validators: [validators.required],
    },
  });

  const handleLogin = async () => {
    // Validate all fields
    const isValid = form.validateAll();

    if (!isValid) {
      setToast({
        visible: true,
        message: 'Please enter a valid email and password',
        type: 'error',
      });
      return;
    }

    try {
      await signIn({
        email: form.values.email,
        password: form.values.password,
      });
      setToast({
        visible: true,
        message: 'Welcome back!',
        type: 'success',
      });
      // Navigation will be handled by the auth state listener
    } catch (error: any) {
      setToast({
        visible: true,
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    setToast({
      visible: true,
      message: 'Password reset coming soon!',
      type: 'info',
    });
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

      <LoadingOverlay visible={loading} message="Signing in..." />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h1" align="center">
            Welcome Back
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            Sign in to continue studying
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Enter your email address"
            accessibilityHint="The email you used to sign up"
            {...form.getFieldProps('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            accessibilityLabel="Enter your password"
            accessibilityHint="Your account password"
            {...form.getFieldProps('password')}
          />

          <View style={styles.forgotContainer}>
            <Text
              variant="caption"
              color="brand"
              style={styles.forgotLink}
              onPress={handleForgotPassword}
            >
              Forgot Password?
            </Text>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
            accessibilityLabel="Sign in button"
            accessibilityHint="Tap to sign in to your account"
          />

          <View style={styles.signupContainer}>
            <Text variant="body" color="secondary">
              Don't have an account?{' '}
            </Text>
            <Text
              variant="body"
              color="brand"
              style={styles.signupLink}
              onPress={handleSignUp}
            >
              Sign Up
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
  forgotContainer: {
    alignItems: 'flex-end',
    marginTop: -spacing[2],
    marginBottom: spacing[2],
  },
  forgotLink: {
    fontWeight: '500',
    paddingVertical: spacing[2],
  },
  loginButton: {
    marginTop: spacing[4],
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  signupLink: {
    fontWeight: '600',
  },
});
