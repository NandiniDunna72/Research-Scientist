from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field


class GenerateResearchQuestionsRequest(BaseModel):
    """Payload for triggering research question generation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or identifier")


class ResearchQuestionItemResponse(BaseModel):
    """Schema for individual research question."""
    question_id: Union[str, int]
    id: Optional[int] = None
    question: str
    type: str  # Primary Research Question, Secondary Research Question, Methodological Question, etc.
    question_type: Optional[str] = None
    related_gap_id: Optional[Union[str, int]] = None
    related_gap_title: Optional[str] = None
    motivation: str
    supporting_evidence: Union[str, List[str]]
    expected_investigation: str
    feasibility: str  # High, Medium, Low
    priority: str  # High, Medium, Low

    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ResearchQuestionGenerationResponse(BaseModel):
    """Overall structured result schema matching Section 10."""
    id: Optional[int] = None
    project_id: Union[int, str]
    topic: str
    papers_considered: int
    gaps_considered: int
    primary_research_question: Optional[ResearchQuestionItemResponse] = None
    secondary_questions: List[ResearchQuestionItemResponse] = Field(default_factory=list)
    research_questions: List[ResearchQuestionItemResponse] = Field(default_factory=list)
    overall_research_direction: str
    recommended_next_step: str

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
