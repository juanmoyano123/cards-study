"""
Authentication routes - Signup, login, logout, and user management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    UpdateUserRequest,
)
from app.utils.database import get_db
from app.utils.auth import (
    create_user,
    authenticate_user,
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.config import settings

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new user account.

    - **email**: Valid email address
    - **password**: Password (min 8 characters)
    - **name**: User's full name

    Returns JWT access token.
    """
    # Create user
    user = create_user(
        db=db,
        email=request.email,
        password=request.password,
        name=request.name
    )

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with email and password.

    - **email**: User email
    - **password**: User password

    Returns JWT access token.
    """
    # Authenticate user
    user = authenticate_user(db, request.email, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login timestamp
    from datetime import datetime
    user.last_login_at = datetime.utcnow()
    db.commit()

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.

    Requires authentication.
    """
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.

    - **name**: Updated name (optional)
    - **daily_card_limit**: Updated daily card limit (optional)
    - **study_reminder_time**: Updated reminder time (optional)
    - **timezone**: Updated timezone (optional)

    Requires authentication.
    """
    # Update fields if provided
    if request.name is not None:
        current_user.name = request.name

    if request.daily_card_limit is not None:
        current_user.daily_card_limit = request.daily_card_limit

    if request.study_reminder_time is not None:
        from datetime import time
        # Parse time string (HH:MM format)
        try:
            hour, minute = map(int, request.study_reminder_time.split(":"))
            current_user.study_reminder_time = time(hour=hour, minute=minute)
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time format. Use HH:MM format."
            )

    if request.timezone is not None:
        current_user.timezone = request.timezone

    db.commit()
    db.refresh(current_user)

    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout current user.

    Note: With JWT tokens, logout is handled client-side by discarding the token.
    This endpoint is provided for consistency but doesn't invalidate the token.

    Requires authentication.
    """
    return {"message": "Successfully logged out"}
