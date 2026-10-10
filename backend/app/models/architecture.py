from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class ArchitectureGeneration(Base):
    """PostgreSQL model for research project system architecture generation records."""
    __tablename__ = "architecture_generations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    architecture_title = Column(String(500), nullable=False)
    architecture_type = Column(String(255), nullable=False)

    # Complete Structured Architecture Result conforming to Module 8 specifications
    structured_architecture_result = Column(JSON, nullable=False)

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
    project = relationship("ResearchProject", backref="architecture_generations")
    user = relationship("User", backref="architecture_generations")

    def __repr__(self) -> str:
        return f"<ArchitectureGeneration(id={self.id}, project_id={self.project_id}, title='{self.architecture_title[:30]}', type='{self.architecture_type}')>"
