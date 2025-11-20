"""
StudyMaterial model - Stores extracted text from PDFs or pasted content.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, ARRAY, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.utils.database import Base


class StudyMaterial(Base):
    """
    StudyMaterial model.
    Stores extracted text from uploaded PDFs or pasted content.
    NOTE: Original PDF files are NOT stored to save storage costs.
    """
    __tablename__ = "study_materials"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Content
    filename = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=False)
    word_count = Column(Integer)

    # Categorization
    subject_category = Column(String(100), nullable=True)
    tags = Column(ARRAY(String), default=[])

    # Processing status
    status = Column(
        String(20),
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')"),
        default="pending"
    )
    processed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    # user = relationship("User", back_populates="study_materials")
    # flashcards = relationship("Flashcard", back_populates="material", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')", name="check_status"),
    )

    def __repr__(self):
        return f"<StudyMaterial(id={self.id}, filename={self.filename}, status={self.status})>"

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "filename": self.filename,
            "extracted_text": self.extracted_text,
            "word_count": self.word_count,
            "subject_category": self.subject_category,
            "tags": self.tags or [],
            "status": self.status,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
