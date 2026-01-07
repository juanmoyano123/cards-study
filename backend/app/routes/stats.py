"""
Stats routes - Statistics and analytics endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from typing import List, Optional
from datetime import datetime, date, timedelta

from app.utils.database import get_db
from app.utils.auth import get_current_user_id
from app.models.flashcard import Flashcard
from app.models.card_stats import CardStats
from app.models.study_session import StudySession
from app.models.user_stats import UserStats
from app.models.card_review import CardReview
from app.models.user_goal import UserGoal
from app.schemas.stats import (
    DashboardStats,
    TodayStats,
    HeatmapDay,
    SubjectProgress
)
from app.schemas.goal import DailyProgressResponse

router = APIRouter()


def calculate_streak(user_id: str, db: Session) -> tuple[int, int]:
    """
    Calculate current and longest streak for a user.

    Returns:
        (current_streak, longest_streak)
    """
    # Get all study sessions ordered by date DESC
    sessions = db.query(StudySession).filter(
        StudySession.user_id == user_id,
        StudySession.cards_studied > 0  # Only count days with actual study
    ).order_by(desc(StudySession.date)).all()

    if not sessions:
        return (0, 0)

    # Calculate current streak
    current_streak = 0
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Check if studied today or yesterday (allow 1 day gap)
    latest_session = sessions[0].date
    if latest_session == today or latest_session == yesterday:
        current_streak = 1
        expected_date = latest_session - timedelta(days=1)

        for session in sessions[1:]:
            if session.date == expected_date:
                current_streak += 1
                expected_date = session.date - timedelta(days=1)
            else:
                break

    # Calculate longest streak
    longest_streak = 0
    temp_streak = 1

    for i in range(len(sessions) - 1):
        current_date = sessions[i].date
        next_date = sessions[i + 1].date

        # If consecutive days
        if (current_date - next_date).days == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    longest_streak = max(longest_streak, temp_streak)
    longest_streak = max(longest_streak, current_streak)

    return (current_streak, longest_streak)


def get_heatmap_data(user_id: str, db: Session, days: int = 90) -> List[HeatmapDay]:
    """
    Get heatmap data for the last N days.

    Args:
        user_id: User ID
        db: Database session
        days: Number of days to fetch (default 90)

    Returns:
        List of HeatmapDay objects
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    # Query study sessions
    sessions = db.query(
        StudySession.date,
        StudySession.cards_studied
    ).filter(
        and_(
            StudySession.user_id == user_id,
            StudySession.date >= start_date,
            StudySession.date <= end_date
        )
    ).all()

    # Create a dictionary for quick lookup
    sessions_dict = {session.date: session.cards_studied for session in sessions}

    # Generate all dates in range
    heatmap_data = []
    current_date = start_date

    while current_date <= end_date:
        count = sessions_dict.get(current_date, 0)
        heatmap_data.append(HeatmapDay(date=current_date, count=count))
        current_date += timedelta(days=1)

    return heatmap_data


