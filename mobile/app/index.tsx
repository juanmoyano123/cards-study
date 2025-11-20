import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        StudyMaster
      </Text>
      <Text style={styles.subtitle}>
        AI-Powered Flashcards
      </Text>
      <Text style={styles.caption}>
        Phase 1: Setup Complete ✅
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.neutral[600],
    marginTop: spacing.md,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
});
