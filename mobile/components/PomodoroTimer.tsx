/**
 * PomodoroTimer Component
 * A study timer with configurable work/break intervals
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { colors, spacing, borderRadius } from '../constants';
import { usePomodoroStore } from '../stores/pomodoroStore';

interface PomodoroTimerProps {
  /** Callback when a Pomodoro session completes */
  onComplete?: () => void;
  /** Whether to show in compact mode for study header */
  compact?: boolean;
  /** Callback to open settings modal */
  onOpenSettings?: () => void;
}

export function PomodoroTimer({
  onComplete,
  compact = false,
  onOpenSettings,
}: PomodoroTimerProps) {
  const {
    timeRemaining,
    isRunning,
    isBreak,
    completedPomodoros,
    workDuration,
    breakDuration,
    tick,
    start,
    pause,
    reset,
    completeSession,
  } = usePomodoroStore();

  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);

  // Calculate progress (0-1)
  const totalTime = isBreak ? breakDuration : workDuration;
  const progress = timeRemaining / totalTime;

  // Animate progress ring
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App going to background - save current time
        backgroundTimeRef.current = Date.now();
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        backgroundTimeRef.current
      ) {
        // App coming to foreground - calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        if (isRunning && elapsedSeconds > 0) {
          // Tick multiple times to catch up
          for (let i = 0; i < elapsedSeconds && timeRemaining > 0; i++) {
            tick();
          }
        }
        backgroundTimeRef.current = null;
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning, timeRemaining, tick]);

  // Timer tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, tick]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!isBreak) {
      // Work session completed
      completeSession();
      onComplete?.();
    }

    // Reset for next phase (handled by store)
  }, [isBreak, completeSession, onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle button press with haptic
  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    start();
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pause();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
  };

  // Compact mode for header integration
  if (compact) {
    return (
      <Pressable
        onPress={isRunning ? handlePause : handleStart}
        style={[
          styles.compactContainer,
          isBreak && styles.compactBreak,
        ]}
      >
        <View style={styles.compactIcon}>
          {isBreak ? (
            <Coffee size={14} color={colors.warning[600]} />
          ) : (
            <BookOpen size={14} color={colors.primary[600]} />
          )}
        </View>
        <Text style={[styles.compactTime, isBreak && styles.compactTimeBreak]}>
          {formatTime(timeRemaining)}
        </Text>
        {completedPomodoros > 0 && (
          <View style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>{completedPomodoros}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Full timer display
  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isBreak ? (
            <Coffee size={20} color={colors.warning[500]} />
          ) : (
            <BookOpen size={20} color={colors.primary[500]} />
          )}
          <Text style={styles.headerTitle}>
            {isBreak ? 'Break Time' : 'Focus Time'}
          </Text>
        </View>
        {onOpenSettings && (
          <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
            <Settings size={18} color={colors.neutral[400]} />
          </Pressable>
        )}
      </View>

      {/* Timer Display */}
      <Animated.View
        style={[
          styles.timerContainer,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {/* Progress Ring Background */}
        <View
          style={[
            styles.progressRing,
            isBreak ? styles.progressRingBreak : styles.progressRingWork,
          ]}
        >
          {/* Progress Fill */}
          <Animated.View
            style={[
              styles.progressFill,
              isBreak ? styles.progressFillBreak : styles.progressFillWork,
              {
                transform: [
                  {
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Timer Text */}
          <View style={styles.timerTextContainer}>
            <Text style={[styles.timerText, isBreak && styles.timerTextBreak]}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={styles.phaseText}>
              {isBreak ? 'Relax & Recharge' : 'Stay Focused'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <Button
          variant="outline"
          size="md"
          onPress={handleReset}
          style={styles.controlButton}
        >
          <RotateCcw size={20} color={colors.neutral[600]} />
        </Button>

        <Button
          variant={isBreak ? 'warning' : 'primary'}
          size="lg"
          onPress={isRunning ? handlePause : handleStart}
          style={styles.mainButton}
        >
          {isRunning ? (
            <Pause size={28} color={colors.white} />
          ) : (
            <Play size={28} color={colors.white} />
          )}
        </Button>

        <View style={styles.pomodoroCount}>
          <Text style={styles.pomodoroCountNumber}>{completedPomodoros}</Text>
          <Text style={styles.pomodoroCountLabel}>Sessions</Text>
        </View>
      </View>

      {/* Session indicator dots */}
      {completedPomodoros > 0 && (
        <View style={styles.sessionDots}>
          {Array.from({ length: Math.min(completedPomodoros, 8) }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.sessionDot,
                i < completedPomodoros && styles.sessionDotCompleted,
              ]}
            />
          ))}
          {completedPomodoros > 8 && (
            <Text style={styles.moreDotsText}>+{completedPomodoros - 8}</Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  settingsButton: {
    padding: spacing[2],
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingWork: {
    borderColor: colors.primary[100],
    backgroundColor: colors.primary[50],
  },
  progressRingBreak: {
    borderColor: colors.warning[100],
    backgroundColor: colors.warning[50],
  },
  progressFill: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressFillWork: {
    borderTopColor: colors.primary[500],
    borderRightColor: colors.primary[500],
  },
  progressFillBreak: {
    borderTopColor: colors.warning[500],
    borderRightColor: colors.warning[500],
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary[700],
    fontVariant: ['tabular-nums'],
  },
  timerTextBreak: {
    color: colors.warning[700],
  },
  phaseText: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pomodoroCount: {
    alignItems: 'center',
    minWidth: 48,
  },
  pomodoroCountNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[600],
  },
  pomodoroCountLabel: {
    fontSize: 10,
    color: colors.neutral[500],
    textTransform: 'uppercase',
  },
  sessionDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[200],
  },
  sessionDotCompleted: {
    backgroundColor: colors.primary[500],
  },
  moreDotsText: {
    fontSize: 12,
    color: colors.neutral[500],
    marginLeft: spacing[1],
  },
  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[1],
  },
  compactBreak: {
    backgroundColor: colors.warning[50],
  },
  compactIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
    fontVariant: ['tabular-nums'],
  },
  compactTimeBreak: {
    color: colors.warning[700],
  },
  compactBadge: {
    backgroundColor: colors.primary[500],
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[1],
  },
  compactBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
});
