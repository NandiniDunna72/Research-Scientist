from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchGapAnalysis(Base):
    """PostgreSQL model for project-level cross-paper research gap analyses."""
    __tablename__ = "research_gap_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    papers_analyzed = Column(Integer, default=0, nullable=False)
    overall_summary = Column(Text, nullable=False)
    major_categories = Column(JSON, nullable=True)  # List[str]
    most_important_gap = Column(Text, nullable=True)

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
    project = relationship("ResearchProject", backref="gap_analyses")
    user = relationship("User", backref="gap_analyses")
    gaps = relationship(
        "ResearchGap",
        back_populates="analysis",
        cascade="all, delete-orphan",
        order_by="ResearchGap.priority",
    )

    def __repr__(self) -> str:
        return f"<ResearchGapAnalysis(id={self.id}, project_id={self.project_id}, papers_analyzed={self.papers_analyzed})>"


class ResearchGap(Base):
    """PostgreSQL model for individual evidence-based research gaps."""
    __tablename__ = "research_gaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("research_gap_analyses.id", ondelete="CASCADE"), nullable=False, index=True)

    gap_title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)  # Methodological, Dataset, Evaluation, Domain, etc.
    description = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=False)  # List[str] - specific empirical evidence points
    affected_papers = Column(JSON, nullable=False)  # List[str] - paper titles or references
    why_it_matters = Column(Text, nullable=False)
    potential_direction = Column(Text, nullable=False)
    confidence = Column(String(50), default="High", nullable=False)  # "High", "Medium", "Low"
    confidence_rationale = Column(Text, nullable=True)
    priority = Column(Integer, default=1, nullable=False)  # 1, 2, 3...

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    analysis = relationship("ResearchGapAnalysis", back_populates="gaps")

    def __repr__(self) -> str:
        return f"<ResearchGap(id={self.id}, priority={self.priority}, title='{self.gap_title[:30]}')>"
