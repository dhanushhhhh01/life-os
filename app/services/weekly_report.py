"""
Weekly Reflection Report Generator
====================================
Every Sunday (or on demand), generates a beautiful summary:
- Mood trend data
- Goal progress deltas
- Habit completion rates
- Journal count
- AI-generated wins + insight
"""

from datetime import date, timedelta
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    User, DailyCheckin, Goal, Habit, HabitLog, JournalEntry, WeeklyReport,
)
from app.ai_service import get_client, MODEL
from app.life_score import calculate_life_score


def generate_weekly_report(db: Session, user: User, week_offset: int = 0) -> WeeklyReport:
    """
    Generate a weekly report. week_offset=0 means current week,
    week_offset=1 means last week, etc.
    """
    today = date.today()
    # Find the most recent Sunday (or today if Sunday)
    days_since_sunday = (today.weekday() + 1) % 7
    this_sunday = today - timedelta(days=days_since_sunday)
    week_end = this_sunday - timedelta(weeks=week_offset)
    week_start = week_end - timedelta(days=6)

    # Check if report already exists
    existing = db.query(WeeklyReport).filter(
        WeeklyReport.user_id == user.id,
        WeeklyReport.week_start == week_start,
    ).first()
    if existing and existing.summary:
        return existing

    # ── Gather data ──────────────────────────────────────────────────────

    # Mood data
    checkins = db.query(DailyCheckin).filter(
        DailyCheckin.user_id == user.id,
        DailyCheckin.date >= week_start,
        DailyCheckin.date <= week_end,
    ).order_by(DailyCheckin.date.asc()).all()

    mood_data = [
        {"date": c.date.isoformat(), "mood": c.mood, "energy": c.energy}
        for c in checkins
    ]
    avg_mood = sum(c.mood for c in checkins) / len(checkins) if checkins else None
    avg_energy = sum(c.energy for c in checkins) / len(checkins) if checkins else None

    # Goal progress
    active_goals = db.query(Goal).filter(
        Goal.user_id == user.id, Goal.status == "active"
    ).all()
    goals_progress = [
        {"title": g.title, "progress": g.progress, "category": g.category}
        for g in active_goals
    ]

    # Habit completion
    active_habits = db.query(Habit).filter(
        Habit.user_id == user.id, Habit.is_active == True
    ).all()

    habit_completion = []
    for h in active_habits:
        logs = db.query(func.count(HabitLog.id)).filter(
            HabitLog.habit_id == h.id,
            HabitLog.date >= week_start,
            HabitLog.date <= week_end,
        ).scalar() or 0
        target = 7 if h.frequency == "daily" else h.target_count
        rate = (logs / target * 100) if target > 0 else 0
        habit_completion.append({
            "name": h.name, "completed": logs, "target": target,
            "rate": round(rate, 1),
        })

    # Journal count
    journal_count = db.query(func.count(JournalEntry.id)).filter(
        JournalEntry.user_id == user.id,
        JournalEntry.created_at >= week_start,
        JournalEntry.created_at <= week_end + timedelta(days=1),
    ).scalar() or 0

    # Life score
    scores = calculate_life_score(db, user)

    # ── AI Summary ───────────────────────────────────────────────────────

    data_block = (
        f"Week: {week_start} to {week_end}\n\n"
        f"Mood data: {mood_data}\n"
        f"Average mood: {avg_mood:.1f}/10\n" if avg_mood else "No mood data\n"
        f"Average energy: {avg_energy:.1f}/10\n" if avg_energy else ""
        f"\nGoals: {goals_progress}\n"
        f"\nHabits: {habit_completion}\n"
        f"\nJournal entries written: {journal_count}\n"
        f"Life Score: {scores['total_score']}/100\n"
    )

    try:
        client = get_client()
        message = client.messages.create(
            model=MODEL,
            max_tokens=800,
            system=(
                "You are Life OS generating a weekly reflection report. Based on the data:\n"
                "1. Write a warm 2-3 sentence summary of the week\n"
                "2. List 3 specific wins (things that went well, based on data)\n"
                "3. Write 1 actionable insight or pattern you noticed\n\n"
                "Be specific, reference actual numbers. Keep it encouraging but honest.\n"
                "Respond in JSON format: {\"summary\": \"...\", \"wins\": [\"...\", \"...\", \"...\"], \"insight\": \"...\"}"
            ),
            messages=[{"role": "user", "content": data_block}],
        )

        import json
        try:
            ai_data = json.loads(message.content[0].text)
            summary = ai_data.get("summary", "")
            wins = ai_data.get("wins", [])
            insight = ai_data.get("insight", "")
        except (json.JSONDecodeError, IndexError):
            summary = message.content[0].text
            wins = []
            insight = ""
    except Exception:
        summary = f"Week of {week_start}: {len(checkins)} check-ins, {journal_count} journal entries."
        wins = []
        insight = "AI summary unavailable."

    # ── Save ─────────────────────────────────────────────────────────────

    if existing:
        report = existing
        report.mood_data = mood_data
        report.avg_mood = avg_mood
        report.avg_energy = avg_energy
        report.goals_progress = goals_progress
        report.habit_completion = habit_completion
        report.journal_count = journal_count
        report.life_score = scores["total_score"]
        report.summary = summary
        report.wins = wins
        report.ai_insight = insight
    else:
        report = WeeklyReport(
            user_id=user.id,
            week_start=week_start,
            week_end=week_end,
            mood_data=mood_data,
            avg_mood=avg_mood,
            avg_energy=avg_energy,
            goals_progress=goals_progress,
            habit_completion=habit_completion,
            journal_count=journal_count,
            life_score=scores["total_score"],
            summary=summary,
            wins=wins,
            ai_insight=insight,
        )
        db.add(report)

    db.commit()
    db.refresh(report)
    return report


def list_reports(db: Session, user_id, limit: int = 12) -> list:
    """Get recent weekly reports."""
    return (
        db.query(WeeklyReport)
        .filter(WeeklyReport.user_id == user_id)
        .order_by(WeeklyReport.week_start.desc())
        .limit(limit)
        .all()
    )
