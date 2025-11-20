# StudyMaster - Roadmap de Ejecución

**Versión:** 2.0 - Universal Edition
**Timeline Total:** 12-14 semanas hasta lanzamiento público
**Última actualización:** 2025-11-20

---

## 📊 Vista General de Fases

```
Fase 0: Validación Pre-MVP (Semana 1-2)
Fase 1: Fundación Técnica (Semana 2-4)
Fase 2: Core Features (Semana 5-9)
Fase 3: Polish & Testing (Semana 10-12)
Fase 4: Launch & Iteración (Semana 13-14)
```

---

## FASE 0: Validación Pre-MVP
**Duración:** 1-2 semanas
**Objetivo:** Validar demanda antes de construir

### ✅ Tareas

- [ ] **Landing Page**
  - Crear página en Framer/Carrd (4 horas)
  - Headline: "AI-Powered Flashcards for Smarter Studying"
  - CTA: Email signup para waitlist
  - Sección de features (AI generation, spaced repetition, dashboard)

- [ ] **Validación de Mercado**
  - 10 entrevistas con estudiantes universitarios (diferentes carreras)
  - Identificar pain points principales con estudio actual
  - Validar willingness to pay ($9.99/mes)
  - Objetivo: 100+ signups en waitlist

- [ ] **Análisis Competencia**
  - Probar Quizlet, Anki, RemNote (30 min cada uno)
  - Documentar qué funciona bien y qué no
  - Identificar gaps de UX

### 🎯 Criterios de Éxito
- ✅ 100+ emails en waitlist
- ✅ 5+ estudiantes comprometidos para beta
- ✅ Pain points claros identificados

---

## FASE 1: Fundación Técnica
**Duración:** Semana 2-4 (2-3 semanas)
**Objetivo:** Setup completo del proyecto y arquitectura base

### Sprint 1: React Native Foundation (Semana 2-3)

- [ ] **Proyecto Setup**
  - Inicializar proyecto Expo + React Native
  - Configurar NativeWind (Tailwind para RN)
  - Setup Expo Router (navegación)
  - Configurar ESLint + Prettier
  - Git repo con .gitignore apropiado

- [ ] **Entorno de Desarrollo**
  - Expo Go instalado en celular
  - Emulador iOS (si tienes Mac)
  - Emulador Android (Android Studio)
  - Variables de entorno (.env.local)

- [ ] **Design System Básico**
  - Colores (primary, success, warning, error, neutrals)
  - Tipografía (headlines, body, mono)
  - Componentes base (Button, Input, Card)
  - Layout base (SafeArea, Container)

**Entregable:** App "Hello World" corriendo en iOS + Android

---

### Sprint 2: Backend + Auth (Semana 3-4)

- [ ] **PostgreSQL Local**
  - Docker Compose con PostgreSQL 16
  - pgAdmin para gestión de DB
  - Schema inicial (users, study_materials, flashcards)

- [ ] **Supabase Setup**
  - Crear proyecto en Supabase
  - Configurar Auth (email + Google OAuth)
  - Row Level Security policies
  - Conectar desde React Native

- [ ] **FastAPI Backend**
  - Proyecto FastAPI inicial
  - Rutas de health check
  - Conexión a PostgreSQL
  - CORS configurado para mobile

- [ ] **Auth Flow en App**
  - Pantallas: Login, Signup, Forgot Password
  - Integración con Supabase Auth
  - Protected routes
  - Session persistence (AsyncStorage)
  - Onboarding básico (nombre + subject)

**Entregable:** Login/Signup funcional, sesión persistente

---

## FASE 2: Core Features
**Duración:** Semana 5-9 (5 semanas)
**Objetivo:** Implementar las 4 features P0 (must-have)

### Sprint 3: AI Flashcard Generation (Semana 5-7)

#### Week 5: PDF Processing + Text Extraction

- [ ] **Upload Interface**
  - Pantalla de upload (drag-drop web, file picker mobile)
  - Input de texto manual (paste)
  - Validación de archivos (PDF < 10MB)
  - Progress indicator durante upload

- [ ] **Backend: Text Extraction**
  - Endpoint: `POST /api/materials/extract`
  - PyPDF2 para extraer texto de PDFs
  - Fallback con pdf.js si falla
  - Guardar extracted_text en DB (NO el PDF)
  - Detección automática de subject_category

