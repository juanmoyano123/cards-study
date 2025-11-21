import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { colors, spacing } from '../constants';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react-native';

interface StudySessionSummaryProps {
  cardsStudied: number;
  cardsAgain: number;
  cardsHard: number;
  cardsGood: number;
  cardsEasy: number;
  timeSpentMinutes: number;
  onContinue: () => void;
  onGoToDashboard: () => void;
}

export function StudySessionSummary({
  cardsStudied,
  cardsAgain,
  cardsHard,
  cardsGood,
  cardsEasy,
  timeSpentMinutes,
  onContinue,
  onGoToDashboard,
}: StudySessionSummaryProps) {
  const successRate = cardsStudied > 0
    ? Math.round(((cardsGood + cardsEasy) / cardsStudied) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.trophyContainer}>
          <Trophy size={48} color={colors.warning[500]} />
        </View>
        <Text style={styles.title}>Session Complete!</Text>
        <Text style={styles.subtitle}>
          Great work! Here's how you did.
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatValue}>{cardsStudied}</Text>
          <Text style={styles.mainStatLabel}>Cards Studied</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Target size={20} color={colors.success[500]} />
            <Text style={styles.statValue}>{successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>

          <View style={styles.statItem}>
            <Clock size={20} color={colors.primary[500]} />
            <Text style={styles.statValue}>{timeSpentMinutes || '<1'}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>

          <View style={styles.statItem}>
            <TrendingUp size={20} color={colors.info[500]} />
            <Text style={styles.statValue}>{cardsGood + cardsEasy}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
        <View style={styles.breakdownList}>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: colors.error[500] }]} />
            <Text style={styles.breakdownLabel}>Again</Text>
            <Text style={styles.breakdownValue}>{cardsAgain}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: colors.warning[500] }]} />
            <Text style={styles.breakdownLabel}>Hard</Text>
            <Text style={styles.breakdownValue}>{cardsHard}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: colors.success[500] }]} />
            <Text style={styles.breakdownLabel}>Good</Text>
            <Text style={styles.breakdownValue}>{cardsGood}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: colors.info[500] }]} />
            <Text style={styles.breakdownLabel}>Easy</Text>
            <Text style={styles.breakdownValue}>{cardsEasy}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Study More Cards"
          variant="primary"
          onPress={onContinue}
          style={styles.primaryButton}
        />
        <Button
          title="Go to Dashboard"
          variant="outline"
          onPress={onGoToDashboard}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[500],
  },
  statsCard: {
    marginBottom: spacing[4],
    padding: spacing[5],
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary[600],
  },
  mainStatLabel: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  breakdownCard: {
    marginBottom: spacing[6],
    padding: spacing[4],
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  breakdownList: {
    gap: spacing[2],
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[3],
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[600],
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  actions: {
    gap: spacing[3],
  },
  primaryButton: {
    marginBottom: spacing[2],
  },
});
