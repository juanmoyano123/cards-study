"""
CardReview model - History of all card reviews for analytics.
"""

from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.utils.database import Base


class CardReview(Base):
    """
    CardReview model.
    History of all card reviews for analytics and algorithm tuning.
    """
    __tablename__ = "card_reviews"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    card_id = Column(UUID(as_uuid=True), ForeignKey("flashcards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Review data
    rating = Column(
        Integer,
        CheckConstraint("rating IN (1, 2, 3, 4)"),
        nullable=False
    )
    # 1 = Again (forgot)
    # 2 = Hard (remembered with difficulty)
    # 3 = Good (remembered easily)
    # 4 = Easy (remembered instantly)

    # FSRS state at time of review
    previous_interval_days = Column(Integer, nullable=True)
    new_interval_days = Column(Integer, nullable=True)
    previous_ease_factor = Column(Float, nullable=True)
    new_ease_factor = Column(Float, nullable=True)

    # Performance
    time_spent_seconds = Column(Integer, nullable=True)
    due_date = Column(Date, nullable=True)

    # Context
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="SET NULL"), nullable=True, index=True)

    # Timestamp
    reviewed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # card = relationship("Flashcard", back_populates="reviews")
    # user = relationship("User")
    # session = relationship("StudySession", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating IN (1, 2, 3, 4)", name="check_rating"),
    )

    def __repr__(self):
        return f"<CardReview(id={self.id}, card_id={self.card_id}, rating={self.rating})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "card_id": str(self.card_id),
            "user_id": str(self.user_id),
            "rating": self.rating,
            "previous_interval_days": self.previous_interval_days,
            "new_interval_days": self.new_interval_days,
            "previous_ease_factor": self.previous_ease_factor,
            "new_ease_factor": self.new_ease_factor,
            "time_spent_seconds": self.time_spent_seconds,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "session_id": str(self.session_id) if self.session_id else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }
