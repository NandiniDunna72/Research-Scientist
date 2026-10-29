from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.database.database import get_db
from app.models.user import User

# HTTPBearer with auto_error=False to allow clean custom 401 error messages
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that extracts, verifies JWT Bearer token, and retrieves the User from PostgreSQL."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Support Demo User token seamlessly
    if token in ("academic_research_scientist_demo_token_2026", "demo-token", "demo_token"):
        user = db.query(User).filter(User.email == "alex.vance@stanford.edu").first()
        if not user:
            user = User(
                full_name="Dr. Alex Vance, Senior AI Scientist",
                email="alex.vance@stanford.edu",
                password_hash="demo_account_access_key",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_val = payload.get("sub") or payload.get("user_id")
    if not user_id_val:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user identification.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_val)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification format in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User belonging to this token was not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
