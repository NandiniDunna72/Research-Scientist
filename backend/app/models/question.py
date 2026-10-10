from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchQuestionGeneration(Base):
    """PostgreSQL model for project-level research question generations."""
    __tablename__ = "research_question_generations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    papers_considered = Column(Integer, default=0, nullable=False)
    gaps_considered = Column(Integer, default=0, nullable=False)

    primary_question = Column(JSON, nullable=True)  # Structured primary question JSON
    overall_research_direction = Column(Text, nullable=False)
    recommended_next_step = Column(Text, nullable=False)

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
    project = relationship("ResearchProject", backref="question_generations")
    user = relationship("User", backref="question_generations")
    questions = relationship(
        "ResearchQuestion",
        back_populates="generation",
        cascade="all, delete-orphan",
        order_by="ResearchQuestion.id",
    )

    def __repr__(self) -> str:
        return f"<ResearchQuestionGeneration(id={self.id}, project_id={self.project_id})>"


class ResearchQuestion(Base):
    """PostgreSQL model for individual structured research questions."""
    __tablename__ = "research_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    generation_id = Column(Integer, ForeignKey("research_question_generations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    question = Column(Text, nullable=False)
    question_type = Column(String(100), nullable=False)  # Primary Research Question, Secondary Research Question, etc.
    related_gap_id = Column(Integer, nullable=True)
    related_gap_title = Column(String(500), nullable=True)
    motivation = Column(Text, nullable=False)
    supporting_evidence = Column(JSON, nullable=False)  # Text or List[str]
    expected_investigation = Column(Text, nullable=False)
    feasibility = Column(String(50), default="High", nullable=False)  # "High", "Medium", "Low"
    priority = Column(String(50), default="High", nullable=False)  # "High", "Medium", "Low"

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    generation = relationship("ResearchQuestionGeneration", back_populates="questions")
    project = relationship("ResearchProject", backref="research_questions")
    user = relationship("User", backref="research_questions")

    def __repr__(self) -> str:
        return f"<ResearchQuestion(id={self.id}, type='{self.question_type}', question='{self.question[:30]}')>"
