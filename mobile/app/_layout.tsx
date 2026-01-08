import { useEffect, useRef } from 'react';
import { SplashScreen, Stack, router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LogBox } from 'react-native';

// Ignore SplashScreen errors in logs (cosmetic fix for Expo issue)
LogBox.ignoreLogs([
  'No native splash screen registered',
  'SplashScreen.show',
]);

// Track if splash screen was properly initialized
let splashScreenReady = false;

// Prevent auto-hiding splash screen with error handling
SplashScreen.preventAutoHideAsync()
  .then(() => {
    splashScreenReady = true;
  })
  .catch(() => {
    // SplashScreen not available - continue without it
    splashScreenReady = false;
  });

export default function RootLayout() {
  const { initialized, user, initialize } = useAuthStore();
  const splashHidden = useRef(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (initialized && !splashHidden.current) {
      splashHidden.current = true;

      // Only hide if it was properly initialized
      if (splashScreenReady) {
        SplashScreen.hideAsync().catch(() => {
          // Ignore errors
        });
      }

      // Redirect based on auth state
      if (!user) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [initialized, user]);

  if (!initialized) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
