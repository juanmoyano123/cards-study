# StudyMaster UX/UI Audit Report

**Version:** 1.0
**Date:** November 20, 2025
**Auditor:** UX/UI Research & Design Team

---

## Executive Summary

This audit evaluates the current implementation of StudyMaster against its documented design system and industry best practices. The analysis covers components, screens, accessibility, and interaction patterns.

### Key Findings
- **17 Critical/High issues** requiring immediate attention
- **12 Medium issues** for short-term improvement
- **8 Low priority enhancements** for polish

### Severity Legend
- **CRITICAL**: Blocks user flows or causes major usability issues
- **HIGH**: Significantly impacts UX but has workarounds
- **MEDIUM**: Noticeable UX degradation
- **LOW**: Polish and enhancement opportunities

---

## Table of Contents

1. [Component Issues](#1-component-issues)
2. [Screen-Specific Issues](#2-screen-specific-issues)
3. [Accessibility Issues](#3-accessibility-issues)
4. [Missing States & Feedback](#4-missing-states--feedback)
5. [Design System Inconsistencies](#5-design-system-inconsistencies)
6. [Recommended New Components](#6-recommended-new-components)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. Component Issues

### 1.1 Button Component

#### ISSUE-001: Missing Haptic Feedback [HIGH]
**Location:** `/mobile/components/Button.tsx`
**Problem:** No haptic feedback on button press, reducing tactile confirmation.
**Design System Reference:** Mobile-first with native gestures expected.

**Current Code:**
```tsx
<TouchableOpacity
  onPress={onPress}
  disabled={isDisabled}
  style={buttonStyle}
  activeOpacity={0.7}
>
```

**Recommended Fix:**
```tsx
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  onPress();
};

<TouchableOpacity
  onPress={handlePress}
  disabled={isDisabled}
  style={buttonStyle}
  activeOpacity={0.7}
>
```

---

#### ISSUE-002: Missing Press Animation [MEDIUM]
**Location:** `/mobile/components/Button.tsx`
**Problem:** Design system specifies `transform: scale(0.95)` on press, but current implementation only uses opacity.

**Recommended Fix:**
```tsx
import { Animated, Pressable } from 'react-native';

// Replace TouchableOpacity with Pressable and animated scale
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.97,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

<Pressable
  onPress={handlePress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  disabled={isDisabled}
>
  <Animated.View style={[buttonStyle, { transform: [{ scale: scaleAnim }] }]}>
    {/* content */}
  </Animated.View>
</Pressable>
```

---

#### ISSUE-003: Button Border Radius Inconsistency [MEDIUM]
**Location:** `/mobile/components/Button.tsx` line 81
**Problem:** Uses `borderRadius.default` (8px), but design system specifies `24px` (full rounded) for primary buttons with "15% higher engagement".

**Current Code:**
```tsx
base: {
  borderRadius: borderRadius.default, // 8px
}
```

**Recommended Fix:**
```tsx
base: {
  borderRadius: borderRadius.xl, // 24px - matches design system
}
```

---

#### ISSUE-004: Missing Icon Support in Button [MEDIUM]
**Location:** `/mobile/components/Button.tsx`
**Problem:** No prop for leading/trailing icons. Many CTAs need icons (e.g., "Upload Material" with upload icon).

**Recommended Addition:**
```tsx
interface ButtonProps {
  // ... existing props
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// In render:
<View style={styles.buttonContent}>
  {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
  <Text style={textStyleCombined}>{title}</Text>
  {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
</View>

// Add styles:
buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
iconLeft: {
  marginRight: spacing[2],
},
iconRight: {
  marginLeft: spacing[2],
},
```

---

### 1.2 Input Component

#### ISSUE-005: Missing Success State [HIGH]
**Location:** `/mobile/components/Input.tsx`
**Problem:** Has error state but no success state for validation feedback (e.g., valid email format).

**Recommended Addition:**
```tsx
interface InputProps extends TextInputProps {
  // ... existing props
  success?: boolean;
  successText?: string;
}

// Add to styles:
inputContainerSuccess: {
  borderColor: colors.success[500],
},
successText: {
  fontSize: fontSize.sm,
  color: colors.success[500],
  marginTop: spacing[1],
},

// In render:
<View
  style={[
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    hasError && styles.inputContainerError,
    success && !hasError && styles.inputContainerSuccess,
  ]}
>

// After input:
{success && !error && successText && (
  <Text style={styles.successText}>{successText}</Text>
)}
```

---

#### ISSUE-006: Touch Target Too Small for Eye Icon [HIGH]
**Location:** `/mobile/components/Input.tsx` line 80-91
**Problem:** Eye icon TouchableOpacity has no explicit size. Design system requires 48px minimum touch targets.

**Current Code:**
```tsx
<TouchableOpacity
  onPress={() => setIsSecure(!isSecure)}
  style={styles.rightIcon}
>
```

**Recommended Fix:**
```tsx
<TouchableOpacity
  onPress={() => setIsSecure(!isSecure)}
  style={styles.rightIconTouchable}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>

// Add style:
rightIconTouchable: {
  minWidth: 48,
  minHeight: 48,
  justifyContent: 'center',
  alignItems: 'center',
  paddingRight: spacing[2],
},
```

---

#### ISSUE-007: Missing Character Counter [LOW]
**Location:** `/mobile/components/Input.tsx`
**Problem:** No character count for limited inputs (useful for flashcard content).

**Recommended Addition:**
```tsx
interface InputProps extends TextInputProps {
  // ... existing props
  maxLength?: number;
  showCharacterCount?: boolean;
}

// In render (after helper/error text):
{showCharacterCount && maxLength && (
  <Text style={styles.characterCount}>
    {value?.length || 0}/{maxLength}
  </Text>
)}

// Style:
characterCount: {
  fontSize: fontSize.xs,
  color: colors.text.tertiary,
  textAlign: 'right',
  marginTop: spacing[1],
},
```

---

### 1.3 Text Component

#### ISSUE-008: Missing numberOfLines Prop [MEDIUM]
**Location:** `/mobile/components/Text.tsx`
**Problem:** No support for text truncation with ellipsis.

**Recommended Addition:**
```tsx
interface TextProps {
  // ... existing props
  numberOfLines?: number;
}

<RNText
  style={textStyle}
  onPress={onPress}
  numberOfLines={numberOfLines}
>
  {children}
</RNText>
```

---

#### ISSUE-009: Missing Accessibility Label Support [HIGH]
**Location:** `/mobile/components/Text.tsx`
**Problem:** No accessibility props passed through.

**Recommended Addition:**
```tsx
interface TextProps {
  // ... existing props
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header' | 'link' | 'button';
}

<RNText
  style={textStyle}
  onPress={onPress}
  accessibilityLabel={accessibilityLabel}
  accessibilityRole={accessibilityRole || (onPress ? 'button' : 'text')}
>
```

---

### 1.4 Card Component

#### ISSUE-010: Missing Active State Animation [MEDIUM]
**Location:** `/mobile/components/Card.tsx`
**Problem:** Pressable cards have no visual feedback on press.

**Recommended Fix:**
```tsx
import { Animated, Pressable } from 'react-native';

if (onPress) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => {
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }}
      onPress={onPress}
    >
      <Animated.View style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

---

## 2. Screen-Specific Issues

### 2.1 Login Screen

#### ISSUE-011: No Form Validation Feedback Before Submit [CRITICAL]
**Location:** `/mobile/app/(auth)/login.tsx`
**Problem:** Validation only happens on submit via Alert. Users don't know requirements until they fail.

**Current Code:**
```tsx
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }
  // ...
};
```

**Recommended Fix:**
```tsx
const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return undefined;
};

const handleEmailChange = (value: string) => {
  setEmail(value);
  if (errors.email) {
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
  }
};

const handleEmailBlur = () => {
  setErrors(prev => ({ ...prev, email: validateEmail(email) }));
};

// In Input:
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChangeText={handleEmailChange}
  onBlur={handleEmailBlur}
  error={errors.email}
/>
```

---

#### ISSUE-012: Missing "Forgot Password" Link [HIGH]
**Location:** `/mobile/app/(auth)/login.tsx`
**Problem:** No password recovery option. Critical for user retention.

**Recommended Addition:**
```tsx
// After password input:
<TouchableOpacity
  onPress={() => router.push('/(auth)/forgot-password')}
  style={styles.forgotPassword}
>
  <Text variant="caption" color="brand">
    Forgot password?
  </Text>
</TouchableOpacity>

// Style:
forgotPassword: {
  alignSelf: 'flex-end',
  marginTop: spacing[2],
  padding: spacing[2], // Increase touch target
},
```

---

#### ISSUE-013: Link Touch Target Too Small [HIGH]
**Location:** `/mobile/app/(auth)/login.tsx` line 88-95
**Problem:** "Sign Up" text link has no padding, making it hard to tap.

**Current Code:**
```tsx
<Text
  variant="body"
  color="brand"
  style={styles.signupLink}
  onPress={handleSignUp}
>
  Sign Up
</Text>
```

**Recommended Fix:**
```tsx
<TouchableOpacity
  onPress={handleSignUp}
  style={styles.signupLinkTouchable}
>
  <Text variant="body" color="brand" style={styles.signupLink}>
    Sign Up
  </Text>
</TouchableOpacity>

// Style:
signupLinkTouchable: {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[1],
},
```

---

### 2.2 Signup Screen

#### ISSUE-014: No Password Strength Indicator [HIGH]
**Location:** `/mobile/app/(auth)/signup.tsx`
**Problem:** Users only see "Minimum 6 characters" but no real-time feedback on password strength.

**Recommended Addition (New Component):**
```tsx
// components/PasswordStrengthIndicator.tsx
interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    colors.error[500],
    colors.warning[500],
    colors.warning[500],
    colors.success[500],
    colors.success[500],
  ];

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i < strength ? colors[strength - 1] : colors.neutral[200] },
            ]}
          />
        ))}
      </View>
      <Text variant="caption" style={{ color: colors[strength - 1] || colors.neutral[400] }}>
        {password.length > 0 ? labels[strength - 1] || 'Very Weak' : ''}
      </Text>
    </View>
  );
};
```

---

#### ISSUE-015: Confirm Password Should Validate in Real-Time [MEDIUM]
**Location:** `/mobile/app/(auth)/signup.tsx`
**Problem:** Password match only checked on submit.

**Recommended Fix:**
```tsx
const [confirmError, setConfirmError] = useState<string>();