def get_progress_by_subject(user_id: str, db: Session) -> List[SubjectProgress]:
    """
    Get progress breakdown by subject/category.

    Args:
        user_id: User ID
        db: Database session

    Returns:
        List of SubjectProgress objects
    """
    # Get all flashcards with their stats
    cards_query = db.query(
        Flashcard,
        CardStats
    ).outerjoin(
        CardStats,
        and_(
            CardStats.card_id == Flashcard.id,
            CardStats.user_id == user_id
        )
    ).filter(
        Flashcard.user_id == user_id,
        Flashcard.status == "active",
        Flashcard.deleted_at.is_(None)
    ).all()

    if not cards_query:
        return []

    # Group by tags (subjects)
    subject_stats = {}

    for flashcard, card_stat in cards_query:
        # Use first tag as subject, or "Uncategorized"
        subject = "Sin categoría"
        if flashcard.tags and len(flashcard.tags) > 0:
            subject = flashcard.tags[0]

        if subject not in subject_stats:
            subject_stats[subject] = {
                "total_cards": 0,
                "mastered_cards": 0,
                "cards_due": 0,
                "last_studied": None
            }

        subject_stats[subject]["total_cards"] += 1

        if card_stat:
            # Consider mastered if interval > 30 days
            if card_stat.current_interval_days > 30:
                subject_stats[subject]["mastered_cards"] += 1

            # Count due cards
            if card_stat.due_date and card_stat.due_date <= date.today():
                subject_stats[subject]["cards_due"] += 1

            # Track last studied
            if card_stat.last_reviewed_at:
                last_studied = card_stat.last_reviewed_at.date()
                if (subject_stats[subject]["last_studied"] is None or
                    last_studied > subject_stats[subject]["last_studied"]):
                    subject_stats[subject]["last_studied"] = last_studied

    # Convert to SubjectProgress objects
    progress_list = []
    for subject, stats in subject_stats.items():
        mastery_percentage = 0
        if stats["total_cards"] > 0:
            mastery_percentage = (stats["mastered_cards"] / stats["total_cards"]) * 100

        progress_list.append(SubjectProgress(
            subject=subject,
            total_cards=stats["total_cards"],
            mastered_cards=stats["mastered_cards"],
            cards_due=stats["cards_due"],
            mastery_percentage=round(mastery_percentage, 1),
            last_studied=stats["last_studied"]
        ))

    # Sort by total cards descending
    progress_list.sort(key=lambda x: x.total_cards, reverse=True)

    return progress_list


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get complete dashboard statistics.

    Returns all stats needed for the dashboard:
    - Streak tracking
    - Today's stats
    - Overall stats
    - Heatmap data
    - Progress by subject
    """
    # Get or create user stats
    user_stats = db.query(UserStats).filter(
        UserStats.user_id == user_id
    ).first()

    if not user_stats:
        # Create new user stats
        user_stats = UserStats(user_id=user_id)
        db.add(user_stats)
        db.commit()
        db.refresh(user_stats)

    # Calculate streaks
    current_streak, longest_streak = calculate_streak(user_id, db)

    # Get today's session
    today = date.today()
    today_session = db.query(StudySession).filter(
        and_(
            StudySession.user_id == user_id,
            StudySession.date == today
        )
    ).first()

    cards_studied_today = today_session.cards_studied if today_session else 0

    # Count cards due today
    cards_due_today = db.query(CardStats).filter(
        and_(
            CardStats.user_id == user_id,
            CardStats.due_date <= today
        )
    ).count()

    # Count total cards
    total_cards = db.query(Flashcard).filter(
        and_(
            Flashcard.user_id == user_id,
            Flashcard.status == "active",
            Flashcard.deleted_at.is_(None)
        )
    ).count()

    # Count mastered cards (interval > 30 days)
    total_cards_mastered = db.query(CardStats).filter(
        and_(
            CardStats.user_id == user_id,
            CardStats.current_interval_days > 30
        )
    ).count()

    # Get this week's stats
    week_ago = today - timedelta(days=7)
    week_sessions = db.query(StudySession).filter(
        and_(
            StudySession.user_id == user_id,
            StudySession.date >= week_ago,
            StudySession.date <= today
        )
    ).all()

    cards_studied_this_week = sum(s.cards_studied for s in week_sessions)
    study_time_this_week = sum(s.time_spent_minutes for s in week_sessions)

    # Get heatmap data
    heatmap_data = get_heatmap_data(user_id, db, days=90)

    # Get progress by subject
    progress_by_subject = get_progress_by_subject(user_id, db)

    # Build response
    stats = DashboardStats(
        current_streak=current_streak,
        longest_streak=longest_streak,
        cards_due_today=cards_due_today,
        cards_studied_today=cards_studied_today,
        total_cards=total_cards,
        total_cards_mastered=total_cards_mastered,
        total_study_time_minutes=user_stats.total_study_minutes,
        cards_studied_this_week=cards_studied_this_week,
        study_time_this_week=study_time_this_week,
        heatmap_data=heatmap_data,
        progress_by_subject=progress_by_subject
    )

    return stats


@router.get("/today", response_model=TodayStats)
async def get_today_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get quick stats for today.

    Lightweight endpoint for quick checks.
    """
    today = date.today()

    # Get today's session
    today_session = db.query(StudySession).filter(
        and_(
            StudySession.user_id == user_id,
            StudySession.date == today
        )
    ).first()

    cards_studied = today_session.cards_studied if today_session else 0
    study_time = today_session.time_spent_minutes if today_session else 0

    # Count cards due today
    cards_due = db.query(CardStats).filter(
        and_(
            CardStats.user_id == user_id,
            CardStats.due_date <= today
        )
    ).count()

    # Calculate current streak
    current_streak, _ = calculate_streak(user_id, db)

    return TodayStats(
        cards_due=cards_due,
        cards_studied=cards_studied,
        study_time_minutes=study_time,
        current_streak=current_streak
    )


@router.get("/daily-progress", response_model=DailyProgressResponse)
async def get_daily_progress(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get daily progress toward user's goal.

    Calculates progress based on user's goal type:
    - easy_ratings: Count cards rated 4 (Easy) today
    - cards_studied: Count total cards studied today
    - study_minutes: Count total study minutes today
    """
    # Get user's goal
    user_goal = db.query(UserGoal).filter(
        UserGoal.user_id == user_id
    ).first()

    # Default goal if not set
    if not user_goal:
        user_goal = UserGoal(
            user_id=user_id,
            daily_cards_goal=20,
            goal_type="easy_ratings"
        )
        db.add(user_goal)
        db.commit()
        db.refresh(user_goal)

    today = date.today()

    # Get today's session for basic stats
    today_session = db.query(StudySession).filter(
        and_(
            StudySession.user_id == user_id,
            StudySession.date == today
        )
    ).first()

    cards_studied_today = today_session.cards_studied if today_session else 0
    study_minutes_today = today_session.time_spent_minutes if today_session else 0
    easy_ratings_today = today_session.cards_easy if today_session else 0

    # Calculate progress based on goal type
    progress = 0
    if user_goal.goal_type == "easy_ratings":
        progress = easy_ratings_today
    elif user_goal.goal_type == "cards_studied":
        progress = cards_studied_today
    elif user_goal.goal_type == "study_minutes":
        progress = study_minutes_today

    # Calculate remaining and percentage
    remaining = max(0, user_goal.daily_cards_goal - progress)
    percentage = min(100.0, (progress / user_goal.daily_cards_goal * 100)) if user_goal.daily_cards_goal > 0 else 0

    return DailyProgressResponse(
        goal=user_goal.daily_cards_goal,
        progress=progress,
        remaining=remaining,
        percentage=round(percentage, 1),
        goal_type=user_goal.goal_type,
        easy_ratings_today=easy_ratings_today,
        cards_studied_today=cards_studied_today,
        study_minutes_today=study_minutes_today
    )
