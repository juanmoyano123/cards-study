# 🚀 FEATURES OVERVIEW - StudyMaster Medical

**Última actualización:** 11 de Noviembre, 2025
**Timeline MVP:** 12-14 semanas (Native Mobile App)
**Platform:** React Native + Expo (iOS + Android)
**Features totales:** 10 (6 P0, 3 P1, 1 P2)

---

## 📊 TABLA COMPLETA DE FEATURES (RICE PRIORITIZATION)

| ID | Feature | Priority | RICE | Reach | Impact | Confidence | Effort | Sprint | Status |
|:---|:--------|:--------:|:----:|:-----:|:------:|:----------:|:------:|:------:|:------:|
| **F-001** | **AI Medical Flashcard Generation** | 🔴 P0 | **300** | 100% | 3 | 100% | 5d | S3 | ⚪ Pending |
| **F-002** | **FSRS Spaced Repetition System** | 🔴 P0 | **240** | 100% | 3 | 80% | 4d | S4 | ⚪ Pending |
| **F-003** | **Study Dashboard with Heatmap** | 🔴 P0 | **180** | 100% | 2 | 90% | 3d | S5 | ⚪ Pending |
| **F-004** | **Authentication & User Management** | 🔴 P0 | **150** | 100% | 2 | 100% | 2d | S2 | ⚪ Pending |
| **F-006** | **PDF Text Extraction** | 🔴 P0 | **133** | 100% | 2 | 100% | 1.5d | S3 | ⚪ Pending |
| **F-005** | **Pomodoro Timer Integration** | 🟡 P1 | **120** | 80% | 2 | 80% | 2d | S5 | ⚪ Pending |
| **F-007** | **Native Mobile UI Components** | 🔴 P0 | **120** | 100% | 2 | 100% | 4d | S4 | ⚪ Pending |
| **F-008** | **Flashcard Editor** | 🟡 P1 | **90** | 90% | 1 | 100% | 2d | S3 | ⚪ Pending |
| **F-009** | **Study Analytics** | 🟡 P1 | **72** | 60% | 2 | 80% | 3d | V1.1 | 🔵 Future |
| **F-010** | **Export to Anki** | 🟢 P2 | **40** | 30% | 2 | 70% | 4d | V1.1 | 🔵 Future |

**Leyenda:**
- **Reach:** % de usuarios que usarán esta feature
- **Impact:** 3=Massive, 2=High, 1=Medium, 0.5=Low
- **Confidence:** % de certeza en las estimaciones
- **Effort:** Días de desarrollo estimados

---

## 🎯 FEATURES POR PRIORIDAD

### 🔴 P0 - MUST HAVE (MVP Crítico)
*Sin estas features, el MVP no funciona*

| ID | Feature | User Value | RICE | Effort | Sprint |
|:---|:--------|:-----------|:----:|:------:|:------:|
| F-001 | AI Medical Flashcard Generation | Ahorra 90 min por sesión | 300 | 5d | S3 |
| F-002 | FSRS Spaced Repetition System | Retención 2x mejor | 240 | 4d | S4 |
| F-003 | Study Dashboard with Heatmap | Motivación + consistencia | 180 | 3d | S5 |
| F-004 | Authentication & User Management | Acceso seguro + datos | 150 | 2d | S2 |
| F-006 | PDF Text Extraction | Soporte para PDFs | 133 | 1.5d | S3 |
| F-007 | Native Mobile UI Components | Experiencia nativa iOS/Android | 120 | 4d | S4 |

**Total P0:** 6 features | 21.5 días de desarrollo

---

### 🟡 P1 - SHOULD HAVE (Mejoran experiencia)
*Importantes pero podemos lanzar sin ellas*

| ID | Feature | User Value | RICE | Effort | Sprint |
|:---|:--------|:-----------|:----:|:------:|:------:|
| F-005 | Pomodoro Timer Integration | Sesiones estructuradas | 120 | 2d | S5 |
| F-008 | Flashcard Editor | Corregir errores de IA | 90 | 2d | S3 |
| F-009 | Study Analytics | Insights de aprendizaje | 72 | 3d | V1.1 |

