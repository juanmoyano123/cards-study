"""
Tests for FSRS (Free Spaced Repetition Scheduler) Algorithm.

Tests cover:
- New card rating behavior
- Review card ease factor updates
- Interval calculations
- Mastery level progression
- Next intervals preview
"""

import pytest
from datetime import date, timedelta
from app.services.fsrs import FSRS, fsrs


class TestFSRSNewCards:
    """Test FSRS behavior with new cards (first review)."""

    def test_new_card_rating_1_again(self):
        """Test that rating 1 (Again) on new card resets to 0 interval."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=1,
            current_interval=0,
            current_ease=2.5,
            review_count=0
        )

        assert new_interval == 0, "Rating 1 should reset to 0 interval"
        assert due == date.today(), "Should be due today"
        assert new_ease < 2.5, "Ease should be reduced"

    def test_new_card_rating_2_hard(self):
        """Test that rating 2 (Hard) on new card gives 1 day."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=2,
            current_interval=0,
            current_ease=2.5,
            review_count=0
        )

        assert new_interval == 1, "Rating 2 should give 1 day interval"
        assert due == date.today() + timedelta(days=1)
        assert new_ease <= 2.5, "Ease should not increase"

    def test_new_card_rating_3_good(self):
        """Test that rating 3 (Good) on new card gives 2-3 days."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=3,
            current_interval=0,
            current_ease=2.5,
            review_count=0
        )

        assert 1 <= new_interval <= 4, "Rating 3 should give 1-4 days"
        assert new_ease >= 2.5, "Ease should stay or increase"

    def test_new_card_rating_4_easy(self):
        """Test that rating 4 (Easy) on new card gives 4-7 days."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=4,
            current_interval=0,
            current_ease=2.5,
            review_count=0
        )

        assert new_interval >= 4, "Rating 4 should give at least 4 days"
        assert due == date.today() + timedelta(days=new_interval)
        assert new_ease >= 2.5, "Ease should stay or increase"


class TestFSRSReviewCards:
    """Test FSRS behavior with cards in review phase."""

    def test_review_card_rating_1_resets(self):
        """Test that rating 1 on review card resets to learning."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=1,
            current_interval=10,  # Was at 10 days
            current_ease=2.5,
            review_count=5
        )

        assert new_interval == 0, "Rating 1 should reset to learning"
        assert due == date.today(), "Should be due today"
        assert new_ease < 2.5, "Ease should be reduced significantly"

    def test_review_card_rating_2_hard(self):
        """Test that rating 2 (Hard) reduces ease and gives modest interval."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=2,
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )

        assert new_interval >= 10, "Interval should not decrease below current"
        assert new_interval <= 15, "Interval should increase modestly"
        assert new_ease < 2.5, "Ease should be reduced"

    def test_review_card_rating_3_good(self):
        """Test that rating 3 (Good) multiplies interval by ease factor."""
        current_interval = 10
        current_ease = 2.5

        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=3,
            current_interval=current_interval,
            current_ease=current_ease,
            review_count=5
        )

        expected_interval = int(current_interval * current_ease)
        assert new_interval == expected_interval, "Should multiply by ease"
        assert new_ease == current_ease, "Ease should stay same"

    def test_review_card_rating_4_easy(self):
        """Test that rating 4 (Easy) increases ease and gives bonus interval."""
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=4,
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )

        assert new_interval > 10 * 2.5, "Should get bonus interval"
        assert new_ease > 2.5, "Ease should increase"
        assert new_ease <= 3.0, "Ease should be capped at 3.0"


class TestFSRSMasteryLevels:
    """Test mastery level calculation."""

    def test_mastery_new_card(self):
        """Test that cards with 0 reviews are 'new'."""
        mastery = fsrs.get_mastery_level(interval_days=0, review_count=0)
        assert mastery == "new"

    def test_mastery_learning(self):
        """Test that cards with 0 interval but reviews are 'learning'."""
        mastery = fsrs.get_mastery_level(interval_days=0, review_count=3)
        assert mastery == "learning"

    def test_mastery_young(self):
        """Test that cards with <7 days are 'young'."""
        mastery = fsrs.get_mastery_level(interval_days=5, review_count=3)
        assert mastery == "young"

    def test_mastery_mature(self):
        """Test that cards with 7-29 days are 'mature'."""
        mastery = fsrs.get_mastery_level(interval_days=20, review_count=5)
        assert mastery == "mature"

    def test_mastery_mastered(self):
        """Test that cards with 30+ days are 'mastered'."""
        mastery = fsrs.get_mastery_level(interval_days=45, review_count=8)
        assert mastery == "mastered"