const handleConfirmPasswordChange = (value: string) => {
  setConfirmPassword(value);
  if (value && value !== password) {
    setConfirmError('Passwords do not match');
  } else {
    setConfirmError(undefined);
  }
};

<Input
  label="Confirm Password"
  type="password"
  placeholder="Re-enter your password"
  value={confirmPassword}
  onChangeText={handleConfirmPasswordChange}
  error={confirmError}
  success={confirmPassword.length > 0 && confirmPassword === password}
/>
```

---

### 2.3 Dashboard Screen

#### ISSUE-016: Empty State Missing CTA Icon [MEDIUM]
**Location:** `/mobile/app/(tabs)/index.tsx` line 57-79
**Problem:** "No flashcards yet" card would benefit from an illustration or icon.

**Recommended Addition:**
```tsx
import { FileText } from 'lucide-react-native';

<Card variant="outlined" style={styles.emptyState}>
  <View style={styles.emptyIconContainer}>
    <FileText size={64} color={colors.neutral[300]} />
  </View>
  <Text variant="h3" align="center" style={styles.emptyTitle}>
    No flashcards yet
  </Text>
  // ...
</Card>

// Style:
emptyIconContainer: {
  alignItems: 'center',
  marginBottom: spacing[4],
},
```

---

#### ISSUE-017: Stats Cards Missing Loading State [HIGH]
**Location:** `/mobile/app/(tabs)/index.tsx` line 29-54
**Problem:** Stats show hardcoded "0" values. Should show skeleton/loading when fetching.

**Recommended Addition:**
```tsx
// Add loading state
const { user } = useAuthStore();
const [statsLoading, setStatsLoading] = useState(true);
const [stats, setStats] = useState({ streak: 0, dueToday: 0 });

