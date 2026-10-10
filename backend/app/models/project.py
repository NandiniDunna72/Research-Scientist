from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchProject(Base):
    """Research Project database model for PostgreSQL."""
    __tablename__ = "research_projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    topic = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    domain = Column(String(255), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", backref="projects")
    papers = relationship("ResearchPaper", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ResearchProject(id={self.id}, user_id={self.user_id}, title='{self.title[:30]}')>"
