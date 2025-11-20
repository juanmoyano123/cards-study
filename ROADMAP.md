# StudyMaster - Roadmap de Desarrollo Técnico

**Versión:** 2.0 - Development-Focused
**Timeline Total:** 10-12 semanas de desarrollo puro
**Última actualización:** 2025-11-20

---

## 🎯 Metodología de Trabajo

Cada fase sigue este ciclo:

```
1. PLANEAR ARQUITECTURA
   └─> Diseñar estructura, definir schemas, planear componentes

2. EJECUTAR PLAN
   └─> Escribir código, implementar features

3. TESTEAR CÓDIGO
   └─> Unit tests, integration tests, manual testing

4. VALIDAR & AVANZAR
   └─> Code review, fix bugs, documentar, siguiente fase
```

**Regla de Oro:** No avanzar a la siguiente fase hasta que los tests pasen y el código esté funcional.

---

## 📊 Vista General de Fases

| Fase | Nombre | Duración | Objetivo |
|------|--------|----------|----------|
| **0** | Arquitectura & Planning | 3-5 días | Diseñar arquitectura completa del sistema |
| **1** | Setup & Foundation | 5-7 días | Proyecto base + tooling + CI/CD |
| **2** | Backend Core | 5-7 días | Database + API base + Auth |
| **3** | Frontend Foundation | 5-7 días | React Native + navegación + UI base |
| **4** | Feature: AI Generation | 7-10 días | Upload + extract + generate flashcards |
| **5** | Feature: Spaced Repetition | 5-7 días | FSRS algorithm + study mode |
| **6** | Feature: Dashboard | 5-7 días | Stats + heatmap + progress |
| **7** | Feature: Pomodoro (Opcional) | 3-5 días | Timer + sessions |
| **8** | Testing & Optimization | 5-7 días | Bug fixes + performance + refactor |
| **9** | Build & Deploy | 3-5 días | Production builds + deploy |

**Total:** 10-12 semanas

---

## FASE 0: Arquitectura & Technical Planning
**Duración:** 3-5 días
**Objetivo:** Diseñar la arquitectura completa antes de escribir código

### 📐 Planear Arquitectura

- [ ] **Arquitectura de Sistema**
  - Diagrama de arquitectura (Frontend ↔ Backend ↔ Database ↔ OpenAI)
  - Definir flujo de datos
  - Identificar puntos críticos de performance
  - Estrategia de caching
  - Error handling strategy

- [ ] **Database Design**
  - Schema completo de todas las tablas
  - Relaciones entre tablas
  - Índices necesarios para performance
  - Row Level Security policies (Supabase)
  - Migration strategy

- [ ] **API Design**
  - Listar todos los endpoints necesarios
  - Request/Response schemas
  - Error codes y mensajes
  - Rate limiting strategy
  - Authentication flow

- [ ] **Frontend Architecture**
  - Estructura de carpetas
  - State management strategy (Zustand)
  - Navigation structure (Expo Router)
  - Component hierarchy
  - Offline-first considerations

- [ ] **External Integrations**
  - OpenAI API integration plan
  - PDF processing strategy (PyPDF2 vs pdf.js)
  - Supabase setup plan
  - Analytics integration (opcional)

### 📄 Documentar Arquitectura

- [ ] Crear `/docs/architecture.md`
  - System diagram
  - Database ERD
  - API endpoints list
  - Component tree

- [ ] Crear `/docs/database-schema.sql`
  - DDL completo
  - Seeds de testing

- [ ] Crear `/docs/api-spec.md`
  - OpenAPI/Swagger spec
  - O documentación manual

### ✅ Criterios de Completitud
- ✅ Arquitectura documentada y revisada
- ✅ Database schema validado
- ✅ API endpoints definidos
- ✅ No quedan decisiones técnicas pendientes

**Entregable:** Documentación completa de arquitectura

---

## FASE 1: Setup & Foundation
**Duración:** 5-7 días
**Objetivo:** Setup completo del proyecto y tooling

### 📐 Planear Setup

- [ ] **Definir Tech Stack Final**
  - Backend: FastAPI + PostgreSQL + Supabase
  - Frontend: React Native + Expo + NativeWind
  - Testing: Pytest (backend), Jest + React Testing Library (frontend)
  - CI/CD: GitHub Actions

- [ ] **Estructura de Monorepo (Opcional)**
  - `/backend` - FastAPI
  - `/mobile` - React Native + Expo
  - `/shared` - Types compartidos

### 🔨 Ejecutar Setup

#### Backend Setup

- [ ] **Proyecto FastAPI**
  ```bash
  mkdir backend && cd backend
  python -m venv venv
  source venv/bin/activate
  pip install fastapi uvicorn sqlalchemy alembic pytest
  ```

