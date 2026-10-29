from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest


class AuthService:
    """Service handling user registration, authentication, and session token issuance."""

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.strip().lower()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def register_user(cls, db: Session, req: RegisterRequest) -> Tuple[User, str]:
        normalized_email = req.email.strip().lower()

        # Check whether email already exists
        existing_user = cls.get_by_email(db, normalized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # Hash password securely
        hashed_password = hash_password(req.password)

        new_user = User(
            full_name=req.full_name.strip(),
            email=normalized_email,
            password_hash=hashed_password,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate JWT access token
        token = create_access_token(
            subject=new_user.id,
            extra_claims={"email": new_user.email, "full_name": new_user.full_name},
        )

        return new_user, token

    @classmethod
    def login_user(cls, db: Session, req: LoginRequest) -> Tuple[User, str]:
        normalized_email = req.email.strip().lower()
        user = cls.get_by_email(db, normalized_email)

        # Do not reveal whether the email exists separately from whether the password is incorrect
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "full_name": user.full_name},
        )

        return user, token

    @classmethod
    def get_or_create_demo_user(cls, db: Session) -> Tuple[User, str]:
        email = "alex.vance@stanford.edu"
        user = cls.get_by_email(db, email)
        if not user:
            user = User(
                full_name="Dr. Alex Vance, Senior AI Scientist",
                email=email,
                password_hash=hash_password("DemoScientist2026!"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email, "full_name": user.full_name},
        )
        return user, token
