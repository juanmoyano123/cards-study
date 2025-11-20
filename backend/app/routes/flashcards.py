"""
Flashcards routes - CRUD operations for flashcards.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime, date

from app.schemas.flashcard import (
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardResponse,
    FlashcardListResponse,
    FlashcardConfirmRequest,
)
from app.utils.database import get_db
from app.utils.auth import get_current_user_id
from app.models.flashcard import Flashcard
from app.models.card_stats import CardStats

router = APIRouter()


@router.post("", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    request: FlashcardCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new flashcard manually.

    - **material_id**: Optional ID of source material
    - **question**: Flashcard question
    - **answer**: Flashcard answer
    - **explanation**: Optional additional explanation
    - **tags**: Optional list of tags
    - **difficulty**: Difficulty level (1-5, default: 3)

    Requires authentication.
    """
    # Create flashcard
    flashcard = Flashcard(
        user_id=uuid.UUID(user_id),
        material_id=request.material_id,
        question=request.question,
        answer=request.answer,
        explanation=request.explanation,
        tags=request.tags,
        difficulty=request.difficulty,
        ai_confidence=request.ai_confidence,
        is_edited=False,
        status="active"  # Manually created cards are active by default
    )

    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)

    # Create card stats
    card_stats = CardStats(
        card_id=flashcard.id,
        user_id=uuid.UUID(user_id),
        due_date=date.today()  # Available for study immediately
    )
    db.add(card_stats)
    db.commit()

    # Update user stats
    from app.models.user_stats import UserStats
    user_stats = db.query(UserStats).filter(UserStats.user_id == uuid.UUID(user_id)).first()
    if user_stats:
        user_stats.total_flashcards_created += 1
        user_stats.cards_new += 1
        db.commit()

    return FlashcardResponse.from_orm(flashcard)


@router.get("", response_model=FlashcardListResponse)
async def list_flashcards(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, regex="^(draft|active|archived)$"),
    material_id: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List all flashcards for the current user.

    - **page**: Page number (default: 1)
    - **page_size**: Number of items per page (default: 20, max: 100)
    - **status**: Optional filter by status (draft, active, archived)
    - **material_id**: Optional filter by source material
    - **tags**: Optional filter by tags (matches any)

    Requires authentication.
    """
    # Base query
    query = db.query(Flashcard).filter(
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.deleted_at.is_(None)
    )

    # Apply filters
    if status:
        query = query.filter(Flashcard.status == status)

    if material_id:
        query = query.filter(Flashcard.material_id == uuid.UUID(material_id))

    if tags:
        # Filter flashcards that have any of the specified tags
        query = query.filter(Flashcard.tags.overlap(tags))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    flashcards = query.order_by(Flashcard.created_at.desc()).offset(offset).limit(page_size).all()

    return FlashcardListResponse(
        flashcards=[FlashcardResponse.from_orm(f) for f in flashcards],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{flashcard_id}", response_model=FlashcardResponse)
async def get_flashcard(
    flashcard_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a specific flashcard by ID.

    Requires authentication and ownership.
    """
    flashcard = db.query(Flashcard).filter(
        Flashcard.id == uuid.UUID(flashcard_id),
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.deleted_at.is_(None)
    ).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )

    return FlashcardResponse.from_orm(flashcard)


@router.put("/{flashcard_id}", response_model=FlashcardResponse)
async def update_flashcard(
    flashcard_id: str,
    request: FlashcardUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a flashcard.

    - **question**: Updated question (optional)
    - **answer**: Updated answer (optional)
    - **explanation**: Updated explanation (optional)
    - **tags**: Updated tags (optional)
    - **difficulty**: Updated difficulty (optional)
    - **status**: Updated status (optional)

    Requires authentication and ownership.
    """
    flashcard = db.query(Flashcard).filter(
        Flashcard.id == uuid.UUID(flashcard_id),
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.deleted_at.is_(None)
    ).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )

    # Track if any content was edited
    content_edited = False

    # Update fields if provided
    if request.question is not None:
        flashcard.question = request.question
        content_edited = True

    if request.answer is not None:
        flashcard.answer = request.answer
        content_edited = True

    if request.explanation is not None:
        flashcard.explanation = request.explanation
        content_edited = True

    if request.tags is not None:
        flashcard.tags = request.tags

    if request.difficulty is not None:
        flashcard.difficulty = request.difficulty

    if request.status is not None:
        flashcard.status = request.status

    # Mark as edited if content changed
    if content_edited and flashcard.ai_confidence is not None:
        flashcard.is_edited = True

    db.commit()
    db.refresh(flashcard)

    return FlashcardResponse.from_orm(flashcard)


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    flashcard_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a flashcard (soft delete).

    Requires authentication and ownership.
    """
    flashcard = db.query(Flashcard).filter(
        Flashcard.id == uuid.UUID(flashcard_id),
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.deleted_at.is_(None)
    ).first()

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )

    # Soft delete
    flashcard.deleted_at = datetime.utcnow()
    db.commit()

    return None


@router.post("/confirm", status_code=status.HTTP_200_OK)
async def confirm_flashcards(
    request: FlashcardConfirmRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Confirm draft flashcards (change status from 'draft' to 'active').

    - **flashcard_ids**: List of flashcard IDs to confirm

    Requires authentication and ownership.
    """
    confirmed_count = 0

    for flashcard_id in request.flashcard_ids:
        flashcard = db.query(Flashcard).filter(
            Flashcard.id == flashcard_id,
            Flashcard.user_id == uuid.UUID(user_id),
            Flashcard.status == "draft",
            Flashcard.deleted_at.is_(None)
        ).first()

        if flashcard:
            flashcard.status = "active"
            confirmed_count += 1

    db.commit()

    return {
        "message": f"Confirmed {confirmed_count} flashcards",
        "confirmed_count": confirmed_count
    }
