import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal as RNModal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Text, Input, Textarea, Button, Select, Card } from '.';
import { colors, spacing, borderRadius } from '../constants';

export interface EditableCard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: number;
  tags: string[];
}

interface EditCardModalProps {
  visible: boolean;
  card: EditableCard | null;
  onClose: () => void;
  onSave: (card: EditableCard) => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  visible,
  card,
  onClose,
  onSave,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when card changes
  useEffect(() => {
    if (card) {
      setQuestion(card.question);
      setAnswer(card.answer);
      setExplanation(card.explanation || '');
      setDifficulty(card.difficulty);
      setTagsInput(card.tags.join(', '));
      setErrors({});
    }
  }, [card]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.trim().length < 5) {
      newErrors.question = 'Question must be at least 5 characters';
    }

    if (!answer.trim()) {
      newErrors.answer = 'Answer is required';
    } else if (answer.trim().length < 3) {
      newErrors.answer = 'Answer must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!card || !validate()) {
      return;
    }

    // Parse tags from comma-separated input
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const updatedCard: EditableCard = {
      id: card.id,
      question: question.trim(),
      answer: answer.trim(),
      explanation: explanation.trim() || undefined,
      difficulty,
      tags,
    };

    onSave(updatedCard);
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  // Difficulty options
  const difficultyOptions = [
    { label: '1 - Very Easy', value: 1 },
    { label: '2 - Easy', value: 2 },
    { label: '3 - Medium', value: 3 },
    { label: '4 - Hard', value: 4 },
    { label: '5 - Very Hard', value: 5 },
  ];

  if (!card) return null;

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h3">Edit Flashcard</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="flat" style={styles.formCard}>
            {/* Question */}
            <Textarea
              label="Question *"
              value={question}
              onChangeText={setQuestion}
              placeholder="Enter the question..."
              rows={3}
              maxLength={2000}
              showCharacterCount
              error={errors.question}
            />

            {/* Answer */}
            <Textarea
              label="Answer *"
              value={answer}
              onChangeText={setAnswer}
              placeholder="Enter the answer..."
              rows={4}
              maxLength={5000}
              showCharacterCount
              error={errors.answer}
            />

            {/* Explanation (Optional) */}
            <Textarea
              label="Explanation (Optional)"
              value={explanation}
              onChangeText={setExplanation}
              placeholder="Add additional explanation or context..."
              rows={3}
              maxLength={3000}
              showCharacterCount
              helperText="Helps provide context during study"
            />

            {/* Difficulty */}
            <View style={styles.difficultyContainer}>
              <Text variant="caption" style={styles.fieldLabel}>
                Difficulty Level
              </Text>
              <View style={styles.difficultyOptions}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.difficultyOption,
                      difficulty === option.value && styles.difficultyOptionActive,
                    ]}
                    onPress={() => setDifficulty(option.value)}
                  >
                    <Text
                      variant="caption"
                      style={[
                        styles.difficultyText,
                        difficulty === option.value ? styles.difficultyTextActive : undefined,
                      ] as any}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <Input
              label="Tags (Optional)"
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="biology, cells, photosynthesis"
              helperText="Separate tags with commas"
              maxLength={200}
            />

            {/* Helper Text */}
            <Card variant="outlined" style={styles.helperCard}>
              <Text variant="caption" color="secondary">
                * Required fields
              </Text>
              <Text variant="caption" color="secondary" style={styles.helperTip}>
                Tip: Keep questions clear and specific. Answers should be concise but
                complete.
              </Text>
            </Card>
          </Card>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            style={styles.footerButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            style={styles.footerButton}
          />
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  closeButton: {
    padding: spacing[2],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  formCard: {
    padding: spacing[4],
    gap: spacing[4],
  },
  fieldLabel: {
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  difficultyContainer: {
    marginBottom: spacing[4],
  },
  difficultyOptions: {
    gap: spacing[2],
  },
  difficultyOption: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.default,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
  },
  difficultyOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  difficultyText: {
    color: colors.neutral[600],
  },
  difficultyTextActive: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  helperCard: {
    backgroundColor: colors.info[50],
    borderColor: colors.info[500],
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing[3],
  },
  helperTip: {
    marginTop: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  footerButton: {
    flex: 1,
  },
});
