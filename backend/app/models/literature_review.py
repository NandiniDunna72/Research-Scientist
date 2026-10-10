from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class LiteratureReviewGeneration(Base):
    """PostgreSQL model for project-level literature review generations."""
    __tablename__ = "literature_review_generations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    topic = Column(String(500), nullable=False)
    papers_considered = Column(Integer, default=0, nullable=False)
    papers_with_analysis = Column(Integer, default=0, nullable=False)

    # Core Literature Review Sections
    introduction = Column(Text, nullable=False)
    research_landscape = Column(JSON, nullable=False)  # overview, major_themes, research_period, dominant_approaches
    methodological_analysis = Column(JSON, nullable=False)  # common_methods, algorithms_models, datasets, evaluation_methods, synthesis
    comparative_synthesis = Column(JSON, nullable=False)  # similarities, differences, strengths, limitations
    research_trends = Column(JSON, nullable=False)  # list of key trend strings
    limitations_in_literature = Column(JSON, nullable=False)  # synthesized recurring limitations
    research_gaps_summary = Column(JSON, nullable=False)  # integrated research gaps
    research_question_connection = Column(Text, nullable=False)
    conclusion = Column(Text, nullable=False)

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
    project = relationship("ResearchProject", backref="literature_review_generations")
    user = relationship("User", backref="literature_review_generations")
    themes = relationship(
        "LiteratureReviewTheme",
        back_populates="generation",
        cascade="all, delete-orphan",
        order_by="LiteratureReviewTheme.id",
    )
    paper_summaries = relationship(
        "LiteratureReviewPaperSummary",
        back_populates="generation",
        cascade="all, delete-orphan",
        order_by="LiteratureReviewPaperSummary.id",
    )

    def __repr__(self) -> str:
        return f"<LiteratureReviewGeneration(id={self.id}, project_id={self.project_id}, topic='{self.topic[:30]}')>"


class LiteratureReviewTheme(Base):
    """PostgreSQL model for thematic grouping of research papers."""
    __tablename__ = "literature_review_themes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    generation_id = Column(Integer, ForeignKey("literature_review_generations.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    theme_id = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    paper_ids = Column(JSON, nullable=False)  # List[int or str]
    paper_titles = Column(JSON, nullable=True)  # List[str]
    common_methods = Column(JSON, nullable=False)  # List[str]
    key_findings = Column(JSON, nullable=False)  # List[str]
    differences = Column(JSON, nullable=False)  # List[str]

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    generation = relationship("LiteratureReviewGeneration", back_populates="themes")
    project = relationship("ResearchProject", backref="literature_review_themes")
    user = relationship("User", backref="literature_review_themes")

    def __repr__(self) -> str:
        return f"<LiteratureReviewTheme(id={self.id}, theme_id='{self.theme_id}', title='{self.title[:30]}')>"


class LiteratureReviewPaperSummary(Base):
    """PostgreSQL model for paper-level matrix synthesis."""
    __tablename__ = "literature_review_paper_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    generation_id = Column(Integer, ForeignKey("literature_review_generations.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(Integer, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=True, index=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    authors = Column(JSON, nullable=False)  # List[str]
    year = Column(Integer, nullable=True)
    methodology = Column(Text, nullable=False)
    dataset = Column(Text, nullable=False)
    algorithms_models = Column(JSON, nullable=False)  # List[str]
    key_findings = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    contribution = Column(Text, nullable=False)
    relevance_to_topic = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    generation = relationship("LiteratureReviewGeneration", back_populates="paper_summaries")
    paper = relationship("ResearchPaper", backref="literature_review_summaries")
    project = relationship("ResearchProject", backref="literature_review_paper_summaries")
    user = relationship("User", backref="literature_review_paper_summaries")

    def __repr__(self) -> str:
        return f"<LiteratureReviewPaperSummary(id={self.id}, paper_id={self.paper_id}, title='{self.title[:30]}')>"
