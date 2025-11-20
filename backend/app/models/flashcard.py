"""
Flashcard model - Individual flashcards generated from study materials.
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, Float, DateTime, ForeignKey, ARRAY, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.utils.database import Base


class Flashcard(Base):
    """
    Flashcard model.
    Individual flashcards generated from study materials or created manually.
    """
    __tablename__ = "flashcards"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    material_id = Column(UUID(as_uuid=True), ForeignKey("study_materials.id", ondelete="CASCADE"), nullable=True)

    # Content
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)

    # Metadata
    tags = Column(ARRAY(String), default=[])
    difficulty = Column(Integer, CheckConstraint("difficulty BETWEEN 1 AND 5"), default=3)
    ai_confidence = Column(Float, CheckConstraint("ai_confidence BETWEEN 0 AND 1"), nullable=True)
    is_edited = Column(Boolean, default=False)

    # Status
    status = Column(
        String(20),
        CheckConstraint("status IN ('draft', 'active', 'archived')"),
        default="draft"
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    # user = relationship("User", back_populates="flashcards")
    # material = relationship("StudyMaterial", back_populates="flashcards")
    # stats = relationship("CardStats", back_populates="card", uselist=False, cascade="all, delete-orphan")
    # reviews = relationship("CardReview", back_populates="card", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("difficulty BETWEEN 1 AND 5", name="check_difficulty"),
        CheckConstraint("ai_confidence BETWEEN 0 AND 1", name="check_ai_confidence"),
        CheckConstraint("status IN ('draft', 'active', 'archived')", name="check_status"),
    )

    def __repr__(self):
        return f"<Flashcard(id={self.id}, status={self.status})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "material_id": str(self.material_id) if self.material_id else None,
            "question": self.question,
            "answer": self.answer,
            "explanation": self.explanation,
            "tags": self.tags or [],
            "difficulty": self.difficulty,
            "ai_confidence": self.ai_confidence,
            "is_edited": self.is_edited,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
