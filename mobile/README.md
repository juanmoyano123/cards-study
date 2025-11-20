# StudyMaster Mobile App

React Native mobile application for StudyMaster - AI-powered flashcard platform.

## 📱 Tech Stack

- **Framework:** React Native + Expo SDK 50
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Authentication:** Supabase Auth
- **Testing:** Jest + React Testing Library

## 🏗️ Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, signup, onboarding)
│   ├── (tabs)/            # Main app tabs (dashboard, study, upload, profile)
│   ├── _layout.tsx        # Root layout with auth protection
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Text.tsx
│   └── __tests__/        # Component tests
├── constants/            # Design system constants
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── services/             # API services
│   ├── api.ts           # API client with JWT interceptor
│   ├── authService.ts
│   ├── materialsService.ts
│   └── flashcardsService.ts
├── stores/               # Zustand state stores
│   └── authStore.ts
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   └── supabase.ts      # Supabase client
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Environment Setup

Create a `.env` file in the `mobile/` directory:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Run Development Server

```bash
# Start Expo dev server
npx expo start

# For iOS
npx expo start --ios

# For Android
npx expo start --android

# For web
npx expo start --web
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📂 Features Implemented (Phase 3)

### ✅ Design System
- Color palette with brand colors
- Spacing system (4px base grid)
- Typography scale
- Reusable components (Button, Input, Card, Text)

### ✅ Authentication
- Login screen
- Signup screen
- Onboarding screen
- Protected routes
- Auth state management with Zustand
- Supabase integration

### ✅ Navigation
- Bottom tab navigation (Dashboard, Study, Upload, Profile)
- Stack navigation for auth flow
- Protected routes middleware

### ✅ Screens
- Dashboard (empty state with stats placeholders)
- Study (placeholder for Phase 5)
- Upload (placeholder for Phase 4)
- Profile (user info, stats, settings, sign out)

### ✅ API Integration
- API client with JWT interceptor
- Auth service
- Materials service
- Flashcards service

### ✅ Testing
- Component tests for Button, Input, Text
- Test configuration with Jest

## 🎨 Design System

### Colors
- **Primary:** Purple #A855F7 (innovation & academic)
- **Success:** Green #10B981
- **Warning:** Orange #F59E0B
- **Error:** Red #EF4444
- **Info:** Blue #3B82F6

### Components
- **Button:** 3 variants (primary, secondary, outline), 3 sizes (sm, md, lg)
- **Input:** Text, email, password, number types with error/helper text
- **Card:** 3 variants (default, elevated, outlined)
- **Text:** 8 variants (h1, h2, h3, body, bodyLarge, caption, label, button)

## 🔒 Authentication Flow

1. User opens app → redirect to login if not authenticated
2. Login/Signup → Supabase Auth
3. Onboarding (optional) → collect subject preference
4. Redirect to Dashboard → protected tabs

## 📊 State Management

### Auth Store (Zustand)
- User state
- Session management
- Sign in/up/out actions
- Profile updates

## 🌐 API Services

### API Client
- Base URL configuration
- JWT token injection
- Auto token refresh on 401
- Error handling

### Services
- **authService:** User profile management
- **materialsService:** Upload & extract study materials
- **flashcardsService:** Generate, CRUD flashcards

## 🧪 Testing Strategy

- **Unit Tests:** Component behavior
- **Integration Tests:** Auth flow, navigation
- **Manual Tests:** iOS/Android compatibility

## 📱 Screen Sizes Supported

- **Mobile:** 375px - 428px (iPhone, Android phones)
- **Tablet:** 768px - 1024px (iPad, Android tablets)

## 🛠️ Development Commands

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Clean start
npx expo start --clear
```

## 🚧 Coming in Phase 4

- PDF upload & text extraction
- AI flashcard generation
- Card preview & editing
- Material management

## 🚧 Coming in Phase 5

- Study mode with spaced repetition
- FSRS algorithm integration
- Card review tracking
- Progress statistics

## 📝 Notes

- Phase 3 focuses on frontend foundation
- Backend integration ready (API services implemented)
- Upload/Study features are placeholders (will be implemented in Phases 4-5)
- All components follow design system specifications

## 🤝 Contributing

1. Create feature branch
2. Write code + tests
3. Run linter & type checker
4. Test on iOS/Android
5. Submit PR

## 📄 License

Proprietary - StudyMaster

---

**Phase 3 Status:** ✅ Complete
**Next Phase:** Phase 4 - AI Flashcard Generation
