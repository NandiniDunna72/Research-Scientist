from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ResearchPresentation(Base):
    """PostgreSQL model for project-level research PowerPoint presentations."""
    __tablename__ = "research_presentations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(500), nullable=False)
    presentation_type = Column(String(100), default="Project Proposal", nullable=False)
    theme = Column(String(100), default="Professional Academic", nullable=False)
    style = Column(String(100), default="Academic Formal", nullable=False)
    slide_count = Column(Integer, default=12, nullable=False)

    presenter_name = Column(String(255), nullable=True)
    institution = Column(String(500), nullable=True)
    supervisor_name = Column(String(255), nullable=True)
    include_speaker_notes = Column(Boolean, default=True, nullable=False)

    # Structured slide content (JSON list of slide objects conforming to Module 10 specification)
    structured_slides = Column(JSON, nullable=False)

    # Local file path where the generated .pptx binary is stored
    file_path = Column(String(1000), nullable=True)

    status = Column(String(50), default="generated", nullable=False)
    version = Column(Integer, default=1, nullable=False)

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
    project = relationship("ResearchProject", backref="presentations")
    user = relationship("User", backref="presentations")

    def __repr__(self) -> str:
        return f"<ResearchPresentation(id={self.id}, project_id={self.project_id}, title='{self.title[:30]}', slides={self.slide_count})>"
