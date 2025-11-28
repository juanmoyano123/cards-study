"""
Authentication utilities - JWT verification and user authentication.
"""

from datetime import datetime, timedelta
from typing import Optional
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session

from app.config import settings
from app.utils.database import get_db
from app.models.user import User

# Security
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Bcrypt has a 72 byte limit, so we truncate the password to ensure compatibility.

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    # Truncate password to 72 bytes (bcrypt limit)
    password_bytes = password.encode('utf-8')[:72]
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.

    Bcrypt has a 72 byte limit, so we truncate the password to ensure compatibility.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise
    """
    # Truncate password to 72 bytes (bcrypt limit) - same as hash_password
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (typically user_id)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Get the current user ID from the JWT token.

    This is a FastAPI dependency that can be used to protect endpoints.

    Args:
        credentials: HTTP Bearer credentials from the request

    Returns:
        User ID as string

    Raises:
        HTTPException: If token is invalid or user_id is missing

    Usage:
        @app.get("/protected")
        async def protected_route(user_id: str = Depends(get_current_user_id)):
            return {"user_id": user_id}
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current user object from the database.

    This is a FastAPI dependency that can be used to get the full user object.

    Args:
        user_id: User ID from JWT token
        db: Database session

    Returns:
        User object

    Raises:
        HTTPException: If user is not found or deleted

    Usage:
        @app.get("/me")
        async def get_me(user: User = Depends(get_current_user)):
            return user.to_dict()
    """
    user = db.query(User).filter(
        User.id == uuid.UUID(user_id),
        User.deleted_at.is_(None)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email and password.

    Args:
        db: Database session
        email: User email
        password: Plain text password

    Returns:
        User object if authentication successful, None otherwise
    """
    user = db.query(User).filter(
        User.email == email,
        User.deleted_at.is_(None)
    ).first()

    if not user:
        return None

    # If using local auth (password_hash is set), verify password
    # If using Supabase Auth (password_hash is None), skip verification
    if user.password_hash:
        if not verify_password(password, user.password_hash):
            return None

    return user


def create_user(db: Session, email: str, password: str, name: str) -> User:
    """
    Create a new user in the database.

    Args:
        db: Database session
        email: User email
        password: Plain text password (will be hashed)
        name: User name

    Returns:
        Created user object

    Raises:
        HTTPException: If user already exists
    """
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    user = User(
        email=email,
        name=name,
        # Hash password for local auth. In production with Supabase Auth,
        # password_hash would be None and auth would be handled by Supabase
        password_hash=hash_password(password) if password else None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create user_stats entry
    from app.models.user_stats import UserStats
    user_stats = UserStats(user_id=user.id)
    db.add(user_stats)
    db.commit()

    return user
