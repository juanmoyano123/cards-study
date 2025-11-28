import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Edit2, Trash2, Check } from 'lucide-react-native';
import { Text, Card, Badge, Checkbox } from '.';
import { colors, spacing, borderRadius } from '../constants';

export interface PreviewCard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: number;
  tags: string[];
  selected: boolean;
}

interface CardPreviewProps {
  cards: PreviewCard[];
  onToggleSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  style?: ViewStyle;
}

export const CardPreview = React.memo<CardPreviewProps>(({
  cards,
  onToggleSelect,
  onEdit,
  onDelete,
  onSelectAll,
  onDeselectAll,
  style,
}) => {
  const selectedCount = cards.filter((c) => c.selected).length;
  const totalCount = cards.length;
  const allSelected = selectedCount === totalCount;

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return colors.success[500];
    if (difficulty <= 3) return colors.warning[500];
    return colors.error[500];
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return 'Very Easy';
    if (difficulty === 2) return 'Easy';
    if (difficulty === 3) return 'Medium';
    if (difficulty === 4) return 'Hard';
    return 'Very Hard';
  };

  const renderCard = ({ item, index }: { item: PreviewCard; index: number }) => (
    <Card
      variant="outlined"
      style={[
        styles.cardItem,
        !item.selected ? styles.cardItemUnselected : undefined,
      ] as any}
    >
      {/* Header with checkbox and actions */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleSelect(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View
            style={[
              styles.checkbox,
              item.selected && styles.checkboxSelected,
            ]}
          >
            {item.selected && <Check size={16} color={colors.white} />}
          </View>
          <Text variant="caption" color="secondary" style={styles.cardNumber}>
            Card #{index + 1}
          </Text>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onEdit(item.id)}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Edit2 size={18} color={colors.primary[500]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            style={styles.actionButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={colors.error[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Question */}
        <View style={styles.questionSection}>
          <Text variant="caption" color="secondary" style={styles.sectionLabel}>
            QUESTION
          </Text>
          <Text variant="body" style={styles.questionText}>
            {item.question}
          </Text>
        </View>

        {/* Answer */}
        <View style={styles.answerSection}>
          <Text variant="caption" color="secondary" style={styles.sectionLabel}>
            ANSWER
          </Text>
          <Text variant="body" color="secondary" style={styles.answerText}>
            {item.answer}
          </Text>
        </View>

        {/* Explanation (if exists) */}
        {item.explanation && (
          <View style={styles.explanationSection}>
            <Text variant="caption" color="secondary" style={styles.sectionLabel}>
              EXPLANATION
            </Text>
            <Text variant="caption" color="secondary">
              {item.explanation}
            </Text>
          </View>
        )}

        {/* Footer with difficulty and tags */}
        <View style={styles.cardFooter}>
          <Badge
            label={getDifficultyLabel(item.difficulty)}
            variant={item.difficulty <= 2 ? 'success' : item.difficulty <= 3 ? 'warning' : 'error'}
            size="sm"
          />

          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={idx}
                  label={tag}
                  variant="neutral"
                  size="sm"
                />
              ))}
              {item.tags.length > 3 && (
                <Text variant="caption" color="secondary">
                  +{item.tags.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Selection Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.selectionInfo}>
          <Text variant="body" style={styles.selectionText}>
            {selectedCount} of {totalCount} selected
          </Text>
        </View>

        <View style={styles.selectionActions}>
          <TouchableOpacity
            onPress={allSelected ? onDeselectAll : onSelectAll}
            style={styles.selectionButton}
          >
            <Text variant="button" color="primary">
              {allSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards List */}
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  selectionInfo: {},
  selectionText: {
    fontWeight: '500',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  selectionButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  listContent: {
    padding: spacing[4],
  },
  separator: {
    height: spacing[3],
  },
  cardItem: {
    padding: spacing[4],
  },
  cardItemUnselected: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  cardNumber: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    padding: spacing[1],
  },
  cardContent: {
    gap: spacing[3],
  },
  questionSection: {
    gap: spacing[1],
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  questionText: {
    lineHeight: 24,
  },
  answerSection: {
    gap: spacing[1],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  answerText: {
    lineHeight: 22,
  },
  explanationSection: {
    gap: spacing[1],
    paddingTop: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    flexWrap: 'wrap',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
});
