"""
Material schemas - Request and response models for study materials.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class MaterialCreate(BaseModel):
    """Request schema for creating a study material (text only)."""
    filename: str = Field(..., min_length=1, max_length=500)
    extracted_text: str = Field(..., min_length=10)
    subject_category: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)


class MaterialUpdate(BaseModel):
    """Request schema for updating a study material."""
    filename: Optional[str] = Field(None, min_length=1, max_length=500)
    subject_category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None


class MaterialResponse(BaseModel):
    """Response schema for study material."""
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    extracted_text: str
    word_count: Optional[int]
    subject_category: Optional[str]
    tags: List[str]
    status: str
    processed_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    flashcard_count: int = 0  # Number of flashcards generated from this material

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    """Response schema for list of materials."""
    materials: List[MaterialResponse]
    total: int
    page: int
    page_size: int


class MaterialExtractRequest(BaseModel):
    """Request schema for extracting text from PDF or pasting text."""
    text: Optional[str] = None  # For pasted text
    filename: str = Field(..., min_length=1, max_length=500)
    subject_category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
