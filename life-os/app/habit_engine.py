"""
Smart Habit Engine
===================
- Tracks per-day completions via HabitLog
- Detects missed streaks and generates personalized AI nudges
- References mood history to make nudges emotionally intelligent
"""

from datetime import date, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import User, Habit, HabitLog, DailyCheckin
from app.ai_service import get_client, build_mood_context, build_habits_context, MODEL


def log_habit_completion(db: Session, user: User, habit_id, log_date: Optional[date] = None) -> Habit:
    """Log a habit completion for a specific date. Updates streak logic."""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user.id).first()
    if not habit:
        raise ValueError("Habit not found")

    today = log_date or date.today()

    # Check if already logged
    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id,
        HabitLog.date == today,
    ).first()

    if existing:
        existing.count += 1
        db.commit()
        db.refresh(existing)
    else:
        log = HabitLog(
            user_id=user.id,
            habit_id=habit.id,
            date=today,
        )
        db.add(log)

    # Update streak
    _update_streak(db, habit)
    db.commit()
    db.refresh(habit)
    return habit


def _update_streak(db: Session, habit: Habit):
    """Recalculate current streak from logs."""
    today = date.today()
    streak = 0
    check_date = today

    while True:
        has_log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == check_date,
        ).first()

        if has_log:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    habit.current_streak = streak
    habit.last_logged = today
    habit.missed_days = 0
    if streak > habit.best_streak:
        habit.best_streak = streak


def check_missed_habits(db: Session, user: User) -> List[dict]:
    """Check all active habits for missed days. Returns list of habits needing nudges."""
    today = date.today()
    habits = db.query(Habit).filter(
        Habit.user_id == user.id,
        Habit.is_active == True,
    ).all()

    nudge_candidates = []

    for habit in habits:
        if habit.frequency == "weekly":
            # Check if logged this week
            week_start = today - timedelta(days=today.weekday())
            logs_this_week = db.query(func.count(HabitLog.id)).filter(
                HabitLog.habit_id == habit.id,
                HabitLog.date >= week_start,
            ).scalar() or 0
            if logs_this_week >= habit.target_count:
                continue
            # Only nudge if past mid-week with no logs
            if today.weekday() >= 3 and logs_this_week == 0:
                missed = today.weekday() - 0  # days since Monday
                nudge_candidates.append({"habit": habit, "missed_days": missed})
        else:
            # Daily habit — count consecutive missed days
            missed = 0
            check = today
            while True:
                has_log = db.query(HabitLog).filter(
                    HabitLog.habit_id == habit.id,
                    HabitLog.date == check,
                ).first()
                if has_log:
                    break
                missed += 1
                check -= timedelta(days=1)
                if missed > 30:
                    break

            # Update missed_days on model
            habit.missed_days = missed

            if missed >= 2:
                nudge_candidates.append({"habit": habit, "missed_days": missed})

    db.commit()
    return nudge_candidates


def generate_nudge(db: Session, user: User, habit: Habit, missed_days: int) -> str:
    """Generate a personalized AI nudge for a missed habit."""
    mood_ctx = build_mood_context(db, user, days=14)

    # Find what happened last time they broke this streak
    historical_note = _find_historical_pattern(db, user, habit)

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=300,
        system=(
            "You are the Life OS nudge engine. Generate a short, warm, personalized "
            "nudge message (2-4 sentences max) to encourage the user to get back to "
            "their habit. Be specific — reference the habit name, how many days missed, "
            "and any mood correlation you notice. Suggest a smaller version of the habit "
            "to lower the barrier. Never be preachy or guilt-trippy. Be a supportive friend."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Habit: {habit.name} ({habit.frequency}, preferred time: {habit.time_of_day})\n"
                f"Missed: {missed_days} consecutive days\n"
                f"Current streak before miss: {habit.current_streak}\n"
                f"Best streak ever: {habit.best_streak}\n"
                f"{historical_note}\n\n"
                f"{mood_ctx}\n\n"
                "Write a nudge message."
            ),
        }],
    )
    return message.content[0].text


def _find_historical_pattern(db: Session, user: User, habit: Habit) -> str:
    """Look for mood patterns around previous streak breaks."""
    # Find gaps in habit logs
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id,
    ).order_by(HabitLog.date.desc()).limit(60).all()

    if len(logs) < 5:
        return "Historical pattern: Not enough data yet."

    # Find the last gap
    dates = sorted([l.date for l in logs])
    gaps = []
    for i in range(1, len(dates)):
        diff = (dates[i] - dates[i - 1]).days
        if diff > 2:
            gaps.append({"start": dates[i - 1], "end": dates[i], "length": diff})

    if not gaps:
        return "Historical pattern: User has been fairly consistent."

    last_gap = gaps[-1]
    # Check mood during that gap
    checkins = db.query(DailyCheckin).filter(
        DailyCheckin.user_id == user.id,
        DailyCheckin.date >= last_gap["start"],
        DailyCheckin.date <= last_gap["end"],
    ).all()

    if checkins:
        avg_mood = sum(c.mood for c in checkins) / len(checkins)
        return (
            f"Historical pattern: Last time they skipped this habit for {last_gap['length']} days "
            f"(around {last_gap['start']}), their average mood was {avg_mood:.1f}/10."
        )
    return "Historical pattern: Previous gap found but no mood data for that period."


def get_habit_stats(db: Session, user: User, habit_id, days: int = 30) -> dict:
    """Get detailed stats for a single habit."""
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user.id).first()
    if not habit:
        raise ValueError("Habit not found")

    since = date.today() - timedelta(days=days)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id,
        HabitLog.date >= since,
    ).order_by(HabitLog.date.asc()).all()

    log_dates = {l.date for l in logs}

    if habit.frequency == "daily":
        expected = days
    else:
        expected = max(1, days // 7) * habit.target_count

    completed = len(logs)
    rate = (completed / expected * 100) if expected > 0 else 0

    # Build calendar data
    calendar = []
    for i in range(days):
        d = since + timedelta(days=i)
        calendar.append({
            "date": d.isoformat(),
            "completed": d in log_dates,
        })

    return {
        "habit_id": str(habit.id),
        "name": habit.name,
        "days_analyzed": days,
        "completed": completed,
        "expected": expected,
        "completion_rate": round(rate, 1),
        "current_streak": habit.current_streak,
        "best_streak": habit.best_streak,
        "calendar": calendar,
    }
