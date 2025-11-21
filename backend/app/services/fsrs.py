"""
FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation.

Based on: https://github.com/open-spaced-repetition/fsrs4anki
This is a simplified version optimized for StudyMaster.

Rating scale:
    1 = Again (forgot completely)
    2 = Hard (recalled with significant difficulty)
    3 = Good (recalled with some effort)
    4 = Easy (recalled instantly)
"""

from dataclasses import dataclass
from datetime import datetime, date, timedelta
from typing import Tuple
import math


@dataclass
class FSRSParams:
    """FSRS algorithm parameters (default values from fsrs4anki)."""
    # Weights for stability calculation
    w: Tuple[float, ...] = (
        0.4,    # w[0]: Initial stability for rating 1
        0.6,    # w[1]: Initial stability for rating 2
        2.4,    # w[2]: Initial stability for rating 3
        5.8,    # w[3]: Initial stability for rating 4
        4.93,   # w[4]: Stability increase rate
        0.94,   # w[5]: Stability decrease rate
        0.86,   # w[6]: Difficulty modifier
        0.01,   # w[7]: Difficulty base
        1.49,   # w[8]: Hard penalty
        0.14,   # w[9]: Easy bonus
        0.94,   # w[10]: Retrievability decay
        2.18,   # w[11]: Forgetting curve steepness
        0.05,   # w[12]: Minimum difficulty
        0.34,   # w[13]: Maximum difficulty
        1.26,   # w[14]: Difficulty mean reversion
        0.29,   # w[15]: Stability mean reversion
        2.61,   # w[16]: Retrievability threshold
    )

    # Learning steps (in minutes) for new cards
    learning_steps: Tuple[int, ...] = (1, 10)

    # Minimum interval (in days)
    min_interval: int = 1

    # Maximum interval (in days)
    max_interval: int = 365

    # Request retention (target probability of recall)
    request_retention: float = 0.9


@dataclass
class CardState:
    """Current state of a card in the FSRS algorithm."""
    stability: float  # How long the memory will last
    difficulty: float  # How hard the card is (0-1)
    due_date: date
    interval_days: int
    review_count: int
    is_learning: bool  # True if card is in learning phase


