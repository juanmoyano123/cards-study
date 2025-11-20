"""
Materials routes - CRUD operations for study materials.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
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

    return MaterialResponse.from_orm(material)


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

    return MaterialListResponse(
        materials=[MaterialResponse.from_orm(m) for m in materials],
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

    return MaterialResponse.from_orm(material)


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

    return MaterialResponse.from_orm(material)


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