- [ ] **Estructura de Carpetas**
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── models/         # SQLAlchemy models
  │   ├── schemas/        # Pydantic schemas
  │   ├── routes/         # API routes
  │   ├── services/       # Business logic
  │   ├── utils/          # Helpers
  │   └── config.py       # Environment config
  ├── tests/
  ├── alembic/            # Migrations
  ├── requirements.txt
  └── .env.example
  ```

- [ ] **PostgreSQL Local con Docker**
  ```yaml
  # docker-compose.yml
  version: '3.8'
  services:
    postgres:
      image: postgres:16
      environment:
        POSTGRES_DB: studymaster
        POSTGRES_USER: dev
        POSTGRES_PASSWORD: devpass
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data
  ```

- [ ] **FastAPI Base**
  - Health check endpoint: `GET /health`
  - CORS configurado
  - Environment variables
  - Logging setup

#### Frontend Setup

- [ ] **Proyecto React Native + Expo**
  ```bash
  npx create-expo-app mobile --template blank-typescript
  cd mobile
  npm install nativewind tailwindcss
  npx expo install expo-router
  ```

- [ ] **Estructura de Carpetas**
  ```
  mobile/
  ├── app/              # Expo Router screens
  │   ├── (tabs)/      # Tab navigation
  │   ├── (auth)/      # Auth screens
  │   └── _layout.tsx
  ├── components/       # Reusable components
  ├── services/         # API calls
  ├── stores/           # Zustand stores
  ├── utils/            # Helpers
  ├── constants/        # Colors, spacing, etc.
  └── types/            # TypeScript types
  ```

- [ ] **NativeWind Setup**
  - `tailwind.config.js`
  - `global.css`
  - Verificar que funciona

- [ ] **Expo Router Setup**
  - File-based routing configurado
  - Tab navigation structure
  - Stack navigation for auth

#### Tooling

- [ ] **Git Setup**
  - `.gitignore` para backend (venv, __pycache__, .env)
  - `.gitignore` para frontend (node_modules, .expo, .env)
  - Conventional commits

- [ ] **Testing Setup**
  - Backend: `pytest` configurado
  - Frontend: `jest` + `@testing-library/react-native`
  - Coverage reports

- [ ] **CI/CD (Opcional para MVP)**
  - GitHub Actions para tests
  - Lint checks en PR
  - Build checks

### 🧪 Testear Setup

- [ ] Backend funciona:
  ```bash
  cd backend
  uvicorn app.main:app --reload
  # Visitar http://localhost:8000/health
  ```

- [ ] Frontend funciona:
  ```bash
  cd mobile
  npx expo start
  # Escanear QR con Expo Go
  ```

- [ ] Database conecta:
  ```bash
  docker-compose up -d
  # Conectar con pgAdmin o psql
  ```

- [ ] Tests corren:
  ```bash
  # Backend
  cd backend && pytest

  # Frontend
  cd mobile && npm test
  ```

### ✅ Criterios de Completitud
- ✅ Backend corriendo en localhost:8000
- ✅ Frontend corriendo en Expo Go
- ✅ PostgreSQL corriendo en Docker
- ✅ Tests setup (aunque vacíos por ahora)
- ✅ Git commits limpios

**Entregable:** Proyecto base funcional con tooling completo

---

## FASE 2: Backend Core
**Duración:** 5-7 días
**Objetivo:** Database, API base, y autenticación funcionando

### 📐 Planear Backend

- [ ] **Database Schema Final**
  ```sql
  -- users (via Supabase Auth)
  -- study_materials
  -- flashcards
  -- card_reviews
  -- card_stats
  -- study_sessions
  -- user_stats
  ```

- [ ] **API Endpoints a Implementar**
  ```
  Auth:
  - POST /auth/signup
  - POST /auth/login
  - POST /auth/logout
  - GET  /auth/me

  Materials:
  - POST /materials/extract    # PDF → text
  - GET  /materials/:id

  Flashcards:
  - POST /flashcards/generate  # AI generation
  - GET  /flashcards
  - PUT  /flashcards/:id
  - DELETE /flashcards/:id

  Study:
  - GET  /study/queue          # Cards due today
  - POST /study/review         # Record review

  Stats:
  - GET  /stats/dashboard      # All dashboard data
  ```

### 🔨 Ejecutar Backend Core

#### Database

- [ ] **Crear SQLAlchemy Models**
  - `models/user.py` (si no usas solo Supabase Auth)
  - `models/study_material.py`
  - `models/flashcard.py`
  - `models/card_review.py`
  - `models/card_stats.py`
  - `models/study_session.py`
  - `models/user_stats.py`

- [ ] **Crear Alembic Migrations**
  ```bash
  alembic init alembic
  alembic revision --autogenerate -m "Initial schema"
  alembic upgrade head
  ```

- [ ] **Verificar Schema en DB**
  - Conectar con pgAdmin
  - Verificar todas las tablas existen
  - Verificar relaciones (foreign keys)
  - Verificar índices

#### Auth con Supabase

- [ ] **Supabase Project Setup**
  - Crear proyecto en supabase.com
  - Obtener URL y anon key
  - Configurar Auth providers (email, Google)

- [ ] **Backend Auth Integration**
  - Instalar `supabase-py`
  - Middleware para verificar JWT
  - Endpoint `/auth/me` usando JWT

- [ ] **Row Level Security**
  - Policies para users solo ven sus datos
  - Policies para insert/update/delete

#### API Base Endpoints

- [ ] **Health & Docs**
  - `GET /health` - Health check
  - `GET /docs` - FastAPI auto-docs
  - `GET /openapi.json` - OpenAPI spec

- [ ] **Auth Endpoints**
  - POST `/auth/signup`
  - POST `/auth/login`
  - GET `/auth/me`

- [ ] **CRUD Materials (sin AI todavía)**
  - POST `/materials` - Create material (texto manual por ahora)
  - GET `/materials/:id`
  - GET `/materials` - List user materials

- [ ] **CRUD Flashcards (sin AI todavía)**
  - POST `/flashcards` - Create manual
  - GET `/flashcards`
  - PUT `/flashcards/:id`
  - DELETE `/flashcards/:id`

### 🧪 Testear Backend

- [ ] **Unit Tests**
  - `tests/test_auth.py` - Auth flow
  - `tests/test_materials.py` - CRUD materials
  - `tests/test_flashcards.py` - CRUD flashcards

- [ ] **Integration Tests**
  - Signup → Login → Create Material → Create Flashcard
  - Verificar JWT funciona
  - Verificar RLS funciona (user A no ve datos de user B)

- [ ] **Manual Testing**
  - Probar todos los endpoints con curl o Postman
  - Verificar errores retornan códigos HTTP correctos
  - Verificar validación de inputs

### ✅ Criterios de Completitud
- ✅ Todas las tablas creadas en DB
- ✅ Auth funciona (signup, login, JWT)
- ✅ CRUD básico funciona para materials y flashcards
- ✅ Tests passing (>80% coverage)
- ✅ API docs generadas automáticamente

**Entregable:** Backend funcional con auth y CRUD básico

---

## FASE 3: Frontend Foundation
**Duración:** 5-7 días
**Objetivo:** React Native base con auth, navegación, y UI

### 📐 Planear Frontend

- [ ] **Navegación Structure**
  ```
  app/
  ├── (auth)/
  │   ├── login.tsx
  │   ├── signup.tsx
  │   └── onboarding.tsx
  ├── (tabs)/
  │   ├── index.tsx          # Dashboard
  │   ├── study.tsx          # Study mode
  │   ├── upload.tsx         # Upload
  │   └── profile.tsx        # Settings
  └── _layout.tsx
  ```

- [ ] **Design System Implementation**
  - Colors (del design system)
  - Typography
  - Spacing
  - Components base

### 🔨 Ejecutar Frontend Foundation

#### Design System

- [ ] **Constants**
  ```typescript
  // constants/colors.ts
  export const colors = {
    primary: '#A855F7',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    // ...
  }

  // constants/spacing.ts
  export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }
  ```

- [ ] **Base Components**
  - `<Button>` (primary, secondary, outline)
  - `<Input>` (text, password, email)
  - `<Card>`
  - `<Text>` (h1, h2, body, caption)
  - `<SafeArea>`

#### Auth Flow

- [ ] **Supabase Client Setup**
  ```bash
  npm install @supabase/supabase-js
  ```

- [ ] **Auth Screens**
  - `(auth)/login.tsx`
  - `(auth)/signup.tsx`
  - `(auth)/onboarding.tsx` (nombre + subject)

- [ ] **Auth State Management**
  ```typescript
  // stores/authStore.ts
  import { create } from 'zustand'

  interface AuthStore {
    user: User | null
    session: Session | null
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
  }
  ```

- [ ] **Protected Routes**
  - Si no hay session → redirect a `/auth/login`
  - Si hay session → allow access a tabs

#### Navigation

- [ ] **Tab Navigation**
  - 4 tabs: Dashboard, Study, Upload, Profile
  - Icons (Lucide React Native)
  - Active state styling

- [ ] **Stack Navigation**
  - Auth stack (login, signup, onboarding)
  - Study stack (study mode, card detail)

#### API Integration

- [ ] **API Client**
  ```typescript
  // services/api.ts
  import axios from 'axios'

  const api = axios.create({
    baseURL: 'http://localhost:8000',
  })

  // Interceptor para JWT
  api.interceptors.request.use(async (config) => {
    const session = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  })
  ```

- [ ] **API Services**
  - `services/authService.ts`
  - `services/materialsService.ts`
  - `services/flashcardsService.ts`

#### Basic Screens

- [ ] **Dashboard Screen (placeholder)**
  - Header con nombre
  - "No flashcards yet" state
  - CTA: "Upload Material"

- [ ] **Profile Screen**
  - User info
  - Logout button

### 🧪 Testear Frontend

- [ ] **Component Tests**
  - `Button.test.tsx`
  - `Input.test.tsx`
  - `Card.test.tsx`

- [ ] **Integration Tests**
  - Login flow
  - Signup flow
  - Protected route redirect

- [ ] **Manual Testing**
  - Signup → login → see dashboard
  - Logout → redirect to login
  - Test en iOS y Android (emuladores)

### ✅ Criterios de Completitud
- ✅ Auth flow completo (signup, login, logout)
- ✅ Navegación funciona (tabs + stacks)
- ✅ Design system implementado
- ✅ API integration funciona
- ✅ Tests passing

**Entregable:** App funcional con auth y navegación

---

## FASE 4: Feature F-001 - AI Flashcard Generation
**Duración:** 7-10 días
**Objetivo:** Upload PDF → Extract text → Generate flashcards con AI

### 📐 Planear Feature

- [ ] **Backend Flow**
  ```
  1. Upload PDF (o paste text)
  2. Extract text con PyPDF2
  3. Save to study_materials (extracted_text, NO file)
  4. Call OpenAI API con extracted text
  5. Parse JSON response
  6. Save flashcards con status "draft"
  7. Return flashcards for preview
  ```

- [ ] **Frontend Flow**
  ```
  1. Upload screen (file picker o text input)
  2. Show progress indicator
  3. Preview generated cards (swipeable)
  4. Edit cards inline
  5. Save all → navigate to dashboard
  ```

- [ ] **OpenAI Prompt Design**
  - Diseñar prompt template
  - Few-shot examples
  - JSON output format
  - Error handling para respuestas malformadas

### 🔨 Ejecutar Feature

#### Backend: PDF Processing

- [ ] **Install Dependencies**
  ```bash
  pip install PyPDF2 openai python-multipart
  ```

- [ ] **Endpoint: Extract Text**
  ```python
  # routes/materials.py
  @router.post("/materials/extract")
  async def extract_text(
      file: UploadFile = File(None),
      text: str = Form(None),
      user_id: str = Depends(get_current_user)
  ):
      # Si es file, extract con PyPDF2
      # Si es text, usar directamente
      # Save to study_materials
      # Return material_id
  ```

- [ ] **PDF Text Extraction**
  ```python
  # services/pdf_service.py
  import PyPDF2

  def extract_text_from_pdf(file_bytes: bytes) -> str:
      # PyPDF2 logic
      # Return extracted text
  ```

#### Backend: OpenAI Integration

- [ ] **OpenAI Setup**
  ```bash
  pip install openai
  ```
  - API key en `.env`
  - Rate limiting (10 requests/hour per user)

- [ ] **Endpoint: Generate Flashcards**
  ```python
  @router.post("/flashcards/generate")
  async def generate_flashcards(
      material_id: str,
      card_count: int = 20,
      user_id: str = Depends(get_current_user)
  ):
      # Get material text from DB
      # Call OpenAI with prompt
      # Parse JSON response
      # Save flashcards with status "draft"
      # Return flashcards
  ```

- [ ] **OpenAI Service**
  ```python
  # services/openai_service.py
  from openai import OpenAI

  client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

  def generate_flashcards(text: str, count: int) -> list[dict]:
      prompt = f"""
      You are a flashcard generation expert. Generate {count} flashcards from this text.

      Text:
      {text}

      Return JSON array:
      [
        {{
          "question": "...",
          "answer": "...",
          "difficulty": 1-5,
          "tags": ["tag1", "tag2"]
        }}
      ]
      """

      response = client.chat.completions.create(
          model="gpt-4o-mini",
          messages=[{"role": "user", "content": prompt}],
          temperature=0.7,
          response_format={"type": "json_object"}
      )

      # Parse and return
  ```

- [ ] **Prompt Engineering**
  - Refinar prompt con ejemplos
  - Testear con diferentes textos
  - Objetivo: 85%+ accuracy

#### Frontend: Upload Interface

- [ ] **Upload Screen**
  ```typescript
  // app/(tabs)/upload.tsx
  - File picker (expo-document-picker)
  - O text input (paste)
  - Upload button
  - Progress indicator
  ```

- [ ] **Install Dependencies**
  ```bash
  npx expo install expo-document-picker
  ```

- [ ] **Upload Service**
  ```typescript
  // services/uploadService.ts
  export async function uploadMaterial(
    file: File | null,
    text: string | null
  ) {
    const formData = new FormData()
    if (file) formData.append('file', file)
    if (text) formData.append('text', text)

    const response = await api.post('/materials/extract', formData)
    return response.data
  }
  ```

#### Frontend: Card Preview & Edit

- [ ] **Preview Screen**
  ```typescript
  // app/preview.tsx
  - Swipeable card list
  - Edit button per card
  - Save all button
  - Regenerate button (optional)
  ```

- [ ] **Card Component**
  ```typescript
  // components/FlashcardPreview.tsx
  <Card>
    <Text>{question}</Text>
    <Text>{answer}</Text>
    <Button onPress={onEdit}>Edit</Button>
  </Card>
  ```

- [ ] **Edit Modal**
  ```typescript
  // components/EditCardModal.tsx
  - Input for question
  - Input for answer
  - Tags input (optional)
  - Save/Cancel buttons
  ```

### 🧪 Testear Feature

#### Backend Tests

- [ ] **Test PDF Extraction**
  ```python
  def test_extract_text_from_pdf():
      # Load sample PDF
      # Extract text
      # Assert text contains expected content
  ```

- [ ] **Test OpenAI Generation**
  ```python
  def test_generate_flashcards():
      # Mock OpenAI response
      # Call generate_flashcards
      # Assert correct format
  ```

- [ ] **Test Full Flow**
  ```python
  def test_full_generation_flow():
      # Upload PDF
      # Extract text
      # Generate cards
      # Assert cards saved to DB
  ```

#### Frontend Tests

- [ ] **Test Upload**
  - Upload file → verify API call
  - Paste text → verify API call

- [ ] **Test Preview**
  - Mock flashcards → render preview
  - Edit card → verify state update

#### Manual Testing

- [ ] Upload PDF real (ej: lecture notes)
- [ ] Verificar text extraction correcto
- [ ] Verificar flashcards generadas son buenas (>85% accuracy)
- [ ] Edit cards → save → verify saved to DB
- [ ] Test con diferentes tipos de PDFs

### ✅ Criterios de Completitud
- ✅ PDF upload funciona
- ✅ Text extraction funciona (>95% accuracy)
- ✅ OpenAI generation funciona (>85% quality)
- ✅ Preview + edit funciona
- ✅ Save to DB funciona
- ✅ Tests passing
- ✅ Error handling completo

**Entregable:** Feature completo de AI generation

---

## FASE 5: Feature F-002 - Spaced Repetition
**Duración:** 5-7 días
**Objetivo:** Algoritmo FSRS + Study mode + Review tracking

### 📐 Planear Feature

- [ ] **FSRS Algorithm**
  - Estudiar algoritmo: https://github.com/open-spaced-repetition/fsrs4anki
  - Definir parámetros iniciales
  - Calcular next review date based on rating

- [ ] **Study Flow**
  ```
  1. Get cards due today (sorted by priority)
  2. Show card (question side)
  3. User flips card (see answer)
  4. User rates: Again (1), Hard (2), Good (3), Easy (4)
  5. Update card stats (interval, ease, due_date)
  6. Next card (repeat)
  7. End of session → show summary
  ```

### 🔨 Ejecutar Feature

#### Backend: FSRS Algorithm

- [ ] **FSRS Implementation**
  ```python
  # services/fsrs_service.py
  from datetime import datetime, timedelta

  class FSRS:
      def __init__(self):
          self.w = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]

      def calculate_next_review(
          self,
          rating: int,  # 1-4
          current_ease: float,
          current_interval: int,
          review_count: int
      ) -> tuple[float, int, datetime]:
          # FSRS algorithm logic
          # Return (new_ease, new_interval, due_date)
  ```

- [ ] **Endpoint: Get Study Queue**
  ```python
  @router.get("/study/queue")
  async def get_study_queue(
      user_id: str = Depends(get_current_user),
      limit: int = 50
  ):
      # Get cards where due_date <= today
      # Order by: overdue DESC, interval ASC
      # Limit to N cards
      # Return cards
  ```

- [ ] **Endpoint: Submit Review**
  ```python
  @router.post("/study/review")
  async def submit_review(
      card_id: str,
      rating: int,  # 1-4
      time_spent: int,  # seconds
      user_id: str = Depends(get_current_user)
  ):
      # Get card stats
      # Calculate next review with FSRS
      # Update card_stats
      # Insert card_review record
      # Update user_stats
      # Return next card or session complete
  ```

#### Frontend: Study Mode

- [ ] **Study Screen**
  ```typescript
  // app/(tabs)/study.tsx
  - Load queue on mount
  - Show card count (X / Y)
  - Flashcard component
  - Rating buttons (4 colors)
  - Progress bar
  - Timer (optional)
  ```

- [ ] **Flashcard Component**
  ```typescript
  // components/Flashcard.tsx
  interface Props {
    question: string
    answer: string
    isFlipped: boolean
    onFlip: () => void
  }

  // Flip animation con react-native-animatable
  ```

- [ ] **Rating Buttons**
  ```typescript
  // components/RatingButtons.tsx
  <View>
    <Button color="red" onPress={() => onRate(1)}>Again</Button>
    <Button color="orange" onPress={() => onRate(2)}>Hard</Button>
    <Button color="green" onPress={() => onRate(3)}>Good</Button>
    <Button color="blue" onPress={() => onRate(4)}>Easy</Button>
  </View>
  ```

- [ ] **Swipe Gestures (Opcional)**
  ```typescript
  // Swipe left = Again
  // Swipe down = Hard
  // Swipe up = Good
  // Swipe right = Easy
  ```

#### State Management

- [ ] **Study Store**
  ```typescript
  // stores/studyStore.ts
  interface StudyStore {
    queue: Flashcard[]
    currentIndex: number
    isFlipped: boolean
    loadQueue: () => Promise<void>
    flipCard: () => void
    submitReview: (rating: number) => Promise<void>
    nextCard: () => void
  }
  ```

### 🧪 Testear Feature

#### Backend Tests

- [ ] **Test FSRS Algorithm**
  ```python
  def test_fsrs_rating_1():
      # Rating = 1 (Again)
      # Assert interval resets

  def test_fsrs_rating_4():
      # Rating = 4 (Easy)
      # Assert interval increases significantly
  ```

- [ ] **Test Study Queue**
  ```python
  def test_get_study_queue():
      # Create cards with different due dates
      # Call get_study_queue
      # Assert overdue cards appear first
  ```

- [ ] **Test Review Submission**
  ```python
  def test_submit_review():
      # Create card
      # Submit review with rating
      # Assert card_stats updated
      # Assert card_review created
  ```

#### Frontend Tests

- [ ] Test card flip animation
- [ ] Test rating submission
- [ ] Test queue navigation

#### Manual Testing

- [ ] Create 20 test flashcards
- [ ] Study all cards
- [ ] Verify next review dates calculated correctly
- [ ] Test again tomorrow → verify cards appear
- [ ] Test different ratings → verify intervals different

### ✅ Criterios de Completitud
- ✅ FSRS algorithm implementado correctamente
- ✅ Study queue funciona
- ✅ Card flip animation smooth
- ✅ Rating buttons funcionan
- ✅ Review tracking funciona
- ✅ Due dates calculados correctamente
- ✅ Tests passing

**Entregable:** Study mode completo con spaced repetition

---

## FASE 6: Feature F-003 - Dashboard & Gamification
**Duración:** 5-7 días
**Objetivo:** Stats, heatmap, progress tracking

### 📐 Planear Feature

- [ ] **Dashboard Components**
  - Top stats bar (streak, cards due, CTA)
  - GitHub-style heatmap (13 weeks × 7 days)
  - Progress by subject
  - Quick actions

- [ ] **Data to Calculate**
  - Current streak (consecutive days)
  - Longest streak
  - Cards studied today
  - Cards due today
  - Total cards mastered (interval > 30 days)
  - Heatmap data (last 90 days)

### 🔨 Ejecutar Feature

#### Backend: Stats Calculation

- [ ] **Endpoint: Dashboard Stats**
  ```python
  @router.get("/stats/dashboard")
  async def get_dashboard_stats(
      user_id: str = Depends(get_current_user)
  ):
      # Calculate all stats
      return {
          "current_streak": 12,
          "longest_streak": 25,
          "cards_due_today": 47,
          "cards_studied_today": 23,
          "total_cards_mastered": 234,
          "heatmap_data": [...],  # Last 90 days
          "progress_by_subject": [...]
      }
  ```

- [ ] **Streak Calculation**
  ```python
  def calculate_streak(user_id: str) -> tuple[int, int]:
      # Query study_sessions ordered by date DESC
      # Count consecutive days
      # Return (current_streak, longest_streak)
  ```

- [ ] **Heatmap Data**
  ```python
  def get_heatmap_data(user_id: str) -> list[dict]:
      # Query last 90 days of study_sessions
      # Return [{"date": "2025-11-20", "count": 35}, ...]
  ```

- [ ] **Progress by Subject**
  ```python
  def get_progress_by_subject(user_id: str) -> list[dict]:
      # Query flashcards grouped by subject
      # Calculate mastery % per subject
      # Return [{"subject": "Biology", "mastered": 67, "total": 100}, ...]
  ```

#### Frontend: Dashboard Screen

- [ ] **Top Stats Bar**
  ```typescript
  // components/StatsBar.tsx
  <View>
    <StatItem icon="🔥" value={streak} label="Day Streak" />
    <StatItem icon="📚" value={cardsDue} label="Due Today" />
    <Button>Study Now</Button>
  </View>
  ```

- [ ] **Heatmap Component**
  ```typescript
  // components/Heatmap.tsx
  // Render 13 weeks × 7 days grid
  // Color intensity based on count
  // Tooltip on hover/press
  ```

- [ ] **Install Heatmap Library (Opcional)**
  ```bash
  npm install react-native-calendar-heatmap
  ```

- [ ] **Progress by Subject**
  ```typescript
  // components/SubjectProgress.tsx
  subjects.map(subject => (
    <View>
      <Text>{subject.name}</Text>
      <ProgressBar value={subject.mastered / subject.total} />
      <Text>{subject.mastered} / {subject.total}</Text>
    </View>
  ))
  ```

- [ ] **Dashboard Screen**
  ```typescript
  // app/(tabs)/index.tsx
  export default function Dashboard() {
    const { stats, loadStats } = useDashboardStore()

    useEffect(() => {
      loadStats()
    }, [])

    return (
      <ScrollView>
        <StatsBar {...stats} />
        <Heatmap data={stats.heatmapData} />
        <SubjectProgress subjects={stats.progressBySubject} />
      </ScrollView>
    )
  }
  ```

### 🧪 Testear Feature

#### Backend Tests

- [ ] **Test Streak Calculation**
  ```python
  def test_calculate_streak():
      # Create study sessions for consecutive days
      # Calculate streak
      # Assert correct value
  ```

- [ ] **Test Heatmap Data**
  ```python
  def test_get_heatmap_data():
      # Create study sessions
      # Get heatmap data
      # Assert correct format
  ```

#### Frontend Tests

- [ ] Test stats bar renders correctly
- [ ] Test heatmap renders with data
- [ ] Test progress bars calculate correctly

#### Manual Testing

- [ ] Study for 3 consecutive days
- [ ] Verify streak increments
- [ ] Verify heatmap shows correct colors
- [ ] Verify progress by subject accurate

### ✅ Criterios de Completitud
- ✅ Dashboard muestra stats correctas
- ✅ Heatmap funciona (13 weeks visible)
- ✅ Streak tracking funciona
- ✅ Progress by subject funciona
- ✅ Stats actualizan en real-time
- ✅ Tests passing

**Entregable:** Dashboard completo con gamification

---

## FASE 7: Feature F-005 - Pomodoro Timer (OPCIONAL)
**Duración:** 3-5 días
**Objetivo:** Timer + session tracking

### 📐 Planear Feature

- [ ] **Timer Logic**
  - 25 min study (default, configurable)
  - 5 min break
  - Notification al finalizar
  - Session tracking

### 🔨 Ejecutar Feature

- [ ] **Timer Component**
  ```typescript
  // components/PomodoroTimer.tsx
  - Countdown timer
  - Start/Pause/Reset buttons
  - Sound/vibration on complete
  ```

- [ ] **Session Tracking**
  - POST `/sessions/start`
  - POST `/sessions/complete`
  - Link to study_sessions table

### 🧪 Testear Feature

- [ ] Test timer counts down correctly
- [ ] Test notification fires
- [ ] Test session saved to DB

### ✅ Criterios de Completitud
- ✅ Timer funciona
- ✅ Notifications funcionan
- ✅ Sessions tracked

**Entregable:** Pomodoro timer funcional (si decides implementarlo)

---

## FASE 8: Testing, Bug Fixes & Optimization
**Duración:** 5-7 días
**Objetivo:** Estabilizar la app, fix bugs, optimizar performance

### 🧪 Testing Comprehensivo

#### Backend

- [ ] **Unit Tests Completos**
  - Models
  - Services
  - Routes
  - Coverage >80%

- [ ] **Integration Tests**
  - Full user flows
  - Auth → Upload → Generate → Study
  - Multiple users (no data leaking)

- [ ] **Load Testing (Opcional)**
  - Simular 100 users concurrentes
  - Verificar performance
  - Identificar bottlenecks

#### Frontend

- [ ] **Component Tests**
  - Todos los components principales
  - Button, Input, Card, Flashcard

- [ ] **Integration Tests**
  - Auth flow
  - Upload flow
  - Study flow

- [ ] **E2E Tests (Opcional)**
  - Detox para React Native
  - Test full app flow

#### Manual Testing

- [ ] **iOS Testing**
  - Test en emulador
  - Test en device real (si tienes)
  - Diferentes screen sizes

- [ ] **Android Testing**
  - Test en emulador
  - Test en device real
  - Diferentes screen sizes

- [ ] **Edge Cases**
  - Upload PDF corrupto
  - OpenAI API falla
  - No internet connection
  - DB connection lost

### 🐛 Bug Fixes

- [ ] **Crear Issues en GitHub**
  - Documentar cada bug encontrado
  - Priority: P0 (blocker), P1 (high), P2 (low)

- [ ] **Fix P0 Bugs**
  - Crashes
  - Data loss
  - Auth failures

- [ ] **Fix P1 Bugs**
  - UI glitches
  - Performance issues
  - Confusing UX

### ⚡ Performance Optimization

- [ ] **Backend**
  - Add database indexes
  - Cache dashboard stats (1 hour)
  - Optimize SQL queries
  - Rate limiting

- [ ] **Frontend**
  - Lazy load screens
  - Image optimization
  - Reduce bundle size
  - Memoize expensive components

- [ ] **API**
  - Pagination para lists
  - Compression (gzip)
  - Response time < 500ms (P95)

### 🔒 Security Audit

- [ ] **Backend Security**
  - SQL injection protected (use ORM)
  - XSS protected
  - CSRF tokens (si aplica)
  - Rate limiting
  - Input validation

- [ ] **Auth Security**
  - JWT expiration (7 days)
  - Refresh tokens
  - Logout invalidates tokens
  - Password hashing (bcrypt)

- [ ] **Data Privacy**
  - RLS working
  - No PDFs stored
  - User data isolated

### 📝 Code Quality

- [ ] **Linting**
  - Backend: `pylint`, `black`
  - Frontend: `eslint`, `prettier`
  - Fix all warnings

- [ ] **Type Safety**
  - TypeScript strict mode
  - Pydantic schemas
  - No `any` types

- [ ] **Code Review**
  - Self-review de todo el código
  - Refactor duplicated logic
  - Add comments donde necesario

### ✅ Criterios de Completitud
- ✅ All tests passing (>80% coverage)
- ✅ No P0 or P1 bugs
- ✅ Performance targets met (<2s load, <500ms API)
- ✅ Security audit passed
- ✅ Code quality high

**Entregable:** App estable y optimizada

---

## FASE 9: Build & Deploy
**Duración:** 3-5 días
**Objetivo:** Production builds y deploy

### 📐 Planear Deploy

- [ ] **Backend Deploy Options**
  - Railway.app (recomendado, $5/mes)
  - Render.com
  - Fly.io
  - AWS/GCP (más complejo)

- [ ] **Database Deploy**
  - Supabase (ya está en cloud)
  - O PostgreSQL managed (Railway, Render)

- [ ] **Mobile Build Options**
  - Expo Application Services (EAS)
  - Local builds (si tienes Mac para iOS)

### 🔨 Ejecutar Deploy

#### Backend Deploy

- [ ] **Preparar para Producción**
  - Environment variables en prod
  - Logging configurado (sentry, rollbar)
  - CORS whitelist (solo tu app)
  - HTTPS enabled

- [ ] **Deploy a Railway**
  ```bash
  # Install Railway CLI
  npm install -g @railway/cli

  # Login
  railway login

  # Initialize
  railway init

  # Deploy
  railway up
  ```

- [ ] **Database Migration**
  ```bash
  # Run migrations en prod
  alembic upgrade head
  ```

- [ ] **Verificar Deploy**
  - Health check funciona
  - API docs accesibles
  - Database conecta

#### Frontend Build

- [ ] **Configurar EAS**
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```

