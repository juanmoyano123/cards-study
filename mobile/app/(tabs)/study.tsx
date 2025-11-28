import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { BookOpen, ArrowLeft, X, Timer } from 'lucide-react-native';
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
  PomodoroTimer,
  PomodoroSettingsModal,
  Toast,
} from '../../components';
import { colors, spacing } from '../../constants';
import { useStudyStore } from '../../stores/studyStore';
import { usePomodoroStore } from '../../stores/pomodoroStore';

type ViewState = 'loading' | 'empty' | 'studying' | 'complete';

export default function StudyScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showPomodoroSettings, setShowPomodoroSettings] = useState(false);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  // Pomodoro store
  const {
    completedPomodoros,
    loadTodayPomodoros,
  } = usePomodoroStore();

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

  // Load queue and pomodoro data on mount
  useEffect(() => {
    console.log('[STUDY_SCREEN] Component mounted, loading queue...');
    loadQueue();
    loadTodayPomodoros();
  }, []);

  // Determine current view state
  const getViewState = (): ViewState => {
    console.log('[STUDY_SCREEN] getViewState - loading:', loading, 'queue.length:', queue.length, 'currentIndex:', currentIndex);
    if (loading && queue.length === 0) return 'loading';
    if (queue.length === 0) return 'empty';
    if (currentIndex >= queue.length) return 'complete';
    return 'studying';
  };

  const viewState = getViewState();
  console.log('[STUDY_SCREEN] Current viewState:', viewState);
  const currentCard = queue[currentIndex];
  console.log('[STUDY_SCREEN] currentCard:', currentCard ? `Card ID: ${currentCard.id}` : 'undefined');

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
      setToast({
        visible: true,
        message: 'Failed to save your rating. Please try again.',
        type: 'error',
      });
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
    router.replace('/(tabs)');
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
    return <LoadingOverlay visible={true} message="Loading your study queue..." />;
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
              onPress: () => router.replace('/(tabs)'),
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
            pomodorosCompleted={completedPomodoros}
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
          {/* Pomodoro Timer Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setShowPomodoroTimer(!showPomodoroTimer)}
            style={styles.timerButton}
          >
            <Timer size={20} color={showPomodoroTimer ? colors.primary[500] : colors.neutral[500]} />
            {completedPomodoros > 0 && (
              <View style={styles.pomodoroCountBadge}>
                <Text style={styles.pomodoroCountText}>{completedPomodoros}</Text>
              </View>
            )}
          </Button>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          value={totalDue > 0 ? Math.round((cardsStudied / totalDue) * 100) : 0}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Pomodoro Timer (collapsible) */}
      {showPomodoroTimer && (
        <View style={styles.pomodoroContainer}>
          <PomodoroTimer
            onComplete={() => {
              // Pomodoro completed - could show a toast or notification
            }}
            onOpenSettings={() => setShowPomodoroSettings(true)}
          />
        </View>
      )}

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

      {/* Pomodoro Settings Modal */}
      <PomodoroSettingsModal
        visible={showPomodoroSettings}
        onClose={() => setShowPomodoroSettings(false)}
      />

      {/* Toast for error notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
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
    backgroundColor: colors.warning[50],
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
  timerButton: {
    padding: spacing[2],
    position: 'relative',
  },
  pomodoroCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pomodoroCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  pomodoroContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
});
