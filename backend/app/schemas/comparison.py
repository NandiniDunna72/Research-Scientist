from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class GeneratePaperComparisonRequest(BaseModel):
    """Payload for initiating a multi-paper comparison."""
    project_id: Union[int, str] = Field(..., description="Target project ID or slug")
    paper_ids: List[Union[int, str]] = Field(..., description="List of at least two paper IDs to compare (min 2, max 10)")


class PaperInfoItem(BaseModel):
    """Dimension A: Core bibliographical metadata."""
    paper_id: Union[int, str]
    title: str
    authors: List[str] = Field(default_factory=list)
    publication_year: Optional[int] = None
    venue: Optional[str] = None
    doi: Optional[str] = None


class ComparisonTableRow(BaseModel):
    """Single dimension row in the cross-paper comparison table."""
    dimension: str
    values: Dict[str, str] = Field(default_factory=dict, description="Mapping from paper_id string to text value")


class ComparisonTableSchema(BaseModel):
    """Dimension-by-dimension comparison table structure."""
    columns: List[str] = Field(default_factory=list, description="Column headings starting with Dimension, followed by paper titles")
    paper_ids: List[Union[int, str]] = Field(default_factory=list)
    rows: List[Dict[str, Any]] = Field(default_factory=list)


class MetricComparisonItem(BaseModel):
    """Preserved context for numerical evaluation metrics."""
    metric_name: str
    reported_value: str
    dataset: str
    evaluation_setting: str
    source_paper_id: Union[int, str]
    source_paper_title: str
    comparability_notes: Optional[str] = None


class GapConnectionItem(BaseModel):
    """Connection between compared papers and identified research gaps."""
    gap_id: Optional[Union[int, str]] = None
    gap_title: str
    category: Optional[str] = None
    supported_papers: List[Union[int, str]] = Field(default_factory=list)
    unresolved_status: str = Field(default="Unresolved in analyzed literature")
    evidence_summary: str
    is_candidate_gap: bool = Field(default=False)


class QuestionConnectionItem(BaseModel):
    """Connection between comparison findings and formulated research questions."""
    question_id: Optional[Union[int, str]] = None
    question_text: str
    relevant_papers: List[Union[int, str]] = Field(default_factory=list)
    comparison_findings: str
    informs_investigation: str


class EligiblePaperItem(BaseModel):
    """Schema for papers eligible for comparison in a project."""
    id: int
    title: str
    authors: List[str] = Field(default_factory=list)
    publication_year: Optional[int] = None
    venue: Optional[str] = None
    abstract: Optional[str] = None
    has_analysis: bool = True
    methodology: Optional[str] = None
    dataset: Optional[str] = None
    algorithms_and_models: Optional[List[str]] = Field(default_factory=list)


class EligiblePapersResponse(BaseModel):
    """Response containing project papers with analysis readiness status."""
    project_id: Union[int, str]
    total_papers: int
    eligible_count: int
    eligible_papers: List[EligiblePaperItem] = Field(default_factory=list)
    unusable_papers: List[Dict[str, Any]] = Field(default_factory=list)
    message: Optional[str] = None


class PaperComparisonResponse(BaseModel):
    """Complete structured response conforming to Section 9."""
    id: Optional[int] = None
    project_id: Union[int, str]
    comparison_id: Optional[Union[int, str]] = None
    title: Optional[str] = None
    papers_compared: int
    paper_ids: List[Union[int, str]] = Field(default_factory=list)

    # Core structured comparison sections
    paper_information: List[Dict[str, Any]] = Field(default_factory=list)
    comparison_dimensions: List[Dict[str, Any]] = Field(default_factory=list)
    comparison_table: Dict[str, Any] = Field(default_factory=dict)
    commonalities: List[str] = Field(default_factory=list)
    differences: List[str] = Field(default_factory=list)
    methodological_strengths: List[Dict[str, Any]] = Field(default_factory=list)
    methodological_limitations: List[Dict[str, Any]] = Field(default_factory=list)
    dataset_and_evaluation_analysis: List[Dict[str, Any]] = Field(default_factory=list)
    reported_metric_comparisons: List[Dict[str, Any]] = Field(default_factory=list)
    research_trends: List[str] = Field(default_factory=list)
    research_gap_connections: List[Dict[str, Any]] = Field(default_factory=list)
    research_question_connections: List[Dict[str, Any]] = Field(default_factory=list)
    overall_synthesis: str
    research_opportunities: List[str] = Field(default_factory=list)
    data_limitations: List[str] = Field(default_factory=list)

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