- [ ] **Create Production Build**
  ```bash
  # iOS
  eas build --platform ios --profile production

  # Android
  eas build --platform android --profile production
  ```

- [ ] **Update Config**
  ```json
  // app.json
  {
    "expo": {
      "name": "StudyMaster",
      "slug": "studymaster",
      "version": "1.0.0",
      "ios": {
        "bundleIdentifier": "com.studymaster.app"
      },
      "android": {
        "package": "com.studymaster.app"
      },
      "extra": {
        "eas": {
          "projectId": "your-project-id"
        }
      }
    }
  }
  ```

#### Testing Production

- [ ] **Test Backend en Prod**
  - Todos los endpoints funcionan
  - HTTPS funciona
  - Rate limiting funciona

- [ ] **Test App Build**
  - Install en device
  - Test todos los flows
  - Verify API calls van a prod backend

### 📱 Distribution (Opcional para MVP)

#### TestFlight (iOS)

- [ ] **Apple Developer Account** ($99/año)
- [ ] **Submit to TestFlight**
  ```bash
  eas submit --platform ios
  ```
- [ ] **Invite Beta Testers**

#### Google Play Internal Testing (Android)

- [ ] **Google Play Console** ($25 one-time)
- [ ] **Submit to Internal Testing**
  ```bash
  eas submit --platform android
  ```
