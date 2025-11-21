/**
 * LoadingOverlay Component
 * Full-screen loading indicator with optional message
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Text,
} from 'react-native';
import { colors, spacing } from '../constants';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          transparent && styles.transparentBackground,
        ]}
      >
        <View style={styles.content}>
          <ActivityIndicator
            size="large"
            color={colors.primary[500]}
          />
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  transparentBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    backgroundColor: colors.white,
    padding: spacing[6],
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 150,
  },
  message: {
    marginTop: spacing[4],
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
