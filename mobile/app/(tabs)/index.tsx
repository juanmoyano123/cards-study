import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card, Text, Button } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing } from '../../constants';

export default function DashboardScreen() {
  const { user } = useAuthStore();

  const handleUpload = () => {
    router.push('/(tabs)/upload');
  };

  const handleStudy = () => {
    router.push('/(tabs)/study');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="h2">Welcome back, {user?.name || 'Student'}! 👋</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Ready to continue your learning journey?
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card variant="elevated" style={styles.statCard}>
          <Text variant="caption" color="secondary">
            Current Streak
          </Text>
          <Text variant="h1" color="brand" style={styles.statValue}>
            0
          </Text>
          <Text variant="caption" color="secondary">
            days 🔥
          </Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text variant="caption" color="secondary">
            Due Today
          </Text>
          <Text variant="h1" color="warning" style={styles.statValue}>
            0
          </Text>
          <Text variant="caption" color="secondary">
            cards 📚
          </Text>
        </Card>
      </View>

      {/* Empty State */}
      <Card variant="outlined" style={styles.emptyState}>
        <Text variant="h3" align="center" style={styles.emptyTitle}>
          No flashcards yet
        </Text>
        <Text variant="body" color="secondary" align="center" style={styles.emptyText}>
          Get started by uploading study materials or creating flashcards manually
        </Text>

        <View style={styles.emptyActions}>
          <Button
            title="Upload Material"
            onPress={handleUpload}
            fullWidth
            style={styles.uploadButton}
          />
          <Button
            title="Browse Study Mode"
            onPress={handleStudy}
            variant="outline"
            fullWidth
          />
        </View>
      </Card>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <Text variant="h3" style={styles.featuresTitle}>
          What's New
        </Text>

        <Card variant="default" style={styles.featureCard}>
          <Text variant="bodyLarge" style={styles.featureEmoji}>
            🤖
          </Text>
          <View style={styles.featureContent}>
            <Text variant="label">AI-Powered Generation</Text>
            <Text variant="caption" color="secondary">
              Upload PDFs and let AI create flashcards for you
            </Text>
          </View>
        </Card>

        <Card variant="default" style={styles.featureCard}>
          <Text variant="bodyLarge" style={styles.featureEmoji}>
            🧠
          </Text>
          <View style={styles.featureContent}>
            <Text variant="label">Smart Spaced Repetition</Text>
            <Text variant="caption" color="secondary">
              Learn efficiently with scientifically-proven FSRS algorithm
            </Text>
          </View>
        </Card>

        <Card variant="default" style={styles.featureCard}>
          <Text variant="bodyLarge" style={styles.featureEmoji}>
            📊
          </Text>
          <View style={styles.featureContent}>
            <Text variant="label">Progress Tracking</Text>
            <Text variant="caption" color="secondary">
              Monitor your learning with detailed analytics and heatmaps
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  statValue: {
    marginVertical: spacing[2],
  },
  emptyState: {
    padding: spacing[6],
    marginBottom: spacing[6],
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
  emptyText: {
    marginBottom: spacing[6],
  },
  emptyActions: {
    gap: spacing[3],
  },
  uploadButton: {
    marginBottom: spacing[0],
  },
  featuresContainer: {
    marginBottom: spacing[6],
  },
  featuresTitle: {
    marginBottom: spacing[4],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: spacing[3],
  },
  featureContent: {
    flex: 1,
  },
});
