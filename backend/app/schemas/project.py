from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ProjectCreateRequest(BaseModel):
    """Schema for creating a research project."""
    title: str = Field(..., min_length=1, max_length=500)
    topic: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for research project response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    topic: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    papers_count: int = 0
    analyzed_count: int = 0
    progress: int = 0
    current_stage: str = "papers"
    created_at: datetime
    updated_at: datetime
