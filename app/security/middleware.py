"""
Security Middleware
===================
Rate limiting, CORS, security headers, request size limits
"""

from fastapi import Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time


# Rate limiter
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Limit request body size to prevent DoS attacks."""
    
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10 MB
    
    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.MAX_REQUEST_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request body too large. Maximum size: {self.MAX_REQUEST_SIZE} bytes"
                )
        
        return await call_next(request)


class SecurityLogMiddleware(BaseHTTPMiddleware):
    """Log security-relevant events."""
    
    async def dispatch(self, request: Request, call_next):
        # Log authentication attempts
        if request.url.path in ["/auth/login", "/auth/register", "/auth/refresh"]:
            request.state.log_security_event = True
            request.state.security_action = request.url.path.split("/")[-1]
        
        # Track request start time
        request.state.start_time = time.time()
        
        response = await call_next(request)
        
        # Add timing header for monitoring
        process_time = time.time() - request.state.start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


def setup_cors(app, allowed_origins: list = None):
    """Configure CORS middleware."""
    import os
    
    if allowed_origins is None:
        # In production (Railway/Vercel), allow all origins for demo
        # In prod, set ALLOWED_ORIGINS env var to restrict
        if os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("VERCEL"):
            allowed_origins = ["*"]  # Open for public demo
        else:
            allowed_origins = ["http://localhost:3000", "http://localhost:8000"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Process-Time"],
    )


def setup_security_middleware(app):
    """Add all security middleware to the app."""
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware)
    app.add_middleware(SecurityLogMiddleware)
    
    # Rate limit exception handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
