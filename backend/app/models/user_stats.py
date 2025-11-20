"""
UserStats model - Denormalized table for fast dashboard queries.
"""

from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.database import Base


class UserStats(Base):
    """
    UserStats model.
    Denormalized table for fast dashboard queries.
    """
    __tablename__ = "user_stats"

    # Primary key (also foreign key to users)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    # Streak tracking
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_study_date = Column(Date, nullable=True)

    # Totals (lifetime)
    total_cards_studied = Column(Integer, default=0)
    total_flashcards_created = Column(Integer, default=0)
    total_materials_uploaded = Column(Integer, default=0)
    total_study_minutes = Column(Integer, default=0)

    # Mastery breakdown
    cards_mastered = Column(Integer, default=0)    # mastery_level = 'mastered'
    cards_mature = Column(Integer, default=0)      # mastery_level = 'mature'
    cards_young = Column(Integer, default=0)       # mastery_level = 'young'
    cards_learning = Column(Integer, default=0)    # mastery_level = 'learning'
    cards_new = Column(Integer, default=0)         # mastery_level = 'new'

    # Performance metrics
    average_accuracy = Column(Float, nullable=True)  # % of cards rated Good or Easy
    average_daily_cards = Column(Integer, nullable=True)

    # Timestamp
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # user = relationship("User", back_populates="stats")

    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, current_streak={self.current_streak})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "user_id": str(self.user_id),
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "last_study_date": self.last_study_date.isoformat() if self.last_study_date else None,
            "total_cards_studied": self.total_cards_studied,
            "total_flashcards_created": self.total_flashcards_created,
            "total_materials_uploaded": self.total_materials_uploaded,
            "total_study_minutes": self.total_study_minutes,
            "cards_mastered": self.cards_mastered,
            "cards_mature": self.cards_mature,
            "cards_young": self.cards_young,
            "cards_learning": self.cards_learning,
            "cards_new": self.cards_new,
            "average_accuracy": self.average_accuracy,
            "average_daily_cards": self.average_daily_cards,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
