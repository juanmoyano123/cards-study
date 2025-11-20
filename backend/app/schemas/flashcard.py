"""
Flashcard schemas - Request and response models for flashcards.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class FlashcardCreate(BaseModel):
    """Request schema for creating a flashcard."""
    material_id: Optional[uuid.UUID] = None
    question: str = Field(..., min_length=1, max_length=2000)
    answer: str = Field(..., min_length=1, max_length=5000)
    explanation: Optional[str] = Field(None, max_length=3000)
    tags: List[str] = Field(default_factory=list)
    difficulty: int = Field(default=3, ge=1, le=5)
    ai_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)


class FlashcardUpdate(BaseModel):
    """Request schema for updating a flashcard."""
    question: Optional[str] = Field(None, min_length=1, max_length=2000)
    answer: Optional[str] = Field(None, min_length=1, max_length=5000)
    explanation: Optional[str] = Field(None, max_length=3000)
    tags: Optional[List[str]] = None
    difficulty: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = Field(None, pattern="^(draft|active|archived)$")


class FlashcardResponse(BaseModel):
    """Response schema for flashcard."""
    id: uuid.UUID
    user_id: uuid.UUID
    material_id: Optional[uuid.UUID]
    question: str
    answer: str
    explanation: Optional[str]
    tags: List[str]
    difficulty: int
    ai_confidence: Optional[float]
    is_edited: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FlashcardWithStats(FlashcardResponse):
    """Flashcard response with stats included."""
    total_reviews: int = 0
    successful_reviews: int = 0
    failed_reviews: int = 0
    current_interval_days: int = 0
    ease_factor: float = 2.5
    due_date: Optional[datetime] = None
    mastery_level: str = "new"
    last_reviewed_at: Optional[datetime] = None


class FlashcardListResponse(BaseModel):
    """Response schema for list of flashcards."""
    flashcards: List[FlashcardResponse]
    total: int
    page: int
    page_size: int


class FlashcardGenerateRequest(BaseModel):
    """Request schema for generating flashcards from material."""
    material_id: uuid.UUID
    card_count: int = Field(default=20, ge=1, le=100)
    difficulty: Optional[int] = Field(None, ge=1, le=5)


class FlashcardGenerateResponse(BaseModel):
    """Response schema for flashcard generation."""
    flashcards: List[FlashcardResponse]
    material_id: uuid.UUID
    total_generated: int
    status: str  # "success", "partial", "failed"


class FlashcardConfirmRequest(BaseModel):
    """Request schema for confirming draft flashcards."""
    flashcard_ids: List[uuid.UUID]