**Total P1:** 3 features | 7 días de desarrollo

---

### 🟢 P2 - NICE TO HAVE (Post-Launch)
*Mejoras futuras, no críticas para validación*

| ID | Feature | User Value | RICE | Effort | Sprint |
|:---|:--------|:-----------|:----:|:------:|:------:|
| F-010 | Export to Anki | Migración de usuarios Anki | 40 | 4d | V1.1 |

**Total P2:** 1 feature | 4 días de desarrollo

---

## 📅 FEATURES POR SPRINT

### Sprint 1 (Semana 1): Market Validation
- Landing page creation (web)
- Reddit/Discord outreach
- User interviews (10 medical students)
- **Goal:** 200 waitlist signups

**Features:** Ninguna (pre-desarrollo)

---

### Sprint 2 (Semana 2-3): React Native Foundation
**Duration:** 2 semanas
**Focus:** Expo + React Native setup

**Deliverables:**
- ✅ Expo + React Native proyecto configurado
- ✅ NativeWind styling configurado
- ✅ Expo Router navigation
- ✅ Expo Go testing setup
- ✅ Hello World app running on iOS + Android

---

### Sprint 3 (Semana 3-4): Authentication & Backend
**Duration:** 1 semana
**Focus:** Auth + PostgreSQL setup

| ID | Feature | Effort | Dependencies |
|:---|:--------|:------:|:------------:|
| F-004 | Authentication & User Management | 2d | - |

**Deliverables:**
- ✅ Supabase Auth integration (email + Google OAuth)
- ✅ PostgreSQL Docker local
- ✅ FastAPI backend skeleton
- ✅ Protected routes y session management

---

### Sprint 4 (Semana 4-5): Native UI Components
**Duration:** 1 semana
**Focus:** Design system + component library

| ID | Feature | Effort | Dependencies |
|:---|:--------|:------:|:------------:|
| F-007 | Native Mobile UI Components | 4d | F-004 |

**Deliverables:**
- ✅ Design system con NativeWind
- ✅ Reusable components (buttons, cards, inputs)
- ✅ Navigation structure (tabs + stack)
- ✅ Loading states and error handling

---

### Sprint 5 (Semana 6-7): Core Value - AI Flashcards
**Duration:** 2 semanas
**Focus:** Generación de flashcards con IA

| ID | Feature | Effort | Dependencies |
|:---|:--------|:------:|:------------:|
| F-006 | PDF Text Extraction | 1.5d | F-004 |
| F-001 | AI Medical Flashcard Generation | 5d | F-006 |
| F-008 | Flashcard Editor | 2d | F-001 |

**Deliverables:**
- ✅ PDF upload (native file picker)
- ✅ OpenAI genera flashcards médicas
- ✅ Usuario puede revisar y editar
- ✅ Calidad de IA >85% accuracy

---

### Sprint 6 (Semana 8-9): Spaced Repetition
**Duration:** 2 semanas
**Focus:** Algoritmo de estudio óptimo

| ID | Feature | Effort | Dependencies |
|:---|:--------|:------:|:------------:|
| F-002 | FSRS Spaced Repetition System | 4d | F-001 |

**Deliverables:**
- ✅ FSRS algorithm implementado
- ✅ Study UI con swipe gestures
- ✅ Rating system (Again/Hard/Good/Easy)
- ✅ AsyncStorage para offline persistence

---

### Sprint 7 (Semana 9-10): Dashboard & Gamification
**Duration:** 2 semanas
**Focus:** Motivación + visualización

| ID | Feature | Effort | Dependencies |
|:---|:--------|:------:|:------------:|
| F-003 | Study Dashboard with Heatmap | 3d | F-002 |
| F-005 | Pomodoro Timer Integration | 2d | F-002 |

