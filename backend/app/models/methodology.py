from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchMethodologyGeneration(Base):
    """PostgreSQL model for project-level research methodology generations."""
    __tablename__ = "research_methodology_generations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    topic = Column(String(500), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    papers_considered = Column(Integer, default=0, nullable=False)
    gaps_considered = Column(Integer, default=0, nullable=False)
    questions_considered = Column(Integer, default=0, nullable=False)
    has_literature_review = Column(Boolean, default=False, nullable=False)

    # Core Structured Methodology Sections (A through N)
    research_overview = Column(JSON, nullable=False)
    research_design = Column(JSON, nullable=False)
    proposed_approach = Column(JSON, nullable=False)
    data_collection = Column(JSON, nullable=False)
    data_preprocessing = Column(JSON, nullable=False)
    methods_and_algorithms = Column(JSON, nullable=False)
    system_design = Column(JSON, nullable=False)
    experimental_setup = Column(JSON, nullable=False)
    evaluation_metrics = Column(JSON, nullable=False)
    comparison_strategy = Column(JSON, nullable=False)
    expected_outcomes = Column(JSON, nullable=False)
    limitations_and_risks = Column(JSON, nullable=False)
    reproducibility_and_ethics = Column(JSON, nullable=False)
    execution_plan = Column(JSON, nullable=False)
    assumptions_and_open_questions = Column(JSON, nullable=True)

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
    project = relationship("ResearchProject", backref="methodology_generations")
    user = relationship("User", backref="methodology_generations")

    def __repr__(self) -> str:
        return f"<ResearchMethodologyGeneration(id={self.id}, project_id={self.project_id}, topic='{self.topic[:30]}', version={self.version})>"
