# StudyMaster - Arquitectura del Sistema

**Versión:** 1.0
**Fecha:** 2025-11-20
**Estado:** Draft - Fase 0

---

## 📋 Tabla de Contenidos

1. [Vista General del Sistema](#vista-general-del-sistema)
2. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Decisiones de Arquitectura](#decisiones-de-arquitectura)
6. [Estrategias de Performance](#estrategias-de-performance)
7. [Estrategias de Seguridad](#estrategias-de-seguridad)
8. [Manejo de Errores](#manejo-de-errores)
9. [Escalabilidad](#escalabilidad)
10. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)

---

## Vista General del Sistema

### Descripción

StudyMaster es una aplicación móvil nativa (iOS/Android) que permite a estudiantes universitarios convertir materiales de estudio en flashcards inteligentes usando IA, con un sistema de repetición espaciada (FSRS) para optimizar el aprendizaje.

### Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE CLIENT                            │
│                  (React Native + Expo)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Auth Flow   │  │  Study Mode  │  │  Dashboard   │         │
│  │  (Supabase)  │  │  (FSRS)      │  │  (Stats)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│                      (FastAPI + CORS)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Authentication Middleware                     │  │
│  │              (JWT Verification + RLS)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Routes    │  │  Services   │  │   Models    │           │
│  │  /auth      │  │  - AI Gen   │  │ SQLAlchemy  │           │
│  │  /materials │  │  - FSRS     │  │  Pydantic   │           │
│  │  /cards     │  │  - PDF Proc │  │             │           │
│  │  /study     │  │  - Stats    │  │             │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
       ┌────────────┴────────┐          │
       │                     │          │
       ▼                     ▼          ▼
┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │    │   OpenAI     │  │   Supabase   │
│  (Supabase)  │    │   API        │  │   Auth       │
│              │    │  (GPT-4o)    │  │   (JWT)      │
│  - Users     │    │              │  │              │
│  - Materials │    └──────────────┘  └──────────────┘
│  - Cards     │
│  - Reviews   │
│  - Stats     │
└──────────────┘
```

### Stack Tecnológico

#### Frontend (Mobile)
- **Framework:** React Native + Expo
- **Lenguaje:** TypeScript
- **Styling:** NativeWind (Tailwind CSS para React Native)
- **Navegación:** Expo Router (file-based routing)
- **State Management:** Zustand
- **Local Storage:** AsyncStorage (datos) + SecureStore (tokens)
- **Networking:** Axios con interceptors
- **Notificaciones:** Expo Notifications

#### Backend (API)
- **Framework:** Python FastAPI
- **Lenguaje:** Python 3.11+
- **ORM:** SQLAlchemy 2.0
- **Validación:** Pydantic v2
- **Migrations:** Alembic
- **Testing:** Pytest + pytest-asyncio
- **API Docs:** FastAPI auto-generated (OpenAPI)

#### Database
- **Desarrollo:** PostgreSQL 16 (Docker local)
- **Producción:** Supabase (PostgreSQL 15)
- **Características:**
  - Row Level Security (RLS)
  - Índices B-tree y GIN
  - Triggers para stats denormalizados
  - JSONB para campos flexibles

#### Servicios Externos
- **Auth:** Supabase Auth (JWT + OAuth)
- **AI:** OpenAI GPT-4o-mini
- **Monitoring:** Sentry
- **Analytics:** Plausible (opcional)

---

## Diagrama de Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                              │
│                         (React Native + Expo)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        PRESENTATION LAYER                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Auth    │  │  Upload  │  │  Study   │  │Dashboard │        │  │
│  │  │  Screens │  │  Screens │  │  Screens │  │ Screens  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        BUSINESS LOGIC LAYER                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Auth    │  │  Upload  │  │  Study   │  │  Stats   │        │  │
│  │  │  Store   │  │  Store   │  │  Store   │  │  Store   │        │  │
│  │  │ (Zustand)│  │ (Zustand)│  │ (Zustand)│  │ (Zustand)│        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        DATA ACCESS LAYER                          │  │
│  │  ┌────────────────────────┐  ┌────────────────────────┐         │  │
│  │  │   API Client (Axios)   │  │  Local Storage          │         │  │
│  │  │   - JWT Interceptor    │  │  - AsyncStorage         │         │  │
│  │  │   - Retry Logic        │  │  - SecureStore          │         │  │
│  │  └────────────────────────┘  └────────────────────────┘         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (HTTPS)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                               │
│                            (FastAPI + Python)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        API ROUTES LAYER                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  /auth   │  │/materials│  │/flashcards│ │  /study  │        │  │
│  │  │  routes  │  │  routes  │  │  routes  │  │  routes  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        BUSINESS LOGIC LAYER                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │   AI     │  │   PDF    │  │   FSRS   │  │  Stats   │        │  │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        DATA ACCESS LAYER                          │  │
│  │  ┌────────────────────────┐  ┌────────────────────────┐         │  │
│  │  │  SQLAlchemy Models     │  │  Pydantic Schemas      │         │  │
│  │  │  - User                │  │  - Request/Response    │         │  │
│  │  │  - StudyMaterial       │  │  - Validation          │         │  │
│  │  │  - Flashcard           │  │                        │         │  │
│  │  └────────────────────────┘  └────────────────────────┘         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                    │                            │
                    ▼                            ▼
        ┌──────────────────┐          ┌──────────────────┐
        │   PostgreSQL     │          │   External APIs  │
        │   (Supabase)     │          │   - OpenAI       │
        │   + RLS          │          │   - Supabase Auth│
        └──────────────────┘          └──────────────────┘
```

---

## Flujo de Datos

### Flujo 1: Autenticación (Sign Up / Login)

```
┌───────────┐
│   User    │
│  (Mobile) │
└─────┬─────┘
      │ 1. Sign up / Login
      ▼
┌───────────────┐
│  Auth Screen  │
│  (RN Screen)  │
└───────┬───────┘
        │ 2. Call Supabase SDK
        ▼
┌────────────────┐
│  Supabase Auth │ ◄──── 3. Verify credentials
│  (JWT Service) │       4. Generate JWT token
└────────┬───────┘
         │ 5. Return JWT + User data
         ▼
┌────────────────┐
│  Auth Store    │ ◄──── 6. Store in Zustand
│  (Zustand)     │       7. Save JWT to SecureStore
└────────┬───────┘
         │ 8. Navigate to Dashboard
         ▼
┌────────────────┐
│  Dashboard     │
└────────────────┘
```

### Flujo 2: Generación de Flashcards con IA

```
┌───────────┐
│   User    │
└─────┬─────┘
      │ 1. Upload PDF / Paste text
      ▼
┌───────────────────┐
│  Upload Screen    │
│  (File Picker)    │
└─────────┬─────────┘
          │ 2. POST /materials/extract
          │    (FormData: file or text)
          ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ POST /materials/extract            │ │
│  │  - Verify JWT                      │ │
│  │  - Validate file size (<10MB)     │ │
│  │  - Validate file type (PDF)       │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │ PDF Service                        │ │
│  │  - Extract text with PyPDF2       │ │
│  │  - Clean and normalize text       │ │
│  │  - Save to study_materials table  │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│               │ 3. material_id           │
│               ▼                          │
│  ┌─────────────────────────────────────┐│
│  │ POST /flashcards/generate           ││
│  │  - Get material text from DB        ││
│  │  - Call OpenAI Service              ││
│  └────────────┬────────────────────────┘│
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │ AI Service (OpenAI)                │ │
│  │  - Chunk text if >4000 tokens      │ │
│  │  - Build prompt with context       │ │
│  │  - Call OpenAI API (GPT-4o-mini)  │ │
│  │  - Parse JSON response             │ │
│  │  - Validate flashcard quality      │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│               │ 4. Generated cards JSON  │
│               ▼                          │
│  ┌─────────────────────────────────────┐│
│  │ Save flashcards to DB               ││
│  │  - Insert into flashcards table     ││
│  │  - Status: "draft"                  ││
│  │  - Initialize card_stats            ││
│  └────────────┬────────────────────────┘│
└───────────────┼──────────────────────────┘
                │ 5. Return cards array
                ▼
┌───────────────────────────┐
│  Preview Screen           │
│  - Display cards          │
│  - Allow editing          │
│  - Save all button        │
└─────────┬─────────────────┘
          │ 6. User confirms
          │ PUT /flashcards/confirm
          ▼
┌──────────────────┐
│  Dashboard       │
│  (Show new deck) │
└──────────────────┘
```

### Flujo 3: Sistema de Estudio (FSRS)

```
┌───────────┐
│   User    │
└─────┬─────┘
      │ 1. Click "Study Now"
      ▼
┌───────────────────┐
│  Study Screen     │
└─────────┬─────────┘
          │ 2. GET /study/queue
          ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ GET /study/queue                   │ │
│  │  - Get user_id from JWT            │ │
│  │  - Query card_stats table          │ │
│  │  - WHERE due_date <= TODAY()       │ │
│  │  - ORDER BY overdue DESC, interval │ │
│  │  - LIMIT 50                        │ │
│  └────────────┬───────────────────────┘ │
└───────────────┼──────────────────────────┘
                │ 3. Return cards array
                ▼
┌───────────────────────────┐
│  Study Store (Zustand)    │
│  - Load queue             │
│  - currentIndex = 0       │
│  - isFlipped = false      │
└─────────┬─────────────────┘
          │ 4. Display first card
          ▼
┌───────────────────────────┐
│  Flashcard Component      │
│  - Show question          │
│  - User taps to flip      │
│  - Show answer            │
│  - Show rating buttons    │
└─────────┬─────────────────┘
          │ 5. User rates card (1-4)
          │ POST /study/review
          │ { card_id, rating, time_spent }
          ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ POST /study/review                 │ │
│  │  - Get current card_stats          │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │ FSRS Service                       │ │
│  │  - Calculate new interval          │ │
│  │  - Calculate new ease factor       │ │
│  │  - Calculate due_date              │ │
│  │    Based on rating:                │ │
│  │    1 (Again): 10 min               │ │
│  │    2 (Hard): 1 day                 │ │
│  │    3 (Good): interval * ease       │ │
│  │    4 (Easy): interval * ease * 1.3 │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │ Update Database                    │ │
│  │  - UPDATE card_stats               │ │
│  │  - INSERT card_reviews             │ │
│  │  - UPDATE study_sessions           │ │
│  │  - UPDATE user_stats (trigger)     │ │
│  └────────────┬───────────────────────┘ │
└───────────────┼──────────────────────────┘
                │ 6. Return success + next card
                ▼
┌───────────────────────────┐
│  Study Store              │
│  - Increment currentIndex │
│  - Display next card      │
└─────────┬─────────────────┘
          │ 7. Repeat until queue empty
          ▼
┌───────────────────────────┐
│  Session Summary Screen   │
│  - Cards studied: 47      │
│  - Time spent: 18 min     │
│  - Accuracy: 85%          │
└───────────────────────────┘
```

### Flujo 4: Dashboard y Estadísticas

```
┌───────────┐
│   User    │
└─────┬─────┘
      │ 1. Open app / Navigate to Dashboard
      ▼
┌───────────────────┐
│  Dashboard Screen │
└─────────┬─────────┘
          │ 2. GET /stats/dashboard
          ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ GET /stats/dashboard               │ │
│  │  - Get user_id from JWT            │ │
│  └────────────┬───────────────────────┘ │
│               │                          │
│  ┌────────────▼───────────────────────┐ │
│  │ Stats Service                      │ │
│  │                                    │ │
│  │ Query 1: Current Streak            │ │
│  │  - Query study_sessions            │ │
│  │  - Count consecutive days          │ │
│  │                                    │ │
│  │ Query 2: Cards Due Today           │ │
│  │  - Query card_stats                │ │
│  │  - WHERE due_date <= TODAY()       │ │
│  │                                    │ │
│  │ Query 3: Heatmap Data              │ │
│  │  - Query study_sessions            │ │
│  │  - Last 90 days                    │ │
│  │  - GROUP BY date                   │ │
│  │                                    │ │
│  │ Query 4: Progress by Subject       │ │
│  │  - Query flashcards + card_stats   │ │
│  │  - GROUP BY subject                │ │
│  │  - Calculate mastery %             │ │
│  └────────────┬───────────────────────┘ │
└───────────────┼──────────────────────────┘
                │ 3. Return aggregated stats
                ▼
┌───────────────────────────┐
│  Stats Store (Zustand)    │
│  - Cache stats (1 hour)   │
└─────────┬─────────────────┘
          │ 4. Render components
          ▼
┌───────────────────────────┐
│  Dashboard Components     │
│  - Stats Bar (streak)     │
│  - Heatmap (90 days)      │
│  - Subject Progress       │
│  - Quick Actions          │
└───────────────────────────┘
```

---

## Componentes del Sistema

### Frontend (React Native)

#### Estructura de Carpetas

```
mobile/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Auth flow (not authenticated)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/                  # Main app (authenticated)
│   │   ├── index.tsx            # Dashboard
│   │   ├── study.tsx            # Study mode
│   │   ├── upload.tsx           # Upload material
│   │   └── profile.tsx          # User settings
│   ├── preview.tsx              # Card preview after generation
│   ├── _layout.tsx              # Root layout with auth check
│   └── +not-found.tsx
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Text.tsx
│   │   └── SafeArea.tsx
│   ├── study/                   # Study-specific components
│   │   ├── Flashcard.tsx       # Flippable card
│   │   ├── RatingButtons.tsx   # Again/Hard/Good/Easy
│   │   └── ProgressBar.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── Heatmap.tsx
│   │   ├── StatsBar.tsx
│   │   └── SubjectProgress.tsx
│   └── upload/
│       ├── FilePickerZone.tsx
│       └── CardPreview.tsx
│
├── services/                     # API communication
│   ├── api.ts                   # Axios instance with interceptors
│   ├── authService.ts           # Auth API calls
│   ├── materialsService.ts      # Materials API calls
│   ├── flashcardsService.ts     # Flashcards API calls
│   └── studyService.ts          # Study API calls
│
├── stores/                       # Zustand state management
│   ├── authStore.ts             # User auth state
│   ├── uploadStore.ts           # Upload flow state
│   ├── studyStore.ts            # Study session state
│   └── statsStore.ts            # Dashboard stats state
│
├── utils/                        # Helper functions
│   ├── storage.ts               # AsyncStorage helpers
│   ├── validation.ts            # Form validation
│   └── formatting.ts            # Date/number formatting
│
├── constants/                    # App constants
│   ├── colors.ts                # Color palette
│   ├── spacing.ts               # Spacing scale
│   └── typography.ts            # Font styles
│
├── types/                        # TypeScript types
│   ├── api.ts                   # API request/response types
│   ├── models.ts                # Data model types
│   └── navigation.ts            # Navigation types
│
├── app.json                      # Expo config
├── tailwind.config.js            # NativeWind config
├── tsconfig.json                 # TypeScript config
└── package.json
```

#### State Management (Zustand)

**authStore.ts**
```typescript
interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  loadSession: () => Promise<void>
}
```

**studyStore.ts**
```typescript
interface StudyStore {
  queue: Flashcard[]
  currentIndex: number
  isFlipped: boolean
  sessionStats: SessionStats
  loadQueue: () => Promise<void>
  flipCard: () => void
  submitReview: (rating: number) => Promise<void>
  nextCard: () => void
  endSession: () => void
}
```

**statsStore.ts**
```typescript
interface StatsStore {
  stats: DashboardStats | null
  isLoading: boolean
  lastUpdated: Date | null
  loadStats: () => Promise<void>
  refreshStats: () => Promise<void>
}
```

### Backend (FastAPI)

#### Estructura de Carpetas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app + middleware
│   ├── config.py                # Environment variables
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── study_material.py
│   │   ├── flashcard.py
│   │   ├── card_review.py
│   │   ├── card_stats.py
│   │   ├── study_session.py
│   │   └── user_stats.py
│   │
│   ├── schemas/                 # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py             # LoginRequest, SignupRequest
│   │   ├── material.py         # MaterialCreate, MaterialResponse
│   │   ├── flashcard.py        # FlashcardCreate, FlashcardResponse
│   │   └── study.py            # ReviewRequest, QueueResponse
│   │
│   ├── routes/                  # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py             # /auth/*
│   │   ├── materials.py        # /materials/*
│   │   ├── flashcards.py       # /flashcards/*
│   │   ├── study.py            # /study/*
│   │   └── stats.py            # /stats/*
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── pdf_service.py      # PDF text extraction
│   │   ├── openai_service.py   # AI flashcard generation
│   │   ├── fsrs_service.py     # Spaced repetition algorithm
│   │   └── stats_service.py    # Statistics calculation
│   │
│   ├── utils/                   # Utilities
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT verification
│   │   ├── database.py         # DB session management
│   │   └── exceptions.py       # Custom exceptions
│   │
│   └── middleware/              # Middleware
│       ├── __init__.py
│       ├── auth_middleware.py  # JWT verification
│       ├── cors_middleware.py  # CORS config
│       └── error_middleware.py # Global error handler
│
├── tests/                       # Pytest tests
│   ├── __init__.py
│   ├── conftest.py             # Fixtures
│   ├── test_auth.py
│   ├── test_materials.py
│   ├── test_flashcards.py
│   └── test_study.py
│
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment variables
├── docker-compose.yml           # Local PostgreSQL
└── README.md
```

#### API Routes

**Health & Docs**
- `GET /health` - Health check
- `GET /docs` - Swagger UI
- `GET /openapi.json` - OpenAPI spec

**Auth** (`/auth`)
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout (invalidate JWT)
- `GET /auth/me` - Get current user info

**Materials** (`/materials`)
- `POST /materials/extract` - Upload PDF or paste text, extract content
- `GET /materials/{id}` - Get material by ID
- `GET /materials` - List user's materials
- `DELETE /materials/{id}` - Delete material

**Flashcards** (`/flashcards`)
- `POST /flashcards/generate` - Generate flashcards from material
- `GET /flashcards` - List user's flashcards (with filters)
- `GET /flashcards/{id}` - Get single flashcard
- `PUT /flashcards/{id}` - Update flashcard
- `DELETE /flashcards/{id}` - Delete flashcard
- `POST /flashcards/confirm` - Confirm draft flashcards

**Study** (`/study`)
- `GET /study/queue` - Get cards due today
- `POST /study/review` - Submit card review
- `GET /study/session/{id}` - Get session details

**Stats** (`/stats`)
- `GET /stats/dashboard` - Get all dashboard stats
- `GET /stats/heatmap` - Get heatmap data (90 days)
- `GET /stats/progress` - Get progress by subject

---

## Decisiones de Arquitectura

### ADR-001: React Native + Expo para Mobile

**Decisión:** Usar React Native con Expo para la aplicación móvil.

**Contexto:**
- Necesitamos app nativa para iOS y Android
- Presupuesto limitado, un solo desarrollador
- Timeline de 12-14 semanas

**Alternativas consideradas:**
1. Flutter
2. Native (Swift + Kotlin)
3. React Web (PWA)

**Justificación:**
- ✅ Single codebase (95% compartido)
- ✅ Expo maneja builds en la nube (no necesitas Mac)
- ✅ Hot reload rápido
- ✅ Ecosystem maduro con librerías nativas
- ✅ Push notifications y offline support built-in

**Trade-offs aceptados:**
- App size ~40MB (vs PWA ~5MB)
- Dependencia en Expo platform

---

### ADR-002: FastAPI para Backend

**Decisión:** Usar FastAPI como framework backend.

**Contexto:**
- Necesitamos integración con OpenAI API
- Auto-generación de docs API
- Type safety importante

**Alternativas consideradas:**
1. Node.js + Express
2. Django
3. Flask

**Justificación:**
- ✅ Async nativo (perfecto para OpenAI calls)
- ✅ Type hints con Pydantic
- ✅ Auto-generated OpenAPI docs
- ✅ Mejor rendimiento que Flask/Django
- ✅ Python ideal para ML/AI integrations

**Trade-offs aceptados:**
- Dos lenguajes (Python + JS)
- Menos librerías que Node.js

---

### ADR-003: PostgreSQL + Supabase

**Decisión:** PostgreSQL local para desarrollo, Supabase para producción.

**Contexto:**
- Necesitamos auth + database + RLS
- Presupuesto limitado (<$50/mes)
- Row Level Security crítico

**Alternativas consideradas:**
1. Firebase
2. AWS Amplify
3. VPS custom

**Justificación:**
- ✅ RLS built-in
- ✅ Auth incluido (JWT + OAuth)
- ✅ Free tier generoso (500MB + 2GB bandwidth)
- ✅ Compatible con PostgreSQL estándar
- ✅ No vendor lock-in severo

**Trade-offs aceptados:**
- Vendor dependency moderada
- Menos control que VPS custom

---

### ADR-004: No almacenar PDFs

**Decisión:** Extraer texto de PDFs y descartar el archivo.

**Contexto:**
- Storage costoso
- Privacy concerns
- Solo necesitamos texto para IA

**Justificación:**
- ✅ Reduce storage costs ~90%
- ✅ Mejor privacidad (no guardamos documentos)
- ✅ Simplifica arquitectura
- ✅ Cumple con GDPR

**Trade-offs aceptados:**
- No se puede re-procesar PDF original
- Usuario debe guardar PDF localmente si quiere

---

### ADR-005: Zustand para State Management

**Decisión:** Usar Zustand en lugar de Redux Toolkit.

**Contexto:**
- State management necesario
- App pequeña-mediana
- TypeScript first

**Alternativas consideradas:**
1. Redux Toolkit
2. Context API
3. MobX

**Justificación:**
- ✅ Simple y minimalista
- ✅ TypeScript nativo
- ✅ Performance excelente
- ✅ Menos boilerplate que Redux

**Trade-offs aceptados:**
- Ecosystem más pequeño que Redux
- Menos middleware disponible

---

## Estrategias de Performance

### 1. Database Performance

#### Índices

```sql
-- Índice compuesto para buscar cards due
CREATE INDEX idx_card_stats_user_due
ON card_stats(user_id, due_date);

-- Índice para buscar reviews por usuario y fecha
CREATE INDEX idx_card_reviews_user_date
ON card_reviews(user_id, reviewed_at DESC);

-- Índice para buscar materiales por usuario
CREATE INDEX idx_study_materials_user
ON study_materials(user_id, created_at DESC);

-- Índice GIN para búsqueda de texto completo (opcional)
CREATE INDEX idx_flashcards_question_gin
ON flashcards USING GIN(to_tsvector('english', question));
```

#### Query Optimization

**Buena práctica:**
```sql
-- Usar subquery con LIMIT
SELECT * FROM flashcards
WHERE id IN (
  SELECT card_id FROM card_stats
  WHERE user_id = ? AND due_date <= CURRENT_DATE
  ORDER BY due_date ASC
  LIMIT 50
);
```

**Evitar:**
```sql
-- Fetch todo y filtrar en memoria
SELECT * FROM flashcards
WHERE user_id = ?;  -- Potencialmente miles de rows
```

#### Connection Pooling

```python
# config.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,           # 5 conexiones permanentes
    max_overflow=10,       # Hasta 15 conexiones en picos
    pool_pre_ping=True,    # Verificar conexión antes de usar
    pool_recycle=3600,     # Reciclar cada 1 hora
)
```

### 2. Caching Strategy

#### API Response Caching

```python
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=128)
def get_dashboard_stats_cached(user_id: str, cache_key: str):
    """Cache stats for 1 hour"""
    return calculate_dashboard_stats(user_id)

@router.get("/stats/dashboard")
async def get_dashboard(user_id: str = Depends(get_current_user)):
    # Cache key changes every hour
    cache_key = datetime.now().strftime("%Y-%m-%d-%H")
    return get_dashboard_stats_cached(user_id, cache_key)
```

#### Frontend Caching

```typescript
// statsStore.ts
const statsStore = create<StatsStore>((set, get) => ({
  stats: null,
  lastUpdated: null,

  loadStats: async () => {
    const { lastUpdated } = get()
    const now = new Date()

    // Cache for 5 minutes
    if (lastUpdated && (now.getTime() - lastUpdated.getTime()) < 300000) {
      return
    }

    const stats = await api.get('/stats/dashboard')
    set({ stats, lastUpdated: now })
  }
}))
```

### 3. OpenAI API Optimization

#### Request Batching

```python
async def generate_flashcards_batch(texts: list[str]) -> list[list[Flashcard]]:
    """Process multiple materials in parallel"""
    tasks = [generate_flashcards(text) for text in texts]
    return await asyncio.gather(*tasks)
```

#### Token Management

```python
import tiktoken

def chunk_text_by_tokens(text: str, max_tokens: int = 3000):
    """Split text into chunks that fit in context window"""
    encoding = tiktoken.encoding_for_model("gpt-4o-mini")
    tokens = encoding.encode(text)

    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)

    return chunks
```

#### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/flashcards/generate")
@limiter.limit("10/hour")  # Max 10 generations per hour
async def generate_flashcards(...):
    ...
```

### 4. Mobile Performance

#### Image Optimization

```typescript
// Use optimized image formats
<Image
  source={{ uri: imageUrl }}
  style={{ width: 300, height: 200 }}
  resizeMode="cover"
  defaultSource={require('./placeholder.png')}
/>
```

#### List Virtualization

```typescript
import { FlashList } from "@shopify/flash-list"

// Use FlashList instead of FlatList for better performance
<FlashList
  data={flashcards}
  renderItem={({ item }) => <FlashcardItem card={item} />}
  estimatedItemSize={100}
/>
```

#### Lazy Loading

```typescript
// Lazy load heavy screens
const StudyScreen = lazy(() => import('./screens/StudyScreen'))
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'))
```

---

## Estrategias de Seguridad

### 1. Authentication & Authorization

#### JWT Verification

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Row Level Security (RLS)

```sql
-- Enable RLS on all user tables
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own flashcards
CREATE POLICY flashcards_select_policy ON flashcards
FOR SELECT USING (user_id = auth.uid());

-- Policy: Users can only insert their own flashcards
CREATE POLICY flashcards_insert_policy ON flashcards
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can only update their own flashcards
CREATE POLICY flashcards_update_policy ON flashcards
FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can only delete their own flashcards
CREATE POLICY flashcards_delete_policy ON flashcards
FOR DELETE USING (user_id = auth.uid());
```

### 2. Input Validation

#### PDF Upload Validation

```python
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_pdf_upload(file: UploadFile):
    # Check extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Check file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10MB"
        )

    # Reset file pointer
    await file.seek(0)
    return file
```

#### SQL Injection Prevention

```python
# ✅ Good: Use ORM (SQLAlchemy)
flashcards = session.query(Flashcard).filter(
    Flashcard.user_id == user_id
).all()

# ❌ Bad: Raw SQL with string interpolation
query = f"SELECT * FROM flashcards WHERE user_id = '{user_id}'"
```

#### XSS Prevention

```python
# Pydantic automatically escapes HTML
class FlashcardCreate(BaseModel):
    question: str = Field(..., max_length=500)
    answer: str = Field(..., max_length=2000)

    @validator('question', 'answer')
    def sanitize_html(cls, v):
        # Remove any HTML tags
        return re.sub(r'<[^>]+>', '', v)
```

### 3. API Security

#### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo dev server
        "https://studymaster.app"  # Production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Global rate limit
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # 100 requests per minute per IP
    ...

# Endpoint-specific limits
@app.post("/flashcards/generate")
@limiter.limit("10/hour")
async def generate_flashcards(...):
    ...
```

#### API Key Security

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

```bash
# .env (never commit this!)
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
DATABASE_URL=postgresql://user:pass@localhost:5432/studymaster
```

### 4. Data Privacy

#### Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

#### Sensitive Data Logging

```python
import logging

# ❌ Bad: Log sensitive data
logging.info(f"User {email} logged in with password {password}")

# ✅ Good: Never log passwords or tokens
logging.info(f"User {user_id} logged in successfully")
```

---

## Manejo de Errores

### 1. Backend Error Handling

#### Global Exception Handler

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )
```

#### Custom Exceptions

```python
# utils/exceptions.py
class StudyMasterException(Exception):
    """Base exception for StudyMaster"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class PDFProcessingError(StudyMasterException):
    def __init__(self, message: str = "Failed to process PDF"):
        super().__init__(message, status_code=400)

class OpenAIError(StudyMasterException):
    def __init__(self, message: str = "AI generation failed"):
        super().__init__(message, status_code=503)

class FlashcardNotFoundError(StudyMasterException):
    def __init__(self, card_id: str):
        super().__init__(f"Flashcard {card_id} not found", status_code=404)
```

#### Retry Logic for External APIs

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_openai_api(prompt: str) -> dict:
    """Retry up to 3 times with exponential backoff"""
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response
    except openai.error.RateLimitError:
        logging.warning("OpenAI rate limit hit, retrying...")
        raise
    except openai.error.APIError as e:
        logging.error(f"OpenAI API error: {e}")
        raise
```

### 2. Frontend Error Handling

#### API Error Interceptor

```typescript
// services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          await authStore.getState().signOut()
          break
        case 403:
          // Forbidden
          Alert.alert('Access Denied', 'You do not have permission')
          break
        case 404:
          // Not found
          Alert.alert('Not Found', data.detail || 'Resource not found')
          break
        case 422:
          // Validation error
          const errors = data.detail.map((e: any) => e.msg).join('\n')
          Alert.alert('Validation Error', errors)
          break
        case 429:
          // Rate limit
          Alert.alert('Too Many Requests', 'Please try again later')
          break
        case 500:
        case 502:
        case 503:
          // Server error
          Alert.alert('Server Error', 'Please try again later')
          break
        default:
          Alert.alert('Error', data.detail || 'An error occurred')
      }
    } else if (error.request) {
      // Request made but no response
      Alert.alert('Network Error', 'Unable to connect to server')
    } else {
      // Something else happened
      Alert.alert('Error', error.message)
    }

    return Promise.reject(error)
  }
)

