"""
AI Service — The Brain of Life OS
===================================
Handles all LLM interactions via the Anthropic Claude API.
Builds rich context from user data before every AI call.
"""

import os
from datetime import date, timedelta, datetime, timezone
from typing import Optional

import anthropic
from sqlalchemy.orm import Session

from app.models import User, Goal, DailyCheckin, JournalEntry, Habit


def get_client() -> anthropic.Anthropic:
    """Get an Anthropic client. Requires ANTHROPIC_API_KEY in env."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Add it to your .env file."
        )
    return anthropic.Anthropic(api_key=api_key)


MODEL = "claude-sonnet-4-20250514"  # fast + smart; swap to opus for deeper coaching


# ─────────────────────────────────────────────────────────────────────────────
# Context Builders — assemble user data into structured text for the LLM
# ─────────────────────────────────────────────────────────────────────────────

def build_user_profile(user: User) -> str:
    """Basic user identity."""
    return (
        f"User: {user.full_name or user.username}\n"
        f"Timezone: {user.timezone}\n"
        f"Account created: {user.created_at.strftime('%Y-%m-%d')}"
    )


def build_goals_context(db: Session, user: User) -> str:
    """Active goals summary."""
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user.id, Goal.status == "active")
        .order_by(Goal.created_at.desc())
        .limit(20)
        .all()
    )
    if not goals:
        return "Goals: No active goals set yet."

    lines = ["Active Goals:"]
    for g in goals:
        target = f" (due {g.target_date})" if g.target_date else ""
        lines.append(
            f"  • [{g.category}/{g.timeframe}] {g.title} — {g.progress:.0f}% done{target}"
        )
        if g.description:
            lines.append(f"    {g.description[:150]}")
    return "\n".join(lines)


def build_mood_context(db: Session, user: User, days: int = 14) -> str:
    """Recent mood/energy check-ins."""
    since = date.today() - timedelta(days=days)
    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user.id, DailyCheckin.date >= since)
        .order_by(DailyCheckin.date.desc())
        .all()
    )
    if not checkins:
        return "Mood History: No check-ins recorded in the last 2 weeks."

    lines = [f"Mood & Energy (last {days} days):"]
    for c in checkins:
        extras = []
        if c.stress is not None:
            extras.append(f"stress={c.stress}")
        if c.sleep_hours is not None:
            extras.append(f"sleep={c.sleep_hours}h")
        extra_str = f" ({', '.join(extras)})" if extras else ""
        note_str = f" — \"{c.notes[:80]}\"" if c.notes else ""
        lines.append(
            f"  {c.date}: mood={c.mood}/10, energy={c.energy}/10{extra_str}{note_str}"
        )

    # Compute averages
    avg_mood = sum(c.mood for c in checkins) / len(checkins)
    avg_energy = sum(c.energy for c in checkins) / len(checkins)
    lines.append(f"  Averages: mood={avg_mood:.1f}, energy={avg_energy:.1f}")
    return "\n".join(lines)


def build_habits_context(db: Session, user: User) -> str:
    """Active habits and streaks."""
    habits = (
        db.query(Habit)
        .filter(Habit.user_id == user.id, Habit.is_active == True)
        .all()
    )
    if not habits:
        return "Habits: No active habits being tracked."

    lines = ["Active Habits:"]
    for h in habits:
        lines.append(
            f"  • {h.name} ({h.frequency}) — streak: {h.current_streak} "
            f"(best: {h.best_streak})"
        )
    return "\n".join(lines)


def build_journal_context(db: Session, user: User, limit: int = 10) -> str:
    """Recent journal entries (summaries)."""
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    if not entries:
        return "Journal: No entries written yet."

    lines = ["Recent Journal Entries:"]
    for e in entries:
        tag = f" [{e.mood_tag}]" if e.mood_tag else ""
        title = f" — {e.title}" if e.title else ""
        # Truncate content for context window efficiency
        snippet = e.content[:300].replace("\n", " ")
        lines.append(
            f"  {e.created_at.strftime('%Y-%m-%d %H:%M')}{tag}{title}: {snippet}"
        )
    return "\n".join(lines)


def build_full_context(db: Session, user: User) -> str:
    """Assemble all user context into a single block."""
    sections = [
        build_user_profile(user),
        build_goals_context(db, user),
        build_mood_context(db, user),
        build_habits_context(db, user),
        build_journal_context(db, user),
    ]
    return "\n\n".join(sections)


# ─────────────────────────────────────────────────────────────────────────────
# AI Features
# ─────────────────────────────────────────────────────────────────────────────

def generate_daily_briefing(db: Session, user: User) -> str:
    """
    Morning briefing — reads all user data and generates a personalized
    plan for the day.
    """
    context = build_full_context(db, user)
    today = date.today()
    day_name = today.strftime("%A")

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1500,
        system=(
            "You are Life OS, a warm but direct AI life coach and personal planner. "
            "You have deep knowledge of this user's goals, mood patterns, habits, and journal. "
            "Generate a personalized morning briefing for today. Include:\n"
            "1. A warm, personalized greeting (reference something specific from their data)\n"
            "2. How they've been feeling lately (mood/energy trends)\n"
            "3. Top 3 priorities for today based on their goals and recent progress\n"
            "4. One habit to focus on today\n"
            "5. A motivational insight or pattern you've noticed\n"
            "6. A suggested daily schedule with time blocks\n\n"
            "Be specific, not generic. Reference actual data. Keep it concise but actionable."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Today is {day_name}, {today.isoformat()}.\n\n"
                    f"Here is everything you know about me:\n\n{context}\n\n"
                    "Give me my morning briefing."
                ),
            }
        ],
    )
    return message.content[0].text


def analyze_mood_patterns(db: Session, user: User, days: int = 30) -> str:
    """
    Mood insights engine — analyzes check-in history and detects patterns,
    correlations, and actionable insights.
    """
    # Get extended mood data for better pattern detection
    since = date.today() - timedelta(days=days)
    checkins = (
        db.query(DailyCheckin)
        .filter(DailyCheckin.user_id == user.id, DailyCheckin.date >= since)
        .order_by(DailyCheckin.date.asc())
        .all()
    )

    if len(checkins) < 3:
        return (
            "I need at least 3 days of check-in data to detect meaningful patterns. "
            f"You have {len(checkins)} so far. Keep logging daily!"
        )

    # Build detailed data for analysis
    data_lines = []
    for c in checkins:
        day_name = c.date.strftime("%A")
        extras = []
        if c.stress is not None:
            extras.append(f"stress={c.stress}/10")
        if c.sleep_hours is not None:
            extras.append(f"sleep={c.sleep_hours}h")
        extra_str = f", {', '.join(extras)}" if extras else ""
        note_str = f' — notes: "{c.notes}"' if c.notes else ""
        data_lines.append(
            f"{c.date} ({day_name}): mood={c.mood}/10, energy={c.energy}/10{extra_str}{note_str}"
        )

    data_block = "\n".join(data_lines)
    habits_ctx = build_habits_context(db, user)

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1200,
        system=(
            "You are a mood analytics engine inside Life OS. Analyze the user's "
            "check-in data and find patterns. Look for:\n"
            "1. Day-of-week patterns (e.g., low energy on Mondays)\n"
            "2. Sleep ↔ mood/energy correlations\n"
            "3. Stress trends (rising, falling, spikes)\n"
            "4. Mood streaks (good or bad runs)\n"
            "5. Connections between notes/habits and mood changes\n\n"
            "Present 3-5 concrete, specific insights. Each should reference actual "
            "data points. End with 2 actionable recommendations.\n"
            "Be direct and specific — no vague platitudes."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Here is my check-in data from the last {days} days:\n\n"
                    f"{data_block}\n\n{habits_ctx}\n\n"
                    "What patterns do you see?"
                ),
            }
        ],
    )
    return message.content[0].text


def life_coach_chat(
    db: Session,
    user: User,
    user_message: str,
    conversation_history: Optional[list] = None,
) -> str:
    """
    Life coaching chat — responds to big life questions using the user's
    actual data (goals, journal, mood) as context.
    """
    context = build_full_context(db, user)

    messages = []

    # Include conversation history if provided (for multi-turn coaching)
    if conversation_history:
        for msg in conversation_history[-10:]:  # last 10 turns max
            messages.append(msg)

    messages.append({
        "role": "user",
        "content": user_message,
    })

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1500,
        system=(
            "You are Life OS Coach, a thoughtful AI life coach with deep knowledge "
            "of this user's life. You have access to their goals, mood history, "
            "journal entries, and habits.\n\n"
            "COACHING APPROACH:\n"
            "- Reference their actual data when giving advice (specific goals, "
            "mood patterns, journal entries)\n"
            "- Use frameworks: pros/cons analysis, regret minimization, "
            "values alignment, 10/10/10 rule\n"
            "- Ask clarifying questions before giving big advice\n"
            "- Be honest, even if it's uncomfortable\n"
            "- Consider their emotional state (recent mood data)\n"
            "- Connect decisions to their stated goals\n"
            "- Never be preachy. Be a smart friend who happens to know everything "
            "about their life.\n\n"
            f"USER CONTEXT:\n{context}"
        ),
        messages=messages,
    )
    return message.content[0].text


def journal_assistant(
    db: Session,
    user: User,
    user_input: str,
    mode: str = "reflect",
) -> dict:
    """
    AI journaling assistant — takes a feeling or topic, asks follow-ups,
    and generates a reflective journal entry.

    Modes:
      - "reflect": Generate follow-up questions + a draft entry
      - "prompt": Generate a journaling prompt based on recent data
      - "expand": Take rough notes and expand into a full entry
    """
    context = build_full_context(db, user)

    mode_instructions = {
        "reflect": (
            "The user shared a feeling or thought. Do the following:\n"
            "1. Acknowledge what they said with empathy (1-2 sentences)\n"
            "2. Ask 3 specific follow-up questions to help them explore deeper\n"
            "3. Based on what they shared + their recent data, write a draft "
            "reflective journal entry (200-400 words) in FIRST PERSON as if "
            "the user wrote it. Make it introspective and honest.\n\n"
            "Format your response with clear sections:\n"
            "**Reflection:**\n(your empathetic response)\n\n"
            "**Questions to explore:**\n(numbered questions)\n\n"
            "**Draft Journal Entry:**\n(the entry in first person)"
        ),
        "prompt": (
            "Based on the user's recent mood, goals, and journal history, "
            "generate 3 personalized journaling prompts. Each should be specific "
            "to their life, not generic. Explain briefly why each prompt might be "
            "valuable for them right now."
        ),
        "expand": (
            "The user provided rough notes/thoughts. Expand them into a "
            "well-written, reflective journal entry (300-500 words) in FIRST "
            "PERSON. Maintain their voice and meaning, but add depth, "
            "introspection, and connections to their goals/mood patterns. "
            "Don't invent facts — only expand on what they said."
        ),
    }

    instruction = mode_instructions.get(mode, mode_instructions["reflect"])

    client = get_client()
    message = client.messages.create(
        model=MODEL,
        max_tokens=1500,
        system=(
            "You are the Journal Assistant inside Life OS. You help users "
            "process their thoughts and feelings through reflective writing.\n\n"
            f"{instruction}\n\n"
            f"USER CONTEXT:\n{context}"
        ),
        messages=[
            {
                "role": "user",
                "content": user_input,
            }
        ],
    )

    response_text = message.content[0].text

    # Suggest a mood tag based on the content
    mood_tag = _detect_mood_tag(user_input)

    return {
        "ai_response": response_text,
        "suggested_mood_tag": mood_tag,
        "mode": mode,
    }


def _detect_mood_tag(text: str) -> str:
    """Simple keyword-based mood detection (fast, no API call needed)."""
    text_lower = text.lower()
    mood_map = {
        "grateful": ["grateful", "thankful", "appreciate", "blessed"],
        "anxious": ["anxious", "worried", "nervous", "stress", "overwhelm"],
        "motivated": ["motivated", "excited", "pumped", "ready", "inspired"],
        "stuck": ["stuck", "lost", "confused", "don't know", "uncertain"],
        "reflective": ["thinking", "wondering", "looking back", "realize"],
        "frustrated": ["frustrated", "annoyed", "angry", "mad", "irritated"],
        "sad": ["sad", "down", "lonely", "miss", "depressed"],
        "happy": ["happy", "great", "amazing", "wonderful", "good day"],
        "calm": ["calm", "peaceful", "relaxed", "content", "serene"],
    }
    for tag, keywords in mood_map.items():
        if any(kw in text_lower for kw in keywords):
            return tag
    return "reflective"  # default
