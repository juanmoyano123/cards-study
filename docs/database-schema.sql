-- ============================================================================
-- StudyMaster - Database Schema
-- Version: 1.0
-- Date: 2025-11-20
-- Database: PostgreSQL 15+ (Supabase compatible)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Note: In production with Supabase Auth, users are managed by auth.users
-- This table extends the base auth.users with app-specific fields

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Supabase auth.users.id should reference this
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  password_hash VARCHAR,  -- For local auth, NULL when using Supabase Auth

  -- User preferences
  daily_card_limit INTEGER DEFAULT 100,
  study_reminder_time TIME,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. STUDY_MATERIALS TABLE
-- ============================================================================
-- Stores extracted text from uploaded PDFs or pasted content
-- NOTE: We DO NOT store the original PDF files to save storage costs

CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  filename VARCHAR(500) NOT NULL,
  extracted_text TEXT NOT NULL,
  word_count INTEGER,

  -- Categorization
  subject_category VARCHAR(100),  -- e.g., "Computer Science", "Biology"
  tags TEXT[],  -- Array of tags

  -- Processing status
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,  -- If processing failed

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_study_materials_user_id ON study_materials(user_id, created_at DESC);
CREATE INDEX idx_study_materials_status ON study_materials(status);
CREATE INDEX idx_study_materials_subject ON study_materials(subject_category);

-- Full-text search index
CREATE INDEX idx_study_materials_text_search ON study_materials USING GIN(to_tsvector('english', extracted_text));

-- Trigger for updated_at
CREATE TRIGGER update_study_materials_updated_at
BEFORE UPDATE ON study_materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. FLASHCARDS TABLE
-- ============================================================================
-- Individual flashcards generated from study materials

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,

  -- Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,  -- Optional additional context

  -- Metadata
  tags TEXT[],  -- Array of tags for filtering
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5) DEFAULT 3,
  ai_confidence FLOAT CHECK (ai_confidence BETWEEN 0 AND 1),  -- AI generation confidence
  is_edited BOOLEAN DEFAULT FALSE,  -- True if user modified AI-generated card

  -- Status
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id, created_at DESC);
CREATE INDEX idx_flashcards_material_id ON flashcards(material_id);
CREATE INDEX idx_flashcards_status ON flashcards(status);
CREATE INDEX idx_flashcards_tags ON flashcards USING GIN(tags);

-- Full-text search on question and answer
CREATE INDEX idx_flashcards_text_search ON flashcards USING GIN(
  to_tsvector('english', question || ' ' || answer)
);

-- Trigger for updated_at
CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CARD_STATS TABLE
-- ============================================================================
-- Tracks FSRS algorithm state for each card

CREATE TABLE card_stats (
  card_id UUID PRIMARY KEY REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- FSRS algorithm state
  total_reviews INTEGER DEFAULT 0,
  successful_reviews INTEGER DEFAULT 0,  -- Reviews rated >= 3 (Good/Easy)
  failed_reviews INTEGER DEFAULT 0,      -- Reviews rated < 3 (Again/Hard)

  -- Current state
  current_interval_days INTEGER DEFAULT 0,  -- Days until next review
  ease_factor FLOAT DEFAULT 2.5,            -- Multiplier for interval calculation
  due_date DATE DEFAULT CURRENT_DATE,       -- Next review date

  -- Performance metrics
  average_rating FLOAT,  -- Average of all ratings (1-4)
  average_time_seconds INTEGER,  -- Average time spent per review

  -- Mastery tracking
  mastery_level VARCHAR(20) CHECK (mastery_level IN ('new', 'learning', 'young', 'mature', 'mastered')) DEFAULT 'new',
  -- new: Never reviewed
  -- learning: < 7 days interval
  -- young: 7-21 days interval
  -- mature: 21-90 days interval
  -- mastered: > 90 days interval

  -- Timestamps
  first_reviewed_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes (CRITICAL for performance)
CREATE INDEX idx_card_stats_user_due ON card_stats(user_id, due_date, mastery_level);
CREATE INDEX idx_card_stats_due_date ON card_stats(due_date) WHERE due_date <= CURRENT_DATE;
CREATE INDEX idx_card_stats_mastery ON card_stats(user_id, mastery_level);

-- Trigger for updated_at
CREATE TRIGGER update_card_stats_updated_at
BEFORE UPDATE ON card_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update mastery_level based on interval
CREATE OR REPLACE FUNCTION update_mastery_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_interval_days = 0 THEN
    NEW.mastery_level = 'new';
  ELSIF NEW.current_interval_days < 7 THEN
    NEW.mastery_level = 'learning';
  ELSIF NEW.current_interval_days < 21 THEN
    NEW.mastery_level = 'young';
  ELSIF NEW.current_interval_days < 90 THEN
    NEW.mastery_level = 'mature';
  ELSE
    NEW.mastery_level = 'mastered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mastery_level
BEFORE INSERT OR UPDATE OF current_interval_days ON card_stats
FOR EACH ROW
EXECUTE FUNCTION update_mastery_level();

-- ============================================================================
-- 5. CARD_REVIEWS TABLE
-- ============================================================================
-- History of all card reviews (for analytics and algorithm tuning)

CREATE TABLE card_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Review data
  rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3, 4)),
  -- 1 = Again (forgot)
  -- 2 = Hard (remembered with difficulty)
  -- 3 = Good (remembered easily)
  -- 4 = Easy (remembered instantly)

  -- FSRS state at time of review
  previous_interval_days INTEGER,
  new_interval_days INTEGER,
  previous_ease_factor FLOAT,
  new_ease_factor FLOAT,

  -- Performance
  time_spent_seconds INTEGER,  -- How long to answer
  due_date DATE,  -- When card was due

  -- Context
  session_id UUID,  -- Links to study_sessions

  -- Timestamp
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_card_reviews_card_id ON card_reviews(card_id, reviewed_at DESC);
CREATE INDEX idx_card_reviews_user_id ON card_reviews(user_id, reviewed_at DESC);
CREATE INDEX idx_card_reviews_session_id ON card_reviews(session_id);
CREATE INDEX idx_card_reviews_date ON card_reviews(reviewed_at::DATE);

