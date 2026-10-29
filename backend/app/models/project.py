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

    @property
    def papers_count(self) -> int:
        return len(self.papers or [])

    @property
    def analyzed_count(self) -> int:
        return sum(1 for p in (self.papers or []) if len(p.analyses or []) > 0)

    @property
    def progress(self) -> int:
        count = self.papers_count
        if count == 0:
            return 0
        analyzed = self.analyzed_count
        if analyzed == 0:
            return 20
        return min(100, 20 + int((analyzed / max(1, count)) * 60))

    @property
    def current_stage(self) -> str:
        if self.papers_count == 0:
            return "papers"
        if self.analyzed_count == 0:
            return "papers"
        return "analysis"

    def __repr__(self) -> str:
        return f"<ResearchProject(id={self.id}, user_id={self.user_id}, title='{self.title[:30]}')>"
