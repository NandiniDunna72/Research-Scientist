from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class GenerateMethodologyRequest(BaseModel):
    """Payload for triggering research methodology generation."""
    project_id: Union[int, str] = Field(..., description="Target project ID or identifier")


class ResearchOverviewSchema(BaseModel):
    """Section A: Research Overview schema."""
    topic: Optional[str] = None
    problem_statement: str
    research_objective: str
    primary_research_question: str
    specific_objectives: List[str] = Field(default_factory=list)
    proposed_research_direction: str


class ResearchDesignSchema(BaseModel):
    """Section B: Research Design schema."""
    design_type: str
    justification: str
    alternative_designs_considered: Optional[List[str]] = Field(default_factory=list)


class ProposedApproachStageSchema(BaseModel):
    """Section C: Proposed Approach stage schema."""
    stage_number: Optional[int] = None
    stage_name: str
    problem_addressed: str
    proposed_approach: str
    main_processing_stages: List[str] = Field(default_factory=list)
    expected_inputs: Union[List[str], str] = Field(default_factory=list)
    expected_outputs: Union[List[str], str] = Field(default_factory=list)
    relationship_to_gaps: Optional[str] = None
    distinction_from_existing_work: Optional[str] = None


class DataCollectionSchema(BaseModel):
    """Section D: Data Collection schema."""
    required_data: List[str] = Field(default_factory=list)
    potential_sources: List[str] = Field(default_factory=list)
    collection_methods: List[str] = Field(default_factory=list)
    quality_requirements: List[str] = Field(default_factory=list)
    ethical_considerations: List[str] = Field(default_factory=list)
    dataset_selection_criteria: Optional[List[str]] = Field(default_factory=list)


class PreprocessingStepSchema(BaseModel):
    """Section E: Data Preprocessing step schema."""
    step_number: Optional[int] = None
    name: str
    purpose: str
    technique: str
    target_data_type: str


class MethodAlgorithmSchema(BaseModel):
    """Section F: Proposed Models, Algorithms, or Techniques schema."""
    name: str
    purpose: str
    reason_for_selection: str
    strengths: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    relevant_research_question: str
    status: str = Field(default="proposed_for_investigation", description="'established_in_literature' or 'proposed_for_investigation'")
    trade_offs: Optional[str] = None


class SystemDesignComponentSchema(BaseModel):
    """Sub-schema for system design components."""
    name: str
    responsibility: str
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)


class SystemDesignSchema(BaseModel):
    """Section G: System Design and Implementation Plan schema."""
    components: List[SystemDesignComponentSchema] = Field(default_factory=list)
    data_flow: List[str] = Field(default_factory=list)
    processing_pipeline: List[str] = Field(default_factory=list)
    model_integration: Optional[str] = None
    expected_outputs: List[str] = Field(default_factory=list)


class ExperimentalSetupSchema(BaseModel):
    """Section H: Experimental Setup schema."""
    design: str
    baselines: List[str] = Field(default_factory=list)
    comparison_conditions: List[str] = Field(default_factory=list)
    training_and_testing_strategy: Optional[str] = None
    validation_strategy: List[str] = Field(default_factory=list)
    reproducibility: List[str] = Field(default_factory=list)
    hardware_software_requirements: Optional[List[str]] = Field(default_factory=list)


class EvaluationMetricSchema(BaseModel):
    """Section I: Evaluation Metrics schema."""
    name: str
    category: str  # Classification, Regression, Performance, Clinical, System
    purpose: str
    justification: str
    formula_or_criteria: Optional[str] = None


class ComparisonStrategySchema(BaseModel):
    """Section J: Baselines and Comparison Strategy schema."""
    baseline_method: str
    comparison_purpose: str
    evaluation_conditions: str
    metrics: List[str] = Field(default_factory=list)
    fairness_and_reproducibility: str


class ExpectedOutcomeSchema(BaseModel):
    """Section K: Expected Outcomes schema."""
    hypothesis_or_outcome: str
    confidence_level: Optional[str] = "Hypothesized"
    supporting_rationale: str
    validation_criterion: str


class RiskLimitationSchema(BaseModel):
    """Section L: Limitations and Risks schema."""
    category: str  # Data, Computational, Methodological, Evaluation, Implementation, Validity
    risk_description: str
    mitigation_strategy: str


class ReproducibilityEthicsSchema(BaseModel):
    """Section M: Reproducibility and Ethical Considerations schema."""
    experimental_settings_documentation: str
    version_control: str
    dataset_provenance: str
    data_privacy_and_ethics: str
    licensing_and_permissions: str
    responsible_ai: str


class ExecutionStepSchema(BaseModel):
    """Section N: Step-by-Step Execution Plan schema."""
    step_number: int
    activity: str
    description: str
    required_inputs: List[str] = Field(default_factory=list)
    expected_deliverable: str
    dependencies: List[str] = Field(default_factory=list)
    estimated_effort: str


class MethodologyStatusResponse(BaseModel):
    """Status check response to determine readiness for methodology generation."""
    project_id: Union[int, str]
    ready: bool
    has_papers: bool
    papers_count: int
    has_analyses: bool
    analyzed_papers_count: int
    has_gaps: bool
    gaps_count: int
    has_questions: bool
    questions_count: int
    has_literature_review: bool
    missing_modules: List[str] = Field(default_factory=list)
    generated: bool
    latest_version: Optional[int] = None


class MethodologyResponse(BaseModel):
    """Complete structured Research Methodology result schema matching Module 6."""
    id: Optional[int] = None
    project_id: Union[int, str]
    topic: str
    version: int = 1
    papers_considered: int = 0
    gaps_considered: int = 0
    questions_considered: int = 0
    has_literature_review: bool = False

    # Sections A through N
    research_overview: Dict[str, Any]
    research_design: Dict[str, Any]
    proposed_approach: List[Dict[str, Any]]
    data_collection: Dict[str, Any]
    data_preprocessing: List[Dict[str, Any]]
    methods_and_algorithms: List[Dict[str, Any]]
    system_design: Dict[str, Any]
    experimental_setup: Dict[str, Any]
    evaluation_metrics: List[Dict[str, Any]]
    comparison_strategy: List[Dict[str, Any]]
    expected_outcomes: List[Dict[str, Any]]
    limitations_and_risks: List[Dict[str, Any]]
    reproducibility_and_ethics: Dict[str, Any]
    execution_plan: List[Dict[str, Any]]
    assumptions_and_open_questions: Optional[List[str]] = Field(default_factory=list)

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
