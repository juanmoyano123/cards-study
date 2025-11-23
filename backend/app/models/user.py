"""
User model - Extends Supabase auth.users with app-specific fields.
"""

from sqlalchemy import Column, String, Integer, DateTime, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from app.utils.database import Base


class User(Base):
    """
    User model.
    In production with Supabase Auth, this extends auth.users.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User info
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String)
    password_hash = Column(String, nullable=True)  # For local auth, None when using Supabase Auth

    # User preferences
    daily_card_limit = Column(Integer, default=100)
    study_reminder_time = Column(Time, nullable=True)
    timezone = Column(String(50), default="UTC")

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Soft delete
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "daily_card_limit": self.daily_card_limit,
            "study_reminder_time": self.study_reminder_time.isoformat() if self.study_reminder_time else None,
            "timezone": self.timezone,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }
