from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class PaperSearchRequest(BaseModel):
    """Search request schema for academic papers discovery."""
    query: str = Field(..., min_length=1, max_length=500, description="Research topic, title, or keywords to search")
    limit: Optional[int] = Field(20, ge=1, description="Maximum number of papers to return (enforced max 20)")


class DiscoveredPaper(BaseModel):
    """Normalized discovered academic paper schema."""
    id: str
    title: str
    authors: List[Union[str, dict]] = []
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    publication_date: Optional[str] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    paper_url: Optional[str] = None
    pdf_url: Optional[str] = None
    citation_count: Optional[int] = 0
    source: str
    publication_type: Optional[str] = None
    external_id: Optional[str] = None
    relevance_score: Optional[int] = 0


class PaperSearchResponse(BaseModel):
    """Response format for paper discovery search."""
    query: str
    total: int
    papers: List[DiscoveredPaper]
    message: Optional[str] = None


class SavePaperRequest(BaseModel):
    """Request payload to save a discovered paper to PostgreSQL."""
    project_id: Optional[Union[int, str]] = None
    title: str = Field(..., min_length=1, description="Paper title")
    abstract: Optional[str] = None
    authors: Optional[List[Any]] = []
    publication_year: Optional[int] = None
    publication_date: Optional[str] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    paper_url: Optional[str] = None
    pdf_url: Optional[str] = None
    citation_count: Optional[int] = 0
    source: Optional[str] = None
    external_id: Optional[str] = None
    publication_type: Optional[str] = None
    relevance_score: Optional[int] = 0


class SavedPaperResponse(BaseModel):
    """Response payload for a saved paper in PostgreSQL."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: Optional[int] = None
    user_id: int
    external_id: Optional[str] = None
    title: str
    abstract: Optional[str] = None
    authors: Optional[List[Any]] = []
    publication_year: Optional[int] = None
    publication_date: Optional[str] = None
    venue: Optional[str] = None
    doi: Optional[str] = None
    paper_url: Optional[str] = None
    pdf_url: Optional[str] = None
    citation_count: int = 0
    source: Optional[str] = None
    publication_type: Optional[str] = None
    relevance_score: int = 0
    created_at: datetime
    updated_at: datetime


class PaperMessageResponse(BaseModel):
    """Generic status/message response for paper operations."""
    message: str
    paper_id: Optional[int] = None
