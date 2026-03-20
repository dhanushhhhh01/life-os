"""
Smart Goal Decomposer
======================
User says "I want to write a book" → AI generates:
- 90-day milestones with target dates
- Weekly task breakdown
- Daily micro-habits to build momentum
Results are saved directly on the Goal model.
"""

import json
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import User, Goal
from app.ai_service import get_client, build_goals_context, build_habits_context, MODEL


def decompose_goal(db: Session, user: User, goal_id) -> dict:
    """Take an existing goal and break it into milestones, weekly tasks, and daily habits."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not goal:
        raise ValueError("Goal not found")

    existing_context = build_goals_context(db, user)
    habits_context = build_habits_context(db, user)

    target = goal.target_date or (date.today() + timedelta(days=90))
    days_available = (target - date.today()).days
    weeks_available = max(1, days_available // 7)

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1500,
        system=(
            "You are Life OS Goal Decomposer. Break down a big goal into actionable pieces.\n"
            "Consider the user's existing goals and habits to avoid overloading them.\n\n"
            "Respond in strict JSON format:\n"
            "{\n"
            '  "milestones": [\n'
            '    {"title": "...", "target_date": "YYYY-MM-DD", "description": "..."}\n'
            "  ],\n"
            '  "weekly_tasks": [\n'
            '    {"week": 1, "tasks": ["task1", "task2", "task3"]}\n'
            "  ],\n"
            '  "daily_habits": [\n'
            '    {"habit": "...", "frequency": "daily", "time_of_day": "morning", "duration_minutes": 15}\n'
            "  ]\n"
            "}\n\n"
            "Rules:\n"
            "- Create 3-6 milestones spread across the timeframe\n"
            "- Weekly tasks for at least the first 4 weeks\n"
            "- 1-3 small daily micro-habits (keep them tiny — 5-15 min)\n"
            "- Be realistic about the timeframe\n"
            "- Make tasks specific and measurable"
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Goal: {goal.title}\n"
                f"Description: {goal.description or 'None provided'}\n"
                f"Category: {goal.category}\n"
                f"Target date: {target.isoformat()} ({days_available} days, ~{weeks_available} weeks)\n"
                f"Current progress: {goal.progress}%\n\n"
                f"Existing context:\n{existing_context}\n\n{habits_context}\n\n"
                "Decompose this goal."
            ),
        }],
    )

    # Parse AI response
    raw = message.content[0].text
    try:
        # Handle markdown code blocks
        if "```" in raw:
            raw = raw.split("```json")[-1].split("```")[0] if "```json" in raw else raw.split("```")[1].split("```")[0]
        result = json.loads(raw.strip())
    except (json.JSONDecodeError, IndexError):
        result = {
            "milestones": [{"title": "Define scope", "target_date": (date.today() + timedelta(days=14)).isoformat(), "description": "Clarify what done looks like"}],
            "weekly_tasks": [{"week": 1, "tasks": ["Research and plan", "Set up workspace", "Start first draft"]}],
            "daily_habits": [{"habit": f"Work on {goal.title} for 15 min", "frequency": "daily", "time_of_day": "morning", "duration_minutes": 15}],
            "_parse_error": "AI response wasn't valid JSON. Using defaults.",
            "_raw": raw[:500],
        }

    # Save to goal
    goal.milestones = result.get("milestones", [])
    goal.weekly_tasks = result.get("weekly_tasks", [])
    goal.daily_habits = result.get("daily_habits", [])
    db.commit()
    db.refresh(goal)

    return {
        "goal_id": str(goal.id),
        "title": goal.title,
        "target_date": target.isoformat(),
        "milestones": goal.milestones,
        "weekly_tasks": goal.weekly_tasks,
        "daily_habits": goal.daily_habits,
    }
