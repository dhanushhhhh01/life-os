"""Daily check-in routes — mood, energy, stress tracking."""

from datetime import date, timezone, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import DailyCheckin, User
from app.schemas import CheckinCreate, CheckinOut

router = APIRouter(prefix="/checkin", tags=["Daily Check-ins"])


@router.post("", response_model=CheckinOut, status_code=status.HTTP_201_CREATED)
def create_checkin(
    payload: CheckinCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log today's check-in (mood + energy). One per day — updates if exists."""
    checkin_date = payload.date or date.today()

    # Upsert: update if a check-in already exists for this date
    existing = db.query(DailyCheckin).filter(
        DailyCheckin.user_id == user.id,
        DailyCheckin.date == checkin_date,
    ).first()

    if existing:
        existing.mood = payload.mood
        existing.energy = payload.energy
        existing.stress = payload.stress if payload.stress is not None else existing.stress
        existing.sleep_hours = payload.sleep_hours if payload.sleep_hours is not None else existing.sleep_hours
        existing.notes = payload.notes if payload.notes is not None else existing.notes
        db.commit()
        db.refresh(existing)
        return existing

    checkin = DailyCheckin(
        user_id=user.id,
        date=checkin_date,
        mood=payload.mood,
        energy=payload.energy,
        stress=payload.stress,
        sleep_hours=payload.sleep_hours,
        notes=payload.notes,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("", response_model=List[CheckinOut])
def list_checkins(
    days: int = Query(30, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent check-ins (default: last 30 days)."""
    return (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user.id)
        .order_by(DailyCheckin.date.desc())
        .limit(days)
        .all()
    )


@router.get("/today", response_model=Optional[CheckinOut])
def get_today_checkin(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get today's check-in, or null if not yet logged."""
    today = date.today()
    checkin = db.query(DailyCheckin).filter(
        DailyCheckin.user_id == user.id,
        DailyCheckin.date == today,
    ).first()
    return checkin
