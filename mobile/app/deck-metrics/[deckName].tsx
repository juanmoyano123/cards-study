import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, TrendingUp, AlertCircle, Target } from 'lucide-react-native';
import { Card, Text, LoadingOverlay } from '../../components';
import { ProgressBar } from '../../components/Progress';
import { getDeckMetrics, DeckMetrics as DeckMetricsType } from '../../services/statsService';
import { colors, spacing } from '../../constants';

export default function DeckMetricsScreen() {
  const { deckName } = useLocalSearchParams<{ deckName: string }>();
  const [metrics, setMetrics] = useState<DeckMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [deckName]);

  const loadMetrics = async () => {
    if (!deckName) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDeckMetrics(deckName);
      setMetrics(data);
    } catch (err: any) {
      console.error('Error loading deck metrics:', err);
      setError(err.response?.data?.detail || 'Failed to load deck metrics');
      Alert.alert('Error', error || 'Failed to load deck metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible message="Loading deck metrics..." />;
  }

  if (!metrics || metrics.total_cards === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text variant="h2">{deckName || 'Deck Metrics'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Text variant="h3" align="center">No cards found</Text>
          <Text variant="body" color="secondary" align="center" style={styles.emptyText}>
            This deck doesn't have any cards yet.
          </Text>
        </View>
      </View>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 3.5) return colors.success[500];
    if (rating >= 2.5) return colors.warning[500];
    return colors.error[500];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text variant="h2" numberOfLines={1}>{deckName}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Mastery Progress Card */}
        <Card variant="elevated" style={styles.masteryCard}>
          <View style={styles.masteryHeader}>
            <Target size={24} color={colors.primary[600]} />
            <Text variant="h3" style={styles.cardTitle}>Mastery Progress</Text>
          </View>

          <View style={styles.masteryStats}>
            <Text variant="h1" color="brand" style={styles.masteryPercentage}>
              {metrics.mastery_percentage.toFixed(0)}%
            </Text>
            <Text variant="body" color="secondary">
              {metrics.easy_count} of {metrics.total_cards} cards mastered
            </Text>
          </View>

          <ProgressBar
            value={metrics.mastery_percentage}
            variant="success"
            size="lg"
            showLabel={false}
          />

          <View style={styles.ratingDistribution}>
            <View style={styles.ratingItem}>
              <View style={[styles.ratingDot, { backgroundColor: colors.success[500] }]} />
              <Text variant="caption" color="secondary">Easy: {metrics.easy_count}</Text>
            </View>
            <View style={styles.ratingItem}>
              <View style={[styles.ratingDot, { backgroundColor: colors.primary[500] }]} />
              <Text variant="caption" color="secondary">Good: {metrics.good_count}</Text>
            </View>
            <View style={styles.ratingItem}>
              <View style={[styles.ratingDot, { backgroundColor: colors.warning[500] }]} />
              <Text variant="caption" color="secondary">Hard: {metrics.hard_count}</Text>
            </View>
            <View style={styles.ratingItem}>
              <View style={[styles.ratingDot, { backgroundColor: colors.error[500] }]} />
              <Text variant="caption" color="secondary">Again: {metrics.again_count}</Text>
            </View>
            {metrics.new_count > 0 && (
              <View style={styles.ratingItem}>
                <View style={[styles.ratingDot, { backgroundColor: colors.neutral[400] }]} />
                <Text variant="caption" color="secondary">New: {metrics.new_count}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Performance Metrics */}
        <Card variant="default" style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <TrendingUp size={24} color={colors.primary[600]} />
            <Text variant="h3" style={styles.cardTitle}>Performance</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="h2" style={{ color: getRatingColor(metrics.average_rating) }}>
                {metrics.average_rating.toFixed(1)}
              </Text>
              <Text variant="caption" color="secondary">Avg Rating</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="h2" color="brand">{metrics.total_reviews}</Text>
              <Text variant="caption" color="secondary">Total Reviews</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="h2" color="error">{metrics.failed_reviews_this_month}</Text>
              <Text variant="caption" color="secondary">Failed This Month</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="h2" color="info">
                {metrics.last_studied ? new Date(metrics.last_studied).toLocaleDateString() : 'Never'}
              </Text>
              <Text variant="caption" color="secondary">Last Studied</Text>
            </View>
          </View>
        </Card>

        {/* Problematic Cards */}
        {metrics.problematic_cards && metrics.problematic_cards.length > 0 && (
          <Card variant="default" style={styles.problematicCard}>
            <View style={styles.problematicHeader}>
              <AlertCircle size={24} color={colors.error[600]} />
              <Text variant="h3" style={styles.cardTitle}>Needs Practice</Text>
            </View>

            <Text variant="caption" color="secondary" style={styles.problematicSubtitle}>
              Cards that need more attention (most failures)
            </Text>

            <View style={styles.problematicList}>
              {metrics.problematic_cards.map((card, index) => (
                <View key={card.card_id} style={styles.problematicItem}>
                  <View style={styles.problematicRank}>
                    <Text variant="caption" style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.problematicContent}>
                    <Text variant="body" numberOfLines={2} style={styles.problematicQuestion}>
                      {card.question}
                    </Text>
                    <View style={styles.problematicMeta}>
                      <Text variant="caption" color="error">
                        {card.failed_reviews} failures
                      </Text>
                      <Text variant="caption" color="secondary"> • </Text>
                      <Text variant="caption" color="secondary">
                        Avg: {card.average_rating.toFixed(1)}/4.0
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Empty state for no problematic cards */}
        {(!metrics.problematic_cards || metrics.problematic_cards.length === 0) && (
          <Card variant="default" style={styles.problematicCard}>
            <View style={styles.problematicHeader}>
              <AlertCircle size={24} color={colors.success[600]} />
              <Text variant="h3" style={styles.cardTitle}>All Clear!</Text>
            </View>
            <Text variant="body" color="secondary" align="center" style={styles.noProblemText}>
              No problematic cards found. Great work! 🎉
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing[1],
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  emptyText: {
    marginTop: spacing[2],
  },
  masteryCard: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  masteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  cardTitle: {
    marginLeft: spacing[2],
  },
  masteryStats: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  masteryPercentage: {
    fontSize: 48,
    marginBottom: spacing[1],
  },
  ratingDistribution: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  performanceCard: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  problematicCard: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  problematicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  problematicSubtitle: {
    marginBottom: spacing[4],
  },
  problematicList: {
    gap: spacing[3],
  },
  problematicItem: {
    flexDirection: 'row',
    padding: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.error[500],
  },
  problematicRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  rankNumber: {
    fontWeight: 'bold',
    color: colors.error[700],
  },
  problematicContent: {
    flex: 1,
  },
  problematicQuestion: {
    marginBottom: spacing[1],
  },
  problematicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noProblemText: {
    marginTop: spacing[2],
  },
});
