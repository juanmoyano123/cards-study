"""
StudySession model - Tracks daily study sessions for streaks and analytics.
"""

from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.utils.database import Base


class StudySession(Base):
    """
    StudySession model.
    Tracks daily study sessions for streaks and analytics.
    """
    __tablename__ = "study_sessions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Session data
    date = Column(Date, nullable=False)
    cards_studied = Column(Integer, default=0)
    cards_again = Column(Integer, default=0)   # Rated 1
    cards_hard = Column(Integer, default=0)    # Rated 2
    cards_good = Column(Integer, default=0)    # Rated 3
    cards_easy = Column(Integer, default=0)    # Rated 4

    # Time tracking
    time_spent_minutes = Column(Integer, default=0)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)

    # Streak tracking
    streak_day = Column(Integer, default=0)  # Day number in current streak

    # Session context
    pomodoro_sessions = Column(Integer, default=0)  # Number of Pomodoro timers completed

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # user = relationship("User", back_populates="study_sessions")
    # reviews = relationship("CardReview", back_populates="session")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="unique_user_date"),
    )

    def __repr__(self):
        return f"<StudySession(id={self.id}, date={self.date}, cards_studied={self.cards_studied})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "date": self.date.isoformat() if self.date else None,
            "cards_studied": self.cards_studied,
            "cards_again": self.cards_again,
            "cards_hard": self.cards_hard,
            "cards_good": self.cards_good,
            "cards_easy": self.cards_easy,
            "time_spent_minutes": self.time_spent_minutes,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "streak_day": self.streak_day,
            "pomodoro_sessions": self.pomodoro_sessions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
