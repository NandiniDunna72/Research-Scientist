from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field


class ResearchGapItemResponse(BaseModel):
    """Schema for individual research gap response."""
    id: int
    gap_id: int = Field(..., description="Gap identifier")
    gap_title: str
    title: str = Field(..., description="Display title for gap")
    category: str = Field(..., description="Gap Category (e.g. Methodological Gap, Dataset Gap)")
    description: str
    evidence: List[str] = Field(default_factory=list, description="Specific empirical evidence from papers")
    affected_papers: List[str] = Field(default_factory=list, description="Papers contributing to this gap")
    why_it_matters: str = Field(..., description="Importance and impact of the gap")
    potential_direction: str = Field(..., description="Potential research direction to resolve gap")
    confidence: str = Field(default="High", description="High, Medium, or Low")
    confidence_rationale: Optional[str] = None
    priority: int = Field(default=1, description="AI-assisted priority rank (1, 2, 3...)")
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResearchGapAnalysisResponse(BaseModel):
    """Schema for project-level research gap analysis response."""
    id: int
    project_id: int
    papers_analyzed: int
    gaps_identified: Optional[int] = None
    overall_summary: str
    major_categories: List[str] = Field(default_factory=list)
    most_important_gap: Optional[str] = None
    warning: Optional[str] = None
    gaps: List[ResearchGapItemResponse] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalyzeResearchGapsRequest(BaseModel):
    """Request payload to analyze research gaps for a project."""
    project_id: Union[int, str] = Field(..., description="Project ID or identifier")
    paper_ids: Optional[List[Union[int, str]]] = Field(
        None,
        description="Optional list of specific paper IDs to analyze. If empty, all analyzed papers are used."
    )