**Deliverables:**
- ✅ Heatmap calendar (React Native)
- ✅ Stats de progreso
- ✅ Pomodoro timer con notificaciones locales
- ✅ Subject progress bars

---

### Sprint 8 (Semana 10-11): Monetization & Polish
**Duration:** 2 semanas
**Focus:** Payments + optimización

**Deliverables:**
- ✅ Stripe payment integration (React Native)
- ✅ Subscription management
- ✅ Paywall screens
- ✅ Performance optimization
- ✅ Offline support refinement

---

### Sprint 9 (Semana 11-12): Beta Testing
**Duration:** 2 semanas
**Focus:** Testing con usuarios reales

**Deliverables:**
- ✅ Expo Development Build creado
- ✅ Beta distribution (TestFlight + Google Play Internal)
- ✅ 20-50 medical students onboarded
- ✅ Feedback collection
- **Goal:** 40% activation, 8/10 quality rating

---

### Sprint 10 (Semana 12-13): Iteration & Hardening
**Duration:** 1 semana
**Focus:** Bugfixes + refinamiento

**Deliverables:**
- ✅ Bug fixes from beta
- ✅ AI prompt engineering refinement
- ✅ Performance tuning
- ✅ App icon + splash screen final
- ✅ Production-ready app

---

### Sprint 11 (Semana 13-14): App Store Submission
**Duration:** 1-2 semanas
**Focus:** Publicación en stores

**Deliverables:**
- ✅ App Store listing (screenshots, description)
- ✅ Google Play listing
- ✅ Submit for review
- ✅ **Wait time:** 2-7 días (Apple), 1-3 días (Google)
- ✅ Apps published and live

---

## 🔍 DETALLES RÁPIDOS POR FEATURE

### F-001: AI Medical Flashcard Generation 🤖
**RICE: 300** | **Effort: 5d** | **Sprint: S3**

**¿Qué hace?**
Usuario sube PDF → IA genera 20-50 flashcards médicas en 30 segundos

**Valor clave:**
Ahorra 90 minutos de creación manual por sesión

**Componentes:**
- Upload drag-and-drop
- Progress indicator
- Card preview + edit
- Save to library

**Tech:**
- OpenAI GPT-4o-mini ($0.15/1M tokens)
- PyPDF2 para extracción
- Supabase Storage

**Acceptance criteria:**
- ✅ 85%+ accuracy en terminología médica
- ✅ Generación <30 segundos
- ✅ Formato USMLE/NCLEX style

---

### F-002: FSRS Spaced Repetition System 🧠
**RICE: 240** | **Effort: 4d** | **Sprint: S4**

**¿Qué hace?**
Algoritmo científico determina cuándo mostrar cada flashcard para máxima retención

**Valor clave:**
Retención 200%+ mejor vs re-lectura tradicional

**Componentes:**
- FSRS algorithm (reference: fsrs4anki)
- Study UI con flip animations
- Rating buttons (Again/Hard/Good/Easy)
- Daily queue management

**Tech:**
- PostgreSQL para tracking
- Indexed queries (user_id, due_date)
- Batch updates para performance

**Acceptance criteria:**
- ✅ Intervalos calculados correctamente
- ✅ Queue loads <500ms con 1000 cards
- ✅ Swipe gestures en mobile

---

### F-003: Study Dashboard with Heatmap 📊
**RICE: 180** | **Effort: 3d** | **Sprint: S5**

**¿Qué hace?**
Dashboard visual con heatmap estilo GitHub + stats de progreso

**Valor clave:**
Gamificación aumenta retención 40% (dato Duolingo)

**Componentes:**
- GitHub-style heatmap (90 días)
- Stats: streak, cards mastered, time studied
- Subject progress bars
- Calendar view

**Tech:**
- react-calendar-heatmap library
- Materialized views para aggregations
- Cache 1 hora

**Acceptance criteria:**
- ✅ Heatmap responsive mobile/desktop
- ✅ Tooltips con counts exactos
- ✅ Real-time stats updates

