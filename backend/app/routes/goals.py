"""
Goals routes - User goal management endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.utils.auth import get_current_user_id
from app.models.user_goal import UserGoal
from app.schemas.goal import (
    UserGoalResponse,
    UserGoalUpdate,
)

router = APIRouter()


@router.get("", response_model=UserGoalResponse)
async def get_user_goal(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get user's goal configuration.

    If no goal exists, creates a default one.
    """
    # Get or create user goal
    user_goal = db.query(UserGoal).filter(
        UserGoal.user_id == user_id
    ).first()

    if not user_goal:
        # Create default goal
        user_goal = UserGoal(
            user_id=user_id,
            daily_cards_goal=20,
            goal_type="easy_ratings"
        )
        db.add(user_goal)
        db.commit()
        db.refresh(user_goal)

    return user_goal


@router.put("", response_model=UserGoalResponse)
async def update_user_goal(
    goal_update: UserGoalUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update user's goal configuration.

    Creates a new goal if it doesn't exist.
    """
    # Get or create user goal
    user_goal = db.query(UserGoal).filter(
        UserGoal.user_id == user_id
    ).first()

    if not user_goal:
        # Create new goal
        user_goal = UserGoal(
            user_id=user_id,
            daily_cards_goal=goal_update.daily_cards_goal,
            goal_type=goal_update.goal_type
        )
        db.add(user_goal)
    else:
        # Update existing goal
        user_goal.daily_cards_goal = goal_update.daily_cards_goal
        user_goal.goal_type = goal_update.goal_type

    db.commit()
    db.refresh(user_goal)

    return user_goal
