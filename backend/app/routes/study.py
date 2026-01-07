"""
Study routes - Spaced repetition study mode and review tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date, timedelta
import uuid

from app.utils.database import get_db
from app.utils.auth import get_current_user_id
from app.models.flashcard import Flashcard
from app.models.card_stats import CardStats
from app.models.card_review import CardReview
from app.models.study_session import StudySession
from app.models.user_stats import UserStats
from app.services.fsrs import fsrs

router = APIRouter()


# ============ Schemas ============

class StudyCard(BaseModel):
    """Flashcard data for study mode."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    question: str
    answer: str
    explanation: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty: int = 3

    # Stats for UI
    interval_days: int = 0
    ease_factor: float = 2.5
    review_count: int = 0
    mastery_level: str = "new"

    # Preview of next intervals
    next_intervals: dict = {}


class StudyQueueResponse(BaseModel):
    """Response for study queue endpoint."""
    cards: List[StudyCard]
    total_due: int
    new_cards: int
    review_cards: int
    overdue_cards: int


class ReviewRequest(BaseModel):
    """Request to submit a card review."""
    card_id: str = Field(..., description="ID of the flashcard")
    rating: int = Field(..., ge=1, le=4, description="Rating: 1=Again, 2=Hard, 3=Good, 4=Easy")
    time_spent_seconds: Optional[int] = Field(None, ge=0, description="Time spent reviewing in seconds")


class ReviewResponse(BaseModel):
    """Response after submitting a review."""
    success: bool
    card_id: str
    new_interval_days: int
    new_ease_factor: float
    new_due_date: str
    mastery_level: str
    cards_remaining: int


class SessionSummary(BaseModel):
    """Summary of a study session."""
    session_id: str
    cards_studied: int
    cards_again: int
    cards_hard: int
    cards_good: int
    cards_easy: int
    time_spent_minutes: int
    streak_day: int


# ============ Endpoints ============

