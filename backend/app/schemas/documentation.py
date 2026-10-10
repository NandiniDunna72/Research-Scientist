from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class DocumentationSectionSchema(BaseModel):
    """Structured representation of a single manuscript section."""
    id: str = Field(..., description="Unique section identifier (e.g. 'sec-abstract', 'sec-intro')")
    number: int = Field(..., description="Section sequence number")
    title: str = Field(..., description="Section heading title")
    content: str = Field(..., description="Markdown content of the section")
    included: bool = Field(default=True, description="Whether section is included in compiled output")
    wordCount: int = Field(default=0, description="Word count in this section")
    section_key: Optional[str] = Field(None, description="Semantic key mapping (e.g. 'abstract', 'methodology')")


class GenerateDocumentationRequest(BaseModel):
    """Payload for generating project research documentation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or slug")
    template: Optional[str] = Field(default="IEEE Conference", description="Publisher format template")
    target_journal: Optional[str] = Field(default=None, description="Target journal or conference venue")
    reference_style: Optional[str] = Field(default="IEEE", description="Citation reference style (IEEE, APA, Harvard, ACM)")
    sections_to_include: Optional[List[str]] = Field(default=None, description="List of section IDs to include")
    authors: Optional[Union[List[str], str]] = Field(default=None, description="Optional author details")
    institution: Optional[str] = Field(default=None, description="Optional institution / affiliation")


class UpdateDocumentationRequest(BaseModel):
    """Payload for saving user edits to the documentation."""
    title: Optional[str] = Field(None, description="Document title")
    template: Optional[str] = Field(None, description="Publisher format template")
    target_journal: Optional[str] = Field(None, description="Target journal / conference venue")
    reference_style: Optional[str] = Field(None, description="Citation reference style")
    authors: Optional[Union[List[str], str]] = Field(None, description="Author information")
    institution: Optional[str] = Field(None, description="Institution / affiliation")
    status: Optional[str] = Field(None, description="Document status ('draft', 'finalized')")
    sections: Optional[List[DocumentationSectionSchema]] = Field(None, description="Updated sections list")
    compiled_markdown: Optional[str] = Field(None, description="Full compiled markdown override")


class RegenerateDocumentationRequest(BaseModel):
    """Payload for regenerating complete document or selected sections."""
    section_ids: Optional[List[str]] = Field(default=None, description="Specific section IDs to regenerate. If omitted, regenerates entire document.")
    template: Optional[str] = Field(default=None, description="Updated publisher format template")
    reference_style: Optional[str] = Field(default=None, description="Updated reference style")


class DocumentationData(BaseModel):
    """Structured documentation data payload."""
    id: Optional[int] = None
    project_id: Union[int, str]
    title: str
    template: str
    target_journal: Optional[str] = None
    reference_style: str = "IEEE"
    authors: Optional[Union[List[str], str]] = None
    institution: Optional[str] = None
    status: str = "draft"
    version: int = 1
    sections: List[DocumentationSectionSchema]
    compiled_markdown: str
    total_word_count: int
    missing_upstream_context: Optional[List[str]] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DocumentationResponse(BaseModel):
    """API envelope response for documentation endpoints."""
    id: int
    project_id: int
    title: str
    template: str
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    data: DocumentationData