-- ============================================================================
-- 6. STUDY_SESSIONS TABLE
-- ============================================================================
-- Tracks daily study sessions for streaks and analytics

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session data
  date DATE NOT NULL,
  cards_studied INTEGER DEFAULT 0,
  cards_again INTEGER DEFAULT 0,   -- Rated 1
  cards_hard INTEGER DEFAULT 0,    -- Rated 2
  cards_good INTEGER DEFAULT 0,    -- Rated 3
  cards_easy INTEGER DEFAULT 0,    -- Rated 4

  -- Time tracking
  time_spent_minutes INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,

  -- Streak tracking
  streak_day INTEGER DEFAULT 0,  -- Day number in current streak

  -- Session context
  pomodoro_sessions INTEGER DEFAULT 0,  -- Number of Pomodoro timers completed

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)  -- One session per user per day
);

-- Indexes
CREATE INDEX idx_study_sessions_user_date ON study_sessions(user_id, date DESC);
CREATE INDEX idx_study_sessions_date ON study_sessions(date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_study_sessions_updated_at
BEFORE UPDATE ON study_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. USER_STATS TABLE
-- ============================================================================
-- Denormalized table for fast dashboard queries

CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,

  -- Totals (lifetime)
  total_cards_studied INTEGER DEFAULT 0,
  total_flashcards_created INTEGER DEFAULT 0,
  total_materials_uploaded INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,

  -- Mastery breakdown
  cards_mastered INTEGER DEFAULT 0,        -- mastery_level = 'mastered'
  cards_mature INTEGER DEFAULT 0,          -- mastery_level = 'mature'
  cards_young INTEGER DEFAULT 0,           -- mastery_level = 'young'
  cards_learning INTEGER DEFAULT 0,        -- mastery_level = 'learning'
  cards_new INTEGER DEFAULT 0,             -- mastery_level = 'new'

  -- Performance metrics
  average_accuracy FLOAT,  -- % of cards rated Good or Easy
  average_daily_cards INTEGER,

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON user_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update user_stats when study_sessions changes
CREATE OR REPLACE FUNCTION update_user_stats_from_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Update streak
  UPDATE user_stats
  SET
    current_streak = (
      SELECT COUNT(DISTINCT date)
      FROM study_sessions
      WHERE user_id = NEW.user_id
        AND date >= (SELECT MAX(date) FROM study_sessions WHERE user_id = NEW.user_id) - INTERVAL '100 days'
        AND date IN (
          SELECT date
          FROM generate_series(
            (SELECT MAX(date) FROM study_sessions WHERE user_id = NEW.user_id) - INTERVAL '100 days',
            (SELECT MAX(date) FROM study_sessions WHERE user_id = NEW.user_id),
            '1 day'::interval
          ) AS date
        )
    ),
    longest_streak = GREATEST(
      longest_streak,
      (SELECT COUNT(DISTINCT date) FROM study_sessions WHERE user_id = NEW.user_id)
    ),
    last_study_date = NEW.date,
    total_cards_studied = total_cards_studied + NEW.cards_studied,
    total_study_minutes = total_study_minutes + NEW.time_spent_minutes,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_from_session
AFTER INSERT OR UPDATE ON study_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_from_session();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (id = auth.uid());

-- Study materials policies
CREATE POLICY study_materials_select_policy ON study_materials
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY study_materials_insert_policy ON study_materials
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY study_materials_update_policy ON study_materials
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY study_materials_delete_policy ON study_materials
  FOR DELETE USING (user_id = auth.uid());

-- Flashcards policies
CREATE POLICY flashcards_select_policy ON flashcards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY flashcards_insert_policy ON flashcards
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY flashcards_update_policy ON flashcards
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY flashcards_delete_policy ON flashcards
  FOR DELETE USING (user_id = auth.uid());

-- Card stats policies
CREATE POLICY card_stats_select_policy ON card_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY card_stats_insert_policy ON card_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY card_stats_update_policy ON card_stats
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY card_stats_delete_policy ON card_stats
  FOR DELETE USING (user_id = auth.uid());

-- Card reviews policies
CREATE POLICY card_reviews_select_policy ON card_reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY card_reviews_insert_policy ON card_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Study sessions policies
CREATE POLICY study_sessions_select_policy ON study_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY study_sessions_insert_policy ON study_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY study_sessions_update_policy ON study_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- User stats policies
CREATE POLICY user_stats_select_policy ON user_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_stats_update_policy ON user_stats
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 9. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Cards due today
CREATE OR REPLACE VIEW cards_due_today AS
SELECT
  f.id,
  f.user_id,
  f.question,
  f.answer,
  f.tags,
  cs.due_date,
  cs.ease_factor,
  cs.current_interval_days,
  cs.mastery_level,
  cs.total_reviews
FROM flashcards f
JOIN card_stats cs ON f.id = cs.card_id
WHERE f.status = 'active'
  AND cs.due_date <= CURRENT_DATE
  AND f.deleted_at IS NULL;

-- View: User dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT
  u.id AS user_id,
  u.name,
  us.current_streak,
  us.longest_streak,
  us.total_cards_studied,
  us.cards_mastered,
  (SELECT COUNT(*) FROM cards_due_today cdt WHERE cdt.user_id = u.id) AS cards_due_today,
  us.last_study_date
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id;

-- ============================================================================
-- 10. SEED DATA FOR DEVELOPMENT/TESTING
-- ============================================================================

-- Insert test user
INSERT INTO users (id, email, name, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', NOW())
ON CONFLICT (id) DO NOTHING;

-- Initialize user_stats for test user
INSERT INTO user_stats (user_id, current_streak, longest_streak)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample study material
INSERT INTO study_materials (id, user_id, filename, extracted_text, word_count, subject_category, status, processed_at)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'introduction-to-python.pdf',
    'Python is a high-level, interpreted programming language. It was created by Guido van Rossum and first released in 1991. Python emphasizes code readability with its notable use of significant whitespace.',
    35,
    'Computer Science',
    'completed',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample flashcards
INSERT INTO flashcards (id, user_id, material_id, question, answer, tags, difficulty, ai_confidence, status)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Who created the Python programming language?',
    'Guido van Rossum',
    ARRAY['Python', 'History', 'Programming'],
    2,
    0.95,
    'active'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'When was Python first released?',
    '1991',
    ARRAY['Python', 'History'],
    1,
    0.98,
    'active'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'What does Python emphasize in its design?',
    'Code readability with significant whitespace',
    ARRAY['Python', 'Design', 'Programming'],
    3,
    0.92,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Initialize card stats for sample flashcards
INSERT INTO card_stats (card_id, user_id, due_date, ease_factor, current_interval_days, mastery_level)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE,
    2.5,
    0,
    'new'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE,
    2.5,
    0,
    'new'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE,
    2.5,
    0,
    'new'
  )
ON CONFLICT (card_id) DO NOTHING;

-- Insert sample study session
INSERT INTO study_sessions (id, user_id, date, cards_studied, cards_good, cards_easy, time_spent_minutes, streak_day)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE,
    10,
    6,
    4,
    15,
    1
  )
ON CONFLICT (user_id, date) DO NOTHING;

-- ============================================================================
-- 11. USEFUL QUERIES FOR DEVELOPMENT
-- ============================================================================

-- Get cards due for a user
-- SELECT * FROM cards_due_today WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Get user dashboard
-- SELECT * FROM user_dashboard_summary WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Get heatmap data (last 90 days)
-- SELECT date, cards_studied
-- FROM study_sessions
-- WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
--   AND date >= CURRENT_DATE - INTERVAL '90 days'
-- ORDER BY date ASC;

-- Get mastery breakdown
-- SELECT mastery_level, COUNT(*) as count
-- FROM card_stats
-- WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
-- GROUP BY mastery_level;

-- Calculate current streak
-- WITH consecutive_days AS (
--   SELECT
--     date,
--     date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY date) AS grp
--   FROM study_sessions
--   WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
--     AND cards_studied > 0
--   ORDER BY date DESC
-- )
-- SELECT COUNT(*) AS current_streak
-- FROM consecutive_days
-- WHERE grp = (SELECT MAX(grp) FROM consecutive_days);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