export default api
```

#### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React from 'react'
import { View, Text, Button } from 'react-native'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    // Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
          <Button
            title="Reload"
            onPress={() => this.setState({ hasError: false, error: null })}
          />
        </View>
      )
    }

    return this.props.children
  }
}
```

---

## Escalabilidad

### 1. Database Scaling

#### Vertical Scaling (Short-term)

- Supabase free tier: 500MB storage, 2GB bandwidth
- Upgrade to Pro: $25/mes → 8GB storage, 50GB bandwidth
- Upgrade to Team: $599/mes → 100GB storage, 250GB bandwidth

#### Horizontal Scaling (Long-term)

**Read Replicas:**
```python
# Primary for writes
primary_engine = create_engine(PRIMARY_DATABASE_URL)

# Replica for reads
replica_engine = create_engine(REPLICA_DATABASE_URL)

# Use replica for heavy read queries
def get_dashboard_stats(user_id: str):
    with replica_engine.connect() as conn:
        result = conn.execute(...)
```

**Sharding by User ID:**
```python
def get_shard_for_user(user_id: str) -> str:
    """Route user to specific database shard"""
    shard_num = int(user_id, 16) % NUM_SHARDS
    return f"shard_{shard_num}"
```

### 2. API Scaling

#### Load Balancing

```
                    ┌──────────────┐
                    │ Load Balancer│
                    │  (Railway)   │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ API Server 1│ │API Server 2│ │API Server 3│
    │ (Container) │ │ (Container)│ │ (Container)│
    └─────────────┘ └────────────┘ └────────────┘
```

