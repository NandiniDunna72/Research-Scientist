from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: EmailStr = Field(..., description="Unique email address")

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


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128, description="Plain text password")


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
