from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Account password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, max_length=128, description="Account password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    access_token: str
    token: str
    token_type: str = "bearer"
    message: Optional[str] = "Signed in successfully."
    user: UserResponse


class RegisterResponse(BaseModel):
    message: str = "Account created successfully"
    token: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    user: UserResponse


class CurrentUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str
