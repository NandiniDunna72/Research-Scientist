from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PaperAnalysisBase(BaseModel):
    """Core academic structured analysis fields."""
    research_problem: Optional[str] = Field(
        None, description="The primary research problem addressed by the paper"
    )
    research_objective: Optional[str] = Field(
        None, description="The specific scientific objective or hypothesis"
    )
    research_questions: List[str] = Field(
        default_factory=list, description="Explicit research questions answered"
    )
    approach: Optional[str] = Field(
        None, description="High-level conceptual or technical approach"
    )
    methodology: Optional[str] = Field(
        None, description="Detailed methodological process and experimental workflow"
    )
    dataset: Optional[str] = Field(
        None, description="Data sources, corpora, or benchmarks used"
    )
    algorithms_and_models: List[str] = Field(
        default_factory=list, description="Specific algorithms, architectures, or models"
    )
    experimental_setup: Optional[str] = Field(
        None, description="Validation environment, baselines, and evaluation metrics"
    )
    key_results: List[str] = Field(
        default_factory=list, description="Quantitative and qualitative results with exact figures"
    )
    key_findings: List[str] = Field(
        default_factory=list, description="Core scientific discoveries and insights"
    )
    contributions: List[str] = Field(
        default_factory=list, description="Primary novel contributions to the scientific literature"
    )
    limitations: List[str] = Field(
        default_factory=list, description="Explicit technical, methodological, or scale limitations"
    )
    future_work: List[str] = Field(
        default_factory=list, description="Future directions and open research avenues"
    )
    keywords: List[str] = Field(
        default_factory=list, description="Salient academic keywords and concepts"
    )
    source_type: str = Field(
        "abstract", description="Provenance of analyzed text ('full_paper', 'abstract', 'metadata')"
    )
    overview: Optional[str] = Field(
        None, description="Executive synthesis overview of the paper"
    )


class PaperAnalysisResponse(PaperAnalysisBase):
    """Full database response schema for a paper analysis."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    paper_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class AnalyzePaperRequest(BaseModel):
    """Optional payload when triggering paper analysis."""
    force_regenerate: bool = False
    preferred_source_type: Optional[str] = None  # e.g., 'full_paper' or 'abstract'
