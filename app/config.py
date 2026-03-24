"""Application configuration — loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

# Railway/production compatibility
DATABASE_URL: str = os.getenv(
    "DATABASE_URL", "sqlite:///./lifeos.db"  # SQLite fallback for dev/Railway
)
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-please")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")
