# Cards-Study Database Schema Analysis

## Executive Summary
The cards-study project uses **PostgreSQL 16** with **SQLAlchemy ORM** and **Alembic** for migrations. The database schema is well-designed for a spaced repetition flashcard application with 7 core tables implementing FSRS (Free Spaced Repetition Scheduler) algorithm support.

---

## 1. SCHEMA DESIGN PATTERNS & NORMALIZATION

### Database Architecture
- **Type**: Relational (PostgreSQL 16+)
- **Schema Definition**: `/home/user/cards-study/docs/database-schema.sql` (659 lines)
- **ORM Models**: SQLAlchemy models in `/home/user/cards-study/backend/app/models/`
- **Migration Tool**: Alembic (setup but no migrations created yet)

### Core Tables (7 tables)
1. **users** - User authentication and preferences
2. **study_materials** - Extracted text from PDFs/content
3. **flashcards** - Individual study cards
4. **card_stats** - FSRS algorithm state per card
5. **card_reviews** - History of all reviews
6. **study_sessions** - Daily session tracking
7. **user_stats** - Denormalized dashboard metrics

### Normalization Analysis
- **1NF**: All tables properly normalized
- **2NF**: All non-key attributes fully dependent on primary key
- **3NF**: Mostly good, with intentional denormalization in `user_stats` for performance
- **BCNF**: Satisfied for all tables

### Design Strengths
✓ UUID primary keys for distributed systems
✓ Comprehensive foreign key constraints with CASCADE delete
✓ Soft delete implementation (deleted_at columns)
✓ Timestamp tracking (created_at, updated_at, deleted_at)
✓ CHECK constraints for data validity
✓ Row-level security (RLS) policies defined
✓ Database-level triggers for automatic timestamp updates
✓ Mastery level calculation triggers

### Design Issues
✗ Relationships commented out in ORM models (lines 51-55 in flashcard.py, etc.)
  - Limits ORM power for eager loading and relationships
  - May cause N+1 query problems
✗ No explicit transaction management shown in routes
✗ User authentication tied to both local tables and Supabase
  - Mixed auth strategy may cause confusion

---

## 2. MISSING INDEXES CAUSING PERFORMANCE ISSUES

### Critical Missing Indexes

#### HIGH PRIORITY (Query Performance Impact)

**1. card_reviews table - User history queries**
```
Missing: idx_card_reviews_user_date
-- Likely needed for: "Get all reviews for a user on a date range"
-- Current indexes only have user_id and card_id separately
-- Impact: SLOW - User dashboard queries fetching review history
```

**2. study_materials & flashcards - Combined user+status queries**
```
Missing: idx_study_materials_user_status
-- Current: idx_study_materials_user_id, idx_study_materials_status (separate)
-- Needed for: "Get all completed materials for user"
-- Impact: MEDIUM - May cause two-index scans instead of one
```

**3. card_stats - Performance review queries**
```
Missing: idx_card_stats_mastery_user_due
-- Current: idx_card_stats_user_due includes mastery but in wrong order
-- Needed for: "Get cards due today by mastery level"
-- Reorder suggested: (user_id, mastery_level, due_date) for better selectivity
```

#### MEDIUM PRIORITY

**4. flashcards - Soft delete + status**
```
Missing: idx_flashcards_user_status_deleted
-- Current: idx_flashcards_user_id, idx_flashcards_status (separate)
-- All flashcard queries filter on (user_id, status, deleted_at IS NULL)
-- Impact: Compound index would eliminate redundant checks
-- Suggested: CREATE INDEX idx_flashcards_active_user ON flashcards
  (user_id, status) WHERE deleted_at IS NULL;
```

**5. study_sessions - Streak calculation**
```
Missing: idx_study_sessions_user_streak
-- Query pattern: "SELECT * FROM study_sessions WHERE user_id = ? 
  AND date >= ? ORDER BY date DESC"
-- Current: Only (user_id, date DESC) exists
-- Impact: MEDIUM - Multiple full table scans during streak calculation
-- Note: The trigger update_user_stats_from_session() has expensive streak logic
```

**6. card_reviews.session_id**
```
Current: idx_card_reviews_session_id exists (good)
Missing: Consider adding (session_id, reviewed_at DESC) for historical queries
```

### Recommended Index Additions

