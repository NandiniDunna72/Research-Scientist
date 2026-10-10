from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchPaper(Base):
    """Saved Research Paper database model for PostgreSQL."""
    __tablename__ = "research_papers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    external_id = Column(String(255), nullable=True, index=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, nullable=True)  # JSON list of authors
    publication_year = Column(Integer, nullable=True)
    publication_date = Column(String(100), nullable=True)
    venue = Column(String(500), nullable=True)
    doi = Column(String(255), nullable=True, index=True)
    paper_url = Column(String(1000), nullable=True)
    pdf_url = Column(String(1000), nullable=True)
    citation_count = Column(Integer, default=0, nullable=False)
    source = Column(String(100), nullable=True)
    publication_type = Column(String(100), nullable=True)
    relevance_score = Column(Integer, default=0, nullable=False)

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
    user = relationship("User", backref="papers")
    project = relationship("ResearchProject", back_populates="papers")

    def __repr__(self) -> str:
        return f"<ResearchPaper(id={self.id}, user_id={self.user_id}, title='{self.title[:30]}')>"
