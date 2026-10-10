from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchDocumentation(Base):
    """PostgreSQL model for project-level research documentation generations and drafts."""
    __tablename__ = "research_documentations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    template = Column(String(100), default="IEEE Conference", nullable=False)
    target_journal = Column(String(255), nullable=True)
    reference_style = Column(String(50), default="IEEE", nullable=False)  # "IEEE", "APA", "Harvard", "ACM"
    authors = Column(JSON, nullable=True)  # List or text of authors
    institution = Column(String(500), nullable=True)

    # Document status and version
    status = Column(String(50), default="draft", nullable=False)  # "draft", "finalized", "in_review"
    version = Column(Integer, default=1, nullable=False)

    # Structured section content (stores all academic sections A through O)
    structured_content = Column(JSON, nullable=False)

    # Section selection configuration (list of section objects with id, title, included, wordCount)
    sections_config = Column(JSON, nullable=False)

    # Compiled full markdown text
    compiled_markdown = Column(Text, nullable=True)

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
    project = relationship("ResearchProject", backref="documentations")
    user = relationship("User", backref="documentations")

    def __repr__(self) -> str:
        return f"<ResearchDocumentation(id={self.id}, project_id={self.project_id}, title='{self.title[:30]}', version={self.version})>"
