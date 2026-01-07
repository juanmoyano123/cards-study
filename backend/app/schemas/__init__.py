"""
Schemas package - Pydantic models for request and response validation.
"""

from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UpdateUserRequest,
    ChangePasswordRequest,
)

from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    MaterialListResponse,
    MaterialExtractRequest,
)

from app.schemas.flashcard import (
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardResponse,
    FlashcardWithStats,
    FlashcardListResponse,
    FlashcardGenerateRequest,
    FlashcardGenerateResponse,
    FlashcardConfirmRequest,
)

from app.schemas.goal import (
    UserGoalResponse,
    UserGoalUpdate,
    DailyProgressResponse,
)

__all__ = [
    # Auth
    "SignupRequest",
    "LoginRequest",
    "TokenResponse",
    "UserResponse",
    "UpdateUserRequest",
    "ChangePasswordRequest",
    # Material
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialResponse",
    "MaterialListResponse",
    "MaterialExtractRequest",
    # Flashcard
    "FlashcardCreate",
    "FlashcardUpdate",
    "FlashcardResponse",
    "FlashcardWithStats",
    "FlashcardListResponse",
    "FlashcardGenerateRequest",
    "FlashcardGenerateResponse",
    "FlashcardConfirmRequest",
    # Goal
    "UserGoalResponse",
    "UserGoalUpdate",
    "DailyProgressResponse",
]