---

### F-004: Authentication & User Management 🔐
**RICE: 150** | **Effort: 2d** | **Sprint: S2**

**¿Qué hace?**
Signup/login seguro con email o Google OAuth

**Valor clave:**
Acceso seguro + datos personalizados

**Componentes:**
- Signup/login forms
- Email verification
- Password reset flow
- Protected routes

**Tech:**
- Supabase Auth (JWT tokens)
- Google OAuth provider
- Row-level security

**Acceptance criteria:**
- ✅ Password reset <2 min delivery
- ✅ Sessions persist across refresh
- ✅ Social login sin friction

---

### F-005: Pomodoro Timer Integration ⏱️
**RICE: 120** | **Effort: 2d** | **Sprint: S5**

**¿Qué hace?**
Timer de 25 min integrado en sesiones de estudio

**Valor clave:**
Estructura las sesiones, gamifica la consistencia

**Componentes:**
- Timer countdown
- Break notifications
- Session tracking
- Pause/resume

**Tech:**
- Frontend timer (useEffect + setInterval)
- Browser Notification API
- Backend registra sesiones

**Acceptance criteria:**
- ✅ Notificación al finalizar
- ✅ Sesiones en heatmap
- ✅ Configurable (15/25/45 min)

---

### F-006: PDF Text Extraction 📄
**RICE: 133** | **Effort: 1.5d** | **Sprint: S3**

**¿Qué hace?**
Extrae texto de PDFs para generar flashcards

**Valor clave:**
Soporte para cualquier material de estudio

**Componentes:**
- File upload validation
- Text extraction
- Error handling
- Format normalization

**Tech:**
- PyPDF2 (Python)
- Fallback: pdf.js (client-side)
- Max size: 10MB

**Acceptance criteria:**
- ✅ Extrae 95%+ de PDFs correctamente
- ✅ Maneja errores gracefully
- ✅ Preview antes de generar

---

### F-007: Native Mobile UI Components 📱
**RICE: 120** | **Effort: 4d** | **Sprint: S4**

**¿Qué hace?**
Librería completa de componentes nativos para iOS y Android con diseño consistente

**Valor clave:**
Experiencia de app nativa (no web wrapper) con performance superior

**Componentes:**
- Design system con NativeWind
- Buttons, Cards, Inputs nativos
- Navigation (Stack + Tabs)
- Touch gestures (swipe, long-press)
- Loading states y error boundaries
- Bottom sheets y modals nativos

**Tech:**
- React Native components
- NativeWind (Tailwind for RN)
- Expo Router para navigation
- Reanimated 2 para animations

**Acceptance criteria:**
- ✅ Funciona iOS 14+ y Android 10+
- ✅ 60fps smooth animations
- ✅ Native feel (no web-like delays)
- ✅ Swipe gestures responsive
- ✅ Platform-specific behaviors (iOS/Android)

---

### F-008: Flashcard Editor ✏️
**RICE: 90** | **Effort: 2d** | **Sprint: S3**

**¿Qué hace?**
Editar flashcards generadas por IA antes de guardar

**Valor clave:**
Corregir errores de IA, personalizar contenido

**Componentes:**
- Inline editing
- Autosave
- Delete cards
- Add tags/categories

**Tech:**
- Debounced autosave (500ms)
- Optimistic UI updates
- Undo/redo stack

**Acceptance criteria:**
- ✅ Edit sin lag
- ✅ Changes persist instantly
- ✅ Bulk edit disponible

---

### F-009: Study Analytics 📈
**RICE: 72** | **Effort: 3d** | **Sprint: V1.1 (Post-MVP)**

**¿Qué hace?**
Insights sobre patrones de aprendizaje

**Valor clave:**
Identificar áreas débiles, optimizar estudio

**Componentes:**
- Time vs retention graphs
- Weak topics identification
- Predicted exam readiness
- Study recommendations

