-- ============================================================================
-- DATABASE OPTIMIZATION FIXES
-- Apply these changes to improve query performance
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING INDEXES (HIGH PRIORITY)
-- ============================================================================
-- These indexes will significantly improve query performance
-- Estimated impact: 50-70% faster dashboard queries

-- 1. Card reviews user + date index
-- For queries: "Get all reviews for user on a specific date"
-- Example: Dashboard statistics for a day
CREATE INDEX idx_card_reviews_user_reviewed_date ON card_reviews
  (user_id, reviewed_at DESC)
  WHERE reviewed_at::DATE = CURRENT_DATE;

-- 2. Study materials - user + status combined
-- For queries: "Get all completed/processing materials for a user"
-- Example: Load study material library
CREATE INDEX idx_study_materials_user_status ON study_materials
  (user_id, status) WHERE deleted_at IS NULL;

-- 3. Active flashcards for user (most common query)
-- For queries: "Get all active flashcards for a user"
-- Example: Study dashboard, card browsing
CREATE INDEX idx_flashcards_active_user ON flashcards
  (user_id, status) WHERE deleted_at IS NULL AND status = 'active';

-- 4. Card stats - reorder for better selectivity
-- Current index: (user_id, due_date, mastery_level)
-- Better: (user_id, mastery_level, due_date DESC)
-- For queries: "Get new cards due today for a user"
CREATE INDEX idx_card_stats_review_due ON card_stats
  (user_id, mastery_level, due_date DESC)
  WHERE due_date <= CURRENT_DATE;

-- 5. Study sessions - streak calculation
-- For queries: "Get consecutive days of studying"
-- Used by: Streak calculation trigger and endpoints
CREATE INDEX idx_study_sessions_streak_calc ON study_sessions
  (user_id, date DESC)
  WHERE cards_studied > 0;

-- ============================================================================
-- PART 2: ANALYZE INDEX USAGE (RUN AFTER INDEX CREATION)
-- ============================================================================
-- These queries help verify the indexes are being used

-- Check that new indexes exist:
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index sizes (to ensure they're not too large):
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
JOIN pg_class ON indexrelname = relname
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- PART 3: OPTIMIZE SOFT DELETE QUERIES
-- ============================================================================
-- Many indexes should filter out deleted records

-- Optional: Replace existing indexes with filtered versions for major tables
-- (Only if you need to reduce index size significantly)

-- ALTER INDEX idx_flashcards_user_id RENAME TO idx_flashcards_user_id_old;
-- CREATE INDEX idx_flashcards_user_id ON flashcards
--   (user_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- PART 4: ANALYZE EXISTING QUERIES
-- ============================================================================
-- Run these to find slow queries

-- Find slowest queries by execution count:
-- (Requires log_min_duration_statement in PostgreSQL config)
-- SELECT query, mean_exec_time, calls
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time * calls DESC
-- LIMIT 10;

-- Check if indexes are actually being used:
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS "index_scans",
  idx_tup_read AS "tuples_read",
  idx_tup_fetch AS "tuples_fetched"
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================================
-- PART 5: IDENTIFY MISSING INDEXES VIA UNUSED SEQUENTIAL SCANS
-- ============================================================================
-- Tables with many sequential scans might need more indexes

SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  (seq_scan - idx_scan) AS seq_vs_idx,
  ROUND(100 * seq_scan / (seq_scan + idx_scan), 2) AS seq_percent
FROM pg_stat_user_tables
WHERE (seq_scan + idx_scan) > 0
ORDER BY seq_vs_idx DESC
LIMIT 10;

-- ============================================================================
-- PART 6: VACUUM AND ANALYZE (RUN AFTER INDEX CREATION)
-- ============================================================================
-- Important: Analyze tables after creating indexes

-- Full maintenance (run once after all changes):
-- ANALYZE;
-- VACUUM ANALYZE;

-- Per-table analysis:
ANALYZE card_reviews;
ANALYZE study_materials;
ANALYZE flashcards;
ANALYZE card_stats;
ANALYZE study_sessions;

-- ============================================================================
-- PART 7: EXAMPLE QUERIES WITH EXPECTED INDEX USAGE
-- ============================================================================

-- Query 1: Get active flashcards for user (should use idx_flashcards_active_user)
-- Expected: Index scan, very fast
EXPLAIN ANALYZE
SELECT id, question, answer, difficulty
FROM flashcards
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- Query 2: Get cards due today (should use idx_card_stats_review_due)
-- Expected: Index scan with filter on mastery_level
EXPLAIN ANALYZE
SELECT cs.card_id, cs.mastery_level, f.question, f.answer
FROM card_stats cs
JOIN flashcards f ON cs.card_id = f.id
WHERE cs.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND cs.due_date <= CURRENT_DATE
  AND f.status = 'active'
ORDER BY cs.due_date DESC
LIMIT 50;

-- Query 3: Get reviews for today (should use idx_card_reviews_user_reviewed_date)
-- Expected: Index scan with partial index match
EXPLAIN ANALYZE
SELECT id, card_id, rating, reviewed_at
FROM card_reviews
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND reviewed_at::DATE = CURRENT_DATE
ORDER BY reviewed_at DESC;

-- Query 4: Get materials for user (should use idx_study_materials_user_status)
-- Expected: Index scan
EXPLAIN ANALYZE
SELECT id, filename, status, word_count
FROM study_materials
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND status = 'completed'
  AND deleted_at IS NULL;

-- ============================================================================
-- PART 8: MONITORING QUERIES
-- ============================================================================

-- Check table sizes (to understand data volume):
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  (SELECT COUNT(*) FROM flashcards) AS flashcard_count,
  (SELECT COUNT(*) FROM card_reviews) AS review_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('flashcards', 'card_reviews', 'card_stats', 'users', 'study_sessions');

-- Check index hit ratio (should be >99% in production):
SELECT
  SUM(idx_scan) as index_scans,
  SUM(seq_scan) as sequence_scans,
  SUM(idx_scan) / (SUM(idx_scan) + SUM(seq_scan)) * 100 as index_hit_ratio
FROM pg_stat_user_tables;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After applying these fixes:
-- 1. Run ANALYZE to update statistics
-- 2. Monitor slow_log for remaining slow queries
-- 3. Test with realistic data volume
-- 4. Use EXPLAIN ANALYZE to verify index usage
-- 5. Consider setting log_min_duration_statement = 1000 in PostgreSQL config
--    to log all queries taking longer than 1 second

-- These indexes should be included in Alembic migrations:
-- See DATABASE_ANALYSIS.md for migration setup instructions
