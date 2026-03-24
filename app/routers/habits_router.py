"""Habit tracking routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Habit, User
from app.schemas import HabitCreate, HabitOut

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(
    payload: HabitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new habit to track."""
    habit = Habit(user_id=user.id, **payload.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.get("", response_model=List[HabitOut])
def list_habits(
    active_only: bool = True,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List habits for the current user."""
    q = db.query(Habit).filter(Habit.user_id == user.id)
    if active_only:
        q = q.filter(Habit.is_active == True)
    return q.order_by(Habit.created_at.desc()).all()


@router.patch("/{habit_id}/log", response_model=HabitOut)
def log_habit(
    habit_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a habit completion — increments the streak."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found.")

    habit.current_streak += 1
    if habit.current_streak > habit.best_streak:
        habit.best_streak = habit.current_streak
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a habit."""
    habit = db.query(Habit).filter(
        Habit.id == habit_id, Habit.user_id == user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found.")
    db.delete(habit)
    db.commit()
