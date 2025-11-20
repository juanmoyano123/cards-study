# StudyMaster - Lista Completa de Dependencias

**Fecha:** 2025-11-20
**Basado en:** ROADMAP.md - Todas las fases

---

## 📦 Backend Dependencies (Python)

### ✅ Ya Instaladas
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- pydantic==2.5.0
- pydantic-settings==2.1.0
- sqlalchemy==2.0.23
- alembic==1.12.1
- psycopg2-binary==2.9.9
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4
- python-multipart==0.0.6
- supabase==2.0.3
- openai==1.3.5
- tiktoken==0.5.1
- PyPDF2==3.0.1
- httpx==0.24.1
- requests==2.31.0
- python-dotenv==1.0.0
- slowapi==0.1.9
- pytest==7.4.3
- pytest-asyncio==0.21.1
- pytest-cov==4.1.0
- black==23.11.0
- pylint==3.0.2
- mypy==1.7.1
- loguru==0.7.2
- python-dateutil==2.8.2

### ❌ Faltantes (Ninguna)
Todas las dependencias del backend ya están instaladas.

---

## 📱 Frontend Dependencies (React Native/Expo)

### ✅ Ya Instaladas (Básicas)
- expo
- react
- react-native
- typescript
- @testing-library/react-native
- @testing-library/jest-native
- jest
- nativewind
- tailwindcss

### ❌ Faltantes (A Instalar)

#### Fase 3: Frontend Foundation
- **@supabase/supabase-js** - Cliente Supabase para auth
- **zustand** - State management (auth, study, dashboard stores)
- **axios** - HTTP client para API calls
- **@react-native-async-storage/async-storage** - Persistent storage
- **lucide-react-native** - Iconos para tabs y UI

#### Fase 4: AI Generation
- **expo-document-picker** - Subir PDFs desde dispositivo
- **expo-image-picker** - Subir imágenes (opcional)

#### Fase 5: Spaced Repetition
- **react-native-animatable** - Animaciones flip card
- **react-native-gesture-handler** - Swipe gestures (opcional)
- **react-native-reanimated** - Animaciones smooth

#### Fase 6: Dashboard
- **react-native-svg** - Gráficos y visualizaciones
- **react-native-calendar-heatmap** - Heatmap GitHub-style (opcional, puede hacerse custom)
- **d3** - Visualizaciones de datos (opcional)

#### Fase 7: Pomodoro Timer
- **expo-notifications** - Notificaciones cuando termina timer
- **expo-av** - Sonidos de notificación

#### Testing (Fase 8)
- **detox** - E2E testing (opcional, complejo de setup)

---

## 🔧 DevOps Dependencies

### CI/CD (Opcional)
- **GitHub Actions** - Ya configurado en `.github/workflows` (si existe)

### Build & Deploy (Fase 9)
- **eas-cli** - Expo Application Services CLI
- **@expo/ngrok** - Tunneling (opcional)

---

## 📋 Resumen de Instalación

### Backend
```bash
cd backend
source venv/bin/activate
# Ya todas instaladas ✅
```

### Frontend - Core (Fase 3)
```bash
cd mobile
npm install @supabase/supabase-js zustand axios @react-native-async-storage/async-storage
npx expo install lucide-react-native
```

### Frontend - Upload (Fase 4)
```bash
npx expo install expo-document-picker expo-image-picker
```

### Frontend - Animations (Fase 5)
```bash
npm install react-native-animatable
npx expo install react-native-gesture-handler react-native-reanimated
```

### Frontend - Visualizations (Fase 6)
```bash
npx expo install react-native-svg
npm install react-native-calendar-heatmap
# O custom heatmap sin librería externa
```

### Frontend - Notifications (Fase 7)
```bash
npx expo install expo-notifications expo-av
```

### Build Tools (Fase 9)
```bash
npm install -g eas-cli
```

---

## 🎯 Orden de Instalación Recomendado

1. **Ahora (Fase 3):** Core dependencies (supabase, zustand, axios, async-storage, lucide)
2. **Fase 4:** Document picker
3. **Fase 5:** Animations (animatable, gesture-handler, reanimated)
4. **Fase 6:** SVG + Heatmap
5. **Fase 7:** Notifications
6. **Fase 9:** EAS CLI

---

## 📊 Tamaño Estimado

**Backend:**
- Instaladas: ~500MB (con venv)

**Frontend:**
- Básicas instaladas: ~800MB (node_modules)
- + Core (Fase 3): +50MB
- + Animations (Fase 5): +30MB
- + Visualizations (Fase 6): +20MB
- **Total estimado:** ~900MB

---

## ⚠️ Notas Importantes

### Expo Packages
Siempre usar `npx expo install` para paquetes que requieren configuración nativa:
- expo-document-picker
- expo-notifications
- expo-av
- react-native-reanimated
- react-native-gesture-handler

### NPM Packages
Usar `npm install` para paquetes JavaScript puros:
- zustand
- axios
- react-native-animatable
- d3

### Peer Dependencies
Algunas pueden dar warnings de peer dependencies, usar:
```bash
npm install --legacy-peer-deps
```

---

**Generado desde:** ROADMAP.md
**Última actualización:** 2025-11-20
