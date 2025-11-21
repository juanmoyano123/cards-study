/**
 * EmptyState Component
 * Reusable empty state with icon, title, description, and actions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { colors, spacing } from '../constants';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  tip?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconColor = colors.neutral[300],
  title,
  description,
  primaryAction,
  secondaryAction,
  tip,
}) => {
  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={64} color={iconColor} />
      </View>

      <Text variant="h3" align="center" style={styles.title}>
        {title}
      </Text>

      <Text variant="body" color="secondary" align="center" style={styles.description}>
        {description}
      </Text>

      {primaryAction && (
        <Button
          title={primaryAction.label}
          onPress={primaryAction.onPress}
          fullWidth
          style={styles.primaryButton}
        />
      )}

      {secondaryAction && (
        <Button
          title={secondaryAction.label}
          onPress={secondaryAction.onPress}
          variant="outline"
          fullWidth
        />
      )}

      {tip && (
        <View style={styles.tipContainer}>
          <Text variant="caption" color="tertiary" align="center">
            {tip}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  description: {
    marginBottom: spacing[6],
  },
  primaryButton: {
    marginBottom: spacing[3],
  },
  tipContainer: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default EmptyState;
