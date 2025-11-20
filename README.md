# StudyMaster

AI-powered flashcard platform with spaced repetition for university students.

## 🎯 Overview

StudyMaster transforms study materials (PDFs, notes) into smart flashcards using AI, then helps students retain knowledge through scientifically-proven spaced repetition.

**Key Features:**
- 🤖 AI flashcard generation (OpenAI GPT-4o-mini)
- 🧠 FSRS spaced repetition algorithm
- 📊 Progress tracking with GitHub-style heatmap
- 📱 Native iOS & Android apps
- ⏱️ Pomodoro timer integration (optional)

## 🏗️ Project Structure

```
cards-study/
├── backend/              # Python FastAPI backend
│   ├── app/             # Application code
│   ├── tests/           # Pytest tests
│   └── README.md        # Backend docs
├── mobile/              # React Native + Expo frontend
│   ├── app/             # Expo Router screens
│   ├── components/      # Reusable components
│   └── README.md        # Frontend docs
├── docs/                # Technical documentation
│   ├── architecture.md  # System architecture
│   ├── database-schema.sql  # Database schema
│   └── api-spec.md      # API specification
├── design/              # Design assets
├── docker-compose.yml   # Local development database
└── ROADMAP.md          # Development roadmap
```

## 🚀 Quick Start

### Prerequisites

- **Backend:**
  - Python 3.11+
  - Docker & Docker Compose
  - pip

- **Frontend:**
  - Node.js 18+
  - npm or yarn
  - Expo CLI

- **Services:**
  - OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
  - Supabase account (optional, for production)

### 1. Clone Repository

```bash
git clone https://github.com/juanmoyano123/cards-study.git
cd cards-study
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start Database

```bash
# From project root
docker-compose up -d postgres

# Verify it's running
docker-compose ps
```

### 4. Run Backend

```bash
cd backend
uvicorn app.main:app --reload

# API available at: http://localhost:8000
# Docs available at: http://localhost:8000/docs
```

### 5. Setup Frontend

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
```

## 📖 Documentation

- **[Architecture Documentation](docs/architecture.md)** - System design, tech stack decisions, performance strategies
- **[Database Schema](docs/database-schema.sql)** - Complete PostgreSQL schema with RLS policies
- **[API Specification](docs/api-spec.md)** - REST API endpoints with examples
- **[Development Roadmap](ROADMAP.md)** - Phase-by-phase development plan
- **[Backend README](backend/README.md)** - Backend-specific setup and development
- **[Frontend README](mobile/README.md)** - Frontend-specific setup and development (will be created)

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest                    # Run all tests
pytest --cov=app         # Run with coverage
pytest -v                # Verbose output
```

### Frontend Tests

```bash
cd mobile
npm test                 # Run Jest tests
npm test -- --coverage   # With coverage
```

## 🛠️ Tech Stack

### Frontend (Mobile)
- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS)
- **Navigation:** Expo Router
- **State:** Zustand
- **Storage:** AsyncStorage + SecureStore

### Backend (API)
- **Framework:** Python FastAPI
- **Database:** PostgreSQL 16 (Supabase)
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Auth:** Supabase Auth (JWT)

### Services
- **AI:** OpenAI GPT-4o-mini
- **Storage:** Supabase
- **Analytics:** Plausible (optional)

## 📊 Development Phases

Current phase: **Phase 1 - Setup & Foundation** ✅

- [x] **Phase 0:** Architecture & Planning (3-5 days)
- [ ] **Phase 1:** Setup & Foundation (5-7 days) - IN PROGRESS
- [ ] **Phase 2:** Backend Core (5-7 days)
- [ ] **Phase 3:** Frontend Foundation (5-7 days)
- [ ] **Phase 4:** AI Flashcard Generation (7-10 days)
- [ ] **Phase 5:** Spaced Repetition (5-7 days)
- [ ] **Phase 6:** Dashboard & Gamification (5-7 days)
- [ ] **Phase 7:** Pomodoro Timer (3-5 days, optional)
- [ ] **Phase 8:** Testing & Optimization (5-7 days)
- [ ] **Phase 9:** Build & Deploy (3-5 days)

See [ROADMAP.md](ROADMAP.md) for detailed phase breakdown.

## 🔑 Environment Variables

### Backend (`backend/.env`)

```bash
# Required
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://studymaster:devpass@localhost:5432/studymaster

# Optional (for production)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
```

### Frontend (`mobile/.env`)

```bash
# API endpoint
EXPO_PUBLIC_API_URL=http://localhost:8000

# Supabase (for production)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🐳 Docker Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres

# Access PostgreSQL
docker-compose exec postgres psql -U studymaster -d studymaster

# Access pgAdmin (http://localhost:5050)
# Email: admin@studymaster.local
# Password: admin
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes
3. Run tests: `pytest` (backend) and `npm test` (frontend)
4. Commit: `git commit -m "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Create Pull Request

## 📝 License

Proprietary - StudyMaster

## 🙏 Acknowledgments

- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki) - Spaced repetition algorithm
- [OpenAI](https://openai.com) - AI flashcard generation
- [Supabase](https://supabase.com) - Backend infrastructure
- [Expo](https://expo.dev) - React Native development platform

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ for students who want to study smarter, not harder.**
