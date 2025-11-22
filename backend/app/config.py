"""
Configuration settings for StudyMaster backend.
Uses pydantic-settings for type-safe environment variable management.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "StudyMaster API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # Database
    DATABASE_URL: str = "postgresql://studymaster:devpass@localhost:5432/studymaster"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False  # Log SQL queries

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Anthropic Claude
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    ANTHROPIC_MAX_TOKENS: int = 4000
    ANTHROPIC_TEMPERATURE: float = 0.7

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:8081",  # Expo dev server
        "http://localhost:19006",  # Expo web
        "http://172.20.13.209:8081",  # Local network access
        "exp://172.20.13.209:8081",  # Expo Go
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    FLASHCARD_GENERATION_LIMIT_PER_HOUR: int = 10
    MATERIAL_UPLOAD_LIMIT_PER_HOUR: int = 20

    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_EXTENSIONS: list[str] = [".pdf"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"

    # Testing
    TESTING: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to ensure settings are only loaded once.
    """
    return Settings()


# Global settings instance
settings = get_settings()
