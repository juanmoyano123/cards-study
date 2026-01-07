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
    SubjectProgress,
    DeckMetrics,
    ProblematicCard
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


@router.get("/deck/{deck_name}/metrics", response_model=DeckMetrics)
async def get_deck_metrics(
    deck_name: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get detailed metrics for a specific deck/subject.

    Args:
        deck_name: The name of the deck (tag/subject)

    Returns:
        DeckMetrics with comprehensive statistics
    """
    # Get all flashcards for this deck
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
    )

    # Filter by deck (tag)
    if deck_name != "Sin categoría":
        # Filter cards that have this tag
        cards_query = cards_query.filter(
            Flashcard.tags.contains([deck_name])
        )
    else:
        # Filter cards with no tags or empty tags
        cards_query = cards_query.filter(
            or_(
                Flashcard.tags == None,
                Flashcard.tags == []
            )
        )

    cards_data = cards_query.all()

    if not cards_data:
        # Return empty metrics if deck not found
        return DeckMetrics(
            deck_name=deck_name,
            total_cards=0
        )

    # Initialize counters
    total_cards = len(cards_data)
    easy_count = 0
    good_count = 0
    hard_count = 0
    again_count = 0
    new_count = 0
    total_rating_sum = 0.0
    total_reviews = 0
    total_study_time = 0
    last_studied = None
    cards_with_ratings = 0

    card_ids = []
    for flashcard, card_stat in cards_data:
        card_ids.append(flashcard.id)

        if card_stat:
            # Count by last rating (we'll get this from card_reviews)
            if card_stat.total_reviews == 0:
                new_count += 1
            else:
                if card_stat.average_rating:
                    total_rating_sum += card_stat.average_rating
                    cards_with_ratings += 1

                total_reviews += card_stat.total_reviews

                # Track last studied date
                if card_stat.last_reviewed_at:
                    reviewed_date = card_stat.last_reviewed_at.date()
                    if last_studied is None or reviewed_date > last_studied:
                        last_studied = reviewed_date
        else:
            new_count += 1

    # Get last ratings from card_reviews for rating distribution
    if card_ids:
        # Get the most recent review for each card
        from sqlalchemy import distinct

        latest_reviews_subquery = db.query(
            CardReview.card_id,
            func.max(CardReview.reviewed_at).label('max_reviewed_at')
        ).filter(
            CardReview.card_id.in_(card_ids),
            CardReview.user_id == user_id
        ).group_by(CardReview.card_id).subquery()

        latest_reviews = db.query(CardReview).join(
            latest_reviews_subquery,
            and_(
                CardReview.card_id == latest_reviews_subquery.c.card_id,
                CardReview.reviewed_at == latest_reviews_subquery.c.max_reviewed_at
            )
        ).all()

        for review in latest_reviews:
            if review.rating == 4:
                easy_count += 1
            elif review.rating == 3:
                good_count += 1
            elif review.rating == 2:
                hard_count += 1
            elif review.rating == 1:
                again_count += 1

    # Calculate failed reviews this month
    month_ago = date.today() - timedelta(days=30)
    failed_reviews_this_month = db.query(CardReview).filter(
        CardReview.card_id.in_(card_ids) if card_ids else False,
        CardReview.user_id == user_id,
        CardReview.rating < 3,
        CardReview.reviewed_at >= month_ago
    ).count()

    # Get problematic cards (top 5 with most failed reviews)
    problematic_cards_data = db.query(
        Flashcard.id,
        Flashcard.question,
        CardStats.failed_reviews,
        CardStats.average_rating,
        CardStats.last_reviewed_at
    ).join(
        CardStats,
        and_(
            CardStats.card_id == Flashcard.id,
            CardStats.user_id == user_id
        )
    ).filter(
        Flashcard.id.in_(card_ids) if card_ids else False,
        CardStats.failed_reviews > 0
    ).order_by(
        desc(CardStats.failed_reviews)
    ).limit(5).all()

    problematic_cards = [
        ProblematicCard(
            card_id=str(card_id),
            question=question[:100] + "..." if len(question) > 100 else question,
            failed_reviews=failed_reviews,
            average_rating=avg_rating or 0.0,
            last_failed=last_reviewed
        )
        for card_id, question, failed_reviews, avg_rating, last_reviewed in problematic_cards_data
    ]

    # Calculate metrics
    average_rating = (total_rating_sum / cards_with_ratings) if cards_with_ratings > 0 else 0.0
    mastery_percentage = (easy_count / total_cards * 100) if total_cards > 0 else 0.0

    return DeckMetrics(
        deck_name=deck_name,
        total_cards=total_cards,
        easy_count=easy_count,
        good_count=good_count,
        hard_count=hard_count,
        again_count=again_count,
        new_count=new_count,
        mastery_percentage=round(mastery_percentage, 1),
        average_rating=round(average_rating, 2),
        failed_reviews_this_month=failed_reviews_this_month,
        total_reviews=total_reviews,
        last_studied=last_studied,
        total_study_time_minutes=total_study_time,
        problematic_cards=problematic_cards
    )
