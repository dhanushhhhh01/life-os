"""
AI Routes — The intelligence layer of Life OS.
Exposes daily briefings, mood insights, coaching chat, and journal assistant.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User, JournalEntry
from app.ai_service import (
    generate_daily_briefing,
    analyze_mood_patterns,
    life_coach_chat,
    journal_assistant,
)

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class BriefingResponse(BaseModel):
    briefing: str
    date: str


class MoodInsightsRequest(BaseModel):
    days: int = Field(30, ge=7, le=365, description="Number of days to analyze")


class MoodInsightsResponse(BaseModel):
    insights: str
    days_analyzed: int


class CoachMessage(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    conversation_history: Optional[List[dict]] = None


class CoachResponse(BaseModel):
    response: str


class JournalAssistRequest(BaseModel):
    input: str = Field(min_length=1, max_length=5000, description="Your thought, feeling, or rough notes")
    mode: str = Field(
        "reflect",
        description="Mode: 'reflect' (follow-ups + draft), 'prompt' (get prompts), 'expand' (expand rough notes)"
    )
    auto_save: bool = Field(False, description="Automatically save the draft as a journal entry")


class JournalAssistResponse(BaseModel):
    ai_response: str
    suggested_mood_tag: str
    mode: str
    saved_entry_id: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/briefing", response_model=BriefingResponse)
def daily_briefing(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    🌅 Daily Briefing — Get your personalized morning plan.
    Reads your goals, mood history, habits, and journal to create
    a tailored plan for the day.
    """
    try:
        briefing = generate_daily_briefing(db, user)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )

    from datetime import date as date_type
    return BriefingResponse(
        briefing=briefing,
        date=date_type.today().isoformat(),
    )


@router.post("/mood-insights", response_model=MoodInsightsResponse)
def mood_insights(
    payload: MoodInsightsRequest = MoodInsightsRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    📊 Mood Insights — Analyze your mood/energy patterns.
    Detects day-of-week patterns, sleep correlations, stress trends,
    and habit connections.
    """
    try:
        insights = analyze_mood_patterns(db, user, days=payload.days)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )

    return MoodInsightsResponse(
        insights=insights,
        days_analyzed=payload.days,
    )


@router.post("/coach", response_model=CoachResponse)
def coach_chat(
    payload: CoachMessage,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    🧭 Life Coach — Ask anything about your life.
    "Should I quit my job?" "How do I prioritize?" "I'm feeling lost."
    The AI uses your actual goals, journal, and mood data to give
    personalized advice.
    """
    try:
        response = life_coach_chat(
            db, user, payload.message, payload.conversation_history
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )

    return CoachResponse(response=response)


@router.post("/journal-assist", response_model=JournalAssistResponse)
def journal_assist(
    payload: JournalAssistRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ✍️ Journal Assistant — Turn feelings into reflective entries.
    
    Modes:
    - **reflect**: Share a feeling → get follow-up questions + a draft entry
    - **prompt**: Get personalized journaling prompts based on your recent data
    - **expand**: Share rough notes → get a polished journal entry
    
    Set auto_save=true to automatically save the draft as a journal entry.
    """
    if payload.mode not in ("reflect", "prompt", "expand"):
        raise HTTPException(
            status_code=400,
            detail="Mode must be 'reflect', 'prompt', or 'expand'.",
        )

    try:
        result = journal_assistant(db, user, payload.input, mode=payload.mode)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )

    saved_id = None

    # Auto-save the draft if requested and mode produces an entry
    if payload.auto_save and payload.mode in ("reflect", "expand"):
        entry = JournalEntry(
            user_id=user.id,
            title=f"AI-assisted reflection",
            content=result["ai_response"],
            mood_tag=result["suggested_mood_tag"],
            prompt=payload.input,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        saved_id = str(entry.id)

    return JournalAssistResponse(
        ai_response=result["ai_response"],
        suggested_mood_tag=result["suggested_mood_tag"],
        mode=result["mode"],
        saved_entry_id=saved_id,
    )