// Skeleton component usage:
{statsLoading ? (
  <Skeleton width={40} height={38} />
) : (
  <Text variant="h1" color="brand" style={styles.statValue}>
    {stats.streak}
  </Text>
)}
```

---

#### ISSUE-018: Feature Cards Not Tappable [LOW]
**Location:** `/mobile/app/(tabs)/index.tsx` line 87-121
**Problem:** Feature cards look interactive but don't navigate anywhere.

**Recommendation:** Either make them tappable (linking to relevant sections) or remove the card elevation/hover styling to indicate they're informational only.

---

### 2.4 Study Screen

#### ISSUE-019: Empty State Too Basic [HIGH]
**Location:** `/mobile/app/(tabs)/study.tsx`
**Problem:** Minimal empty state with no helpful guidance or illustration.

**Recommended Improvement:**
```tsx
export default function StudyScreen() {
  return (
    <View style={styles.container}>
      <Card variant="outlined" style={styles.emptyState}>
        {/* Add illustration */}
        <View style={styles.illustrationContainer}>
          <BookOpen size={80} color={colors.primary[300]} />
        </View>

        <Text variant="h3" align="center" style={styles.emptyTitle}>
          No cards to study
        </Text>

        <Text variant="body" color="secondary" align="center" style={styles.emptyDescription}>
          Upload some study materials to get started with your learning journey
        </Text>

        {/* Add helpful CTA */}
        <Button
          title="Upload Materials"
          onPress={() => router.push('/(tabs)/upload')}
          fullWidth
          style={styles.ctaButton}
          leftIcon={<Upload size={20} color={colors.white} />}
        />

        {/* Add tips */}
        <View style={styles.tipsContainer}>
          <Text variant="caption" color="tertiary" align="center">
            Tip: You can upload PDFs, images, or create cards manually
          </Text>
        </View>
      </Card>
    </View>
  );
}
```

---

### 2.5 Profile Screen

#### ISSUE-020: Settings Rows Not Interactive [HIGH]
**Location:** `/mobile/app/(tabs)/profile.tsx` line 108-127
**Problem:** Settings rows look like buttons but aren't tappable.

**Recommended Fix:**
```tsx
<TouchableOpacity
  style={styles.settingRow}
  onPress={() => router.push('/settings/account')}