```sql
-- HIGH PRIORITY
CREATE INDEX idx_card_reviews_user_reviewed_date ON card_reviews
  (user_id, reviewed_at DESC)
  WHERE reviewed_at::DATE = CURRENT_DATE;

CREATE INDEX idx_study_materials_user_status ON study_materials
  (user_id, status) WHERE deleted_at IS NULL;

CREATE INDEX idx_flashcards_active_user ON flashcards
  (user_id, status) WHERE deleted_at IS NULL
  AND status = 'active';

-- MEDIUM PRIORITY
CREATE INDEX idx_card_stats_review_due ON card_stats
  (user_id, mastery_level, due_date DESC)
  WHERE due_date <= CURRENT_DATE;

CREATE INDEX idx_study_sessions_streak_calc ON study_sessions
  (user_id, date DESC)
  WHERE cards_studied > 0;
```

### Full-Text Search Index Status
✓ Already implemented:
  - GIN index on study_materials.extracted_text
  - GIN index on flashcards (question + answer)
  - tsvector with 'english' language

---

## 3. RELATIONSHIP DEFINITIONS & ORM ISSUES

### Problem: Disabled Relationships in ORM Models

**Current State (Lines commented out):**
```python
# flashcard.py, line 51-55
# user = relationship("User", back_populates="flashcards")
# material = relationship("StudyMaterial", back_populates="flashcards")
# stats = relationship("CardStats", back_populates="card", uselist=False)
# reviews = relationship("CardReview", back_populates="card")

# card_stats.py, line 52
# card = relationship("Flashcard", back_populates="stats")

# study_material.py, line 51-53
# user = relationship("User", back_populates="study_materials")
# flashcards = relationship("Flashcard", back_populates="material")
```

### Impacts of Disabled Relationships
1. **N+1 Query Problem**: Every flashcard requires separate queries for stats
   ```python
   # Current (inefficient):
   flashcards = db.query(Flashcard).filter(...).all()
   for fc in flashcards:
       stats = db.query(CardStats).filter(CardStats.card_id == fc.id).first()
       # N+1 queries!
   ```

2. **No Eager Loading**: Cannot use `joinedload()` or `selectinload()`
   ```python
   # Cannot do:
   cards = db.query(Flashcard).options(
       joinedload(Flashcard.stats)
   ).filter(...).all()
   ```

3. **No Back-Population**: Cascading deletes less safe without explicit relationship cascade

### Missing Relationship Issues

**1. CardStats - Missing user_id relationship validation**
   - card_stats.py defines user_id but doesn't validate correspondence with card.user_id
   - Could result in orphaned stats if card and stats have different users
   - Risk: Data inconsistency

**2. CardReview - No direct relationship to CardStats**
   - Reviews store previous_interval_days and new_interval_days
   - But no link to CardStats table during review recording
   - Makes it hard to verify FSRS state consistency

**3. StudySession - CardReview relationship one-way**
   - CardReview has session_id foreign key (good)
   - But StudySession doesn't have back_populates
   - Makes batch operations on reviews difficult

### Recommended Fixes

```python
# flashcard.py
class Flashcard(Base):
    user_id = Column(...)
    material_id = Column(...)
    
    user = relationship("User", back_populates="flashcards")
    material = relationship("StudyMaterial", back_populates="flashcards")
    stats = relationship("CardStats", back_populates="card", 
                        uselist=False, cascade="all, delete-orphan")
    reviews = relationship("CardReview", back_populates="card",
                          cascade="all, delete-orphan")

# card_stats.py
class CardStats(Base):
    card_id = Column(...)
    user_id = Column(...)
    
    card = relationship("Flashcard", back_populates="stats")
    user = relationship("User", back_populates="card_stats")

# study_session.py
class StudySession(Base):
    user_id = Column(...)
    
    user = relationship("User", back_populates="study_sessions")
    reviews = relationship("CardReview", back_populates="session",
                          cascade="all, delete-orphan")
```

---

## 4. SCHEMA DESIGN PATTERNS

### Pattern 1: FSRS Algorithm Implementation
✓ Properly implemented across two tables:
  - **card_stats**: Current algorithm state
  - **card_reviews**: Historical data for retraining
  
✓ Tracks:
  - current_interval_days
  - ease_factor
  - mastery_level (derived from interval)
  - total_reviews, successful_reviews, failed_reviews

### Pattern 2: Denormalization for Performance
✓ **user_stats** table: Dashboard-specific metrics
  - Reduces need for complex aggregations
  - Updated via trigger on study_sessions
  
✓ **card_stats** table: Pre-calculated mastery_level
  - Avoids interval-to-level conversion on every query

Issue: Trigger for streak calculation is inefficient (see section 5)

