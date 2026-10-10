from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchPaperComparison(Base):
    """PostgreSQL model for multi-paper comparative synthesis records."""
    __tablename__ = "research_paper_comparisons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(500), nullable=True)
    papers_compared = Column(Integer, default=0, nullable=False)
    paper_ids = Column(JSON, nullable=False)

    # Complete Structured Comparison Result conforming to Section 9
    structured_comparison_result = Column(JSON, nullable=False)

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
    project = relationship("ResearchProject", backref="paper_comparisons")
    user = relationship("User", backref="paper_comparisons")

    def __repr__(self) -> str:
        return f"<ResearchPaperComparison(id={self.id}, project_id={self.project_id}, papers_compared={self.papers_compared})>"
