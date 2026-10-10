from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class GenerateArchitectureRequest(BaseModel):
    """Payload for initiating system architecture generation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or slug")


class ArchitectureComponent(BaseModel):
    """Single system component in the research solution architecture."""
    component_id: str = Field(..., description="Unique component ID (e.g., 'comp-data-prep')")
    component_name: str = Field(..., description="Human-readable component name")
    component_type: str = Field(..., description="Type of component (e.g., 'data_pipeline', 'model_training', 'inference_service', 'database', etc.)")
    purpose: str = Field(..., description="Primary architectural purpose of this component")
    responsibilities: List[str] = Field(default_factory=list, description="Core responsibilities performed by this component")
    inputs: List[str] = Field(default_factory=list, description="Data inputs or signals consumed")
    outputs: List[str] = Field(default_factory=list, description="Artifacts, metrics, or signals produced")
    technologies: List[str] = Field(default_factory=list, description="Technologies or libraries employed")
    dependencies: List[str] = Field(default_factory=list, description="Dependent components or subsystems")
    related_research_questions: List[Union[str, int]] = Field(default_factory=list, description="Connected research questions")
    related_research_gaps: List[Union[str, int]] = Field(default_factory=list, description="Connected research gaps")
    implementation_status: str = Field(default="proposed", description="'implemented', 'proposed', or 'optional'")


class ArchitectureDiagram(BaseModel):
    """Mermaid diagram representation of the architecture."""
    diagram_type: str = Field(default="mermaid", description="Diagram engine type (mermaid)")
    source: str = Field(..., description="Valid Mermaid syntax (flowchart / graph)")
    description: str = Field(..., description="Explanation of diagram structure and flows")


class DataFlowStep(BaseModel):
    """Single ordered step in the system data flow."""
    step_number: int = Field(..., description="1-indexed sequence order")
    source_component: str = Field(..., description="Origin component")
    destination_component: str = Field(..., description="Target component")
    data_transferred: str = Field(..., description="Data structures or payloads moved")
    processing_performed: str = Field(..., description="Transformations or computations executed")
    output_produced: str = Field(..., description="Resultant state or payload")
    phase: Optional[str] = Field(default="general", description="'training', 'inference', 'preprocessing', or 'general'")


class TechnologyStackItem(BaseModel):
    """Recommended tool or technology."""
    category: str = Field(..., description="Category (e.g., 'AI/ML Frameworks', 'Backend', 'Data Processing', 'Database', 'Deployment')")
    technology: str = Field(..., description="Technology name")
    role: str = Field(..., description="Role in proposed system")
    reason_for_selection: str = Field(..., description="Justification based on research requirements")
    alternatives: List[str] = Field(default_factory=list, description="Considered alternatives")
    status: str = Field(default="suggested", description="'current', 'suggested', or 'optional'")


class DataStorageEntity(BaseModel):
    """Data storage schema entity."""
    entity_name: str = Field(..., description="Entity or table name")
    purpose: str = Field(..., description="Role and rationale of entity")
    fields: List[str] = Field(default_factory=list, description="Key attributes and field definitions")
    relationships: List[str] = Field(default_factory=list, description="Cardinality and foreign entity links")


class DataStorageDesign(BaseModel):
    """Data storage design and optional ER diagram."""
    storage_paradigm: str = Field(..., description="Storage type (e.g., 'Relational PostgreSQL', 'Vector & Multi-Modal Store', 'Hybrid')")
    description: str = Field(..., description="Data storage architecture narrative")
    entities: List[DataStorageEntity] = Field(default_factory=list)
    er_diagram: Optional[Dict[str, Any]] = Field(default=None, description="Optional Mermaid ER diagram")


class SecurityReliabilityItem(BaseModel):
    """Security, privacy, and reliability considerations."""
    dimension: str = Field(..., description="Dimension (e.g., 'Data Privacy & Ethics', 'Failure Handling', 'API Security')")
    description: str = Field(..., description="Requirement or vulnerability context")
    mitigation_strategy: str = Field(..., description="Architectural mitigation or safeguard")


class DeploymentArchitecture(BaseModel):
    """Deployment topology and execution specifications."""
    deployment_model: str = Field(..., description="e.g., 'Containerized Pipeline / Workstation Cluster', 'Cloud Microservices'")
    minimum_viable_deployment: str = Field(..., description="Minimal viable hardware and setup for experimental validation")
    production_enhancements: str = Field(..., description="Scaling, distribution, or high-availability enhancements")
    hosting_components: List[str] = Field(default_factory=list)
    environment_configuration: List[str] = Field(default_factory=list)
    scaling_considerations: str = Field(..., description="Bottlenecks, horizontal scaling, memory ceilings")


class ArchitectureJustification(BaseModel):
    """Rationale connecting architecture choices to research gaps and questions."""
    objective_or_gap: str = Field(..., description="Research objective or gap addressed")
    architectural_choice: str = Field(..., description="Component or design decision implemented")
    justification: str = Field(..., description="Evidence-grounded rationale")
    trade_offs: str = Field(..., description="Recognized engineering or scientific trade-offs")
    related_question_ids: List[Union[str, int]] = Field(default_factory=list)
    related_gap_ids: List[Union[str, int]] = Field(default_factory=list)


class AlternativeArchitecture(BaseModel):
    """Evaluated alternative architecture design."""
    title: str = Field(..., description="Alternative design title")
    description: str = Field(..., description="Summary of the alternative approach")
    advantages: List[str] = Field(default_factory=list)
    disadvantages: List[str] = Field(default_factory=list)
    complexity: str = Field(..., description="Relative implementation complexity (e.g. 'High', 'Moderate')")
    suitable_conditions: str = Field(..., description="Conditions under which this alternative is preferable")
    rejection_reason: str = Field(..., description="Why the primary architecture was chosen instead")


class ImplementationStage(BaseModel):
    """Sequential stage in architecture implementation."""
    stage_number: int = Field(..., description="1-indexed sequence order")
    stage_name: str = Field(..., description="Stage title")
    tasks: List[str] = Field(default_factory=list, description="Concrete engineering steps")
    dependencies: List[str] = Field(default_factory=list, description="Prerequisite stages or assets")
    deliverable: str = Field(..., description="Measurable outcome or code artifact")
    verification_method: str = Field(..., description="Validation test or experimental checkpoint")


class LimitationAssumption(BaseModel):
    """Known boundary condition or scientific assumption."""
    category: str = Field(..., description="Category (e.g., 'Computational', 'Data Constraint', 'Generalizability')")
    description: str = Field(..., description="Explanation of constraint or boundary")


class ArchitectureResult(BaseModel):
    """Complete structured system architecture result conforming to Module 8."""
    project_id: Union[int, str]
    topic: str
    architecture_title: str
    architecture_type: str
    architecture_summary: str
    components: List[ArchitectureComponent]
    architecture_diagram: ArchitectureDiagram
    data_flow: List[DataFlowStep]
    technology_stack: List[TechnologyStackItem]
    data_storage_design: DataStorageDesign
    security_and_reliability: List[SecurityReliabilityItem]
    deployment_architecture: DeploymentArchitecture
    architecture_justification: List[ArchitectureJustification]
    alternative_architectures: List[AlternativeArchitecture]
    implementation_plan: List[ImplementationStage]
    limitations_and_assumptions: List[LimitationAssumption]
    missing_upstream_context: Optional[List[str]] = Field(default_factory=list)


class ArchitectureResponse(BaseModel):
    """API envelope response for architecture records."""
    id: int
    project_id: int
    architecture_title: str
    architecture_type: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    data: ArchitectureResult
