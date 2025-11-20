"""
Pytest configuration and fixtures for StudyMaster backend tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.config import settings

# Will be used later when database models are created
# from app.utils.database import Base, get_db


@pytest.fixture(scope="session")
def test_settings():
    """
    Override settings for testing.
    """
    settings.TESTING = True
    settings.DEBUG = True
    settings.DATABASE_URL = "sqlite:///:memory:"
    return settings


@pytest.fixture(scope="function")
def client(test_settings):
    """
    Create a test client for the FastAPI app.
    """
    with TestClient(app) as test_client:
        yield test_client


# Database fixtures will be added later when models are created
# @pytest.fixture(scope="function")
# def db_session():
#     """
#     Create a test database session.
#     """
#     engine = create_engine(
#         "sqlite:///:memory:",
#         connect_args={"check_same_thread": False},
#         poolclass=StaticPool,
#     )
#     TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#     Base.metadata.create_all(bind=engine)
#
#     db = TestingSessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
#         Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_user_data():
    """
    Sample user data for testing.
    """
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "name": "Test User"
    }


@pytest.fixture
def sample_material_text():
    """
    Sample study material text for testing.
    """
    return """
    Python is a high-level, interpreted programming language.
    It was created by Guido van Rossum and first released in 1991.
    Python emphasizes code readability with its notable use of significant whitespace.
    The language provides constructs that enable clear programming on both small and large scales.
    """


@pytest.fixture
def sample_flashcard_data():
    """
    Sample flashcard data for testing.
    """
    return {
        "question": "Who created Python?",
        "answer": "Guido van Rossum",
        "tags": ["Python", "History"],
        "difficulty": 2
    }
