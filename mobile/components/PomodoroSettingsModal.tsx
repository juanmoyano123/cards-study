/**
 * PomodoroSettingsModal Component
 * Modal for configuring Pomodoro timer settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Clock, Coffee, Zap, Volume2, Vibrate } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Button } from './Button';
import { Modal } from './Modal';
import { Switch } from './Switch';
import { colors, spacing, borderRadius } from '../constants';
import { usePomodoroStore, PomodoroSettings } from '../stores/pomodoroStore';

interface PomodoroSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Duration options in minutes
const WORK_DURATION_OPTIONS = [15, 20, 25, 30, 45, 50, 60];
const BREAK_DURATION_OPTIONS = [3, 5, 10, 15];
const LONG_BREAK_DURATION_OPTIONS = [10, 15, 20, 30];
const POMODOROS_OPTIONS = [2, 3, 4, 5, 6];

export function PomodoroSettingsModal({
  visible,
  onClose,
}: PomodoroSettingsModalProps) {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
    autoStartBreak,
    autoStartWork,
    soundEnabled,
    vibrationEnabled,
    updateSettings,
  } = usePomodoroStore();

  // Local state for editing
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>({
    workDuration,
    breakDuration,
    longBreakDuration,
    pomodorosUntilLongBreak,
    autoStartBreak,
    autoStartWork,
    soundEnabled,
    vibrationEnabled,
  });

  // Sync local state when modal opens
  useEffect(() => {
    if (visible) {
      setLocalSettings({
        workDuration,
        breakDuration,
        longBreakDuration,
        pomodorosUntilLongBreak,
        autoStartBreak,
        autoStartWork,
        soundEnabled,
        vibrationEnabled,
      });
    }
  }, [visible]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateSettings(localSettings);
    onClose();
  };

  const handleDurationSelect = (
    key: 'workDuration' | 'breakDuration' | 'longBreakDuration',
    minutes: number
  ) => {
    Haptics.selectionAsync();
    setLocalSettings((prev) => ({
      ...prev,
      [key]: minutes * 60, // Convert to seconds
    }));
  };

  const handlePomodorosSelect = (count: number) => {
    Haptics.selectionAsync();
    setLocalSettings((prev) => ({
      ...prev,
      pomodorosUntilLongBreak: count,
    }));
  };

  const handleToggle = (
    key: 'autoStartBreak' | 'autoStartWork' | 'soundEnabled' | 'vibrationEnabled'
  ) => {
    Haptics.selectionAsync();
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderDurationSelector = (
    label: string,
    icon: React.ReactNode,
    options: number[],
    currentValue: number,
    onSelect: (minutes: number) => void
  ) => (
    <View style={styles.settingSection}>
      <View style={styles.settingHeader}>
        {icon}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.optionsRow}>
        {options.map((minutes) => (
          <Pressable
            key={minutes}
            style={[
              styles.optionButton,
              currentValue / 60 === minutes && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(minutes)}
          >
            <Text
              style={[
                styles.optionText,
                currentValue / 60 === minutes ? styles.optionTextSelected : undefined,
              ] as any}
            >
              {minutes}m
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose} size="lg">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Timer Settings</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.neutral[500]} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Work Duration */}
          {renderDurationSelector(
            'Focus Duration',
            <Clock size={18} color={colors.primary[500]} />,
            WORK_DURATION_OPTIONS,
            localSettings.workDuration,
            (minutes) => handleDurationSelect('workDuration', minutes)
          )}

          {/* Break Duration */}
          {renderDurationSelector(
            'Short Break',
            <Coffee size={18} color={colors.warning[500]} />,
            BREAK_DURATION_OPTIONS,
            localSettings.breakDuration,
            (minutes) => handleDurationSelect('breakDuration', minutes)
          )}

          {/* Long Break Duration */}
          {renderDurationSelector(
            'Long Break',
            <Coffee size={18} color={colors.success[500]} />,
            LONG_BREAK_DURATION_OPTIONS,
            localSettings.longBreakDuration,
            (minutes) => handleDurationSelect('longBreakDuration', minutes)
          )}

          {/* Pomodoros until Long Break */}
          <View style={styles.settingSection}>
            <View style={styles.settingHeader}>
              <Zap size={18} color={colors.primary[500]} />
              <Text style={styles.settingLabel}>Pomodoros until long break</Text>
            </View>
            <View style={styles.optionsRow}>
              {POMODOROS_OPTIONS.map((count) => (
                <Pressable
                  key={count}
                  style={[
                    styles.optionButton,
                    localSettings.pomodorosUntilLongBreak === count &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handlePomodorosSelect(count)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      localSettings.pomodorosUntilLongBreak === count ? styles.optionTextSelected : undefined,
                    ] as any}
                  >
                    {count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Auto-start options */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Auto-start</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Auto-start breaks</Text>
                <Text style={styles.toggleDescription}>
                  Automatically start break after focus session
                </Text>
              </View>
              <Switch
                value={localSettings.autoStartBreak}
                onValueChange={() => handleToggle('autoStartBreak')}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Auto-start focus</Text>
                <Text style={styles.toggleDescription}>
                  Automatically start focus after break
                </Text>
              </View>
              <Switch
                value={localSettings.autoStartWork}
                onValueChange={() => handleToggle('autoStartWork')}
              />
            </View>
          </View>

          {/* Notification options */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleLabelRow}>
                  <Volume2 size={16} color={colors.neutral[600]} />
                  <Text style={styles.toggleLabel}>Sound</Text>
                </View>
                <Text style={styles.toggleDescription}>
                  Play sound when timer completes
                </Text>
              </View>
              <Switch
                value={localSettings.soundEnabled}
                onValueChange={() => handleToggle('soundEnabled')}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleLabelRow}>
                  <Vibrate size={16} color={colors.neutral[600]} />
                  <Text style={styles.toggleLabel}>Vibration</Text>
                </View>
                <Text style={styles.toggleDescription}>
                  Vibrate when timer completes
                </Text>
              </View>
              <Switch
                value={localSettings.vibrationEnabled}
                onValueChange={() => handleToggle('vibrationEnabled')}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} style={styles.saveButton}>
            Save Settings
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  closeButton: {
    padding: spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  settingSection: {
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing[3],
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  optionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    minWidth: 48,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary[500],
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[700],
  },
  optionTextSelected: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[800],
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  cancelButton: {
    minWidth: 100,
  },
  saveButton: {
    minWidth: 120,
  },
});
