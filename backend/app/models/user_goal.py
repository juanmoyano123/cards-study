"""
UserGoal model - User daily study goals and preferences.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.utils.database import Base


class UserGoal(Base):
    """
    UserGoal model.
    Stores user's daily study goals and preferences.
    """
    __tablename__ = "user_goals"

    # Primary key (also foreign key to users)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    # Goal configuration
    daily_cards_goal = Column(Integer, default=20, nullable=False)
    goal_type = Column(String(50), default="easy_ratings", nullable=False)  # 'easy_ratings', 'cards_studied', 'study_minutes'

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<UserGoal(user_id={self.user_id}, daily_goal={self.daily_cards_goal}, type={self.goal_type})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "user_id": str(self.user_id),
            "daily_cards_goal": self.daily_cards_goal,
            "goal_type": self.goal_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