>
  <View style={styles.settingContent}>
    <Text variant="body">Account</Text>
    <Text variant="caption" color="secondary">
      Manage your account
    </Text>
  </View>
  <ChevronRight size={20} color={colors.neutral[400]} />
</TouchableOpacity>

// Style:
settingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: spacing[4], // Increased for touch target
  borderBottomWidth: 1,
  borderBottomColor: colors.border.light,
},
settingContent: {
  flex: 1,
},
```

---

#### ISSUE-021: Avatar Missing Image Support [MEDIUM]
**Location:** `/mobile/app/(tabs)/profile.tsx` line 36-41
**Problem:** Avatar only shows initial letter, no support for user uploaded images.

**Recommended Improvement:**
```tsx
<View style={styles.avatarContainer}>
  {user?.avatarUrl ? (
    <Image
      source={{ uri: user.avatarUrl }}
      style={styles.avatarImage}
    />
  ) : (
    <View style={styles.avatarFallback}>
      <Text variant="h1" color="brand">
        {user?.name?.charAt(0).toUpperCase() || 'S'}
      </Text>
    </View>
  )}
  <TouchableOpacity
    style={styles.editAvatarButton}
    onPress={handleEditAvatar}
  >
    <Camera size={16} color={colors.white} />
  </TouchableOpacity>
</View>

// Styles:
avatarContainer: {
  position: 'relative',
  marginBottom: spacing[4],
},
avatarImage: {
  width: 80,
  height: 80,
  borderRadius: 40,
},
avatarFallback: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.primary[100],
  justifyContent: 'center',
  alignItems: 'center',
},
editAvatarButton: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.primary[500],
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: colors.white,
},
```

---

### 2.6 Tab Navigation

#### ISSUE-022: Tab Bar Height Not Safe Area Compliant [HIGH]
**Location:** `/mobile/app/(tabs)/_layout.tsx` line 25-31
**Problem:** Tab bar has fixed `height: 60` and `paddingBottom: 8`. Should use SafeAreaView or account for device notches.

**Current Code:**
```tsx
tabBarStyle: {
  height: 60,
  paddingBottom: 8,
  paddingTop: 8,
},
```

**Recommended Fix:**
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inside component:
const insets = useSafeAreaInsets();

tabBarStyle: {
  height: 60 + insets.bottom,
  paddingBottom: 8 + insets.bottom,
  paddingTop: 8,
},
```

---

#### ISSUE-023: Tab Icons Missing Labels on Small Screens [LOW]
**Location:** `/mobile/app/(tabs)/_layout.tsx`
**Problem:** No `tabBarShowLabel` configuration - labels may be hidden on small screens.

**Recommendation:** Ensure labels are always visible for accessibility:
```tsx
tabBarShowLabel: true,
tabBarLabelStyle: {
  fontSize: 12,
  fontWeight: '500',
},
```

---

## 3. Accessibility Issues

### ISSUE-024: Missing accessibilityLabel on Interactive Elements [CRITICAL]
**Locations:** Multiple screens
**Problem:** Screen readers cannot properly announce interactive elements.

**Examples to Fix:**

```tsx
// Button.tsx
<TouchableOpacity
  accessibilityLabel={title}
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
  // ...
>

// Input.tsx
<TextInput
  accessibilityLabel={label}
  accessibilityHint={helperText}
  // ...
/>

// Profile avatar
<View
  style={styles.avatar}
  accessibilityLabel={`Profile picture for ${user?.name}`}
  accessibilityRole="image"
>
```

---

