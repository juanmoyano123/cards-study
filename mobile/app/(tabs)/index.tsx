import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { Card, Text, Button, Heatmap, LoadingOverlay } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { colors, spacing } from '../../constants';
import { HeatmapDay } from '../../services/statsService';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { stats, loading, error, loadDashboardStats, clearError } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleUpload = () => {
    router.push('/(tabs)/upload');
  };

  const handleStudy = () => {
    router.push('/(tabs)/study');
  };

  const handleDayPress = (day: HeatmapDay) => {
    Alert.alert(
      day.date,
      `${day.count} card${day.count !== 1 ? 's' : ''} studied`
    );
  };

  const hasCards = stats && stats.total_cards > 0;

  if (loading && !stats) {
    return <LoadingOverlay visible message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="h2">Welcome back, {user?.name || 'Student'}! 👋</Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {stats && stats.current_streak > 0
            ? `You're on a ${stats.current_streak} day streak! Keep it up! 🔥`
            : 'Ready to continue your learning journey?'}
        </Text>
      </View>

      {/* Stats Cards Row 1 */}
      <View style={styles.statsContainer}>
        <Card variant="elevated" style={styles.statCard}>
          <Text variant="caption" color="secondary">
            Current Streak
          </Text>
          <Text variant="h1" color="brand" style={styles.statValue}>
            {stats?.current_streak || 0}
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
            {stats?.cards_due_today || 0}
          </Text>
          <Text variant="caption" color="secondary">
            cards 📚
          </Text>
        </Card>
      </View>

      {/* Stats Cards Row 2 */}
      <View style={styles.statsContainer}>
        <Card variant="elevated" style={styles.statCard}>
          <Text variant="caption" color="secondary">
            Total Cards
          </Text>
          <Text variant="h1" color="info" style={styles.statValue}>
            {stats?.total_cards || 0}
          </Text>
          <Text variant="caption" color="secondary">
            created 📝
          </Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text variant="caption" color="secondary">
            Mastered
          </Text>
          <Text variant="h1" color="success" style={styles.statValue}>
            {stats?.total_cards_mastered || 0}
          </Text>
          <Text variant="caption" color="secondary">
            cards ✨
          </Text>
        </Card>
      </View>

      {/* Heatmap */}
      {hasCards && stats?.heatmap_data && (
        <Card variant="outlined" style={styles.heatmapCard}>
          <Heatmap data={stats.heatmap_data} onDayPress={handleDayPress} />
        </Card>
      )}

      {/* Progress by Subject */}
      {hasCards && stats?.progress_by_subject && stats.progress_by_subject.length > 0 && (
        <View style={styles.progressSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Progress by Subject
          </Text>
          {stats.progress_by_subject.map((subject, index) => (
            <Card key={index} variant="default" style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text variant="label">{subject.subject}</Text>
                <Text variant="caption" color="success">
                  {subject.mastery_percentage.toFixed(0)}% mastered
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${subject.mastery_percentage}%` },
                  ]}
                />
              </View>
              <View style={styles.subjectStats}>
                <Text variant="caption" color="secondary">
                  {subject.mastered_cards}/{subject.total_cards} cards
                </Text>
                <Text variant="caption" color="warning">
                  {subject.cards_due} due
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* This Week Stats */}
      {hasCards && (
        <Card variant="outlined" style={styles.weekStatsCard}>
          <Text variant="label" style={styles.weekStatsTitle}>
            This Week
          </Text>
          <View style={styles.weekStatsContainer}>
            <View style={styles.weekStat}>
              <Text variant="h2" color="brand">
                {stats?.cards_studied_this_week || 0}
              </Text>
              <Text variant="caption" color="secondary">
                cards studied
              </Text>
            </View>
            <View style={styles.weekStatDivider} />
            <View style={styles.weekStat}>
              <Text variant="h2" color="info">
                {stats?.study_time_this_week || 0}
              </Text>
              <Text variant="caption" color="secondary">
                minutes
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Empty State (only if no cards) */}
      {!hasCards && (
        <Card variant="outlined" style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FileText size={64} color={colors.neutral[300]} />
          </View>
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
      )}

      {/* Quick Actions */}
      {hasCards && (
        <View style={styles.actionsContainer}>
          <Button
            title={`Study Now (${stats?.cards_due_today || 0} due)`}
            onPress={handleStudy}
            fullWidth
            size="lg"
          />
          <Button
            title="Upload Material"
            onPress={handleUpload}
            variant="outline"
            fullWidth
            size="lg"
          />
        </View>
      )}

      {/* Feature Cards */}
      {!hasCards && (
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
      )}
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
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  statValue: {
    marginVertical: spacing[2],
  },
  heatmapCard: {
    marginBottom: spacing[4],
    padding: 0,
  },
  progressSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  subjectCard: {
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success[500],
    borderRadius: 4,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekStatsCard: {
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  weekStatsTitle: {
    marginBottom: spacing[3],
    fontWeight: '600',
  },
  weekStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
  },
  actionsContainer: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  emptyState: {
    padding: spacing[6],
    marginBottom: spacing[6],
  },
  emptyIconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
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
