import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Text } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing } from '../../constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn({ email, password });
      // Navigation will be handled by the auth state listener
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
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
  loginButton: {
    marginTop: spacing[6],
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
