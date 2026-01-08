import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { BookOpen, Tag, Calendar, ChevronRight, ArrowLeft } from 'lucide-react-native';
import {
  Text,
  Button,
  EmptyState,
  LoadingOverlay,
  Card,
} from '../../components';
import { colors, spacing } from '../../constants';
import { materialsService } from '../../services/materialsService';
import type { StudyMaterial } from '../../types';

export default function DecksScreen() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      console.log('[DECKS_SCREEN] Loading materials...');
      const response = await materialsService.getMaterials(1, 100);
      console.log('[DECKS_SCREEN] Loaded materials:', response.materials.length);
      setMaterials(response.materials);
    } catch (error) {
      console.error('[DECKS_SCREEN] Error loading materials:', error);
      Alert.alert('Error', 'Failed to load decks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMaterials();
    setRefreshing(false);
  }, [loadMaterials]);

  const handleDeckPress = (material: StudyMaterial) => {
    if (material.flashcard_count === 0) {
      Alert.alert(
        'No Cards',
        'This deck has no flashcards yet. Please generate cards from this material first.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('[DECKS_SCREEN] Navigating to study deck:', material.id);
    router.push({
      pathname: '/decks/study',
      params: {
        materialId: material.id,
        materialName: material.filename,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'My Decks',
            headerBackTitle: 'Back',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: spacing[2], padding: spacing[2] }}
              >
                <ArrowLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <LoadingOverlay message="Loading decks..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Decks',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: spacing[2], padding: spacing[2] }}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {materials.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Decks Yet"
            description="Upload materials or paste text to create your first study deck."
            actionLabel="Upload Material"
            onAction={() => router.push('/(tabs)/upload')}
          />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Study Decks</Text>
              <Text style={styles.headerSubtitle}>
                {materials.length} {materials.length === 1 ? 'deck' : 'decks'}
              </Text>
            </View>

            <View style={styles.decksList}>
              {materials.map((material) => (
                <TouchableOpacity
                  key={material.id}
                  onPress={() => handleDeckPress(material)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.deckCard}>
                    <View style={styles.deckHeader}>
                      <View style={styles.deckIcon}>
                        <BookOpen size={24} color={colors.primary[500]} />
                      </View>
                      <View style={styles.deckInfo}>
                        <Text style={styles.deckTitle} numberOfLines={2}>
                          {material.filename}
                        </Text>
                        {material.subject_category && (
                          <View style={styles.categoryBadge}>
                            <Tag size={12} color={colors.neutral[600]} />
                            <Text style={styles.categoryText}>
                              {material.subject_category}
                            </Text>
                          </View>
                        )}
                      </View>
                      <ChevronRight size={20} color={colors.neutral[400]} />
                    </View>

                    <View style={styles.deckStats}>
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>
                          {material.flashcard_count}
                        </Text>
                        <Text style={styles.statLabel}>
                          {material.flashcard_count === 1 ? 'Card' : 'Cards'}
                        </Text>
                      </View>
                      {material.word_count && (
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>
                            {material.word_count}
                          </Text>
                          <Text style={styles.statLabel}>Words</Text>
                        </View>
                      )}
                      <View style={styles.stat}>
                        <Calendar size={14} color={colors.neutral[500]} />
                        <Text style={styles.statLabel}>
                          {new Date(material.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {material.tags && material.tags.length > 0 && (
                      <View style={styles.tags}>
                        {material.tags.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                        {material.tags.length > 3 && (
                          <Text style={styles.moreTags}>
                            +{material.tags.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  decksList: {
    gap: spacing.md,
  },
  deckCard: {
    padding: spacing.md,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  deckStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    color: colors.text.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
