import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from '../../components';
import { colors, spacing } from '../../constants';

export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <Card variant="outlined" style={styles.emptyState}>
        <Text variant="h3" align="center" style={styles.emptyTitle}>
          No cards to study
        </Text>
        <Text variant="body" color="secondary" align="center">
          Upload some study materials to get started with your learning journey
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    justifyContent: 'center',
  },
  emptyState: {
    padding: spacing[6],
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
});
