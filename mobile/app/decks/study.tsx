import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
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
import { materialsService } from '../../services/materialsService';
import { studyService } from '../../services/studyService';
import type { MaterialFlashcard, StudyCard } from '../../types';

type ViewState = 'loading' | 'empty' | 'studying' | 'complete';

export default function DeckStudyScreen() {
  const params = useLocalSearchParams<{
    materialId: string;
    materialName: string;
  }>();
  const { materialId, materialName } = params;

  const [flashcards, setFlashcards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [ratingsAgain, setRatingsAgain] = useState(0);
  const [ratingsHard, setRatingsHard] = useState(0);
  const [ratingsGood, setRatingsGood] = useState(0);
  const [ratingsEasy, setRatingsEasy] = useState(0);

  const cardsStudied = ratingsAgain + ratingsHard + ratingsGood + ratingsEasy;

  const loadFlashcards = useCallback(async () => {
    if (!materialId) return;

    try {
      console.log('[DECK_STUDY] Loading flashcards for material:', materialId);
      setLoading(true);
      const response = await materialsService.getMaterialFlashcards(materialId);
      console.log('[DECK_STUDY] Loaded flashcards:', response.flashcards.length);

      // Transform MaterialFlashcard to StudyCard
      const studyCards: StudyCard[] = response.flashcards.map(card => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation,
        tags: card.tags,
        difficulty: card.difficulty,
        interval_days: 0,
        ease_factor: 2.5,
        review_count: card.stats?.total_reviews || 0,
        mastery_level: (card.stats?.mastery_level as any) || 'new',
        next_intervals: {
          1: '0d',
          2: '1d',
          3: '3d',
          4: '7d',
        },
      }));

      setFlashcards(studyCards);
    } catch (error) {
      console.error('[DECK_STUDY] Error loading flashcards:', error);
      Alert.alert('Error', 'Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const getViewState = (): ViewState => {
    if (loading && flashcards.length === 0) return 'loading';
    if (flashcards.length === 0) return 'empty';
    if (currentIndex >= flashcards.length) return 'complete';
    return 'studying';
  };

  const viewState = getViewState();
  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard || submitting) return;

    try {
      setSubmitting(true);
      console.log('[DECK_STUDY] Submitting rating:', rating, 'for card:', currentCard.id);

      // Calculate time spent on this card
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

      // Submit review to backend
      await studyService.submitReview({
        card_id: currentCard.id,
        rating,
        time_spent_seconds: timeSpent,
      });

      // Update local ratings count
      switch (rating) {
        case 1:
          setRatingsAgain((prev) => prev + 1);
          break;
        case 2:
          setRatingsHard((prev) => prev + 1);
          break;
        case 3:
          setRatingsGood((prev) => prev + 1);
          break;
        case 4:
          setRatingsEasy((prev) => prev + 1);
          break;
      }

      // Move to next card
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } catch (error) {
      console.error('[DECK_STUDY] Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudyMore = () => {
    // Reset to beginning of deck
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatingsAgain(0);
    setRatingsHard(0);
    setRatingsGood(0);
    setRatingsEasy(0);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Study Session',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (viewState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: materialName || 'Study Deck',
            headerBackTitle: 'Back',
          }}
        />
        <LoadingOverlay message="Loading flashcards..." />
      </SafeAreaView>
    );
  }

  if (viewState === 'empty') {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: materialName || 'Study Deck',
            headerBackTitle: 'Back',
          }}
        />
        <EmptyState
          icon={BookOpen}
          title="No Flashcards"
          description="This deck has no flashcards yet. Generate cards from the material first."
          actionLabel="Go Back"
          onAction={handleGoBack}
        />
      </SafeAreaView>
    );
  }

  if (viewState === 'complete') {
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 60000);

    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Session Complete',
            headerBackTitle: 'Back',
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <StudySessionSummary
            cardsStudied={cardsStudied}
            ratingsAgain={ratingsAgain}
            ratingsHard={ratingsHard}
            ratingsGood={ratingsGood}
            ratingsEasy={ratingsEasy}
            timeSpentMinutes={timeSpent}
            streakDay={0}
            onStudyMore={handleStudyMore}
            onGoToDashboard={() => router.push('/(tabs)/')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Studying view
  const progress = flashcards.length > 0
    ? (currentIndex / flashcards.length) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: materialName || 'Study Deck',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Button
              variant="ghost"
              size="sm"
              onPress={handleExit}
              style={{ paddingRight: 0 }}
            >
              <X size={24} color={colors.text.secondary} />
            </Button>
          ),
        }}
      />

      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Card {currentIndex + 1} of {flashcards.length}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <ProgressBar value={progress} />
        </View>

        {/* Flashcard */}
        <View style={styles.cardContainer}>
          <StudyFlashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </View>

        {/* Rating Buttons */}
        {isFlipped && (
          <View style={styles.ratingSection}>
            <RatingButtons
              nextIntervals={currentCard.next_intervals}
              onRate={handleRate}
              disabled={submitting}
            />
          </View>
        )}

        {/* Stats Footer */}
        <Card style={styles.statsCard}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Studied</Text>
              <Text style={styles.statValue}>{cardsStudied}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>
                {flashcards.length - currentIndex}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  ratingSection: {
    marginTop: spacing.lg,
  },
  statsCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
});
