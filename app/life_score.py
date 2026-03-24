"""
Life Score Calculator
======================
A single 0-100 score computed from four pillars:
  - Mood (25%): average mood over last 7 days, scaled to 0-100
  - Habits (25%): completion rate over last 7 days
  - Goals (25%): weighted average progress of active goals
  - Journal (25%): consistency — days with entries in last 7 days

Each component is 0-100. Total = weighted average.
"""

from datetime import date, timedelta
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    User, DailyCheckin, Habit, HabitLog, Goal, JournalEntry, LifeScore,
)


def compute_mood_score(db: Session, user_id, days: int = 7) -> float:
    """Average mood (1-10) scaled to 0-100."""
    since = date.today() - timedelta(days=days)
    result = db.query(func.avg(DailyCheckin.mood)).filter(
        DailyCheckin.user_id == user_id,
        DailyCheckin.date >= since,
    ).scalar()
    if result is None:
        return 50.0  # neutral if no data
    return min(100.0, (float(result) / 10.0) * 100.0)


def compute_habit_score(db: Session, user_id, days: int = 7) -> float:
    """Habit completion rate over last N days."""
    active_habits = db.query(Habit).filter(
        Habit.user_id == user_id, Habit.is_active == True
    ).all()
    if not active_habits:
        return 50.0  # neutral if no habits

    since = date.today() - timedelta(days=days)
    total_expected = 0
    total_completed = 0

    for habit in active_habits:
        if habit.frequency == "daily":
            total_expected += days
        elif habit.frequency == "weekly":
            total_expected += max(1, days // 7)
        else:
            total_expected += days  # assume daily for custom

        completed = db.query(func.count(HabitLog.id)).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date >= since,
        ).scalar() or 0
        total_completed += completed

    if total_expected == 0:
        return 50.0
    return min(100.0, (total_completed / total_expected) * 100.0)


def compute_goal_score(db: Session, user_id) -> float:
    """Weighted average progress of active goals."""
    goals = db.query(Goal).filter(
        Goal.user_id == user_id, Goal.status == "active"
    ).all()
    if not goals:
        return 50.0

    total = sum(g.progress for g in goals)
    return min(100.0, total / len(goals))


def compute_journal_score(db: Session, user_id, days: int = 7) -> float:
    """Journal consistency — unique days with entries in last N days."""
    since = date.today() - timedelta(days=days)
    count = db.query(
        func.count(func.distinct(func.date(JournalEntry.created_at)))
    ).filter(
        JournalEntry.user_id == user_id,
        JournalEntry.created_at >= since,
    ).scalar() or 0

    # 7/7 days = 100, 0/7 = 0
    return min(100.0, (count / days) * 100.0)


def calculate_life_score(db: Session, user: User) -> dict:
    """Calculate the full Life Score breakdown. Returns dict with all components."""
    mood = compute_mood_score(db, user.id)
    habits = compute_habit_score(db, user.id)
    goals = compute_goal_score(db, user.id)
    journal = compute_journal_score(db, user.id)

    # Weighted average (equal weights)
    total = (mood * 0.25) + (habits * 0.25) + (goals * 0.25) + (journal * 0.25)

    return {
        "total_score": round(total, 1),
        "mood_score": round(mood, 1),
        "habit_score": round(habits, 1),
        "goal_score": round(goals, 1),
        "journal_score": round(journal, 1),
    }


def save_life_score(db: Session, user: User) -> LifeScore:
    """Calculate and persist today's Life Score."""
    scores = calculate_life_score(db, user)
    today = date.today()

    # Upsert
    existing = db.query(LifeScore).filter(
        LifeScore.user_id == user.id,
        LifeScore.date == today,
    ).first()

    if existing:
        for k, v in scores.items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    score = LifeScore(
        user_id=user.id,
        date=today,
        **scores,
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


def get_score_trend(db: Session, user_id, days: int = 30) -> list:
    """Get Life Score trend over time."""
    since = date.today() - timedelta(days=days)
    scores = db.query(LifeScore).filter(
        LifeScore.user_id == user_id,
        LifeScore.date >= since,
    ).order_by(LifeScore.date.asc()).all()

    return [
        {
            "date": s.date.isoformat(),
            "total": s.total_score,
            "mood": s.mood_score,
            "habits": s.habit_score,
            "goals": s.goal_score,
            "journal": s.journal_score,
        }
        for s in scores
    ]
