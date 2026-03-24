"""
Phase 4 Routes — Smart Habits, Weekly Reports, Goal Decomposer, Life Score
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, Habit, HabitLog
from app.habit_engine import (
    log_habit_completion, check_missed_habits, generate_nudge, get_habit_stats,
)
from app.life_score import calculate_life_score, save_life_score, get_score_trend
from app.services.weekly_report import generate_weekly_report, list_reports
from app.services.goal_decomposer import decompose_goal

router = APIRouter(tags=["Phase 4 — Intelligence"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class HabitLogResponse(BaseModel):
    habit_id: str
    name: str
    current_streak: int
    best_streak: int
    message: str

class NudgeResponse(BaseModel):
    habit_id: str
    habit_name: str
    missed_days: int
    nudge: str

class HabitStatsResponse(BaseModel):
    habit_id: str
    name: str
    days_analyzed: int
    completed: int
    expected: int
    completion_rate: float
    current_streak: int
    best_streak: int
    calendar: list

class LifeScoreResponse(BaseModel):
    total_score: float
    mood_score: float
    habit_score: float
    goal_score: float
    journal_score: float

class ScoreTrendPoint(BaseModel):
    date: str
    total: float
    mood: float
    habits: float
    goals: float
    journal: float

class WeeklyReportResponse(BaseModel):
    id: str
    week_start: str
    week_end: str
    avg_mood: Optional[float]
    avg_energy: Optional[float]
    mood_data: Optional[list]
    goals_progress: Optional[list]
    habit_completion: Optional[list]
    journal_count: int
    life_score: Optional[float]
    summary: Optional[str]
    wins: Optional[list]
    ai_insight: Optional[str]

class GoalDecomposeResponse(BaseModel):
    goal_id: str
    title: str
    target_date: str
    milestones: list
    weekly_tasks: list
    daily_habits: list


# ── Smart Habits ─────────────────────────────────────────────────────────────

@router.post("/habits/{habit_id}/complete", response_model=HabitLogResponse)
def complete_habit(
    habit_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a habit completion. Automatically updates streaks."""
    try:
        habit = log_habit_completion(db, user, habit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return HabitLogResponse(
        habit_id=str(habit.id),
        name=habit.name,
        current_streak=habit.current_streak,
        best_streak=habit.best_streak,
        message=f"🔥 {habit.name} logged! Streak: {habit.current_streak} days",
    )


@router.get("/habits/{habit_id}/stats", response_model=HabitStatsResponse)
def habit_stats(
    habit_id: UUID,
    days: int = Query(30, ge=7, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed stats and calendar for a habit."""
    try:
        stats = get_habit_stats(db, user, habit_id, days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return stats


@router.get("/nudges", response_model=List[NudgeResponse])
def get_nudges(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check for missed habits and generate personalized AI nudges."""
    candidates = check_missed_habits(db, user)

    nudges = []
    for item in candidates[:5]:  # Max 5 nudges at a time
        habit = item["habit"]
        missed = item["missed_days"]
        try:
            nudge_text = generate_nudge(db, user, habit, missed)
        except Exception:
            nudge_text = (
                f"Hey, you've missed {habit.name} for {missed} days. "
                f"How about a quick 5-minute version today?"
            )
        nudges.append(NudgeResponse(
            habit_id=str(habit.id),
            habit_name=habit.name,
            missed_days=missed,
            nudge=nudge_text,
        ))

    return nudges


# ── Life Score ───────────────────────────────────────────────────────────────

@router.get("/life-score", response_model=LifeScoreResponse)
def get_life_score(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current Life Score (0-100) with component breakdown."""
    scores = calculate_life_score(db, user)
    # Also persist it
    save_life_score(db, user)
    return scores


@router.get("/life-score/trend", response_model=List[ScoreTrendPoint])
def life_score_trend(
    days: int = Query(30, ge=7, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get Life Score trend over time."""
    return get_score_trend(db, user.id, days)


# ── Weekly Reports ───────────────────────────────────────────────────────────

@router.post("/reports/weekly", response_model=WeeklyReportResponse)
def create_weekly_report(
    week_offset: int = Query(0, ge=0, le=52, description="0=this week, 1=last week"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a weekly reflection report."""
    try:
        report = generate_weekly_report(db, user, week_offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    return _report_to_response(report)


@router.get("/reports/weekly", response_model=List[WeeklyReportResponse])
def get_weekly_reports(
    limit: int = Query(12, ge=1, le=52),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get past weekly reports."""
    reports = list_reports(db, user.id, limit)
    return [_report_to_response(r) for r in reports]


# ── Goal Decomposer ─────────────────────────────────────────────────────────

@router.post("/goals/{goal_id}/decompose", response_model=GoalDecomposeResponse)
def decompose_goal_endpoint(
    goal_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI-powered goal decomposition into milestones, weekly tasks, and daily habits."""
    try:
        result = decompose_goal(db, user, goal_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decomposition failed: {str(e)}")

    return result


# ── Helpers ──────────────────────────────────────────────────────────────────

def _report_to_response(r) -> WeeklyReportResponse:
    return WeeklyReportResponse(
        id=str(r.id),
        week_start=r.week_start.isoformat(),
        week_end=r.week_end.isoformat(),
        avg_mood=r.avg_mood,
        avg_energy=r.avg_energy,
        mood_data=r.mood_data,
        goals_progress=r.goals_progress,
        habit_completion=r.habit_completion,
        journal_count=r.journal_count,
        life_score=r.life_score,
        summary=r.summary,
        wins=r.wins,
        ai_insight=r.ai_insight,
    )
