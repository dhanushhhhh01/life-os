import os
import time
import json
import hashlib
import logging
from typing import Any, Optional, Callable
from functools import wraps

logger = logging.getLogger(__name__)


class _TTLCache:
    def __init__(self):
        self._store = {}
        self._hits = 0
        self._misses = 0

    def get(self, key):
        entry = self._store.get(key)
        if entry is None:
            self._misses += 1
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            self._misses += 1
            return None
        self._hits += 1
        return value

    def set(self, key, value, ttl=300):
        self._store[key] = (value, time.monotonic() + ttl)

    def delete(self, key):
        self._store.pop(key, None)

    def delete_pattern(self, pattern):
        keys = [k for k in list(self._store.keys()) if pattern in k]
        for k in keys:
            del self._store[k]
        return len(keys)

    def clear(self):
        self._store.clear()

    def stats(self):
        total = self._hits + self._misses
        return {
            "backend": "memory",
            "size": len(self._store),
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / total, 3) if total else 0,
        }


class _RedisCache:
    def __init__(self, redis_url):
        import redis
        self._r = redis.from_url(redis_url, decode_responses=True, socket_timeout=2)
        self._hits = 0
        self._misses = 0

    def get(self, key):
        try:
            raw = self._r.get(key)
            if raw is None:
                self._misses += 1
                return None
            self._hits += 1
            return json.loads(raw)
        except Exception as e:
            logger.warning(f"Cache GET error: {e}")
            self._misses += 1
            return None

    def set(self, key, value, ttl=300):
        try:
            self._r.setex(key, ttl, json.dumps(value, default=str))
        except Exception as e:
            logger.warning(f"Cache SET error: {e}")

    def delete(self, key):
        try:
            self._r.delete(key)
        except Exception as e:
            logger.warning(f"Cache DELETE error: {e}")

    def delete_pattern(self, pattern):
        try:
            keys = self._r.keys(f"*{pattern}*")
            return self._r.delete(*keys) if keys else 0
        except Exception as e:
            logger.warning(f"Cache DELETE_PATTERN error: {e}")
            return 0

    def clear(self):
        try:
            self._r.flushdb()
        except Exception as e:
            logger.warning(f"Cache CLEAR error: {e}")

    def stats(self):
        total = self._hits + self._misses
        try:
            info = self._r.info("stats")
            return {
                "backend": "redis",
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": round(self._hits / total, 3) if total else 0,
                "redis_keyspace_hits": info.get("keyspace_hits", 0),
                "redis_keyspace_misses": info.get("keyspace_misses", 0),
            }
        except Exception:
            return {"backend": "redis", "hits": self._hits, "misses": self._misses}


def _build_cache():
    redis_url = os.getenv("REDIS_URL") or os.getenv("REDIS_PRIVATE_URL")
    if redis_url:
        try:
            c = _RedisCache(redis_url)
            c._r.ping()
            logger.info("Cache: using Redis backend")
            return c
        except Exception as e:
            logger.warning(f"Redis unavailable ({e}), falling back to memory cache")
    logger.info("Cache: using in-memory backend")
    return _TTLCache()


cache = _build_cache()


class TTL:
    HEALTH = 10
    USER_PROFILE = 60
    JOURNAL_LIST = 30
    JOURNAL_ENTRY = 120
    HABITS = 30
    GOALS = 60
    LIFE_SCORE = 60
    AI_INSIGHT = 300
    DASHBOARD = 45
    CHECKIN = 30


def cache_key(*parts):
    raw = ":".join(str(p) for p in parts)
    return hashlib.md5(raw.encode()).hexdigest()[:16] + ":" + raw[:80]


def cached(ttl=300, key_prefix=""):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            safe_kwargs = {k: v for k, v in kwargs.items()
                          if k not in ("db", "request", "current_user")}
            user_id = kwargs.get("current_user") and getattr(kwargs["current_user"], "id", "")
            key = cache_key(key_prefix or fn.__name__, user_id,
                            json.dumps(safe_kwargs, default=str, sort_keys=True))
            hit = cache.get(key)
            if hit is not None:
                return hit
            result = await fn(*args, **kwargs)
            try:
                json.dumps(result, default=str)
                cache.set(key, result, ttl=ttl)
            except (TypeError, ValueError):
                pass
            return result
        return wrapper
    return decorator
