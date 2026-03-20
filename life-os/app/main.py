"""
Life OS — AI-Powered Personal Second Brain & Life Coach
========================================================
Entry point for the FastAPI application.
"""

from fastapi import FastAPI

from app.database import engine, Base
from app.routers import auth_router, goals_router, checkin_router, journal_router, habits_router, ai_router, phase4_router, privacy
from app.security.auth_upgrade import router as auth_upgrade_router
from app.security.middleware import setup_security_middleware, setup_cors

# Create all tables on startup (dev convenience — use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Life OS",
    description="AI-Powered Personal Second Brain & Life Coach API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security middleware stack
setup_cors(app)
setup_security_middleware(app)

# Register routers
app.include_router(auth_router.router)
app.include_router(goals_router.router)
app.include_router(checkin_router.router)
app.include_router(journal_router.router)
app.include_router(habits_router.router)
app.include_router(ai_router.router)
app.include_router(phase4_router.router)
app.include_router(privacy.router)
app.include_router(auth_upgrade_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "Life OS",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