class TestFSRSNextIntervalsPreview:
    """Test next intervals preview functionality."""

    def test_get_next_intervals_preview_new_card(self):
        """Test preview for new card shows all options."""
        preview = fsrs.get_next_intervals_preview(
            current_interval=0,
            current_ease=2.5,
            review_count=0
        )

        assert len(preview) == 4, "Should have 4 rating options"
        assert 1 in preview and 2 in preview and 3 in preview and 4 in preview
        assert preview[1] == "< 10m", "Rating 1 should be <10m"

    def test_get_next_intervals_preview_format(self):
        """Test that preview returns correct format strings."""
        preview = fsrs.get_next_intervals_preview(
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )

        # Check all ratings are present
        for rating in [1, 2, 3, 4]:
            assert rating in preview, f"Rating {rating} should be in preview"
            assert isinstance(preview[rating], str), "Should return string"

        # Check format varies by interval length
        assert "d" in preview[3] or "mo" in preview[3], "Should show days or months"

    def test_get_next_intervals_preview_progression(self):
        """Test that intervals increase with higher ratings."""
        preview = fsrs.get_next_intervals_preview(
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )

        # Extract numeric values (handling different formats)
        def extract_days(interval_str: str) -> int:
            if interval_str == "< 10m":
                return 0
            elif "d" in interval_str:
                return int(interval_str.replace("d", ""))
            elif "mo" in interval_str:
                return int(interval_str.replace("mo", "")) * 30
            elif "y" in interval_str:
                return int(interval_str.replace("y", "")) * 365
            return 0

        days_1 = extract_days(preview[1])
        days_2 = extract_days(preview[2])
        days_3 = extract_days(preview[3])
        days_4 = extract_days(preview[4])

        assert days_2 >= days_1, "Rating 2 should give >= interval than 1"
        assert days_3 > days_2, "Rating 3 should give > interval than 2"
        assert days_4 > days_3, "Rating 4 should give > interval than 3"


class TestFSRSEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_rating_clamping(self):
        """Test that invalid ratings are clamped to valid range."""
        # Rating too low
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=0,  # Invalid
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )
        assert new_interval is not None, "Should handle rating < 1"

        # Rating too high
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=5,  # Invalid
            current_interval=10,
            current_ease=2.5,
            review_count=5
        )
        assert new_interval is not None, "Should handle rating > 4"

    def test_max_interval_cap(self):
        """Test that intervals are capped at max_interval."""
        # Use very high ease and interval to try to exceed cap
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=4,
            current_interval=300,  # Already high
            current_ease=3.0,  # Max ease
            review_count=20
        )

        assert new_interval <= 365, "Interval should be capped at 365 days"

    def test_min_ease_floor(self):
        """Test that ease factor has a minimum floor."""
        current_ease = 1.3  # Already at min
        new_ease, new_interval, due = fsrs.calculate_next_review(
            rating=1,  # Should reduce ease
            current_interval=10,
            current_ease=current_ease,
            review_count=5
        )

        assert new_ease >= 1.3, "Ease should not go below 1.3"

    def test_consistency_multiple_reviews(self):
        """Test that multiple reviews of the same rating are consistent."""
        results = []
        for _ in range(3):
            result = fsrs.calculate_next_review(
                rating=3,
                current_interval=10,
                current_ease=2.5,
                review_count=5
            )
            results.append(result)

        # All results should be identical
        assert all(r == results[0] for r in results), "Same input should give same output"


class TestFSRSInitialState:
    """Test initial state generation."""

    def test_get_initial_state(self):
        """Test that initial state is correctly set."""
        state = fsrs.get_initial_state()

        assert state.stability == 0.0, "Initial stability should be 0"
        assert state.difficulty == 0.3, "Initial difficulty should be 0.3"
        assert state.due_date == date.today(), "Should be due today"
        assert state.interval_days == 0, "Initial interval should be 0"
        assert state.review_count == 0, "Review count should be 0"
        assert state.is_learning is True, "Should be in learning phase"
