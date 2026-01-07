"""
Goal schemas - Request and response models for user goals.
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class UserGoalResponse(BaseModel):
    """User goal configuration response."""
    user_id: str
    daily_cards_goal: int = Field(..., description="Target number of cards to master daily", ge=1, le=500)
    goal_type: Literal["easy_ratings", "cards_studied", "study_minutes"] = Field(
        default="easy_ratings",
        description="Type of goal: easy_ratings (cards rated 4), cards_studied (any review), or study_minutes"
    )
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class UserGoalUpdate(BaseModel):
    """Request model to update user goal."""
    daily_cards_goal: int = Field(..., description="Target number of cards to master daily", ge=1, le=500)
    goal_type: Literal["easy_ratings", "cards_studied", "study_minutes"] = Field(
        default="easy_ratings",
        description="Type of goal: easy_ratings, cards_studied, or study_minutes"
    )


class DailyProgressResponse(BaseModel):
    """Daily progress toward user goal."""
    goal: int = Field(..., description="User's daily goal")
    progress: int = Field(..., description="Current progress toward goal")
    remaining: int = Field(..., description="Amount remaining to reach goal")
    percentage: float = Field(..., description="Percentage of goal completed (0-100)")
    goal_type: str = Field(..., description="Type of goal being tracked")

    # Detailed breakdown
    easy_ratings_today: int = Field(0, description="Cards rated Easy (4) today")
    cards_studied_today: int = Field(0, description="Total cards studied today")
    study_minutes_today: int = Field(0, description="Total study minutes today")

    class Config:
        orm_mode = True
