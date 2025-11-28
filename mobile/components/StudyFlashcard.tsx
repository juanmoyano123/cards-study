import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Badge } from './Badge';
import { colors, spacing } from '../constants';
import type { StudyCard } from '../types';

interface StudyFlashcardProps {
  card: StudyCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export const StudyFlashcard = React.memo(function StudyFlashcard({ card, isFlipped, onFlip }: StudyFlashcardProps) {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  // Responsive card dimensions
  const cardWidth = Math.min(width - spacing[8], 500); // Max width for tablets
  const cardHeight = Math.min(height * 0.6, 500); // 60% of screen height, max 500

  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnimation]);

  // Interpolations for the flip effect
  const frontRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'new':
        return colors.primary[500];
      case 'learning':
        return colors.warning[500];
      case 'young':
        return colors.info[500];
      case 'mature':
        return colors.success[500];
      case 'mastered':
        return colors.success[700];
      default:
        return colors.neutral[500];
    }
  };

  const handleFlip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFlip();
  };

  return (
    <Pressable onPress={handleFlip} style={[styles.container, { width: cardWidth, height: cardHeight }]}>
      {/* Front of card (Question) */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          {
            transform: [{ rotateY: frontRotation }],
            opacity: frontOpacity,
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.masteryBadge,
              { borderColor: getMasteryColor(card.mastery_level) }
            ]}
          >
            <Text style={[styles.masteryText, { color: getMasteryColor(card.mastery_level) }] as any}>
              {card.mastery_level.charAt(0).toUpperCase() + card.mastery_level.slice(1)}
            </Text>
          </View>
          {card.review_count > 0 && (
            <Text style={styles.reviewCount}>
              Reviews: {card.review_count}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>QUESTION</Text>
          <Text style={styles.questionText}>{card.question}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.tapHint}>Tap to reveal answer</Text>
        </View>
      </Animated.View>

      {/* Back of card (Answer) */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          {
            transform: [{ rotateY: backRotation }],
            opacity: backOpacity,
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.masteryBadge,
              { borderColor: getMasteryColor(card.mastery_level) }
            ]}
          >
            <Text style={[styles.masteryText, { color: getMasteryColor(card.mastery_level) }] as any}>
              {card.mastery_level.charAt(0).toUpperCase() + card.mastery_level.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>ANSWER</Text>
          <Text style={styles.answerText}>{card.answer}</Text>

          {card.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>{card.explanation}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.tapHint}>Rate your answer below</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing[5],
    backfaceVisibility: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  front: {
    borderWidth: 2,
    borderColor: colors.primary[100],
  },
  back: {
    borderWidth: 2,
    borderColor: colors.success[100],
    backgroundColor: colors.success[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  reviewCount: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  masteryBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  masteryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[400],
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 28,
    textAlign: 'center',
  },
  answerText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.neutral[800],
    lineHeight: 26,
    textAlign: 'center',
  },
  explanationContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.success[200],
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[400],
    letterSpacing: 1,
    marginBottom: spacing[1],
  },
  explanationText: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  tapHint: {
    fontSize: 13,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },
});
