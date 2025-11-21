import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { EmptyState } from '../../components';
import { colors, spacing } from '../../constants';

export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon={BookOpen}
        iconColor={colors.primary[300]}
        title="No cards to study"
        description="Upload some study materials to get started with your learning journey"
        primaryAction={{
          label: 'Upload Materials',
          onPress: () => router.push('/(tabs)/upload'),
        }}
        secondaryAction={{
          label: 'Go to Dashboard',
          onPress: () => router.push('/(tabs)/'),
        }}
        tip="Tip: You can upload PDFs, images, or create cards manually"
      />
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
});