- [ ] **Invite Beta Testers**

### 📊 Monitoring & Analytics

- [ ] **Backend Monitoring**
  - Sentry for errors
  - Railway logs
  - Uptime monitoring (UptimeRobot)

- [ ] **App Analytics (Opcional)**
  - Plausible
  - Mixpanel
  - Posthog

### 📝 Documentation

- [ ] **README.md**
  - Como correr locally
  - Environment variables
  - Deploy instructions

- [ ] **API Documentation**
  - FastAPI auto-docs deployed
  - O Postman collection

- [ ] **Architecture Docs**
  - Update `/docs/architecture.md`
  - Deployment diagram

### ✅ Criterios de Completitud
- ✅ Backend deployed y funcionando
- ✅ Database en prod funcionando
- ✅ Mobile builds creados (iOS + Android)
- ✅ Production testing completo
- ✅ Monitoring configurado
- ✅ Documentation actualizada

**Entregable:** App deployada y accesible

---

## 📊 Definition of Done (Global)

Para considerar el proyecto COMPLETO:

### Funcional
- ✅ Auth funciona (signup, login, logout)
- ✅ Upload & AI generation funciona
- ✅ Spaced repetition funciona
- ✅ Dashboard con stats funciona
- ✅ Todas las features P0 implementadas