### Pattern 3: Soft Delete Implementation
✓ All tables have deleted_at column
✓ Database views and queries filter deleted_at IS NULL
✓ Soft delete triggers remove historical data constraints

Issue: Most indexes don't filter on deleted_at
  - Suggested: Use WHERE deleted_at IS NULL in index creation

### Pattern 4: Array Types for Tags
✓ Uses PostgreSQL native ARRAY(String)
✓ GIN indexes on tag columns for fast filtering
✓ Supports OVERLAP operator for tag matching

Concern: Array scalability if tags grow unbounded
  - No limit on tags per card/material
  - Recommended: Add constraint on array length if needed

### Pattern 5: Audit Trail with Timestamps
✓ created_at, updated_at, deleted_at on all relevant tables
✓ Triggers maintain updated_at automatically
✓ No explicit user_id tracking for who made changes
  - Fine for single-user app, but limits audit capability

### Pattern 6: Multi-Trigger Architecture
Used triggers:
1. `update_updated_at_column()` - Generic timestamp updater
2. `update_mastery_level()` - Derives mastery from interval
3. `update_user_stats_from_session()` - Aggregates to user_stats

⚠ Warning: Triggers add overhead. Verify performance in production.

---

## 5. MIGRATION FILES & STRUCTURE

### Current State
- **Alembic Version**: Configured in `alembic.ini`
- **Environment**: `/home/user/cards-study/backend/alembic/env.py`
- **Migration Template**: `/home/user/cards-study/backend/alembic/script.py.mako`
- **Versions Directory**: EMPTY (no migrations created yet)

### Critical Issue: No Migration History
The project currently initializes schema from SQL file:
```yaml
# docker-compose.yml
volumes:
  - ./docs/database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
```

**Problems:**
1. Schema changes must be manual SQL edits
2. No version control of migrations
3. Hard to track what changed and when
4. Development database could diverge from production
5. No rollback capability

### Migration Configuration

**alembic.ini settings:**
✓ PostgreSQL dialect configured
✓ prepend_sys_path set correctly
✓ Models imported in env.py (app.models)

**env.py quality:**
✓ Reads DATABASE_URL from settings
✓ Imports all models for autogenerate
✓ Has both offline and online modes
✓ Properly imports Base from database.py

### Recommended Migration Setup

1. **Create initial migration** from current schema:
   ```bash
   cd /home/user/cards-study/backend
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

2. **Future workflow:**
   ```bash
   # After changing a model
   alembic revision --autogenerate -m "Add index to card_reviews"
   # Review the generated migration
   alembic upgrade head
   ```

3. **Add to version control:**
   ```bash
   # Track migrations/versions/*.py files in git
   git add alembic/versions/
   ```

---

## 6. ORM CONFIGURATION & SQLALCHEMY SETUP

### Database Connection Configuration
**File**: `/home/user/cards-study/backend/app/utils/database.py`

✓ **Strengths:**
```python
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,        # 5 (configurable)
    max_overflow=settings.DB_MAX_OVERFLOW,  # 10 (configurable)
    pool_pre_ping=True,    # ✓ Prevents stale connections
    pool_recycle=3600,     # ✓ Recycles every hour
    echo=settings.DB_ECHO,
)
```

✓ **Session Management:**
```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### ORM Model Configuration
**Base Class**: `declarative_base()` from SQLAlchemy

**All models inherit from Base** and define:
- UUID primary keys (good for distributed systems)
- Proper type hints using SQLAlchemy Column types
- CHECK constraints at column level
- Timestamp columns with server defaults
- `to_dict()` methods for serialization

### Query Patterns Observed

**1. Basic filtering** (flashcards.py line ~95):
```python
query = db.query(Flashcard).filter(
    Flashcard.user_id == uuid.UUID(user_id),
    Flashcard.deleted_at.is_(None)
)
```
✓ Good: Uses filter for safety
⚠ Issue: Multiple conditions could benefit from composite indexes

**2. Pagination** (flashcards.py line ~110):
```python
offset = (page - 1) * page_size
flashcards = query.order_by(Flashcard.created_at.desc()).offset(offset).limit(page_size).all()
```
✓ Good: Proper limit/offset pagination
⚠ Issue: Could cache page counts

**3. Array filtering** (flashcards.py):
```python
if tags:
    query = query.filter(Flashcard.tags.overlap(tags))
```
✓ Good: Uses PostgreSQL overlap operator
✓ Index: GIN index on tags already defined

### Connection Pool Configuration

