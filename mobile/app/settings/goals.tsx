import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Target, CheckCircle } from 'lucide-react-native';
import { Card, Text, Button, Toast } from '../../components';
import { getUserGoal, updateUserGoal, UserGoalUpdate } from '../../services/goalService';
import { colors, spacing } from '../../constants';

type GoalType = 'easy_ratings' | 'cards_studied' | 'study_minutes';

export default function GoalsSettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('20');
  const [goalType, setGoalType] = useState<GoalType>('easy_ratings');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    setLoading(true);
    try {
      const goal = await getUserGoal();
      setDailyGoal(goal.daily_cards_goal.toString());
      setGoalType(goal.goal_type);
    } catch (error: any) {
      console.error('Error loading goal:', error);
      setToast({
        visible: true,
        message: 'Failed to load goal settings',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    const goalValue = parseInt(dailyGoal, 10);

    if (isNaN(goalValue) || goalValue < 1 || goalValue > 500) {
      setToast({
        visible: true,
        message: 'Please enter a valid goal between 1 and 500',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const goalUpdate: UserGoalUpdate = {
        daily_cards_goal: goalValue,
        goal_type: goalType,
      };

      await updateUserGoal(goalUpdate);

      setToast({
        visible: true,
        message: 'Goal saved successfully! 🎯',
        type: 'success',
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving goal:', error);
      setToast({
        visible: true,
        message: error.response?.data?.detail || 'Failed to save goal',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getGoalTypeDescription = (type: GoalType): string => {
    switch (type) {
      case 'easy_ratings':
        return 'Cards rated as "Easy" (you know them perfectly)';
      case 'cards_studied':
        return 'Total cards studied (any rating)';
      case 'study_minutes':
        return 'Total minutes spent studying';
    }
  };

  const GoalTypeOption = ({
    type,
    title,
    description,
  }: {
    type: GoalType;
    title: string;
    description: string;
  }) => {
    const isSelected = goalType === type;

    return (
      <TouchableOpacity
        style={[styles.goalTypeOption, isSelected && styles.goalTypeOptionSelected]}
        onPress={() => setGoalType(type)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${title}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.goalTypeContent}>
          <Text variant="bodyLarge" style={styles.goalTypeTitle}>
            {title}
          </Text>
          <Text variant="caption" color="secondary">
            {description}
          </Text>
        </View>
        {isSelected && <CheckCircle size={24} color={colors.primary[600]} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body" color="secondary">
          Loading goal settings...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text variant="h2">Daily Goal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Goal Icon */}
        <View style={styles.iconContainer}>
          <Target size={48} color={colors.primary[600]} />
        </View>

        <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
          Set your daily study goal to stay motivated and track your progress
        </Text>

        {/* Daily Goal Input */}
        <Card variant="default" style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Daily Target
          </Text>

          <View style={styles.inputContainer}>
            <RNTextInput
              style={styles.input}
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="numeric"
              placeholder="20"
              maxLength={3}
            />
            <Text variant="bodyLarge" color="secondary" style={styles.inputSuffix}>
              {goalType === 'study_minutes' ? 'minutes' : 'cards'}
            </Text>
          </View>

          <Text variant="caption" color="secondary" align="center">
            Recommended: 10-50 cards per day or 20-60 minutes
          </Text>
        </Card>

        {/* Goal Type Selection */}
        <Card variant="default" style={styles.card}>
          <Text variant="h3" style={styles.cardTitle}>
            Goal Type
          </Text>

          <Text variant="caption" color="secondary" style={styles.goalTypeDescription}>
            Choose what counts toward your daily goal
          </Text>

          <View style={styles.goalTypeOptions}>
            <GoalTypeOption
              type="easy_ratings"
              title="Mastered Cards"
              description={getGoalTypeDescription('easy_ratings')}
            />

            <GoalTypeOption
              type="cards_studied"
              title="Cards Studied"
              description={getGoalTypeDescription('cards_studied')}
            />

            <GoalTypeOption
              type="study_minutes"
              title="Study Time"
              description={getGoalTypeDescription('study_minutes')}
            />
          </View>
        </Card>

        {/* Save Button */}
        <Button
          title="Save Goal"
          onPress={handleSaveGoal}
          loading={saving}
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing[6],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
  card: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  cardTitle: {
    marginBottom: spacing[4],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary[600],
    textAlign: 'center',
    minWidth: 120,
    padding: spacing[2],
  },
  inputSuffix: {
    marginLeft: spacing[2],
  },
  goalTypeDescription: {
    marginBottom: spacing[4],
  },
  goalTypeOptions: {
    gap: spacing[3],
  },
  goalTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalTypeOptionSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  goalTypeContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  goalTypeTitle: {
    marginBottom: spacing[1],
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
});