**Tech:**
- Chart.js o Recharts
- Aggregation queries
- ML predictions (V2)

**Status:** 🔵 Diferido a V1.1

---

### F-010: Export to Anki 📤
**RICE: 40** | **Effort: 4d** | **Sprint: V1.1 (Post-MVP)**

**¿Qué hace?**
Exportar decks a formato Anki (.apkg)

**Valor clave:**
Migración de power users de Anki

**Componentes:**
- Export wizard
- Format conversion
- Preserve metadata
- Download .apkg file

**Tech:**
- genanki library (Python)
- APKG file generation
- Metadata mapping

**Status:** 🔵 Diferido a V1.1

---

## 📊 RESUMEN EJECUTIVO

### Por Prioridad
- 🔴 **P0 (Must Have):** 6 features - 21.5 días
- 🟡 **P1 (Should Have):** 3 features - 7 días
- 🟢 **P2 (Nice to Have):** 1 feature - 4 días (post-MVP)

### Por Sprint
- **S1:** Validation (1 semana, no dev)
- **S2:** React Native Foundation (2 semanas)
- **S3:** Auth & Backend (1 semana)
- **S4:** Native UI Components (1 semana)
- **S5:** AI Flashcards (2 semanas)
- **S6:** Spaced Repetition (2 semanas)
- **S7:** Dashboard & Gamification (2 semanas)
- **S8:** Monetization & Polish (2 semanas)
- **S9:** Beta Testing (2 semanas)
- **S10:** Iteration & Hardening (1 semana)
- **S11:** App Store Submission (1-2 semanas)

### Total Development Time
- **MVP (P0 + P1):** 28.5 días de desarrollo puro
- **Setup + Testing:** 4 semanas (Expo setup, beta, iteration)
- **App Store Review:** 1-2 semanas
- **Total:** 12-14 semanas a launch público

---

## 🚦 OUT OF SCOPE (V1)

Las siguientes features NO están incluidas en MVP:

| Feature | Razón | Cuándo |
|:--------|:------|:------:|
| ❌ Social/Collaboration | Agrega complejidad sin validar core value | V2.0 |
| ❌ OCR Handwritten Notes | APIs caras ($), complejidad técnica | V1.1 |
| ❌ iPad/Tablet optimized UI | Phone-first, tablet después | V1.1 |
| ❌ Apple Watch companion | No esencial para MVP | V2.0 |
| ❌ LMS Integrations (Canvas/Blackboard) | Requiere partnerships institucionales | V2.0 |
| ❌ Fine-tuned Medical LLM | Requiere data + $50K+ training | V2.0 |
| ❌ Subspecialty Templates | No validado en user research | V1.1 |
| ❌ Multi-language Support | English-only MVP | V2.0 |
| ❌ Voice Recording flashcards | Complejidad audio processing | V2.0 |

---

## 🎯 SUCCESS CRITERIA (POR FEATURE)

### F-001: AI Generation
- ✅ 85%+ user rating "High Quality"
- ✅ <30s generation time
- ✅ <1% error rate

### F-002: Spaced Repetition
- ✅ 40%+ 30-day retention
- ✅ Avg 50+ cards/day per active user
- ✅ 7+ day streaks en 30% users

### F-003: Dashboard
- ✅ 80%+ daily active users view dashboard
- ✅ <1s load time
- ✅ 20%+ users achieve 7-day streak

### F-004: Auth
- ✅ <2 min signup to first study session
- ✅ 70%+ choose Google OAuth
- ✅ <1% auth errors

---

**Documento generado:** 11 de Noviembre, 2025
**Metodología:** RICE Framework (Intercom)
**Platform:** React Native + Expo (Native iOS + Android)
**Timeline:** 12-14 semanas to public launch
**Testing:** Expo Go (gratis) → Expo Dev Build (beta) → App Stores
**Costos hasta launch:** $0 (solo pagas al publicar: $99 Apple + $25 Google)
**Próximo paso:** Handoff a UX/UI Designer
