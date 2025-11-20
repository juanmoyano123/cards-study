# StudyMaster Mobile

React Native + Expo mobile application for StudyMaster.

## Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Auth:** Supabase
- **Testing:** Jest + React Native Testing Library

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Studio
- Expo Go app (for physical device testing)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env
# Set EXPO_PUBLIC_API_URL to your backend URL
# (default: http://localhost:8000)
```

### 3. Start Development Server

```bash
# Start Expo dev server
npm start

# Or start for specific platform
npm run android   # Android
npm run ios       # iOS (Mac only)
npm run web       # Web browser
```

### 4. Run on Device

**Option 1: Physical Device**
1. Install Expo Go app from App Store or Play Store
2. Scan QR code from terminal
3. App will load on your device

**Option 2: Emulator/Simulator**
```bash
# Android (requires Android Studio)
npm run android

# iOS (requires Xcode, Mac only)
npm run ios
```

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── _layout.tsx      # Root layout
│   ├── index.tsx        # Home screen
│   ├── (auth)/          # Auth flow (not authenticated)
│   └── (tabs)/          # Main app (authenticated)
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── study/           # Study-specific components
│   ├── dashboard/       # Dashboard components
│   └── upload/          # Upload components
├── services/             # API services
│   ├── api.ts           # Axios instance
│   ├── authService.ts
│   ├── materialsService.ts
│   └── flashcardsService.ts
├── stores/               # Zustand stores
│   ├── authStore.ts
│   ├── studyStore.ts
│   └── statsStore.ts
├── utils/                # Utility functions
├── constants/            # App constants (colors, spacing, etc.)
├── types/                # TypeScript types
├── assets/               # Images, fonts, etc.
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── README.md
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Lint and fix
npm run lint:fix
```

### Styling with NativeWind

NativeWind allows you to use Tailwind CSS classes in React Native:

```tsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-primary-500">
      <Text className="text-2xl font-bold text-white">
        Hello World
      </Text>
    </View>
  );
}
```

Custom colors from `tailwind.config.js`:
- `primary-500`: #A855F7 (purple)
- `success-500`: #10B981 (green)
- `warning-500`: #F59E0B (orange)
- `error-500`: #EF4444 (red)
- `neutral-*`: Gray scale

### Navigation with Expo Router

Expo Router uses file-based routing similar to Next.js:

```
app/
├── _layout.tsx          → Root layout
├── index.tsx            → / (home)
├── (auth)/
│   ├── login.tsx        → /auth/login
│   └── signup.tsx       → /auth/signup
└── (tabs)/
    ├── _layout.tsx      → Tab layout
    ├── index.tsx        → /tabs (dashboard)
    └── study.tsx        → /tabs/study
```

Navigate programmatically:

```tsx
import { useRouter } from 'expo-router';

export default function MyScreen() {
  const router = useRouter();

  return (
    <Button onPress={() => router.push('/study')}>
      Start Studying
    </Button>
  );
}
```

### State Management with Zustand

Create a store:

```tsx
// stores/authStore.ts
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  signIn: async (email, password) => {
    set({ isLoading: true });
    // API call
    set({ user, isLoading: false });
  },
  signOut: () => set({ user: null }),
}));
```

Use in components:

```tsx
import { useAuthStore } from '@/stores/authStore';

export default function MyComponent() {
  const { user, signIn } = useAuthStore();

  return <Text>{user?.name}</Text>;
}
```

## API Integration

API client is configured in `services/api.ts`:

```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
});

// Auto-attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await getToken(); // from SecureStore
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Environment Variables

Available environment variables (set in `.env`):

- `EXPO_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `EXPO_PUBLIC_ENVIRONMENT`: Environment (development, staging, production)

**Note:** Only variables prefixed with `EXPO_PUBLIC_` are accessible in the app.

## Building for Production

### Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile development

# Build for Android
eas build --platform android --profile development
```

### Production Build

```bash
# Build for app stores
eas build --platform all --profile production

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
npx expo start -c

# Or manually
rm -rf node_modules
rm -rf .expo
npm install
```

### iOS Simulator Not Working

```bash
# Open iOS Simulator manually
open -a Simulator

# Then start Expo
npm run ios
```

### Android Emulator Not Working

1. Open Android Studio
2. Tools → AVD Manager
3. Start an emulator
4. Run `npm run android`

### Port Already in Use

```bash
# Find process using port 8081
lsof -i :8081

# Kill process
kill -9 <PID>

# Or use different port
npx expo start --port 8082
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

## Contributing

See main [README.md](../README.md) for contribution guidelines.

## License

Proprietary - StudyMaster
