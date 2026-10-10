from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class SlideKeyMetric(BaseModel):
    """Key metric callout for slide visual impact."""
    label: str
    value: str


class SlideSchema(BaseModel):
    """Structured model for a single presentation slide."""
    id: int = Field(..., description="Unique slide index or identifier")
    slide_number: int = Field(..., description="1-indexed sequence order")
    title: str = Field(..., description="Slide title")
    subtitle: Optional[str] = Field(None, description="Slide subtitle or thematic category")
    slide_type: str = Field(
        default="bullet",
        description="Slide archetype ('title', 'introduction', 'problem_statement', 'objectives', 'literature_review', 'research_gaps', 'proposed_solution', 'methodology', 'architecture', 'experimental_plan', 'expected_outcomes', 'conclusion', 'references')",
    )
    main_message: Optional[str] = Field(None, description="Concise takeaway sentence")
    bullet_points: List[str] = Field(default_factory=list, description="3-6 concise academic bullet points")
    notes: Optional[str] = Field(None, description="Speaker notes for oral presentation")
    badge: Optional[str] = Field(None, description="Top category tag badge")
    visual_type: Optional[str] = Field(
        default="bullet",
        description="Layout styling ('title', 'bullet', 'architecture', 'comparison', 'matrix', 'conclusion')",
    )
    key_metric: Optional[Dict[str, str]] = Field(None, description="Optional metric highlight ({label, value})")
    source_paper_ids: Optional[List[Union[str, int]]] = Field(default_factory=list, description="Traceable paper IDs")


class GeneratePresentationRequest(BaseModel):
    """Payload for generating an academic PowerPoint presentation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or slug")
    title: Optional[str] = Field(None, description="Custom presentation title (defaults to project topic)")
    presentation_type: Optional[str] = Field(
        default="Project Proposal",
        description="'Project Proposal', 'Final-Year Project Review', 'Research Seminar', 'Literature Review Presentation', 'Technical Demonstration'",
    )
    theme: Optional[str] = Field(
        default="Professional Academic",
        description="'Professional Academic', 'Minimal Research', 'Modern Technical'",
    )
    style: Optional[str] = Field(
        default="Academic Formal",
        description="'Modern Minimal', 'Academic Formal', 'Deep Tech Dark', 'Executive Clean'",
    )
    slide_count: Optional[int] = Field(default=12, ge=6, le=25, description="Desired slide deck count (6 to 25)")
    presenter_name: Optional[str] = Field(None, description="Presenter / Student Name")
    institution: Optional[str] = Field(None, description="University / Institution / Department")
    supervisor_name: Optional[str] = Field(None, description="Guide / Supervisor / Mentor Name")
    include_architecture: Optional[bool] = Field(default=True, description="Include system architecture slide")
    include_comparison: Optional[bool] = Field(default=True, description="Include paper comparison slide")
    include_research_gaps: Optional[bool] = Field(default=True, description="Include research gaps slide")
    include_methodology: Optional[bool] = Field(default=True, description="Include research methodology slide")
    include_speaker_notes: Optional[bool] = Field(default=True, description="Generate oral speaker notes")
    sections_to_include: Optional[List[str]] = Field(default=None, description="Optional custom section filter")


class UpdatePresentationRequest(BaseModel):
    """Payload for editing slide contents or presentation metadata."""
    title: Optional[str] = Field(None, description="Updated presentation title")
    theme: Optional[str] = Field(None, description="Updated visual theme")
    presentation_type: Optional[str] = Field(None, description="Updated presentation type")
    presenter_name: Optional[str] = Field(None, description="Presenter name")
    institution: Optional[str] = Field(None, description="Institution")
    supervisor_name: Optional[str] = Field(None, description="Supervisor name")
    slides: Optional[List[SlideSchema]] = Field(None, description="Complete updated list of slides")


class RegeneratePresentationRequest(BaseModel):
    """Payload for regenerating complete presentation or specific slides."""
    slide_numbers: Optional[List[int]] = Field(
        default=None,
        description="Optional list of slide numbers to regenerate. If omitted, regenerates entire deck.",
    )
    theme: Optional[str] = Field(None, description="Updated theme")
    presentation_type: Optional[str] = Field(None, description="Updated presentation type")
    slide_count: Optional[int] = Field(None, description="Updated slide count")


class PresentationData(BaseModel):
    """Structured presentation data payload returned to client."""
    id: Optional[int] = None
    project_id: Union[int, str]
    title: str
    presentation_type: str
    theme: str
    style: str
    slide_count: int
    presenter_name: Optional[str] = None
    institution: Optional[str] = None
    supervisor_name: Optional[str] = None
    include_speaker_notes: bool = True
    include_architecture: bool = True
    include_comparison: bool = True
    include_research_gaps: bool = True
    include_methodology: bool = True
    status: str = "generated"
    version: int = 1
    file_path: Optional[str] = None
    slides: List[SlideSchema]
    missing_upstream_context: Optional[List[str]] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class PresentationResponse(BaseModel):
    """Envelope response for presentation endpoints."""
    id: int
    project_id: int
    title: str
    presentation_type: str
    theme: str
    slide_count: int
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    data: PresentationData
