import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, User, Bell, Settings } from 'lucide-react-native';
import { Card, Text, Button, Toast } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { colors, spacing } from '../../constants';

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuthStore();
  const { stats, loadDashboardStats } = useDashboardStore();
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    // Load stats if not already loaded
    if (!stats) {
      loadDashboardStats();
    }
  }, []);

  const handleSettingPress = (setting: string) => {
    // TODO: Navigate to setting screens when implemented
    setToast({
      visible: true,
      message: `${setting} settings coming soon!`,
      type: 'info',
    });
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* User Info Card */}
      <Card variant="elevated" style={styles.userCard}>
        <View style={styles.avatar}>
          <Text variant="h1" color="brand">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </Text>
        </View>

        <Text variant="h2" align="center" style={styles.userName}>
          {user?.name || 'Student'}
        </Text>

        <Text variant="body" color="secondary" align="center">
          {user?.email}
        </Text>

        {user?.subject && (
          <View style={styles.subjectBadge}>
            <Text variant="caption" color="brand">
              📚 {user.subject}
            </Text>
          </View>
        )}
      </Card>

      {/* Stats Card */}
      <Card variant="default" style={styles.statsCard}>
        <Text variant="h3" style={styles.sectionTitle}>
          Your Stats
        </Text>

        <View style={styles.statRow}>
          <Text variant="body" color="secondary">
            Total Cards
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {stats?.total_cards || 0}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text variant="body" color="secondary">
            Cards Mastered
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {stats?.total_cards_mastered || 0}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text variant="body" color="secondary">
            Current Streak
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {stats?.current_streak || 0} days 🔥
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text variant="body" color="secondary">
            Longest Streak
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {stats?.longest_streak || 0} days 🏆
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text variant="body" color="secondary">
            Total Study Time
          </Text>
          <Text variant="bodyLarge" style={styles.statValue}>
            {Math.round((stats?.total_study_time_minutes || 0) / 60)} hours
          </Text>
        </View>
      </Card>

      {/* Settings Card */}
      <Card variant="default" style={styles.settingsCard}>
        <Text variant="h3" style={styles.sectionTitle}>
          Settings
        </Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => handleSettingPress('Account')}
          accessibilityRole="button"
          accessibilityLabel="Account settings"
        >
          <View style={styles.settingIcon}>
            <User size={20} color={colors.neutral[500]} />
          </View>
          <View style={styles.settingContent}>
            <Text variant="body">Account</Text>
            <Text variant="caption" color="secondary">
              Manage your account
            </Text>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => handleSettingPress('Notifications')}
          accessibilityRole="button"
          accessibilityLabel="Notification settings"
        >
          <View style={styles.settingIcon}>
            <Bell size={20} color={colors.neutral[500]} />
          </View>
          <View style={styles.settingContent}>
            <Text variant="body">Notifications</Text>
            <Text variant="caption" color="secondary">
              Configure reminders
            </Text>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, styles.settingRowLast]}
          onPress={() => handleSettingPress('Study Preferences')}
          accessibilityRole="button"
          accessibilityLabel="Study preferences settings"
        >
          <View style={styles.settingIcon}>
            <Settings size={20} color={colors.neutral[500]} />
          </View>
          <View style={styles.settingContent}>
            <Text variant="body">Study Preferences</Text>
            <Text variant="caption" color="secondary">
              Customize your learning
            </Text>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button */}
      <Button
        title="Sign Out"
        variant="outline"
        onPress={handleSignOut}
        loading={loading}
        fullWidth
        style={styles.signOutButton}
      />

      {/* Version Info */}
      <Text variant="caption" color="tertiary" align="center" style={styles.version}>
        StudyMaster v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing[4],
  },
  userCard: {
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  userName: {
    marginBottom: spacing[1],
  },
  subjectBadge: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[50],
    borderRadius: 16,
  },
  statsCard: {
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  statValue: {
    fontWeight: '600',
  },
  settingsCard: {
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    marginRight: spacing[3],
  },
  settingContent: {
    flex: 1,
  },
  signOutButton: {
    marginBottom: spacing[4],
  },
  version: {
    marginBottom: spacing[4],
  },
});
