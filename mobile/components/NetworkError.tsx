/**
 * NetworkError Component
 * Displays network error state with retry option
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Text } from './Text';
import { colors, spacing } from '../constants';

interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
  title?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Please check your internet connection and try again.',
  title = 'No Internet Connection',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <WifiOff size={48} color={colors.neutral[400]} />
      </View>
      <Text variant="h3" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry connection"
      >
        <RefreshCw size={20} color={colors.white} />
        <Text variant="button" color="inverse" style={styles.retryText}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 24,
    gap: spacing[2],
  },
  retryText: {
    marginLeft: spacing[2],
  },
});

export default NetworkError;
