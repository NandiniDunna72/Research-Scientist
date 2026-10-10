from datetime import datetime
from typing import List, Optional, Union, Any, Dict
from pydantic import BaseModel, Field


class GenerateLiteratureReviewRequest(BaseModel):
    """Payload for triggering literature review generation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or identifier")
    paper_ids: Optional[List[Union[int, str]]] = Field(None, description="Optional subset of analyzed paper IDs to include")


class ThemeItem(BaseModel):
    """Individual research theme grouping papers."""
    theme_id: str
    title: str
    description: str
    paper_ids: List[Union[int, str]] = Field(default_factory=list)
    paper_titles: Optional[List[str]] = Field(default_factory=list)
    common_methods: List[str] = Field(default_factory=list)
    key_findings: List[str] = Field(default_factory=list)
    differences: List[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class PaperSummaryItem(BaseModel):
    """Individual paper summary matrix row."""
    paper_id: Optional[Union[int, str]] = None
    title: str
    authors: Union[str, List[str]] = Field(default_factory=list)
    year: Optional[int] = None
    methodology: str
    dataset: str
    algorithms_models: Union[str, List[str]] = Field(default_factory=list)
    key_findings: Union[str, List[str]]
    limitations: Union[str, List[str]]
    contribution: str
    relevance_to_topic: str

    model_config = {"from_attributes": True}


class ResearchLandscape(BaseModel):
    """Overview of the research landscape."""
    overview: str
    major_themes: List[str] = Field(default_factory=list)
    research_period: str
    dominant_approaches: List[str] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class MethodologicalAnalysis(BaseModel):
    """Synthesis of cross-paper methodologies."""
    common_methods: List[str] = Field(default_factory=list)
    algorithms_models: List[str] = Field(default_factory=list)
    datasets: List[str] = Field(default_factory=list)
    evaluation_methods: List[str] = Field(default_factory=list)
    synthesis: str

    model_config = {"from_attributes": True}


class ComparativeSynthesis(BaseModel):
    """Cross-paper comparative synthesis."""
    similarities: List[Any] = Field(default_factory=list)
    differences: List[Any] = Field(default_factory=list)
    strengths: List[Any] = Field(default_factory=list)
    limitations: List[Any] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class LiteratureReviewGenerationResponse(BaseModel):
    """Comprehensive literature review payload matching Section 7 & Section 10."""
    id: Optional[int] = None
    project_id: Union[int, str]
    topic: str
    papers_considered: int
    papers_with_analysis: int
    papers_discovered: Optional[int] = None
    papers_without_analysis: Optional[List[str]] = Field(default_factory=list)

    introduction: str
    research_landscape: ResearchLandscape
    themes: List[ThemeItem] = Field(default_factory=list)
    methodological_analysis: MethodologicalAnalysis
    comparative_synthesis: ComparativeSynthesis
    research_trends: List[Any] = Field(default_factory=list)
    limitations_in_literature: List[Any] = Field(default_factory=list)
    research_gaps: Any = Field(default_factory=list)
    research_question_connection: str
    conclusion: str
    paper_summaries: List[PaperSummaryItem] = Field(default_factory=list)

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