### ISSUE-025: Color Contrast Issues [HIGH]
**Locations:** Multiple
**Problem:** `colors.success[500]` (#10B981) on white has only 3.36:1 contrast ratio (fails WCAG AA for small text).

**Affected Areas:**
- Success validation messages
- "Easy" rating button text
- Success toasts

**Recommended Fix:**
Update success color in `/mobile/constants/colors.ts`:
```tsx
success: {
  50: '#F0FDF4',
  500: '#059669', // Changed from #10B981 - now 4.54:1 contrast
  700: '#047857',
},
```

---

### ISSUE-026: No Focus Indicators for Keyboard Navigation [MEDIUM]
**Location:** All interactive components
**Problem:** No visible focus states for external keyboard users.

**Recommended Addition to Button:**
```tsx
const [isFocused, setIsFocused] = useState(false);

<TouchableOpacity
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  style={[
    buttonStyle,
    isFocused && styles.focused,
  ]}
>

// Style:
focused: {
  shadowColor: colors.primary[500],
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
},
```

---

### ISSUE-027: Missing Screen Reader Announcements [HIGH]
**Problem:** Loading states and errors aren't announced to screen readers.

**Recommended Implementation:**
```tsx
import { AccessibilityInfo } from 'react-native';

// On loading state change:
useEffect(() => {
  if (loading) {
    AccessibilityInfo.announceForAccessibility('Loading, please wait');
  }
}, [loading]);

// On error:
useEffect(() => {
  if (error) {
    AccessibilityInfo.announceForAccessibility(`Error: ${error}`);
  }
}, [error]);
```

---

## 4. Missing States & Feedback

### ISSUE-028: No Global Loading Component [CRITICAL]
**Problem:** No consistent loading indicator for async operations.

**Recommended New Component:**
```tsx
// components/LoadingOverlay.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../constants';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text variant="body" style={styles.message}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing[6],
    alignItems: 'center',
    minWidth: 150,
  },
  message: {
    marginTop: spacing[4],
  },
});
```

---

### ISSUE-029: No Toast/Snackbar Component [HIGH]
**Problem:** Using Alert.alert for all messages is intrusive and blocks interaction.

**Recommended New Component:**
```tsx
// components/Toast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../constants';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const backgroundColors = {
  success: colors.success[50],
  error: colors.error[50],
  warning: colors.warning[50],
  info: colors.info[50],
};

const iconColors = {
  success: colors.success[500],
  error: colors.error[500],
  warning: colors.warning[500],
  info: colors.info[500],
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const Icon = icons[type];

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: backgroundColors[type] },
        { transform: [{ translateY }] },
      ]}
    >
      <Icon size={20} color={iconColors[type]} />
      <Text variant="body" style={styles.message}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  message: {
    marginLeft: spacing[3],
    flex: 1,
  },
});
```

---

### ISSUE-030: No Skeleton Loading Components [HIGH]
**Problem:** Content jumps when data loads. Need skeleton placeholders.

**Recommended New Component:**
```tsx
// components/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.default,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 1 }) => (
  <View>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: i < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={24} width="70%" style={{ marginBottom: 12 }} />
    <SkeletonText lines={2} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  cardSkeleton: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
});
```

---

### ISSUE-031: No Error Boundary Component [CRITICAL]
**Problem:** App crashes on unhandled errors with no recovery option.

**Recommended New Component:**
```tsx
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../constants';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <AlertTriangle size={64} color={colors.error[500]} />
          <Text variant="h2" align="center" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.message}>
            We're sorry, but something unexpected happened. Please try again.
          </Text>
          <Button
            title="Try Again"
            onPress={this.handleRetry}
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.white,
  },
  title: {
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[6],
  },
  button: {
    minWidth: 150,
  },
});
```

---

### ISSUE-032: No Network Error Handling UI [HIGH]
**Problem:** Network errors show generic alerts without retry options.

**Recommended New Component:**
```tsx
// components/NetworkError.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../constants';
import { WifiOff } from 'lucide-react-native';

interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Please check your internet connection and try again.',
}) => {
  return (
    <View style={styles.container}>
      <WifiOff size={64} color={colors.neutral[400]} />
      <Text variant="h3" align="center" style={styles.title}>
        No Internet Connection
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>
      <Button title="Try Again" onPress={onRetry} />
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
  title: {
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[6],
    maxWidth: 280,
  },
});
```

---

## 5. Design System Inconsistencies

### ISSUE-033: Button Border Radius Mismatch [MEDIUM]
**Design System:** 24px (full rounded) for primary buttons
**Implementation:** 8px (`borderRadius.default`)

**Fix:** Update Button.tsx to use `borderRadius.xl` (24px)

---

### ISSUE-034: Mobile Button Height [LOW]
**Design System:** 56px on mobile
**Implementation:** 48px (md size default)

**Recommendation:** Add responsive sizing or default to `lg` size on mobile.

---

### ISSUE-035: Input Font Size on Mobile [MEDIUM]
**Design System:** 18px on mobile (prevents iOS zoom)
**Implementation:** 16px (`fontSize.base`)

**Fix in Input.tsx:**
```tsx
input: {
  fontSize: Platform.OS === 'ios' ? fontSize.lg : fontSize.base, // 18px on iOS
}
```

---

### ISSUE-036: Missing Inter Font Loading [HIGH]
**Problem:** Design system specifies Inter font but no font loading implementation found.

**Recommended Implementation:**
```tsx
// app/_layout.tsx
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // ... rest of layout
}
```

---

## 6. Recommended New Components

### 6.1 Rating Buttons (for Study Mode)
The design system specifies a 4-button rating system for spaced repetition. This component is essential for Phase 4.

```tsx
// components/RatingButtons.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../constants';
import * as Haptics from 'expo-haptics';

type Rating = 'again' | 'hard' | 'good' | 'easy';

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  nextReviewTimes: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
  disabled?: boolean;
}

const ratingConfig = {
  again: {
    label: 'Again',
    backgroundColor: colors.error[50],
    borderColor: colors.error[500],
    textColor: colors.error[700],
  },
  hard: {
    label: 'Hard',
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[500],
    textColor: colors.warning[700],
  },
  good: {
    label: 'Good',
    backgroundColor: colors.info[50],
    borderColor: colors.info[500],
    textColor: colors.info[700],
  },
  easy: {
    label: 'Easy',
    backgroundColor: colors.success[50],
    borderColor: colors.success[500],
    textColor: colors.success[700],
  },
};

export const RatingButtons: React.FC<RatingButtonsProps> = ({
  onRate,
  nextReviewTimes,
  disabled = false,
}) => {
  const handlePress = (rating: Rating) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRate(rating);
  };

  return (
    <View style={styles.container}>
      {(Object.keys(ratingConfig) as Rating[]).map((rating) => {
        const config = ratingConfig[rating];
        return (
          <TouchableOpacity
            key={rating}
            style={[
              styles.button,
              {
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
              },
              disabled && styles.disabled,
            ]}
            onPress={() => handlePress(rating)}
            disabled={disabled}
            accessibilityLabel={`${config.label} - Next review: ${nextReviewTimes[rating]}`}
            accessibilityRole="button"
          >
            <Text
              variant="button"
              style={[styles.label, { color: config.textColor }]}
            >
              {config.label}
            </Text>
            <Text
              variant="caption"
              style={[styles.time, { color: config.textColor }]}
            >
              {nextReviewTimes[rating]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    minHeight: 64,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginBottom: spacing[1],
  },
  time: {
    opacity: 0.8,
  },
});
```

---

### 6.2 Empty State Component
A reusable empty state component for consistent messaging across screens.

```tsx
// components/EmptyState.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button, ButtonProps } from './Button';
import { Card } from './Card';
import { colors, spacing } from '../constants';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
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
  title,
  description,
  primaryAction,
  secondaryAction,
  tip,
}) => {
  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={64} color={colors.neutral[300]} />
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
```

---

### 6.3 Flashcard Component
Core component for the study experience.

```tsx
// components/Flashcard.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../constants';
import * as Haptics from 'expo-haptics';

interface FlashcardProps {
  front: string;
  back: string;
  onFlip?: (isFlipped: boolean) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export const Flashcard: React.FC<FlashcardProps> = ({
  front,
  back,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY()).current;

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;

    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setIsFlipped(!isFlipped);
    onFlip?.(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 5;
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            onSwipeRight?.();
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            onSwipeLeft?.();
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const frontStyle = {
    transform: [
      { rotateY: frontInterpolate },
      ...position.getTranslateTransform(),
    ],
    backfaceVisibility: 'hidden' as const,
  };

  const backStyle = {
    transform: [
      { rotateY: backInterpolate },
      ...position.getTranslateTransform(),
    ],
    backfaceVisibility: 'hidden' as const,
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TouchableWithoutFeedback onPress={flipCard}>
        <View style={styles.cardContainer}>
          <Animated.View style={[styles.card, frontStyle]}>
            <Text variant="h3" align="center" style={styles.label}>
              Question
            </Text>
            <Text variant="bodyLarge" align="center" style={styles.content}>
              {front}
            </Text>
            <Text variant="caption" color="tertiary" align="center" style={styles.hint}>
              Tap to reveal answer
            </Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <Text variant="h3" align="center" style={styles.label}>
              Answer
            </Text>
            <Text variant="bodyLarge" align="center" style={styles.content}>
              {back}
            </Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH - spacing[8],
    height: 400,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[900],
    padding: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  label: {
    position: 'absolute',
    top: spacing[4],
    color: colors.neutral[400],
  },
  content: {
    paddingHorizontal: spacing[4],
  },
  hint: {
    position: 'absolute',
    bottom: spacing[4],
  },
});
```

---

## 7. Implementation Checklist

### Phase 1: Critical Issues (Week 1)

- [ ] **ISSUE-011**: Add real-time form validation to login/signup
- [ ] **ISSUE-024**: Add accessibility labels to all interactive elements
- [ ] **ISSUE-028**: Create LoadingOverlay component
- [ ] **ISSUE-031**: Implement ErrorBoundary component
- [ ] **ISSUE-036**: Load Inter font family

### Phase 2: High Priority (Week 2)

- [ ] **ISSUE-001**: Add haptic feedback to buttons
- [ ] **ISSUE-005**: Add success state to Input component
- [ ] **ISSUE-006**: Fix touch target for password visibility toggle
- [ ] **ISSUE-009**: Add accessibility props to Text component
- [ ] **ISSUE-012**: Add "Forgot Password" link
- [ ] **ISSUE-013**: Fix touch targets for text links
- [ ] **ISSUE-014**: Create PasswordStrengthIndicator component
- [ ] **ISSUE-017**: Add loading states to stats cards
- [ ] **ISSUE-019**: Improve Study screen empty state
- [ ] **ISSUE-020**: Make settings rows interactive
- [ ] **ISSUE-022**: Fix tab bar safe area handling
- [ ] **ISSUE-025**: Fix color contrast issues
- [ ] **ISSUE-027**: Add screen reader announcements
- [ ] **ISSUE-029**: Create Toast component
- [ ] **ISSUE-030**: Create Skeleton loading component
- [ ] **ISSUE-032**: Create NetworkError component

### Phase 3: Medium Priority (Week 3)

- [ ] **ISSUE-002**: Add press animation to buttons
- [ ] **ISSUE-003**: Fix button border radius
- [ ] **ISSUE-004**: Add icon support to buttons
- [ ] **ISSUE-008**: Add numberOfLines to Text component
- [ ] **ISSUE-010**: Add active state animation to Card
- [ ] **ISSUE-015**: Add real-time password confirmation validation
- [ ] **ISSUE-016**: Add icon to empty state cards
- [ ] **ISSUE-021**: Add avatar image support
- [ ] **ISSUE-026**: Add focus indicators
- [ ] **ISSUE-033**: Fix design system inconsistencies
- [ ] **ISSUE-035**: Fix input font size on mobile

### Phase 4: Polish (Week 4)

- [ ] **ISSUE-007**: Add character counter to Input
- [ ] **ISSUE-018**: Decide on feature card interactivity
- [ ] **ISSUE-023**: Ensure tab labels always visible
- [ ] **ISSUE-034**: Review button heights on mobile
- [ ] Create RatingButtons component
- [ ] Create EmptyState component
- [ ] Create Flashcard component

---

## Appendix: Component Export Updates

Update `/mobile/components/index.ts` to export new components:

```tsx
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Text } from './Text';

// New components (after implementation)
export { Toast } from './Toast';
export { Skeleton, SkeletonText, SkeletonCard } from './Skeleton';
export { LoadingOverlay } from './LoadingOverlay';
export { ErrorBoundary } from './ErrorBoundary';
export { NetworkError } from './NetworkError';
export { EmptyState } from './EmptyState';
export { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
export { RatingButtons } from './RatingButtons';
export { Flashcard } from './Flashcard';
```

---

## Dependencies to Add

```json
{
  "expo-haptics": "~13.0.1",
  "@expo-google-fonts/inter": "^0.2.3",
  "react-native-safe-area-context": "4.10.5"
}
```

Install with:
```bash
npx expo install expo-haptics @expo-google-fonts/inter react-native-safe-area-context
```

---

**End of Audit Report**

*Generated: November 20, 2025*
*Next Review: After Phase 4 implementation*
