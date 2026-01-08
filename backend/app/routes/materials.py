"""
Materials routes - CRUD operations for study materials.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    MaterialListResponse,
)
from app.utils.database import get_db
from app.utils.auth import get_current_user_id
from app.models.study_material import StudyMaterial
from app.services.pdf_service import pdf_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    request: MaterialCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new study material.

    - **filename**: Name of the file or material
    - **extracted_text**: The extracted or pasted text content
    - **subject_category**: Optional subject category
    - **tags**: Optional list of tags

    Requires authentication.
    """
    # Count words
    word_count = len(request.extracted_text.split())

    # Create material
    material = StudyMaterial(
        user_id=uuid.UUID(user_id),
        filename=request.filename,
        extracted_text=request.extracted_text,
        word_count=word_count,
        subject_category=request.subject_category,
        tags=request.tags,
        status="completed",
        processed_at=datetime.utcnow()
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    # Update user stats
    from app.models.user_stats import UserStats
    user_stats = db.query(UserStats).filter(UserStats.user_id == uuid.UUID(user_id)).first()
    if user_stats:
        user_stats.total_materials_uploaded += 1
        db.commit()

    return MaterialResponse.model_validate(material)


@router.post("/upload", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    filename: str = Form(...),
    subject_category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string of array
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Upload a study material - either PDF file or pasted text.

    Two modes:
    1. PDF Upload: Provide file (PDF), extracts text automatically
    2. Text Paste: Provide text directly (no file)

    - **file**: Optional PDF file (max 10MB)
    - **text**: Optional text content (use if no file)
    - **filename**: Name for the material
    - **subject_category**: Optional subject category
    - **tags**: Optional tags as JSON array string (e.g., '["tag1", "tag2"]')

    Must provide either file OR text, not both.

    Requires authentication.
    """
    user_uuid = uuid.UUID(user_id)

    # Validate that exactly one input method is provided
    if file and text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either file OR text, not both"
        )

    if not file and not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either a PDF file or text content"
        )

    # Parse tags if provided
    parsed_tags = []
    if tags:
        try:
            import json
            parsed_tags = json.loads(tags)
            if not isinstance(parsed_tags, list):
                raise ValueError("Tags must be an array")
        except Exception as e:
            logger.warning(f"Failed to parse tags: {e}")
            parsed_tags = []

    extracted_text = None
    error_message = None

    try:
        # Handle PDF file upload
        if file:
            # Validate file type
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Only PDF files are supported"
                )

            logger.info(f"Processing PDF upload: {file.filename}")

            # Read file bytes
            file_bytes = await file.read()

            # Extract text using PDF service
            try:
                extracted_text = pdf_service.extract_text_from_pdf(file_bytes)

                # Get stats
                stats = pdf_service.get_text_stats(extracted_text)
                logger.info(
                    f"Extracted {stats['word_count']} words from PDF "
                    f"(~{stats['estimated_reading_time_minutes']} min read)"
                )

            except ValueError as e:
                # PDF processing error (file too large, encrypted, etc.)
                error_message = str(e)
                logger.error(f"PDF processing error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message
                )

        # Handle pasted text
        else:
            extracted_text = text.strip()

            # Validate text length
            if len(extracted_text) < 50:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Text must be at least 50 characters long"
                )

            logger.info(f"Processing pasted text: {len(extracted_text)} characters")

        # Count words
        word_count = len(extracted_text.split())

        # Create material
        material = StudyMaterial(
            user_id=user_uuid,
            filename=filename,
            extracted_text=extracted_text,
            word_count=word_count,
            subject_category=subject_category,
            tags=parsed_tags,
            status="completed",
            processed_at=datetime.utcnow(),
            error_message=error_message
        )

        db.add(material)
        db.commit()
        db.refresh(material)

        # Update user stats
        from app.models.user_stats import UserStats
        user_stats = db.query(UserStats).filter(
            UserStats.user_id == user_uuid
        ).first()

        if user_stats:
            user_stats.total_materials_uploaded += 1
            db.commit()

        logger.info(f"Successfully created material {material.id} with {word_count} words")

        return MaterialResponse.model_validate(material)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error uploading material: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process material: {str(e)}"
        )


@router.get("", response_model=MaterialListResponse)
async def list_materials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    subject_category: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List all materials for the current user.

    - **page**: Page number (default: 1)
    - **page_size**: Number of items per page (default: 20, max: 100)
    - **subject_category**: Optional filter by subject category

    Requires authentication.
    """
    from app.models.flashcard import Flashcard

    # Base query
    query = db.query(StudyMaterial).filter(
        StudyMaterial.user_id == uuid.UUID(user_id),
        StudyMaterial.deleted_at.is_(None)
    )

    # Apply filters
    if subject_category:
        query = query.filter(StudyMaterial.subject_category == subject_category)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    materials = query.order_by(StudyMaterial.created_at.desc()).offset(offset).limit(page_size).all()

    # Add flashcard count to each material
    materials_with_count = []
    for material in materials:
        material_dict = MaterialResponse.model_validate(material).model_dump()
        # Count active flashcards for this material
        flashcard_count = db.query(Flashcard).filter(
            Flashcard.material_id == material.id,
            Flashcard.status == 'active',
            Flashcard.deleted_at.is_(None)
        ).count()
        material_dict['flashcard_count'] = flashcard_count
        materials_with_count.append(MaterialResponse(**material_dict))

    return MaterialListResponse(
        materials=materials_with_count,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a specific material by ID.

    Requires authentication and ownership.
    """
    from app.models.flashcard import Flashcard

    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == uuid.UUID(material_id),
        StudyMaterial.user_id == uuid.UUID(user_id),
        StudyMaterial.deleted_at.is_(None)
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )

    # Add flashcard count
    material_dict = MaterialResponse.model_validate(material).model_dump()
    flashcard_count = db.query(Flashcard).filter(
        Flashcard.material_id == material.id,
        Flashcard.status == 'active',
        Flashcard.deleted_at.is_(None)
    ).count()
    material_dict['flashcard_count'] = flashcard_count

    return MaterialResponse(**material_dict)


@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: str,
    request: MaterialUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a study material.

    - **filename**: Updated filename (optional)
    - **subject_category**: Updated subject category (optional)
    - **tags**: Updated tags (optional)

    Requires authentication and ownership.
    """
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == uuid.UUID(material_id),
        StudyMaterial.user_id == uuid.UUID(user_id),
        StudyMaterial.deleted_at.is_(None)
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )

    # Update fields if provided
    if request.filename is not None:
        material.filename = request.filename

    if request.subject_category is not None:
        material.subject_category = request.subject_category

    if request.tags is not None:
        material.tags = request.tags

    db.commit()
    db.refresh(material)

    return MaterialResponse.model_validate(material)


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a study material (soft delete).

    Requires authentication and ownership.
    """
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == uuid.UUID(material_id),
        StudyMaterial.user_id == uuid.UUID(user_id),
        StudyMaterial.deleted_at.is_(None)
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )

    # Soft delete
    material.deleted_at = datetime.utcnow()
    db.commit()

    return None


@router.get("/{material_id}/flashcards")
async def get_material_flashcards(
    material_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get all flashcards for a specific material.

    Returns all active flashcards associated with this material,
    regardless of their due_date (for manual/free study mode).

    Requires authentication and ownership.
    """
    from app.models.flashcard import Flashcard
    from app.models.card_stats import CardStats
    from app.schemas.flashcard import FlashcardResponse

    # Verify material ownership
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == uuid.UUID(material_id),
        StudyMaterial.user_id == uuid.UUID(user_id),
        StudyMaterial.deleted_at.is_(None)
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )

    # Get all active flashcards for this material
    flashcards = db.query(Flashcard).filter(
        Flashcard.material_id == uuid.UUID(material_id),
        Flashcard.user_id == uuid.UUID(user_id),
        Flashcard.status == 'active',
        Flashcard.deleted_at.is_(None)
    ).all()

    # Build response with stats for each card
    cards_with_stats = []
    for card in flashcards:
        card_dict = {
            "id": str(card.id),
            "question": card.question,
            "answer": card.answer,
            "explanation": card.explanation,
            "difficulty": card.difficulty,
            "tags": card.tags,
            "status": card.status,
            "material_id": str(card.material_id) if card.material_id else None,
            "created_at": card.created_at.isoformat() if card.created_at else None,
        }

        # Get stats for this card
        stats = db.query(CardStats).filter(
            CardStats.card_id == card.id,
            CardStats.user_id == uuid.UUID(user_id)
        ).first()

        if stats:
            card_dict["stats"] = {
                "mastery_level": stats.mastery_level,
                "total_reviews": stats.total_reviews,
                "due_date": stats.due_date.isoformat() if stats.due_date else None,
            }
        else:
            card_dict["stats"] = {
                "mastery_level": "new",
                "total_reviews": 0,
                "due_date": None,
            }

        cards_with_stats.append(card_dict)

    return {
        "material_id": str(material.id),
        "material_name": material.filename,
        "flashcards": cards_with_stats,
        "total": len(cards_with_stats)
    }