class FSRS:
    """
    FSRS Algorithm Implementation.

    Calculates optimal review intervals based on user ratings.
    """

    def __init__(self, params: FSRSParams = None):
        self.params = params or FSRSParams()

    def get_initial_state(self) -> CardState:
        """Get the initial state for a new card."""
        return CardState(
            stability=0.0,
            difficulty=0.3,  # Start with medium difficulty
            due_date=date.today(),
            interval_days=0,
            review_count=0,
            is_learning=True
        )

    def calculate_next_review(
        self,
        rating: int,
        current_interval: int,
        current_ease: float,
        review_count: int
    ) -> Tuple[float, int, date]:
        """
        Calculate the next review parameters based on rating.

        Args:
            rating: User rating (1-4)
            current_interval: Current interval in days
            current_ease: Current ease factor
            review_count: Total number of reviews

        Returns:
            Tuple of (new_ease, new_interval_days, due_date)
        """
        # Clamp rating to valid range
        rating = max(1, min(4, rating))

        # First review (new card)
        if review_count == 0:
            return self._handle_new_card(rating)

        # Learning phase (interval < 1 day)
        if current_interval == 0:
            return self._handle_learning_card(rating, current_ease)

        # Review phase
        return self._handle_review_card(rating, current_interval, current_ease)

    def _handle_new_card(self, rating: int) -> Tuple[float, int, date]:
        """Handle first review of a new card."""
        w = self.params.w

        # Initial stability based on rating
        initial_stability = w[rating - 1]

        # Initial ease factor
        initial_ease = 2.5 if rating >= 3 else 2.3

        # Calculate interval
        if rating == 1:
            # Again: Show in 1 minute (same session)
            interval_days = 0
            due = date.today()
        elif rating == 2:
            # Hard: 1 day
            interval_days = 1
            due = date.today() + timedelta(days=1)
        elif rating == 3:
            # Good: ~2-3 days
            interval_days = max(1, int(initial_stability))
            due = date.today() + timedelta(days=interval_days)
        else:  # rating == 4
            # Easy: ~4-6 days
            interval_days = max(1, int(initial_stability * 1.3))
            due = date.today() + timedelta(days=interval_days)

        return (initial_ease, interval_days, due)

    def _handle_learning_card(
        self,
        rating: int,
        current_ease: float
    ) -> Tuple[float, int, date]:
        """Handle a card that's still in learning phase."""
        if rating == 1:
            # Again: Reset to first step
            new_ease = max(1.3, current_ease - 0.2)
            return (new_ease, 0, date.today())

        elif rating == 2:
            # Hard: Stay in learning, show tomorrow
            new_ease = max(1.3, current_ease - 0.1)
            return (new_ease, 1, date.today() + timedelta(days=1))

        elif rating == 3:
            # Good: Graduate to review, 3 days
            return (current_ease, 3, date.today() + timedelta(days=3))

        else:  # rating == 4
            # Easy: Graduate with bonus, 7 days
            new_ease = current_ease + 0.15
            return (new_ease, 7, date.today() + timedelta(days=7))

    def _handle_review_card(
        self,
        rating: int,
        current_interval: int,
        current_ease: float
    ) -> Tuple[float, int, date]:
        """Handle a card in the review phase."""
        # Calculate new ease factor
        if rating == 1:
            # Again: Reduce ease significantly
            new_ease = max(1.3, current_ease - 0.2)
            # Reset interval (relearn)
            new_interval = 0
        elif rating == 2:
            # Hard: Reduce ease slightly, multiply interval by 1.2
            new_ease = max(1.3, current_ease - 0.15)
            new_interval = max(
                self.params.min_interval,
                int(current_interval * 1.2)
            )
        elif rating == 3:
            # Good: Keep ease, multiply by ease factor
            new_ease = current_ease
            new_interval = max(
                self.params.min_interval,
                int(current_interval * new_ease)
            )
        else:  # rating == 4
            # Easy: Increase ease, multiply by ease * 1.3
            new_ease = min(3.0, current_ease + 0.15)
            new_interval = max(
                self.params.min_interval,
                int(current_interval * new_ease * 1.3)
            )

        # Cap at max interval
        new_interval = min(new_interval, self.params.max_interval)

        # Calculate due date
        if new_interval == 0:
            # Relearning: due today
            due = date.today()
        else:
            due = date.today() + timedelta(days=new_interval)

        return (new_ease, new_interval, due)

    def get_mastery_level(self, interval_days: int, review_count: int) -> str:
        """
        Determine the mastery level of a card.

        Args:
            interval_days: Current interval in days
            review_count: Total number of reviews

        Returns:
            Mastery level string
        """
        if review_count == 0:
            return "new"
        elif interval_days == 0:
            return "learning"
        elif interval_days < 7:
            return "young"
        elif interval_days < 30:
            return "mature"
        else:
            return "mastered"

    def get_next_intervals_preview(
        self,
        current_interval: int,
        current_ease: float,
        review_count: int
    ) -> dict:
        """
        Get preview of what intervals each rating would give.

        Useful for showing users what will happen with each choice.

        Returns:
            Dict with rating -> interval string mapping
        """
        result = {}

        for rating in [1, 2, 3, 4]:
            _, interval, due = self.calculate_next_review(
                rating, current_interval, current_ease, review_count
            )

            if interval == 0:
                result[rating] = "< 10m"
            elif interval == 1:
                result[rating] = "1d"
            elif interval < 30:
                result[rating] = f"{interval}d"
            elif interval < 365:
                months = interval // 30
                result[rating] = f"{months}mo"
            else:
                years = interval // 365
                result[rating] = f"{years}y"

        return result


# Singleton instance
fsrs = FSRS()
