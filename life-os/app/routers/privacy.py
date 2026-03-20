"""
Privacy & GDPR Routes
======================
Data export, account deletion, security audit log.
"""

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import (
    User, Goal, DailyCheckin, JournalEntry, Habit, HabitLog,
    WeeklyReport, LifeScore, SecurityLog, RefreshToken,
)

router = APIRouter(prefix="/me", tags=["Privacy & GDPR"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class SecurityLogEntry(BaseModel):
    action: str
    ip_address: Optional[str]
    details: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class DeleteConfirmation(BaseModel):
    confirm: str  # Must be "DELETE MY ACCOUNT"


# ── Data Export ──────────────────────────────────────────────────────────────

@router.get("/export")
def export_all_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GDPR: Download all your data as JSON."""
    uid = user.id

    goals = db.query(Goal).filter(Goal.user_id == uid).all()
    checkins = db.query(DailyCheckin).filter(DailyCheckin.user_id == uid).all()
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == uid).all()
    habits = db.query(Habit).filter(Habit.user_id == uid).all()
    habit_logs = db.query(HabitLog).filter(HabitLog.user_id == uid).all()
    reports = db.query(WeeklyReport).filter(WeeklyReport.user_id == uid).all()
    scores = db.query(LifeScore).filter(LifeScore.user_id == uid).all()
    sec_logs = db.query(SecurityLog).filter(SecurityLog.user_id == uid).order_by(SecurityLog.created_at.desc()).limit(200).all()

    def dt(v):
        return v.isoformat() if v else None

    return {
        "exported_at": datetime.utcnow().isoformat(),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "timezone": user.timezone,
            "created_at": dt(user.created_at),
        },
        "goals": [
            {
                "id": str(g.id), "title": g.title, "description": g.description,
                "category": g.category, "timeframe": g.timeframe,
                "target_date": dt(g.target_date), "progress": g.progress,
                "status": g.status, "milestones": g.milestones,
                "weekly_tasks": g.weekly_tasks, "daily_habits": g.daily_habits,
                "created_at": dt(g.created_at),
            }
            for g in goals
        ],
        "daily_checkins": [
            {
                "id": str(c.id), "date": dt(c.date), "mood": c.mood,
                "energy": c.energy, "stress": c.stress,
                "sleep_hours": c.sleep_hours, "notes": c.notes,
                "created_at": dt(c.created_at),
            }
            for c in checkins
        ],
        "journal_entries": [
            {
                "id": str(e.id), "title": e.title, "content": e.content,
                "mood_tag": e.mood_tag, "prompt": e.prompt,
                "created_at": dt(e.created_at),
            }
            for e in entries
        ],
        "habits": [
            {
                "id": str(h.id), "name": h.name, "description": h.description,
                "frequency": h.frequency, "time_of_day": h.time_of_day,
                "current_streak": h.current_streak, "best_streak": h.best_streak,
                "created_at": dt(h.created_at),
            }
            for h in habits
        ],
        "habit_logs": [
            {
                "id": str(l.id), "habit_id": str(l.habit_id),
                "date": dt(l.date), "count": l.count,
                "created_at": dt(l.created_at),
            }
            for l in habit_logs
        ],
        "weekly_reports": [
            {
                "id": str(r.id), "week_start": dt(r.week_start),
                "week_end": dt(r.week_end), "avg_mood": r.avg_mood,
                "avg_energy": r.avg_energy, "life_score": r.life_score,
                "summary": r.summary, "wins": r.wins,
                "ai_insight": r.ai_insight,
            }
            for r in reports
        ],
        "life_scores": [
            {
                "date": dt(s.date), "total_score": s.total_score,
                "mood_score": s.mood_score, "habit_score": s.habit_score,
                "goal_score": s.goal_score, "journal_score": s.journal_score,
            }
            for s in scores
        ],
        "security_logs": [
            {
                "action": sl.action, "ip_address": sl.ip_address,
                "details": sl.details, "created_at": dt(sl.created_at),
            }
            for sl in sec_logs
        ],
    }


# ── Account Deletion ────────────────────────────────────────────────────────

@router.delete("", status_code=status.HTTP_200_OK)
def delete_account(
    payload: DeleteConfirmation,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GDPR: Permanently delete all user data. Requires confirmation string."""
    if payload.confirm != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=400,
            detail='You must send {"confirm": "DELETE MY ACCOUNT"} to proceed.',
        )

    uid = user.id

    # Delete all related data in order (child tables first)
    db.query(HabitLog).filter(HabitLog.user_id == uid).delete()
    db.query(Habit).filter(Habit.user_id == uid).delete()
    db.query(DailyCheckin).filter(DailyCheckin.user_id == uid).delete()
    db.query(JournalEntry).filter(JournalEntry.user_id == uid).delete()
    db.query(Goal).filter(Goal.user_id == uid).delete()
    db.query(WeeklyReport).filter(WeeklyReport.user_id == uid).delete()
    db.query(LifeScore).filter(LifeScore.user_id == uid).delete()
    db.query(RefreshToken).filter(RefreshToken.user_id == uid).delete()
    db.query(SecurityLog).filter(SecurityLog.user_id == uid).delete()
    db.query(User).filter(User.id == uid).delete()
    db.commit()

    return {"message": "Account and all data permanently deleted."}


# ── Security Log ─────────────────────────────────────────────────────────────

@router.get("/security-log", response_model=List[SecurityLogEntry])
def get_security_log(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the last 50 security events for your account."""
    logs = (
        db.query(SecurityLog)
        .filter(SecurityLog.user_id == user.id)
        .order_by(SecurityLog.created_at.desc())
        .limit(50)
        .all()
    )
    return logs
