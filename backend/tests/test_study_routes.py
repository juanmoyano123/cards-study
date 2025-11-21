"""
Tests for Study Routes - Spaced repetition study mode and review tracking.

Tests cover:
- Getting study queue (empty, with due cards, priority)
- Submitting reviews (stats update, review record)
- Session tracking
- Edge cases
"""

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.flashcard import Flashcard
from app.models.card_stats import CardStats
from app.models.card_review import CardReview
from app.models.study_session import StudySession
from app.models.user_stats import UserStats


class TestStudyQueue:
    """Test study queue endpoint."""

    def test_get_study_queue_empty(self, client: TestClient, auth_headers: dict):
        """Test getting study queue when no cards exist."""
        response = client.get("/study/queue", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["total_due"] == 0
        assert data["new_cards"] == 0
        assert data["review_cards"] == 0
        assert data["overdue_cards"] == 0
        assert len(data["cards"]) == 0

    def test_get_study_queue_with_due_cards(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test getting study queue with cards due today."""
        # Create 3 flashcards
        flashcards = []
        for i in range(3):
            flashcard = Flashcard(
                user_id=test_user_id,
                question=f"Question {i}?",
                answer=f"Answer {i}",
                status="active"
            )
            db.add(flashcard)
            db.flush()

            # Create stats - all due today
            stats = CardStats(
                card_id=flashcard.id,
                user_id=test_user_id,
                due_date=date.today(),
                current_interval_days=i + 1,
                total_reviews=i
            )
            db.add(stats)
            flashcards.append(flashcard)

        db.commit()

        # Get study queue
        response = client.get("/study/queue", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["total_due"] == 3
        assert data["review_cards"] == 3
        assert data["overdue_cards"] == 0
        assert len(data["cards"]) == 3

    def test_get_study_queue_overdue_first(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that overdue cards appear first in queue."""
        # Create cards with different due dates
        yesterday = date.today() - timedelta(days=1)
        tomorrow = date.today() + timedelta(days=1)

        # Overdue card
        flashcard_overdue = Flashcard(
            user_id=test_user_id,
            question="Overdue question?",
            answer="Overdue answer",
            status="active"
        )
        db.add(flashcard_overdue)
        db.flush()

        stats_overdue = CardStats(
            card_id=flashcard_overdue.id,
            user_id=test_user_id,
            due_date=yesterday,
            current_interval_days=5,
            total_reviews=3
        )
        db.add(stats_overdue)

        # Due today card
        flashcard_today = Flashcard(
            user_id=test_user_id,
            question="Today question?",
            answer="Today answer",
            status="active"
        )
        db.add(flashcard_today)
        db.flush()

        stats_today = CardStats(
            card_id=flashcard_today.id,
            user_id=test_user_id,
            due_date=date.today(),
            current_interval_days=3,
            total_reviews=2
        )
        db.add(stats_today)

        # Future card (shouldn't appear)
        flashcard_future = Flashcard(
            user_id=test_user_id,
            question="Future question?",
            answer="Future answer",
            status="active"
        )
        db.add(flashcard_future)
        db.flush()

        stats_future = CardStats(
            card_id=flashcard_future.id,
            user_id=test_user_id,
            due_date=tomorrow,
            current_interval_days=7,
            total_reviews=5
        )
        db.add(stats_future)

        db.commit()

        # Get study queue
        response = client.get("/study/queue", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["total_due"] == 2  # Only overdue + today
        assert data["overdue_cards"] == 1
        assert len(data["cards"]) == 2

        # Overdue card should be first
        assert data["cards"][0]["id"] == str(flashcard_overdue.id)

    def test_get_study_queue_includes_new_cards(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that new cards are included in queue."""
        # Create a new card (no stats yet)
        flashcard_new = Flashcard(
            user_id=test_user_id,
            question="New question?",
            answer="New answer",
            status="active"
        )
        db.add(flashcard_new)
        db.commit()

        # Get study queue
        response = client.get("/study/queue?include_new=true", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["new_cards"] == 1
        assert len(data["cards"]) == 1


class TestSubmitReview:
    """Test submit review endpoint."""

    def test_submit_review_updates_stats(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that submitting a review updates card stats correctly."""
        # Create a flashcard with stats
        flashcard = Flashcard(
            user_id=test_user_id,
            question="Test question?",
            answer="Test answer",
            status="active"
        )
        db.add(flashcard)
        db.flush()

        stats = CardStats(
            card_id=flashcard.id,
            user_id=test_user_id,
            due_date=date.today(),
            current_interval_days=5,
            ease_factor=2.5,
            total_reviews=2
        )
        db.add(stats)
        db.commit()

        # Submit review with rating 3 (Good)
        response = client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 3,
                "time_spent_seconds": 15
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert data["card_id"] == str(flashcard.id)
        assert data["new_interval_days"] > 5  # Should increase
        assert "new_due_date" in data

        # Check stats were updated
        db.refresh(stats)
        assert stats.total_reviews == 3
        assert stats.successful_reviews == 1
        assert stats.last_reviewed_at is not None

    def test_submit_review_creates_review_record(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that submitting a review creates a CardReview record."""
        # Create a flashcard with stats
        flashcard = Flashcard(
            user_id=test_user_id,
            question="Test question?",
            answer="Test answer",
            status="active"
        )
        db.add(flashcard)
        db.flush()

        stats = CardStats(
            card_id=flashcard.id,
            user_id=test_user_id,
            due_date=date.today()
        )
        db.add(stats)
        db.commit()

        # Submit review
        response = client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 3,
                "time_spent_seconds": 20
            },
            headers=auth_headers
        )

        assert response.status_code == 200

        # Check CardReview was created
        review = db.query(CardReview).filter(
            CardReview.card_id == flashcard.id
        ).first()

        assert review is not None
        assert review.rating == 3
        assert review.time_spent_seconds == 20
        assert review.user_id == test_user_id

    def test_submit_review_rating_1_resets_card(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that rating 1 (Again) resets the card."""
        # Create a card with high interval
        flashcard = Flashcard(
            user_id=test_user_id,
            question="Hard question?",
            answer="Hard answer",
            status="active"
        )
        db.add(flashcard)
        db.flush()

        stats = CardStats(
            card_id=flashcard.id,
            user_id=test_user_id,
            due_date=date.today(),
            current_interval_days=30,
            ease_factor=2.5,
            total_reviews=5
        )
        db.add(stats)
        db.commit()

        # Submit review with rating 1 (Again)
        response = client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 1
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        # Should reset to 0 interval
        assert data["new_interval_days"] == 0
        assert data["mastery_level"] == "learning"

        # Check stats
        db.refresh(stats)
        assert stats.current_interval_days == 0
        assert stats.failed_reviews == 1


class TestStudySession:
    """Test study session tracking."""

    def test_session_tracking(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that study sessions are created and updated."""
        # Create a flashcard
        flashcard = Flashcard(
            user_id=test_user_id,
            question="Session test?",
            answer="Session answer",
            status="active"
        )
        db.add(flashcard)
        db.flush()

        stats = CardStats(
            card_id=flashcard.id,
            user_id=test_user_id,
            due_date=date.today()
        )
        db.add(stats)
        db.commit()

        # Submit first review (should create session)
        client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 3,
                "time_spent_seconds": 10
            },
            headers=auth_headers
        )

        # Check session was created
        session = db.query(StudySession).filter(
            StudySession.user_id == test_user_id,
            StudySession.date == date.today()
        ).first()

        assert session is not None
        assert session.cards_studied == 1
        assert session.cards_good == 1

    def test_get_current_session(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test getting current session summary."""
        # Create a session manually
        session = StudySession(
            user_id=test_user_id,
            date=date.today(),
            cards_studied=10,
            cards_again=2,
            cards_hard=3,
            cards_good=4,
            cards_easy=1,
            time_spent_minutes=15
        )
        db.add(session)
        db.commit()

        # Get session
        response = client.get("/study/session", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()

        assert data["cards_studied"] == 10
        assert data["cards_again"] == 2
        assert data["cards_good"] == 4
        assert data["time_spent_minutes"] == 15


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_submit_review_nonexistent_card(
        self, client: TestClient, auth_headers: dict
    ):
        """Test submitting review for non-existent card returns 404."""
        response = client.post(
            "/study/review",
            json={
                "card_id": "00000000-0000-0000-0000-000000000000",
                "rating": 3
            },
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_submit_review_invalid_rating(
        self, client: TestClient, auth_headers: dict, db: Session, test_user_id: str
    ):
        """Test that invalid ratings are rejected."""
        flashcard = Flashcard(
            user_id=test_user_id,
            question="Test?",
            answer="Test",
            status="active"
        )
        db.add(flashcard)
        db.commit()

        # Rating too low
        response = client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 0
            },
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

        # Rating too high
        response = client.post(
            "/study/review",
            json={
                "card_id": str(flashcard.id),
                "rating": 5
            },
            headers=auth_headers
        )

        assert response.status_code == 422