#### Async Task Queue

```python
from celery import Celery

celery_app = Celery('studymaster', broker='redis://localhost:6379')

@celery_app.task
def generate_flashcards_async(material_id: str):
    """Process flashcard generation in background"""
    material = get_material(material_id)
    cards = generate_flashcards(material.text)
    save_flashcards(cards)
    notify_user(material.user_id, "Flashcards ready!")

# In API endpoint
@router.post("/flashcards/generate")
async def generate_flashcards_endpoint(material_id: str):
    # Queue task instead of blocking
    generate_flashcards_async.delay(material_id)
    return {"status": "processing", "message": "Generation started"}
```

### 3. Caching Layer

#### Redis Caching

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_stats(user_id: str) -> dict | None:
    """Get stats from cache"""
    key = f"stats:{user_id}"
    data = redis_client.get(key)
    return json.loads(data) if data else None

def set_cached_stats(user_id: str, stats: dict, ttl: int = 3600):
    """Cache stats for 1 hour"""
    key = f"stats:{user_id}"
    redis_client.setex(key, ttl, json.dumps(stats))

@router.get("/stats/dashboard")
async def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    # Try cache first
    cached = get_cached_stats(user_id)
    if cached:
        return cached

    # Calculate and cache
    stats = calculate_stats(user_id)
    set_cached_stats(user_id, stats)
    return stats