**Current Settings**:
- Pool size: 5
- Max overflow: 10
- Pre-ping: Enabled (connection validation)
- Recycle: 3600 seconds (1 hour)

**Analysis**:
- Pool size of 5 is conservative for web app
- Overflow of 10 provides safety buffer
- Pre-ping prevents "server closed connection" errors
- Recycle prevents long-idle connection issues

**Recommendations**:
- For production: Increase pool_size to 10-20
- Monitor actual connection usage
- Consider pgBouncer for external pooling if needed

### Type Safety
✓ All models use type hints
✓ UUID types with `as_uuid=True` converts to Python UUID objects
✓ DateTime with timezone awareness
✓ ARRAY type properly defined with element type

---

## 7. COMPREHENSIVE OPTIMIZATION RECOMMENDATIONS

### Tier 1: Critical (Do First)
1. **Enable ORM Relationships** (~30 min)
   - Uncomment and properly define relationships
   - Adds back_populates for bidirectional access
   - Enables eager loading with joinedload/selectinload
   - Prevents N+1 query problems

2. **Create Migration History** (~1 hour)
   - Run `alembic revision --autogenerate -m "Initial schema"`
   - Ensures version control of schema changes
   - Enables safe rollbacks

3. **Add Missing Indexes** (15 min)
   - Implement the 5 HIGH/MEDIUM priority indexes from section 2
   - Run EXPLAIN ANALYZE on slow queries
   - Test with representative data

### Tier 2: Important (Next Sprint)
4. **Fix Streak Calculation Trigger**
   - Current trigger is inefficient (complex query in every INSERT)
   - Consider moving to application logic
   - Or optimize trigger with CTE instead of nested subqueries

5. **Add Composite Indexes**
   - Replace separate single-column indexes with composites where used together
   - E.g., (user_id, status, deleted_at) instead of three separate indexes

6. **Monitor Query Performance**
   - Enable query logging in development: `DB_ECHO=True`
   - Use pgAdmin to analyze slow queries
   - Set up EXPLAIN ANALYZE for dashboard queries

### Tier 3: Nice to Have (Later)
7. **Connection Pool Tuning**
   - Monitor actual connection usage
   - Adjust pool_size based on concurrent users
   - Consider external pooler (pgBouncer) for scaling

8. **Audit Trail Enhancement**
   - Add user_id to audit who made changes
   - Consider trigger-based change logging table

9. **Caching Strategy**
   - Cache user_stats queries (changes only per session)
   - Cache mastery level breakdowns
   - Use Redis for hot data

10. **Full-Text Search Optimization**
    - Already implemented with GIN indexes
    - Consider materialized views for complex searches
    - Monitor tsvector performance with large texts

---

## 8. RISK ASSESSMENT

### High Risk
🔴 **N+1 Query Problem**: Disabled relationships will cause performance issues at scale
   - Fix: Enable relationships and use eager loading

🔴 **No Rollback Path**: SQL-only schema initialization
   - Fix: Set up Alembic migrations

### Medium Risk
🟡 **Inefficient Streak Trigger**: Complex subqueries in trigger on every INSERT
   - Fix: Profile and optimize or move to app logic

🟡 **Soft Delete Filter Burden**: Every query must filter deleted_at
   - Fix: Use filtered indexes to eliminate this

### Low Risk
🟢 **Connection Pool**: Conservative settings but adequate for development
   - Monitor in production, adjust as needed

🟢 **Type Safety**: Well-implemented with Python type hints

---

## Summary Table

| Category | Status | Priority | Details |
|----------|--------|----------|---------|
| **Schema Normalization** | ✓ Good | - | 3NF normalized with intentional denormalization |
| **Indexes** | ⚠ Incomplete | HIGH | 5 missing indexes for query performance |
| **Relationships** | ✗ Disabled | CRITICAL | All ORM relationships commented out |
| **Migrations** | ✗ Empty | CRITICAL | No migration history, SQL-only setup |
| **Connection Pool** | ✓ Good | - | Conservative but appropriate for dev |
| **Query Patterns** | ✓ Safe | - | Proper parameterization, no SQL injection |
| **Soft Delete** | ✓ Implemented | - | Good pattern, but impacts index strategy |
| **FSRS Support** | ✓ Excellent | - | Well-designed algorithm state tracking |
| **Audit Trail** | ⚠ Partial | MEDIUM | Timestamps present, but no user tracking |
| **RLS Policies** | ✓ Defined | - | Comprehensive row-level security setup |