- [ ] **Database**
  ```sql
  CREATE TABLE study_materials (
    id UUID PRIMARY KEY,
    user_id UUID,
    filename TEXT,
    extracted_text TEXT,
    word_count INTEGER,
    subject_category TEXT,
    processed_at TIMESTAMP
  );
  ```

**Checkpoint:** Usuario puede subir PDF → sistema extrae texto → guarda en DB

---

#### Week 6-7: OpenAI Integration + Flashcard Generation

- [ ] **OpenAI Setup**
  - API key en variables de entorno
  - Rate limiting (10 generaciones/hora por user)
  - Error handling (timeouts, rate limits)

- [ ] **Prompt Engineering**
  - Prompt template para generar flashcards
  - Input: texto extraído + subject
  - Output: JSON con array de flashcards
  - Cada card: `{question, answer, difficulty, tags[]}`
  - Objetivo: 85%+ accuracy

- [ ] **Backend Endpoint**
  - `POST /api/flashcards/generate`
  - Recibe material_id
  - Llama a OpenAI API (GPT-4o-mini)
  - Parsea respuesta JSON
  - Guarda flashcards con status "draft"
  - Retorna para preview

- [ ] **Review UI**
  - Pantalla de preview de flashcards generadas
  - Swipe para ver todas las cards
  - Botón "Edit" en cada card
  - Modal de edición (inline)
  - Botones: "Save All", "Regenerate", "Discard"

- [ ] **Database**
  ```sql
  CREATE TABLE flashcards (
    id UUID PRIMARY KEY,
    user_id UUID,
    material_id UUID,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[],
    difficulty INTEGER,
    ai_confidence FLOAT,
    is_edited BOOLEAN DEFAULT FALSE
  );
  ```

**Feature Completa:** F-001 ✅

---

### Sprint 4: Spaced Repetition (Semana 8)

- [ ] **Algoritmo FSRS**
  - Implementar FSRS (Free Spaced Repetition Scheduler)
  - Referencia: https://github.com/open-spaced-repetition/fsrs4anki
  - Parámetros iniciales: ease=2.5, intervals=[1min, 10min, 1d, 3d]
  - Función: `calculateNextReview(cardId, rating)`

- [ ] **Study UI**
  - Pantalla de estudio con card flip
  - Animación smooth (400ms)
  - Botones de rating: Again, Hard, Good, Easy
  - Keyboard shortcuts (1,2,3,4)
  - Swipe gestures en mobile
  - Progress bar (cards completadas / total)

- [ ] **Backend**
  - Endpoint: `GET /api/study/queue?user_id=X`
  - Retorna cards due today ordenadas por prioridad
  - Endpoint: `POST /api/study/review`
  - Input: `{card_id, rating, time_spent}`
  - Actualiza interval, ease_factor, due_date

- [ ] **Database**
  ```sql
  CREATE TABLE card_reviews (
    id UUID PRIMARY KEY,
    card_id UUID,
    user_id UUID,
    rating INTEGER, -- 1=Again, 2=Hard, 3=Good, 4=Easy
    interval_days INTEGER,
    ease_factor FLOAT,
    due_date DATE,
    reviewed_at TIMESTAMP
  );

  CREATE TABLE card_stats (
    card_id UUID PRIMARY KEY,
    user_id UUID,
    total_reviews INTEGER DEFAULT 0,
    successful_reviews INTEGER DEFAULT 0,
    current_interval_days INTEGER,
    ease_factor FLOAT DEFAULT 2.5,
    due_date DATE
  );
  ```

**Feature Completa:** F-002 ✅

---

### Sprint 5: Dashboard + Gamification (Semana 9)

- [ ] **Heatmap Component**
  - Librería: react-native-calendar-heatmap (o custom)
  - 13 semanas × 7 días
  - Color intensity por cards estudiadas (0, 1-10, 11-30, 31-50, 50+)
  - Tooltip con fecha + count

- [ ] **Stats Calculation**
  - Backend: aggregaciones SQL
  - Cards estudiadas hoy
  - Streak actual (días consecutivos)
  - Total cards mastered (interval > 30 días)
  - Average daily cards (30-day avg)
  - Total study time esta semana

