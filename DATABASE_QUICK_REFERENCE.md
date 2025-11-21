# Database Quick Reference

## Key Findings Summary

### 1. CRITICAL ISSUES (Fix Immediately)

#### Issue #1: Disabled ORM Relationships
**File**: `backend/app/models/*.py` (all model files)
**Status**: All relationships commented out
**Impact**: N+1 query problem, no eager loading possible
**Time to Fix**: 30 minutes
```python
# Currently disabled - needs enabling:
# user = relationship("User", back_populates="flashcards")
# stats = relationship("CardStats", back_populates="card", uselist=False, cascade="all, delete-orphan")
```

#### Issue #2: No Migration Version History
**Status**: Alembic configured but `alembic/versions/` is empty
**Current**: Schema loaded from SQL file on Docker init
**Risk**: No rollback capability, hard to track changes
**Time to Fix**: 1 hour
```bash
# Run in backend directory:
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### 2. HIGH PRIORITY MISSING INDEXES

All of these impact query performance:

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| idx_card_reviews_user_reviewed_date | card_reviews | (user_id, reviewed_at DESC) | User history queries |
| idx_study_materials_user_status | study_materials | (user_id, status) | Filter completed materials |
| idx_flashcards_active_user | flashcards | (user_id, status) WHERE deleted_at IS NULL | Get active cards for user |
| idx_card_stats_review_due | card_stats | (user_id, mastery_level, due_date DESC) | Cards due today |
| idx_study_sessions_streak_calc | study_sessions | (user_id, date DESC) WHERE cards_studied > 0 | Streak calculation |

**Time to Fix**: 15 minutes (just run the SQL)

### 3. DATABASE CONFIGURATION

**Type**: PostgreSQL 16+ with SQLAlchemy ORM
**Connection Pool**: 
- Size: 5 (conservative)
- Max Overflow: 10
- Pre-ping: Enabled ✓
- Recycle: 3600s ✓

**For Production**: Increase pool_size to 10-20

### 4. SCHEMA OVERVIEW

```
users (7 core tables)
├── user_stats (denormalized for dashboard)
├── study_materials (extracted PDF text)
│   └── flashcards (generated study cards)
│       ├── card_stats (FSRS algorithm state)
│       └── card_reviews (review history)
└── study_sessions (daily tracking)
    └── card_reviews (links sessions to reviews)
```

### 5. DESIGN PATTERNS IN USE

✓ **FSRS Algorithm**: Properly separated into card_stats (current) and card_reviews (history)
✓ **Soft Delete**: deleted_at column on all main tables
✓ **Denormalization**: user_stats table for fast dashboard queries
✓ **Triggers**: Auto-update timestamps, mastery level, user stats
✓ **Full-Text Search**: GIN indexes on text fields
✓ **Row-Level Security**: RLS policies defined for Supabase
✓ **UUID Keys**: Distributed-system ready

⚠ **Issues**:
- Relationships disabled → N+1 queries
- Streak calculation trigger is inefficient
- Mixed auth strategy (local + Supabase)

### 6. QUERY PATTERNS OBSERVED

From `backend/app/routes/flashcards.py`:

1. **Basic Filter**: `.filter(Flashcard.user_id == user_id, Flashcard.deleted_at.is_(None))`
2. **Array Filter**: `.filter(Flashcard.tags.overlap(tags))` ✓ Has GIN index
3. **Pagination**: Uses OFFSET/LIMIT with ORDER BY created_at DESC

### 7. FILES TO KNOW

| File | Purpose | Status |
|------|---------|--------|
| `docs/database-schema.sql` | Complete schema definition | ✓ Up-to-date (659 lines) |
| `backend/app/utils/database.py` | SQLAlchemy config & pooling | ✓ Well configured |
| `backend/app/models/` | ORM model definitions | ⚠ Relationships disabled |
| `backend/alembic/` | Migration setup | ✗ No migrations yet |
| `docker-compose.yml` | Dev DB init | ✓ Loads schema.sql on startup |

### 8. QUICK OPTIMIZATION CHECKLIST

**Week 1 (Critical)**
- [ ] Enable ORM relationships (30 min)
- [ ] Create initial Alembic migration (1 hour)
- [ ] Add 5 missing indexes (15 min)

**Week 2 (Important)**
- [ ] Profile and optimize streak trigger
- [ ] Implement composite indexes where needed
- [ ] Enable query logging and analyze slow queries

**Week 3+ (Nice to Have)**
- [ ] Add connection pool monitoring
- [ ] Implement caching for user_stats
- [ ] Consider materialized views for reports

### 9. PERFORMANCE BOTTLENECKS

**Current**: Relationships disabled + missing indexes
**Risk Level**: MEDIUM (develops into HIGH at scale)
**Affected Queries**:
- Getting cards with stats: N+1 problem
- Dashboard queries: Slow without indexes
- Streak calculation: Complex trigger execution

### 10. SCHEMA STATISTICS

- **Tables**: 7
- **Indexes**: 19 existing, 5 recommended additions
- **Foreign Keys**: 8 (all with CASCADE delete)
- **Triggers**: 7 (1 generic, 1 mastery calc, 1 user stats, 4 timestamp updates)
- **Views**: 2 (cards_due_today, user_dashboard_summary)
- **CHECK Constraints**: 8
- **UNIQUE Constraints**: 2 (user email, study_sessions per user per day)
- **Array Columns**: 2 (tags in study_materials and flashcards)
- **Full-Text Search**: Yes (GIN indexes)

---

## Getting Help

For detailed analysis, see: `DATABASE_ANALYSIS.md`

For specific optimization recommendations, check section 7 of the full analysis.

For migration setup instructions, see section 5 of the full analysis.
