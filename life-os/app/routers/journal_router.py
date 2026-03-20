"""Journal entry routes."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import JournalEntry, User
from app.schemas import JournalCreate, JournalOut

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("", response_model=JournalOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: JournalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new journal entry."""
    entry = JournalEntry(user_id=user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=List[JournalOut])
def list_entries(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    mood_tag: str = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List journal entries (newest first)."""
    q = db.query(JournalEntry).filter(JournalEntry.user_id == user.id)
    if mood_tag:
        q = q.filter(JournalEntry.mood_tag == mood_tag)
    return q.order_by(JournalEntry.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{entry_id}", response_model=JournalOut)
def get_entry(
    entry_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    db.delete(entry)
    db.commit()