```

### 4. CDN for Static Assets

```typescript
// Use CDN for images and static files
const CARD_IMAGE_CDN = 'https://cdn.studymaster.app/images'

<Image
  source={{ uri: `${CARD_IMAGE_CDN}/card-placeholder.png` }}
/>
```

---

## Monitoreo y Observabilidad

### 1. Application Monitoring

#### Sentry Integration

```python
# Backend
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # 10% of requests
    profiles_sample_rate=0.1,
    environment="production"
)
```

```typescript
// Frontend
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: __DEV__ ? 'development' : 'production',
})
```

### 2. Logging Strategy

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10485760, backupCount=5),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Log important events
logger.info(f"User {user_id} generated flashcards from material {material_id}")
logger.warning(f"OpenAI API rate limit approached")
logger.error(f"Failed to process PDF: {error}", exc_info=True)
```

### 3. Performance Metrics

```python
from prometheus_client import Counter, Histogram

# Define metrics
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    request_count.labels(method=request.method, endpoint=request.url.path).inc()
    request_duration.observe(duration)

    return response
```

### 4. Health Checks

```python
@router.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {
        "database": await check_database(),
        "openai": await check_openai(),
        "redis": await check_redis(),
    }

    all_healthy = all(checks.values())

    return {
        "status": "healthy" if all_healthy else "unhealthy",
        "checks": checks,
        "timestamp": datetime.now().isoformat()
    }

async def check_database() -> bool:
    try:
        # Simple query
        await db.execute("SELECT 1")
        return True
    except Exception:
        return False
```

---

## Apéndices

### A. Glossary

- **FSRS:** Free Spaced Repetition Scheduler
- **RLS:** Row Level Security
- **JWT:** JSON Web Token
- **ORM:** Object-Relational Mapping
- **CDN:** Content Delivery Network
- **TTL:** Time To Live

### B. Referencias

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### C. Decisiones Pendientes

1. ¿Implementar offline mode completo en MVP?
2. ¿Usar WebSockets para real-time updates?
3. ¿Analytics: Plausible vs Mixpanel?
4. ¿CDN: Cloudflare vs CloudFront?

---

**Última actualización:** 2025-11-20
**Próxima revisión:** Después de implementar Fase 1
**Owner:** Architecture Team
