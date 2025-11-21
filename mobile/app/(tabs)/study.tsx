import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { BookOpen, ArrowLeft, X } from 'lucide-react-native';
import {
  Text,
  Button,
  EmptyState,
  LoadingOverlay,
  StudyFlashcard,
  RatingButtons,
  StudySessionSummary,
  ProgressBar,
  Card,
} from '../../components';
import { colors, spacing } from '../../constants';
import { useStudyStore } from '../../stores/studyStore';

type ViewState = 'loading' | 'empty' | 'studying' | 'complete';

export default function StudyScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    queue,
    currentIndex,
    isFlipped,
    loading,
    submitting,
    error,
    totalDue,
    newCards,
    reviewCards,
    overdueCards,
    cardsStudied,
    sessionStartTime,
    ratingsAgain,
    ratingsHard,
    ratingsGood,
    ratingsEasy,
    loadQueue,
    flipCard,
    submitReview,
    nextCard,
    resetSession,
  } = useStudyStore();

  // Load queue on mount
  useEffect(() => {
    loadQueue();
  }, []);

  // Determine current view state
  const getViewState = (): ViewState => {
    if (loading && queue.length === 0) return 'loading';
    if (queue.length === 0) return 'empty';
    if (currentIndex >= queue.length) return 'complete';
    return 'studying';
  };

  const viewState = getViewState();
  const currentCard = queue[currentIndex];

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  }, [loadQueue]);

  // Handle rating
  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    try {
      await submitReview(rating);
      nextCard();
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // Handle continue studying
  const handleContinue = () => {
    resetSession();
    loadQueue();
  };

  // Handle go to dashboard
  const handleGoToDashboard = () => {
    resetSession();
    router.push('/(tabs)/');
  };

  // Handle exit study mode
  const handleExit = () => {
    resetSession();
    router.back();
  };

  // Calculate session stats for summary
  const getSessionStats = () => {
    // Calculate actual time spent in session
    const timeSpentMinutes = sessionStartTime
      ? Math.floor((Date.now() - sessionStartTime) / (1000 * 60))
      : 0;

    return {
      cardsStudied,
      cardsAgain: ratingsAgain,
      cardsHard: ratingsHard,
      cardsGood: ratingsGood,
      cardsEasy: ratingsEasy,
      timeSpentMinutes,
    };
  };

  // Render loading state
  if (viewState === 'loading') {
    return <LoadingOverlay message="Loading your study queue..." />;
  }

  // Render empty state
  if (viewState === 'empty') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            icon={BookOpen}
            iconColor={colors.primary[300]}
            title="No cards to study"
            description={
              error
                ? error
                : "You're all caught up! Upload some study materials to create new flashcards."
            }
            primaryAction={{
              label: 'Upload Materials',
              onPress: () => router.push('/(tabs)/upload'),
            }}
            secondaryAction={{
              label: 'Go to Dashboard',
              onPress: () => router.push('/(tabs)/'),
            }}
            tip="Tip: Cards will appear here when they're due for review based on spaced repetition"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render complete state
  if (viewState === 'complete') {
    const stats = getSessionStats();
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <StudySessionSummary
            {...stats}
            onContinue={handleContinue}
            onGoToDashboard={handleGoToDashboard}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render studying state
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleExit}
          style={styles.exitButton}
        >
          <X size={24} color={colors.neutral[500]} />
        </Button>

        <View style={styles.headerCenter}>
          <Text style={styles.progressText}>
            {cardsStudied + 1} / {totalDue}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {newCards > 0 && (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.badgeText}>{newCards} new</Text>
            </View>
          )}
          {overdueCards > 0 && (
            <View style={[styles.badge, styles.overdueBadge]}>
              <Text style={styles.badgeText}>{overdueCards} overdue</Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          value={totalDue > 0 ? (cardsStudied / totalDue) * 100 : 0}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        {currentCard && (
          <StudyFlashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={flipCard}
          />
        )}
      </View>

      {/* Rating buttons (only show when flipped) */}
      {isFlipped && currentCard && (
        <View style={styles.ratingContainer}>
          <RatingButtons
            nextIntervals={currentCard.next_intervals}
            onRate={handleRate}
            disabled={submitting}
          />
        </View>
      )}

      {/* Tap to flip hint (when not flipped) */}
      {!isFlipped && (
        <View style={styles.hintContainer}>
          <Card style={styles.hintCard}>
            <Text style={styles.hintText}>
              Tap the card to reveal the answer
            </Text>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    backgroundColor: colors.white,
  },
  exitButton: {
    padding: spacing[2],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  newBadge: {
    backgroundColor: colors.primary[100],
  },
  overdueBadge: {
    backgroundColor: colors.warning[100],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  progressContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing[4],
  },
  ratingContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingBottom: spacing[4],
  },
  hintContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  hintCard: {
    padding: spacing[3],
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },
  hintText: {
    fontSize: 14,
    color: colors.primary[700],
    fontWeight: '500',
  },
});
