/**
 * Toast Component
 * Non-intrusive notifications for success, error, warning, info
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Check, X, AlertTriangle, Info } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const toastConfig = {
  success: {
    icon: Check,
    backgroundColor: colors.success[50],
    borderColor: colors.success[500],
    iconColor: colors.success[700],
    textColor: colors.success[700],
  },
  error: {
    icon: X,
    backgroundColor: colors.error[50],
    borderColor: colors.error[500],
    iconColor: colors.error[700],
    textColor: colors.error[700],
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[500],
    iconColor: colors.warning[700],
    textColor: colors.warning[700],
  },
  info: {
    icon: Info,
    backgroundColor: colors.info[50],
    borderColor: colors.info[500],
    iconColor: colors.info[700],
    textColor: colors.info[700],
  },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 4000,
  onDismiss,
  action,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const config = toastConfig[type];
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconComponent size={20} color={config.iconColor} />
        </View>
        <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              handleDismiss();
            }}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text style={[styles.actionText, { color: config.iconColor }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={config.iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing[4],
    right: spacing[4],
    borderWidth: 1,
    borderRadius: borderRadius.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
  },
  iconContainer: {
    marginRight: spacing[2],
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
});

export default Toast;
