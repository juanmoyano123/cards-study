"""
CardStats model - Tracks FSRS algorithm state for each card.
"""

from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import date

from app.utils.database import Base


class CardStats(Base):
    """
    CardStats model.
    Tracks FSRS (Free Spaced Repetition Scheduler) algorithm state for each card.
    """
    __tablename__ = "card_stats"

    # Primary key (also foreign key to flashcards)
    card_id = Column(UUID(as_uuid=True), ForeignKey("flashcards.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # FSRS algorithm state
    total_reviews = Column(Integer, default=0)
    successful_reviews = Column(Integer, default=0)  # Reviews rated >= 3 (Good/Easy)
    failed_reviews = Column(Integer, default=0)      # Reviews rated < 3 (Again/Hard)

    # Current state
    current_interval_days = Column(Integer, default=0)  # Days until next review
    ease_factor = Column(Float, default=2.5)             # Multiplier for interval calculation
    due_date = Column(Date, default=func.current_date())  # Next review date

    # Performance metrics
    average_rating = Column(Float, nullable=True)       # Average of all ratings (1-4)
    average_time_seconds = Column(Integer, nullable=True)  # Average time spent per review

    # Mastery tracking
    mastery_level = Column(
        Column.VARCHAR(20),
        CheckConstraint("mastery_level IN ('new', 'learning', 'young', 'mature', 'mastered')"),
        default="new"
    )

    # Timestamps
    first_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # card = relationship("Flashcard", back_populates="stats")

    __table_args__ = (
        CheckConstraint("mastery_level IN ('new', 'learning', 'young', 'mature', 'mastered')", name="check_mastery_level"),
    )

    def __repr__(self):
        return f"<CardStats(card_id={self.card_id}, mastery_level={self.mastery_level}, due_date={self.due_date})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "card_id": str(self.card_id),
            "user_id": str(self.user_id),
            "total_reviews": self.total_reviews,
            "successful_reviews": self.successful_reviews,
            "failed_reviews": self.failed_reviews,
            "current_interval_days": self.current_interval_days,
            "ease_factor": self.ease_factor,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "average_rating": self.average_rating,
            "average_time_seconds": self.average_time_seconds,
            "mastery_level": self.mastery_level,
            "first_reviewed_at": self.first_reviewed_at.isoformat() if self.first_reviewed_at else None,
            "last_reviewed_at": self.last_reviewed_at.isoformat() if self.last_reviewed_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
