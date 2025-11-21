"""
ORM Relationship Fixes

This file shows how to fix the disabled relationships in SQLAlchemy models.
All relationships are currently commented out and need to be enabled.

CRITICAL: Enabling these relationships will:
1. Fix N+1 query problems
2. Enable eager loading with joinedload() and selectinload()
3. Allow safe cascading deletes
4. Improve code readability

Files to update:
- backend/app/models/user.py
- backend/app/models/flashcard.py
- backend/app/models/study_material.py
- backend/app/models/card_stats.py
- backend/app/models/card_review.py
- backend/app/models/study_session.py
- backend/app/models/user_stats.py

Time to implement: ~30 minutes
"""

# ============================================================================
# PART 1: User Model Relationships
# ============================================================================
# File: backend/app/models/user.py

# ADD THESE IMPORTS:
from sqlalchemy.orm import relationship

# ADD THESE RELATIONSHIPS TO User CLASS:
class User(Base):
    __tablename__ = "users"
    
    # ... existing columns ...
    
    # Add these relationships:
    study_materials = relationship(
        "StudyMaterial",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="StudyMaterial.user_id"
    )
    flashcards = relationship(
        "Flashcard",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Flashcard.user_id"
    )
    card_stats = relationship(
        "CardStats",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="CardStats.user_id"
    )
    card_reviews = relationship(
        "CardReview",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="CardReview.user_id"
    )
    study_sessions = relationship(
        "StudySession",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="StudySession.user_id"
    )
    user_stats = relationship(
        "UserStats",
        back_populates="user",
        uselist=False,  # One-to-one
        cascade="all, delete-orphan",
        foreign_keys="UserStats.user_id"
    )


# ============================================================================
# PART 2: StudyMaterial Model Relationships
# ============================================================================
# File: backend/app/models/study_material.py

# UNCOMMENT AND UPDATE (lines 51-53):

class StudyMaterial(Base):
    __tablename__ = "study_materials"
    
    # ... existing columns ...
    
    # UNCOMMENT THESE (replace lines 51-53):
    user = relationship(
        "User",
        back_populates="study_materials",
        foreign_keys="StudyMaterial.user_id"
    )
    flashcards = relationship(
        "Flashcard",
        back_populates="material",
        cascade="all, delete-orphan",
        foreign_keys="Flashcard.material_id"
    )


# ============================================================================
# PART 3: Flashcard Model Relationships
# ============================================================================
# File: backend/app/models/flashcard.py

# UNCOMMENT AND UPDATE (lines 51-55):

class Flashcard(Base):
    __tablename__ = "flashcards"
    
    # ... existing columns ...
    
    # UNCOMMENT AND UPDATE THESE (replace lines 51-55):
    user = relationship(
        "User",
        back_populates="flashcards",
        foreign_keys="Flashcard.user_id"
    )
    material = relationship(
        "StudyMaterial",
        back_populates="flashcards",
        foreign_keys="Flashcard.material_id"
    )
    stats = relationship(
        "CardStats",
        back_populates="card",
        uselist=False,  # One-to-one relationship
        cascade="all, delete-orphan",
        foreign_keys="CardStats.card_id"
    )
    reviews = relationship(
        "CardReview",
        back_populates="card",
        cascade="all, delete-orphan",
        foreign_keys="CardReview.card_id"
    )


# ============================================================================
# PART 4: CardStats Model Relationships
# ============================================================================
# File: backend/app/models/card_stats.py

# UNCOMMENT AND UPDATE (line 52):

class CardStats(Base):
    __tablename__ = "card_stats"
    
    # ... existing columns ...
    
    # UNCOMMENT AND UPDATE THESE (replace line 52):
    card = relationship(
        "Flashcard",
        back_populates="stats",
        foreign_keys="CardStats.card_id"
    )
    user = relationship(
        "User",
        back_populates="card_stats",
        foreign_keys="CardStats.user_id"
    )


# ============================================================================
# PART 5: CardReview Model Relationships
# ============================================================================
# File: backend/app/models/card_review.py

# UNCOMMENT AND UPDATE (lines 55-58):

class CardReview(Base):
    __tablename__ = "card_reviews"
    
    # ... existing columns ...
    
    # UNCOMMENT AND UPDATE THESE (replace lines 55-58):
    card = relationship(
        "Flashcard",
        back_populates="reviews",
        foreign_keys="CardReview.card_id"
    )
    user = relationship(
        "User",
        back_populates="card_reviews",
        foreign_keys="CardReview.user_id"
    )
    session = relationship(
        "StudySession",
        back_populates="reviews",
        foreign_keys="CardReview.session_id"
    )


# ============================================================================
# PART 6: StudySession Model Relationships
# ============================================================================
# File: backend/app/models/study_session.py

# UNCOMMENT AND UPDATE (lines 50-52):

