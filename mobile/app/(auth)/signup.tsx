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

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuthStore();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signUp({ email, password, name });
      // Navigate to onboarding
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'An error occurred');
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            value={name}
            onChangeText={setName}
          />

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
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            helperText="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            style={styles.signupButton}
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
