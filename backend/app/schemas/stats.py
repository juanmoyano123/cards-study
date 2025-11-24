"""
Stats schemas - Response models for statistics endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import date


class HeatmapDay(BaseModel):
    """Single day in heatmap."""
    date: date
    count: int = Field(..., description="Number of cards studied on this day")

    class Config:
        orm_mode = True


class SubjectProgress(BaseModel):
    """Progress stats for a specific subject/category."""
    subject: str
    total_cards: int
    mastered_cards: int
    cards_due: int
    mastery_percentage: float
    last_studied: Optional[date] = None

    class Config:
        orm_mode = True


class DashboardStats(BaseModel):
    """Complete dashboard statistics."""
    # Streak tracking
    current_streak: int = Field(0, description="Current consecutive days studying")
    longest_streak: int = Field(0, description="Longest streak ever achieved")

    # Today's stats
    cards_due_today: int = Field(0, description="Cards due for review today")
    cards_studied_today: int = Field(0, description="Cards already studied today")

    # Overall stats
    total_cards: int = Field(0, description="Total flashcards created")
    total_cards_mastered: int = Field(0, description="Cards with interval > 30 days")
    total_study_time_minutes: int = Field(0, description="Total study time in minutes")

    # Recent activity
    cards_studied_this_week: int = Field(0, description="Cards studied in last 7 days")
    study_time_this_week: int = Field(0, description="Study time this week in minutes")

    # Heatmap data (last 90 days)
    heatmap_data: List[HeatmapDay] = Field(default_factory=list)

    # Progress by subject
    progress_by_subject: List[SubjectProgress] = Field(default_factory=list)

    class Config:
        orm_mode = True


class TodayStats(BaseModel):
    """Quick stats for today."""
    cards_due: int
    cards_studied: int
    study_time_minutes: int
    current_streak: int

    class Config:
        orm_mode = True
