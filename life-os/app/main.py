import os
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware

from app.database import engine, Base
from app.routers import auth_router, goals_router, checkin_router, journal_router, habits_router, ai_router, phase4_router, privacy
from app.security.auth_upgrade import router as auth_upgrade_router
from app.security.middleware import setup_security_middleware, setup_cors
from app.cache import cache, TTL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Life OS API...")
    Base.metadata.create_all(bind=engine)
    logger.info(f"Cache backend: {cache.stats().get(chr(39)+'backend'+chr(39), chr(39)+'unknown'+chr(39))}")
    yield
    logger.info("Shutting down Life OS API...")


app = FastAPI(title="Life OS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=1000)
setup_cors(app)
setup_security_middleware(app)


@app.middleware("http")
async def add_performance_headers(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    response.headers["X-Response-Time"] = f"{elapsed_ms}ms"
    if request.method == "GET":
        path = request.url.path
        if path in ("/health", "/"):
            response.headers["Cache-Control"] = f"public, max-age={TTL.HEALTH}"
        elif path.startswith("/api/ai"):
            response.headers["Cache-Control"] = f"private, max-age={TTL.AI_INSIGHT}"
        elif path.startswith("/api/"):
            response.headers["Cache-Control"] = "private, max-age=30"
    return response


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
    return {"app": "Life OS", "version": "0.1.0", "status": "running", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/api/cache/stats", tags=["Admin"])
def cache_stats():
    return cache.stats()


@app.delete("/api/cache/clear", tags=["Admin"])
def cache_clear():
    cache.clear()
    return {"status": "cleared"}
