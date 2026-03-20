"""Pydantic schemas — request/response validation."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None
    timezone: str = "UTC"


class UserLogin(BaseModel):
    username: str  # accepts username OR email
    password: str


class UserOut(BaseModel):
    id: UUID
    email: str
    username: str
    full_name: Optional[str]
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Goals ────────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: Optional[str] = None
    category: str = "general"
    timeframe: str = "mid"
    target_date: Optional[date] = None


class GoalOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    category: str
    timeframe: str
    target_date: Optional[date]
    progress: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    timeframe: Optional[str] = None
    target_date: Optional[date] = None
    progress: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None


# ── Daily Check-in ───────────────────────────────────────────────────────────

class CheckinCreate(BaseModel):
    date: Optional[date] = None  # defaults to today
    mood: int = Field(ge=1, le=10)
    energy: int = Field(ge=1, le=10)
    stress: Optional[int] = Field(None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    notes: Optional[str] = None


class CheckinOut(BaseModel):
    id: UUID
    date: date
    mood: int
    energy: int
    stress: Optional[int]
    sleep_hours: Optional[float]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Journal ──────────────────────────────────────────────────────────────────

class JournalCreate(BaseModel):
    title: Optional[str] = None
    content: str = Field(min_length=1)
    mood_tag: Optional[str] = None
    prompt: Optional[str] = None


class JournalOut(BaseModel):
    id: UUID
    title: Optional[str]
    content: str
    mood_tag: Optional[str]
    prompt: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Habits ───────────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    frequency: str = "daily"
    target_count: int = 1
    time_of_day: str = "anytime"  # morning, afternoon, evening, anytime


class HabitOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    frequency: str
    target_count: int
    time_of_day: str
    current_streak: int
    best_streak: int
    missed_days: int
    last_logged: Optional[date]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
