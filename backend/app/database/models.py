"""Database models aggregator."""

from app.database.database import Base
from app.models.user import User

__all__ = ["Base", "User"]