### Calidad
- ✅ Tests passing (>80% coverage)
- ✅ No bugs P0 o P1
- ✅ Performance targets met
- ✅ Security audit passed
- ✅ Accessibility básica (WCAG 2.1 AA)

### Deploy
- ✅ Backend deployed
- ✅ Database deployed
- ✅ Mobile builds creados
- ✅ Production testing completo

### Documentation
- ✅ README completo
- ✅ API docs
- ✅ Architecture docs

---

## 🎯 Prioridades Claras

**Must Have (P0):**
- Auth
- AI Generation
- Spaced Repetition
- Dashboard

**Should Have (P1):**
- Pomodoro Timer
- Advanced Analytics
- Flashcard Editor

**Nice to Have (P2):**
- Export to Anki
- Offline mode
- Collaborative features

---

## 📅 Workflow Diario Recomendado

```
Morning:
1. Review plan del día
2. Pull latest code
3. Run tests
4. Start coding

Afternoon:
5. Continue implementation
6. Write tests
7. Fix bugs

Evening:
8. Code review (self)
9. Commit changes
10. Update roadmap checkboxes
11. Plan tomorrow
```

---

## 🚀 Tracking Progress

Usa este roadmap como checklist. Cada día:

1. ✅ Check off completed tasks
2. 🔄 Update "In Progress" items
3. 📝 Document blockers
4. 🎯 Plan next day

---

**Última actualización:** 2025-11-20
**Próxima revisión:** Después de cada fase
**Owner:** Development Team
