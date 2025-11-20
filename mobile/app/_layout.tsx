import { useEffect } from 'react';
import { SplashScreen, Stack, router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialized, user, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();

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
