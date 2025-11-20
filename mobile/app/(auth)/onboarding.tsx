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

export default function OnboardingScreen() {
  const [subject, setSubject] = useState('');
  const { updateProfile, loading } = useAuthStore();

  const handleContinue = async () => {
    if (!subject) {
      Alert.alert('Error', 'Please enter your subject of study');
      return;
    }

    try {
      await updateProfile({ subject });
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
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
            Let's Get Started! 🎓
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            Tell us a bit about yourself to personalize your experience
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="What are you studying?"
            placeholder="e.g., Biology, Computer Science, Mathematics"
            value={subject}
            onChangeText={setSubject}
            helperText="This helps us organize your flashcards"
          />

          <Button
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            fullWidth
            style={styles.continueButton}
          />

          <Button
            title="Skip for now"
            onPress={handleSkip}
            variant="outline"
            fullWidth
            style={styles.skipButton}
          />
        </View>

        <View style={styles.features}>
          <Text variant="h3" align="center" style={styles.featuresTitle}>
            What you'll get:
          </Text>

          <View style={styles.feature}>
            <Text variant="body" style={styles.featureEmoji}>
              🤖
            </Text>
            <Text variant="body" color="secondary">
              AI-powered flashcard generation
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="body" style={styles.featureEmoji}>
              🧠
            </Text>
            <Text variant="body" color="secondary">
              Smart spaced repetition learning
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="body" style={styles.featureEmoji}>
              📊
            </Text>
            <Text variant="body" color="secondary">
              Progress tracking & analytics
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
    marginBottom: spacing[8],
  },
  continueButton: {
    marginTop: spacing[6],
  },
  skipButton: {
    marginTop: spacing[3],
  },
  features: {
    marginTop: spacing[8],
  },
  featuresTitle: {
    marginBottom: spacing[6],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: spacing[3],
  },
});