@router.get("/queue", response_model=StudyQueueResponse)
async def get_study_queue(
    limit: int = Query(50, ge=1, le=200, description="Max cards to return"),
    include_new: bool = Query(True, description="Include new cards"),
    new_cards_limit: int = Query(20, ge=0, le=50, description="Max new cards per day"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get the study queue - cards due for review today.

    Cards are prioritized:
    1. Overdue cards (oldest first)
    2. Due today (by difficulty, hardest first)
    3. New cards (if include_new=True)

    Requires authentication.
    """
    today = date.today()
    user_uuid = uuid.UUID(user_id)

    # Get all active flashcards with their stats
    query = db.query(Flashcard, CardStats).outerjoin(
        CardStats,
        and_(
            CardStats.card_id == Flashcard.id,
            CardStats.user_id == user_uuid
        )
    ).filter(
        Flashcard.user_id == user_uuid,
        Flashcard.status == "active",
        Flashcard.deleted_at.is_(None)
    )

    all_cards = query.all()

    # Debug logging
    print(f"🔍 [STUDY_QUEUE] user_id: {user_id}")
    print(f"🔍 [STUDY_QUEUE] Today: {today}")
    print(f"🔍 [STUDY_QUEUE] Query returned {len(all_cards)} cards")
    for i, (flashcard, stats) in enumerate(all_cards[:3]):  # Log first 3
        print(f"🔍 [STUDY_QUEUE] Card {i}: id={flashcard.id}, stats={stats}")
        if stats:
            print(f"   └─ due_date={stats.due_date}, total_reviews={stats.total_reviews}")

    # Categorize cards
    overdue_cards = []
    due_today = []
    new_cards = []

    for flashcard, stats in all_cards:
        print(f"🔄 [CATEGORIZE] Card {flashcard.id}")
        if stats is None:
            # Card has no stats yet - it's new
            print(f"   └─ Category: NEW (no stats)")
            new_cards.append((flashcard, None))
        elif stats.due_date is None or stats.total_reviews == 0:
            # Never reviewed - it's new
            print(f"   └─ Category: NEW (due_date={stats.due_date}, total_reviews={stats.total_reviews})")
            new_cards.append((flashcard, stats))
        elif stats.due_date < today:
            # Overdue - stats guaranteed to be non-None here
            print(f"   └─ Category: OVERDUE (due_date={stats.due_date} < {today})")
            overdue_cards.append((flashcard, stats))
        elif stats.due_date == today:
            # Due today - stats guaranteed to be non-None here
            print(f"   └─ Category: DUE_TODAY (due_date={stats.due_date} == {today})")
            due_today.append((flashcard, stats))
        else:
            print(f"   └─ Category: FUTURE (due_date={stats.due_date} > {today}) - SKIPPED")
        # Future cards are not included

    # Sort overdue cards by:
    # 1. Failed reviews (most failures first - cards that need most practice)
    # 2. Days overdue (most overdue first)
    # 3. Ease factor (lowest ease = more difficult)
    # Note: All items in overdue_cards have non-None stats due to filtering above
    overdue_cards.sort(
        key=lambda x: (
            -x[1].failed_reviews,  # More failures = higher priority
            x[1].due_date,          # Older due date = higher priority
            x[1].ease_factor        # Lower ease = higher priority
        )
    )

    # Sort due today cards by:
    # 1. Failed reviews (prioritize problematic cards)
    # 2. Ease factor (lower ease = more difficult)
    # 3. Average rating (lower rating = needs more practice)
    # Note: All items in due_today have non-None stats due to filtering above
    due_today.sort(
        key=lambda x: (
            -x[1].failed_reviews,                    # More failures = higher priority
            x[1].ease_factor,                         # Lower ease = higher priority
            x[1].average_rating if x[1].average_rating else 2.0  # Lower avg rating = higher priority
        )
    )

    print(f"📊 [SUMMARY] Overdue: {len(overdue_cards)}, Due Today: {len(due_today)}, New: {len(new_cards)}")
    print(f"⚙️ [PARAMS] include_new={include_new}, new_cards_limit={new_cards_limit}, limit={limit}")

    # Build the queue
    queue = []

    # Add overdue cards first
    for flashcard, stats in overdue_cards:
        if len(queue) >= limit:
            break
        queue.append(_build_study_card(flashcard, stats))
    print(f"✅ [QUEUE] Added {len(queue)} overdue cards")

    # Add due today
    due_added = 0
    for flashcard, stats in due_today:
        if len(queue) >= limit:
            break
        queue.append(_build_study_card(flashcard, stats))
        due_added += 1
    print(f"✅ [QUEUE] Added {due_added} due today cards, total now: {len(queue)}")

    # Add new cards if allowed
    if include_new:
        new_added = 0
        for flashcard, stats in new_cards:
            if len(queue) >= limit:
                break
            if new_added >= new_cards_limit:
                break
            queue.append(_build_study_card(flashcard, stats))
            new_added += 1
        print(f"✅ [QUEUE] Added {new_added} new cards, total now: {len(queue)}")
    else:
        print(f"⚠️ [QUEUE] Skipped new cards (include_new=False)")

    print(f"🎯 [FINAL] Returning {len(queue)} cards")

    return StudyQueueResponse(
        cards=queue,
        total_due=len(queue),
        new_cards=len(new_cards),
        review_cards=len(due_today) + len(overdue_cards),
        overdue_cards=len(overdue_cards)
    )


@router.post("/review", response_model=ReviewResponse)
async def submit_review(
    request: ReviewRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Submit a review for a flashcard.

    Rating scale:
    - 1 = Again (forgot)
    - 2 = Hard (remembered with difficulty)
    - 3 = Good (remembered easily)
    - 4 = Easy (remembered instantly)

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    card_uuid = uuid.UUID(request.card_id)

    # Get the flashcard
    flashcard = db.query(Flashcard).filter(
        Flashcard.id == card_uuid,
        Flashcard.user_id == user_uuid,
        Flashcard.deleted_at.is_(None)
    ).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )

    # Get or create card stats
    stats = db.query(CardStats).filter(
        CardStats.card_id == card_uuid
    ).first()

    if not stats:
        # Create new stats for this card
        stats = CardStats(
            card_id=card_uuid,
            user_id=user_uuid,
            due_date=date.today()
        )
        db.add(stats)
        db.flush()

    # Store previous values for the review record
    prev_interval = stats.current_interval_days
    prev_ease = stats.ease_factor

    # Calculate next review using FSRS
    new_ease, new_interval, new_due = fsrs.calculate_next_review(
        rating=request.rating,
        current_interval=stats.current_interval_days,
        current_ease=stats.ease_factor,
        review_count=stats.total_reviews
    )

    # Update card stats
    stats.current_interval_days = new_interval
    stats.ease_factor = new_ease
    stats.due_date = new_due
    stats.total_reviews += 1
    stats.last_reviewed_at = datetime.utcnow()

    if stats.first_reviewed_at is None:
        stats.first_reviewed_at = datetime.utcnow()

    # Update success/failure counts
    if request.rating >= 3:
        stats.successful_reviews += 1
    else:
        stats.failed_reviews += 1

    # Update average rating
    if stats.average_rating is None:
        stats.average_rating = float(request.rating)
    else:
        stats.average_rating = (
            (stats.average_rating * (stats.total_reviews - 1) + request.rating)
            / stats.total_reviews
        )

    # Update mastery level
    stats.mastery_level = fsrs.get_mastery_level(new_interval, stats.total_reviews)

    # Get or create today's study session
    today = date.today()
    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        session = StudySession(
            user_id=user_uuid,
            date=today,
            start_time=datetime.utcnow()
        )
        db.add(session)
        db.flush()

    # Update session stats
    session.cards_studied += 1
    if request.rating == 1:
        session.cards_again += 1
    elif request.rating == 2:
        session.cards_hard += 1
    elif request.rating == 3:
        session.cards_good += 1
    else:
        session.cards_easy += 1

    if request.time_spent_seconds:
        session.time_spent_minutes += request.time_spent_seconds // 60

    # Create review record
    review = CardReview(
        card_id=card_uuid,
        user_id=user_uuid,
        rating=request.rating,
        previous_interval_days=prev_interval,
        new_interval_days=new_interval,
        previous_ease_factor=prev_ease,
        new_ease_factor=new_ease,
        time_spent_seconds=request.time_spent_seconds,
        due_date=new_due,
        session_id=session.id
    )
    db.add(review)

    # Update user stats
    user_stats = db.query(UserStats).filter(
        UserStats.user_id == user_uuid
    ).first()

    if user_stats:
        user_stats.total_cards_studied += 1
        user_stats.total_study_minutes += (request.time_spent_seconds or 0) // 60

        # Update streak if this is first review today
        if user_stats.last_study_date != today:
            if user_stats.last_study_date == today - timedelta(days=1):
                # Consecutive day - increment streak
                user_stats.current_streak += 1
                if user_stats.current_streak > user_stats.longest_streak:
                    user_stats.longest_streak = user_stats.current_streak
            else:
                # Streak broken - reset
                user_stats.current_streak = 1
            user_stats.last_study_date = today

        # Update mastery counts
        if stats.mastery_level == "mastered" and prev_interval < 30:
            user_stats.total_cards_mastered += 1
            user_stats.cards_mastered += 1
            if stats.mastery_level != "new":
                user_stats.cards_new = max(0, user_stats.cards_new - 1)

    db.commit()

    # Count remaining cards
    remaining = db.query(CardStats).filter(
        CardStats.user_id == user_uuid,
        or_(
            CardStats.due_date <= today,
            CardStats.total_reviews == 0
        )
    ).count() - 1  # Subtract 1 for the card we just reviewed

    return ReviewResponse(
        success=True,
        card_id=request.card_id,
        new_interval_days=new_interval,
        new_ease_factor=round(new_ease, 2),
        new_due_date=new_due.isoformat(),
        mastery_level=stats.mastery_level,
        cards_remaining=max(0, remaining)
    )


@router.get("/session", response_model=Optional[SessionSummary])
async def get_current_session(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get the current day's study session summary.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    today = date.today()

    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        return None

    return SessionSummary(
        session_id=str(session.id),
        cards_studied=session.cards_studied,
        cards_again=session.cards_again,
        cards_hard=session.cards_hard,
        cards_good=session.cards_good,
        cards_easy=session.cards_easy,
        time_spent_minutes=session.time_spent_minutes,
        streak_day=session.streak_day
    )


@router.post("/session/end", response_model=SessionSummary)
async def end_study_session(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    End the current study session.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    today = date.today()

    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found for today"
        )

    # Set end time
    session.end_time = datetime.utcnow()
    db.commit()

    return SessionSummary(
        session_id=str(session.id),
        cards_studied=session.cards_studied,
        cards_again=session.cards_again,
        cards_hard=session.cards_hard,
        cards_good=session.cards_good,
        cards_easy=session.cards_easy,
        time_spent_minutes=session.time_spent_minutes,
        streak_day=session.streak_day
    )


# ============ Pomodoro Schemas ============

class PomodoroStats(BaseModel):
    """Pomodoro statistics for a day."""
    pomodoro_sessions: int
    total_focus_minutes: int
    date: str


class PomodoroSessionResponse(BaseModel):
    """Response after completing a Pomodoro."""
    success: bool
    pomodoro_count: int
    message: Optional[str] = None


class PomodoroSettingsRequest(BaseModel):
    """Request to update Pomodoro settings."""
    work_duration: Optional[int] = Field(None, ge=60, le=7200, description="Work duration in seconds")
    break_duration: Optional[int] = Field(None, ge=60, le=1800, description="Break duration in seconds")
    long_break_duration: Optional[int] = Field(None, ge=60, le=3600, description="Long break duration in seconds")
    pomodoros_until_long_break: Optional[int] = Field(None, ge=2, le=10, description="Pomodoros until long break")
    auto_start_break: Optional[bool] = None
    auto_start_work: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    vibration_enabled: Optional[bool] = None


class PomodoroSettingsResponse(BaseModel):
    """Pomodoro settings response."""
    work_duration: int = 1500  # 25 minutes
    break_duration: int = 300  # 5 minutes
    long_break_duration: int = 900  # 15 minutes
    pomodoros_until_long_break: int = 4
    auto_start_break: bool = False
    auto_start_work: bool = False
    sound_enabled: bool = True
    vibration_enabled: bool = True


# ============ Pomodoro Endpoints ============

@router.post("/pomodoro/complete", response_model=PomodoroSessionResponse)
async def complete_pomodoro(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Record a completed Pomodoro session.
    Increments the pomodoro_sessions counter for today's study session.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    today = date.today()

    # Get or create today's study session
    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        session = StudySession(
            user_id=user_uuid,
            date=today,
            start_time=datetime.utcnow()
        )
        db.add(session)
        db.flush()

    # Increment pomodoro count
    session.pomodoro_sessions += 1
    # Add 25 minutes of focus time (default Pomodoro duration)
    session.time_spent_minutes += 25

    db.commit()

    return PomodoroSessionResponse(
        success=True,
        pomodoro_count=session.pomodoro_sessions,
        message=f"Pomodoro #{session.pomodoro_sessions} completed!"
    )


@router.get("/pomodoro/today", response_model=PomodoroStats)
async def get_today_pomodoro_stats(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get today's Pomodoro statistics.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    today = date.today()

    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        return PomodoroStats(
            pomodoro_sessions=0,
            total_focus_minutes=0,
            date=today.isoformat()
        )

    return PomodoroStats(
        pomodoro_sessions=session.pomodoro_sessions,
        total_focus_minutes=session.time_spent_minutes,
        date=today.isoformat()
    )


@router.post("/pomodoro/start")
async def start_pomodoro_session(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Start a new Pomodoro session.
    Creates or updates today's study session.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)
    today = date.today()

    # Get or create today's study session
    session = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date == today
    ).first()

    if not session:
        session = StudySession(
            user_id=user_uuid,
            date=today,
            start_time=datetime.utcnow()
        )
        db.add(session)
        db.commit()

    return {
        "session_id": str(session.id),
        "started_at": session.start_time.isoformat() if session.start_time else None
    }


@router.get("/pomodoro/settings", response_model=PomodoroSettingsResponse)
async def get_pomodoro_settings(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get user's Pomodoro settings.

    Currently returns default settings. Future: store in user_settings table.

    Requires authentication.
    """
    # TODO: Implement user-specific settings storage
    # For now, return defaults
    return PomodoroSettingsResponse()


@router.patch("/pomodoro/settings", response_model=PomodoroSettingsResponse)
async def update_pomodoro_settings(
    settings: PomodoroSettingsRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update user's Pomodoro settings.

    Currently just returns the provided settings merged with defaults.
    Future: store in user_settings table.

    Requires authentication.
    """
    # TODO: Implement user-specific settings storage
    # For now, return merged settings
    defaults = PomodoroSettingsResponse()

    return PomodoroSettingsResponse(
        work_duration=settings.work_duration or defaults.work_duration,
        break_duration=settings.break_duration or defaults.break_duration,
        long_break_duration=settings.long_break_duration or defaults.long_break_duration,
        pomodoros_until_long_break=settings.pomodoros_until_long_break or defaults.pomodoros_until_long_break,
        auto_start_break=settings.auto_start_break if settings.auto_start_break is not None else defaults.auto_start_break,
        auto_start_work=settings.auto_start_work if settings.auto_start_work is not None else defaults.auto_start_work,
        sound_enabled=settings.sound_enabled if settings.sound_enabled is not None else defaults.sound_enabled,
        vibration_enabled=settings.vibration_enabled if settings.vibration_enabled is not None else defaults.vibration_enabled,
    )


@router.get("/pomodoro/history", response_model=List[PomodoroStats])
async def get_pomodoro_history(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get Pomodoro history for a date range.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)

    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    sessions = db.query(StudySession).filter(
        StudySession.user_id == user_uuid,
        StudySession.date >= start,
        StudySession.date <= end
    ).order_by(StudySession.date.desc()).all()

    return [
        PomodoroStats(
            pomodoro_sessions=session.pomodoro_sessions,
            total_focus_minutes=session.time_spent_minutes,
            date=session.date.isoformat()
        )
        for session in sessions
    ]


# ============ Helpers ============

def _build_study_card(flashcard: Flashcard, stats: Optional[CardStats]) -> StudyCard:
    """Build a StudyCard from a Flashcard and optional CardStats."""
    interval = stats.current_interval_days if stats else 0
    ease = stats.ease_factor if stats else 2.5
    review_count = stats.total_reviews if stats else 0
    mastery = stats.mastery_level if stats else "new"

    # Get preview of next intervals
    next_intervals = fsrs.get_next_intervals_preview(
        current_interval=interval,
        current_ease=ease,
        review_count=review_count
    )

    return StudyCard(
        id=str(flashcard.id),
        question=flashcard.question,
        answer=flashcard.answer,
        explanation=flashcard.explanation,
        tags=flashcard.tags,
        difficulty=flashcard.difficulty,
        interval_days=interval,
        ease_factor=ease,
        review_count=review_count,
        mastery_level=mastery,
        next_intervals=next_intervals
    )
