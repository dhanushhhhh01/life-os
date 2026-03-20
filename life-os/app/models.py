"""SQLAlchemy ORM models — the database schema for Life OS."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Date,
    ForeignKey, Boolean, UniqueConstraint, JSON, TypeDecorator, CHAR,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.database import Base


# ── Cross-compatible UUID type (works with both PostgreSQL and SQLite) ───────

class UUID(TypeDecorator):
    """Platform-independent UUID type.
    Uses PostgreSQL's native UUID when available, otherwise stores as CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value if isinstance(value, uuid.uuid4.__class__) else uuid.UUID(str(value))
        else:
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid():
    return uuid.uuid4()


# ── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    timezone = Column(String(50), default="UTC")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    checkins = relationship("DailyCheckin", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    habit_logs = relationship("HabitLog", back_populates="user", cascade="all, delete-orphan")
    weekly_reports = relationship("WeeklyReport", back_populates="user", cascade="all, delete-orphan")
    life_scores = relationship("LifeScore", back_populates="user", cascade="all, delete-orphan")


# ── Goals ────────────────────────────────────────────────────────────────────

class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="general")
    timeframe = Column(String(20), default="mid")
    target_date = Column(Date, nullable=True)
    progress = Column(Float, default=0.0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # AI-generated decomposition
    milestones = Column(JSON, nullable=True)      # [{title, target_date, done}]
    weekly_tasks = Column(JSON, nullable=True)     # [{week, tasks: [str]}]
    daily_habits = Column(JSON, nullable=True)     # [{habit, frequency}]

    user = relationship("User", back_populates="goals")


# ── Daily Check-ins ──────────────────────────────────────────────────────────

class DailyCheckin(Base):
    __tablename__ = "daily_checkins"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_date_checkin"),
    )

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    mood = Column(Integer, nullable=False)
    energy = Column(Integer, nullable=False)
    stress = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="checkins")


# ── Journal Entries ──────────────────────────────────────────────────────────

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=True)
    content = Column(Text, nullable=False)
    mood_tag = Column(String(50), nullable=True)
    prompt = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="journal_entries")


# ── Habits ───────────────────────────────────────────────────────────────────

class Habit(Base):
    __tablename__ = "habits"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(String(20), default="daily")      # daily, weekly, custom
    target_count = Column(Integer, default=1)
    time_of_day = Column(String(20), default="anytime")   # morning, afternoon, evening, anytime
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_logged = Column(Date, nullable=True)
    missed_days = Column(Integer, default=0)               # consecutive missed days
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


# ── Habit Logs (individual completions) ──────────────────────────────────────

class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (
        UniqueConstraint("habit_id", "date", name="uq_habit_date_log"),
    )

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    habit_id = Column(UUID(), ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    count = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="habit_logs")
    habit = relationship("Habit", back_populates="logs")


# ── Weekly Reports ───────────────────────────────────────────────────────────

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_user_week_report"),
    )

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)

    # Computed data
    mood_data = Column(JSON, nullable=True)         # [{date, mood, energy}]
    avg_mood = Column(Float, nullable=True)
    avg_energy = Column(Float, nullable=True)
    goals_progress = Column(JSON, nullable=True)    # [{title, progress, delta}]
    habit_completion = Column(JSON, nullable=True)   # [{name, completed, target, rate}]
    journal_count = Column(Integer, default=0)
    life_score = Column(Float, nullable=True)

    # AI-generated
    summary = Column(Text, nullable=True)
    wins = Column(JSON, nullable=True)               # [str]
    ai_insight = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="weekly_reports")


# ── Life Score (daily snapshot) ──────────────────────────────────────────────

class LifeScore(Base):
    __tablename__ = "life_scores"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_date_score"),
    )

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    total_score = Column(Float, nullable=False)     # 0-100

    # Component scores (each 0-100)
    mood_score = Column(Float, default=0)
    habit_score = Column(Float, default=0)
    goal_score = Column(Float, default=0)
    journal_score = Column(Float, default=0)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="life_scores")


# ── Security Logs ────────────────────────────────────────────────────────────

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)       # login, register, refresh, export, delete_account, failed_login
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User")


# ── Refresh Tokens ───────────────────────────────────────────────────────────

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(), primary_key=True, default=new_uuid)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User")