- [ ] **Dashboard UI**
  - Top stats bar (streak, cards due, CTA)
  - Heatmap section
  - Progress por subject (lista con progress bars)
  - Quick actions (Upload, Study Now, Settings)

- [ ] **Database**
  ```sql
  CREATE TABLE study_sessions (
    id UUID PRIMARY KEY,
    user_id UUID,
    date DATE,
    cards_studied INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    streak_day INTEGER
  );

  CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_cards_studied INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    last_study_date DATE
  );
  ```

**Feature Completa:** F-003 ✅

---

## FASE 3: Polish & Testing
**Duración:** Semana 10-12 (3 semanas)
**Objetivo:** Bug fixes, optimización, beta testing

### Sprint 6: Pomodoro Timer (Semana 10)

- [ ] **Timer UI**
  - Botón "Start Study Session"
  - Timer countdown (25 min default, configurable)
  - Pause/Resume buttons
  - Break timer (5 min)
  - Notificación al finalizar

- [ ] **Backend**
  - `POST /api/sessions/start`
  - `POST /api/sessions/complete`
  - Registra tiempo estudiado
  - Suma al heatmap del día

- [ ] **Integration**
  - Timer visible durante study mode
  - Cards estudiadas durante sesión se vinculan
  - Stats actualizados en real-time

**Feature Completa:** F-005 ✅

---

### Sprint 7: Payments + Premium (Semana 10-11)

- [ ] **Stripe Setup**
  - Crear cuenta Stripe
  - Configurar productos: Premium ($9.99/mes)
  - Webhook para subscription events

- [ ] **Paywall Screens**
  - Pricing page (Free vs Premium comparison)
  - Checkout flow con Stripe Elements
  - Success screen
  - Manage subscription screen

- [ ] **Backend**
  - `POST /api/payments/create-checkout`
  - Webhook handler: `/api/webhooks/stripe`
  - Actualizar user.plan en DB

- [ ] **Feature Gating**
  - Free tier: 150 cards, 50 AI generations/mes
  - Premium: Ilimitado

---

### Sprint 8: Beta Testing (Semana 11-12)

- [ ] **Expo Development Build**
  - `eas build --platform all`
  - Distribuir vía TestFlight (iOS)
  - Distribuir vía Google Play Internal (Android)

- [ ] **Beta Recruitment**
  - Invitar 20-50 estudiantes de waitlist
  - 1-on-1 onboarding calls (15 min)
  - Crear Discord/Slack para feedback

- [ ] **Testing & Iteration**
  - Bugfixes basados en feedback
  - Prompt engineering refinement (si AI quality < 8/10)
  - Performance optimization
  - UI polish

- [ ] **Analytics Setup**
  - Plausible o Mixpanel
  - Track: signups, activations, study sessions, conversions
  - Error monitoring: Sentry

**Criterios de Éxito Beta:**
- ✅ 40%+ activation (upload + generate + study 10 cards)
- ✅ 8/10 quality rating de flashcards
- ✅ <1% error rate

---

## FASE 4: Launch & Iteración
**Duración:** Semana 13-14
**Objetivo:** Lanzamiento público

### Sprint 9: Pre-Launch (Semana 13)

- [ ] **App Store Assets**
  - Screenshots (6-8 por plataforma)
  - App icon final (1024×1024)
  - Descripción optimizada
  - Keywords research
  - Video preview (opcional)

- [ ] **Final QA**
  - Testing completo de todos los flows
  - Accessibility audit (WCAG 2.1 AA)
  - Performance testing (load times < 2s)
  - Security audit básico

- [ ] **Submission**
  - Submit to App Store (Apple)
  - Submit to Google Play
  - Esperar review (2-7 días Apple, 1-3 días Google)

---

### Sprint 10: Public Launch (Semana 14)

- [ ] **Launch Channels**
  - Product Hunt post (martes o miércoles)
  - Reddit posts (r/productivity, r/college, r/StudyTips)
  - Twitter/X announcement
  - Email a waitlist

- [ ] **Content Marketing**
  - Blog post: "How I Built StudyMaster in 12 Weeks"
  - Tutorial video (YouTube)
  - SEO-optimized landing page

- [ ] **Monitoring**
  - Dashboard con métricas clave (signups, activations, errors)
  - Alertas para errores críticos
  - Customer support ready (email o chat)