class StudySession(Base):
    __tablename__ = "study_sessions"
    
    # ... existing columns ...
    
    # UNCOMMENT AND UPDATE THESE (replace lines 50-52):
    user = relationship(
        "User",
        back_populates="study_sessions",
        foreign_keys="StudySession.user_id"
    )
    reviews = relationship(
        "CardReview",
        back_populates="session",
        cascade="all, delete-orphan",
        foreign_keys="CardReview.session_id"
    )


# ============================================================================
# PART 7: UserStats Model Relationships
# ============================================================================
# File: backend/app/models/user_stats.py

# UNCOMMENT AND UPDATE (line 49):

class UserStats(Base):
    __tablename__ = "user_stats"
    
    # ... existing columns ...
    
    # UNCOMMENT AND UPDATE THIS (replace line 49):
    user = relationship(
        "User",
        back_populates="user_stats",
        foreign_keys="UserStats.user_id"
    )


# ============================================================================
# PART 8: EXAMPLE USAGE AFTER FIXING RELATIONSHIPS
# ============================================================================

# Now you can use eager loading to prevent N+1 queries!

from sqlalchemy.orm import joinedload, selectinload

# BEFORE (N+1 problem):
# def get_flashcards_with_stats(user_id: str, db: Session):
#     flashcards = db.query(Flashcard).filter(
#         Flashcard.user_id == user_id
#     ).all()
#     # N+1 queries: This causes separate queries for each card's stats
#     return [
#         {
#             "card": fc,
#             "stats": db.query(CardStats).filter(
#                 CardStats.card_id == fc.id
#             ).first()
#         }
#         for fc in flashcards
#     ]

# AFTER (Fixed with eager loading):
def get_flashcards_with_stats(user_id: str, db: Session):
    """
    Get all flashcards for a user with their stats in ONE query
    using eager loading. Much more efficient!
    """
    import uuid
    flashcards = db.query(Flashcard).options(
        joinedload(Flashcard.stats),  # Eager load stats
        joinedload(Flashcard.reviews)  # Also load reviews if needed
    ).filter(
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.deleted_at.is_(None)
    ).all()
    
    # Now access stats without additional queries
    result = [
        {
            "id": str(fc.id),
            "question": fc.question,
            "answer": fc.answer,
            "stats": {
                "due_date": fc.stats.due_date if fc.stats else None,
                "mastery_level": fc.stats.mastery_level if fc.stats else None,
                "total_reviews": fc.stats.total_reviews if fc.stats else 0,
            }
        }
        for fc in flashcards
    ]
    return result


# Example 2: Using selectinload for many-to-one relationships
def get_user_dashboard(user_id: str, db: Session):
    """
    Get user with all their data in one optimized query set
    """
    import uuid
    user = db.query(User).options(
        selectinload(User.study_sessions),
        selectinload(User.user_stats),
        selectinload(User.flashcards).joinedload(Flashcard.stats),
        selectinload(User.card_reviews),
    ).filter(
        User.id == uuid.UUID(user_id)
    ).first()
    
    if user:
        return {
            "user": user.to_dict(),
            "total_flashcards": len(user.flashcards),
            "total_sessions": len(user.study_sessions),
            "stats": user.user_stats.to_dict() if user.user_stats else None,
            "total_reviews": len(user.card_reviews),
        }
    return None


# Example 3: Using relationships in queries
def get_active_cards_due_today(user_id: str, db: Session):
    """
    Get active flashcards due today for a user using relationships
    """
    import uuid
    from datetime import date
    
    # Using relationship joins (much cleaner!)
    cards = db.query(Flashcard).join(
        CardStats, Flashcard.id == CardStats.card_id
    ).filter(
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.status == 'active',
        CardStats.due_date <= date.today(),
        Flashcard.deleted_at.is_(None)
    ).options(
        joinedload(Flashcard.stats)
    ).all()
    
    return [
        {
            "id": str(card.id),
            "question": card.question,
            "answer": card.answer,
            "due_date": card.stats.due_date,
            "mastery_level": card.stats.mastery_level,
        }
        for card in cards
    ]


# ============================================================================
# PART 9: MIGRATION STEPS
# ============================================================================
"""
1. Back up your database (or use Docker - you can recreate easily)

2. Enable relationships in all model files (see parts 1-7 above)

3. Test locally:
   - Start Docker: docker-compose up -d
   - Run tests to ensure relationships work
   - Use EXPLAIN ANALYZE to verify indexes are used

4. Create Alembic migration (optional, can do later):
   cd backend
   alembic revision --autogenerate -m "Enable ORM relationships"
   alembic upgrade head

5. Update route files to use eager loading:
   - Replace manual queries with eager-loaded queries
   - Use joinedload() and selectinload()

6. Monitor performance improvements with DB_ECHO=True
"""

