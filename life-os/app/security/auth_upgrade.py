"""
Refresh Token Logic
====================
Short-lived access tokens (15 min) + long-lived refresh tokens (7 days).
Refresh tokens are hashed before storage. Supports revocation.
"""

import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, RefreshToken, SecurityLog
from app.auth import create_access_token, verify_password, get_current_user
from app.schemas import UserOut, Token
from sqlalchemy import or_

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_TOKEN_EXPIRE_DAYS = 7


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _log_security(db: Session, user_id, action: str, ip: str, details: str = None):
    log = SecurityLog(user_id=user_id, action=action, ip_address=ip, details=details)
    db.add(log)
    db.commit()


def create_refresh_token(db: Session, user_id, ip: str = None) -> str:
    """Generate a new refresh token, store its hash, return the raw token."""
    raw_token = secrets.token_urlsafe(64)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    rt = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(rt)
    db.commit()

    if ip:
        _log_security(db, user_id, "token_issued", ip)

    return raw_token


def verify_refresh_token(db: Session, raw_token: str):
    """Verify a refresh token. Returns the user_id or raises."""
    token_hash = _hash_token(raw_token)
    rt = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False,
    ).first()

    if not rt:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if rt.expires_at < datetime.now(timezone.utc):
        rt.revoked = True
        db.commit()
        raise HTTPException(status_code=401, detail="Refresh token expired")

    return rt.user_id


def revoke_refresh_token(db: Session, raw_token: str):
    """Revoke a specific refresh token."""
    token_hash = _hash_token(raw_token)
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if rt:
        rt.revoked = True
        db.commit()


def revoke_all_user_tokens(db: Session, user_id):
    """Revoke all refresh tokens for a user (logout everywhere)."""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False,
    ).update({"revoked": True})
    db.commit()


# ── Endpoints ────────────────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


@router.post("/refresh", response_model=TokenPairResponse)
def refresh_tokens(
    payload: RefreshRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    ip = _get_client_ip(request)
    user_id = verify_refresh_token(db, payload.refresh_token)

    # Revoke old refresh token (rotation)
    revoke_refresh_token(db, payload.refresh_token)

    # Issue new pair
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(user.id)
    new_refresh = create_refresh_token(db, user.id, ip)

    _log_security(db, user.id, "token_refresh", ip)

    return TokenPairResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserOut.model_validate(user),
    )


@router.post("/logout")
def logout(
    payload: RefreshRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke the provided refresh token."""
    ip = _get_client_ip(request)
    revoke_refresh_token(db, payload.refresh_token)
    _log_security(db, user.id, "logout", ip)
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
def logout_all(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke all refresh tokens for the current user."""
    ip = _get_client_ip(request)
    revoke_all_user_tokens(db, user.id)
    _log_security(db, user.id, "logout_all", ip)
    return {"message": "All sessions revoked"}