**Success Metrics Semana 1:**
- 🎯 200+ signups
- 🎯 40%+ activation rate
- 🎯 5+ conversiones a premium
- 🎯 <1% error rate
- 🎯 <2s load time P95

---

## 🎯 Milestones Críticos

| # | Milestone | Fecha Target | Criterio de Éxito |
|---|-----------|--------------|-------------------|
| M0 | Plan aprobado | ✅ Completado | Plan.md finalizado |
| M1 | Validación pre-MVP | Semana 2 | 100+ waitlist emails |
| M2 | React Native setup | Semana 3 | App corriendo en iOS + Android |
| M3 | Auth funcional | Semana 4 | Login/signup working |
| M4 | AI generation MVP | Semana 7 | Upload → generate → save |
| M5 | Spaced repetition | Semana 8 | Study mode funcional |
| M6 | Dashboard completo | Semana 9 | Heatmap + stats |
| M7 | Beta testing | Semana 12 | 20+ beta users activos |
| M8 | App store approval | Semana 13 | Apps aprobadas |
| M9 | Public launch | Semana 14 | 200+ signups semana 1 |

---

## 📋 Features por Prioridad

### 🔴 P0 - Must Have (MVP)
- [x] F-001: AI Flashcard Generation
- [x] F-002: FSRS Spaced Repetition
- [x] F-003: Dashboard + Heatmap
- [x] F-004: Authentication
- [x] F-006: PDF/Text Processing

### 🟡 P1 - Should Have (V1.1)
- [ ] F-005: Pomodoro Timer
- [ ] F-008: Flashcard Editor (advanced)
- [ ] F-009: Study Analytics

### 🟢 P2 - Nice to Have (V2.0)
- [ ] F-010: Export to Anki
- [ ] Collaborative study groups
- [ ] OCR for images
- [ ] LMS integrations

---

## 🚨 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| AI quality < 85% | Media | Alto | 1 semana de prompt engineering, beta testing |
| OpenAI costs > budget | Baja | Medio | Rate limiting, caching, GPT-4o-mini |
| Slow user acquisition | Media | Alto | Paid ads ($500), Reddit outreach, referrals |
| FSRS implementation bugs | Baja | Medio | Usar librería de referencia, extensive testing |

---

## 📊 KPIs a Trackear

### Acquisition
- Signups totales
- Source de signup (Product Hunt, Reddit, organic, etc)
- CAC (cost per acquisition)

### Activation
- % que completan onboarding
- % que generan primera flashcard
- % que estudian 10+ cards (Aha moment)

### Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average study sessions per week
- Cards studied per session

### Retention
- D1, D7, D30 retention
- Current streak distribution
- Churn rate

### Monetization
- Free to paid conversion rate
- MRR (Monthly Recurring Revenue)
- LTV (Lifetime Value)
- Churn rate premium users

---

## ✅ Definition of Done (Por Feature)

**Para considerar una feature "completada":**

- [ ] Código escrito y reviewed
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] UI responsive (mobile + tablet)
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Error handling completo
- [ ] Loading states implementados
- [ ] Performance acceptable (<2s load, <500ms API)
- [ ] Documentación técnica
- [ ] User testing con 5+ usuarios

---

## 🔄 Post-Launch (V1.1 - V2.0)

### V1.1 (2-4 semanas post-launch)
- Import desde Anki/Quizlet
- Analytics avanzados (predicción de readiness para exámenes)
- Dark mode
- Offline support mejorado

### V2.0 (3-6 meses)
- OCR para PDFs con imágenes (Mathpix API)
- Collaborative study groups
- Subject-specific fine-tuned models
- B2B features (institutional licenses)
- LMS integrations (Canvas, Blackboard)

---

## 📌 Notas Importantes

1. **No guardar PDFs:** Solo texto extraído va a DB. Procesamiento en memoria.
2. **Mobile-first:** 60% de usuarios estudian en celular.
3. **Fast iteration:** Beta testing crucial para AI quality.
4. **Analytics desde día 1:** Decisiones data-driven.
5. **Community:** Discord/Slack para early users = feedback loop.

---

**Última actualización:** 2025-11-20
**Próxima revisión:** Después de cada sprint
**Owner:** Product Team
