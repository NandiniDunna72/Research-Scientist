from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class PaperAnalysis(Base):
    """Structured Paper Analysis database model for PostgreSQL."""
    __tablename__ = "paper_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    paper_id = Column(Integer, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Core Academic Analysis Sections
    research_problem = Column(Text, nullable=True)
    research_objective = Column(Text, nullable=True)
    research_questions = Column(JSON, nullable=True)  # List[str]
    approach = Column(Text, nullable=True)
    methodology = Column(Text, nullable=True)
    dataset = Column(Text, nullable=True)
    algorithms_and_models = Column(JSON, nullable=True)  # List[str]
    experimental_setup = Column(Text, nullable=True)
    key_results = Column(JSON, nullable=True)  # List[str]
    key_findings = Column(JSON, nullable=True)  # List[str]
    contributions = Column(JSON, nullable=True)  # List[str]
    limitations = Column(JSON, nullable=True)  # List[str]
    future_work = Column(JSON, nullable=True)  # List[str]
    keywords = Column(JSON, nullable=True)  # List[str]

    # Source Provenance & Metadata
    source_type = Column(String(50), default="abstract", nullable=False)  # "full_paper", "abstract", or "metadata"
    overview = Column(Text, nullable=True)  # Executive AI synthesis overview

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
    paper = relationship("ResearchPaper", backref="analyses")
    user = relationship("User", backref="analyses")

    def __repr__(self) -> str:
        return f"<PaperAnalysis(id={self.id}, paper_id={self.paper_id}, source_type='{self.source_type}')>"
