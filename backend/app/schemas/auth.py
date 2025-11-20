"""
Authentication schemas - Request and response models for auth endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class SignupRequest(BaseModel):
    """Request schema for user signup."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: uuid.UUID
    email: str
    name: str
    avatar_url: Optional[str] = None
    daily_card_limit: int
    study_reminder_time: Optional[str] = None
    timezone: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    """Request schema for updating user profile."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    daily_card_limit: Optional[int] = Field(None, ge=1, le=500)
    study_reminder_time: Optional[str] = None
    timezone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    """Request schema for changing password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
