export type ResearchStage = 
  | 'topic'
  | 'papers'
  | 'analysis'
  | 'gaps'
  | 'literature'
  | 'methodology'
  | 'comparison'
  | 'architecture'
  | 'documentation'
  | 'presentation';

export interface PaperAuthor {
  name: string;
  affiliation?: string;
  citations?: number;
  orcid?: string;
}

export type PaperSource = 
  | 'arXiv'
  | 'IEEE Xplore'
  | 'ACM Digital Library'
  | 'PubMed'
  | 'Springer'
  | 'Nature'
  | 'ScienceDirect'
  | 'NeurIPS / ICML'
  | 'Semantic Scholar'
  | 'Crossref'
  | string;

export interface ResearchPaper {
  id: string;
  title: string;
  authors: PaperAuthor[];
  year: number;
  journalOrConference: string;
  source: PaperSource;
  abstract: string;
  relevanceScore: number; // 0 - 100
  citationsCount: number;
  doi: string;
  pdfUrl?: string;
  paperUrl?: string;
  selected?: boolean;
  analyzed?: boolean;
  tags: string[];
  saved?: boolean;
  backendId?: number;
}

export interface PaperAnalysis {
  paperId: string;
  overview: string;
  abstract: string;
  summary: {
    keyContributions: string[];
    findings: string[];
    implications: string[];
  };
  researchGaps: string[];
  literatureReview: {
    theoreticalFramework: string;
    relationToPriorWork: string;
    keyDebates: string[];
  };
  methodology: {
    problemFormulation: string;
    dataset: string;
    preprocessing: string;
    modelArchitecture: string;
    trainingStrategy: string;
    evaluationMetrics: string[];
    results: string;
    limitations: string[];
  };
  analyzedAt: string;

  // Structured academic analysis fields
  backendId?: number;
  sourceType?: 'full_paper' | 'abstract' | 'metadata' | string;
  researchProblem?: string;
  researchObjective?: string;
  researchQuestions?: string[];
  approach?: string;
  datasetText?: string;
  algorithmsAndModels?: string[];
  experimentalSetup?: string;
  keyResults?: string[];
  keyFindings?: string[];
  contributions?: string[];
  limitations?: string[];
  futureWork?: string[];
  keywords?: string[];
}

export interface ResearchGap {
  id: string;
  gapNumber: number;
  gap_id?: number;
  title: string;
  gap_title?: string;
  category?: string;
  description: string;
  sourcePaperIds: string[];
  affected_papers?: string[];
  importance: 'High' | 'Medium' | 'Low';
  confidence?: 'High' | 'Medium' | 'Low' | string;
  confidence_rationale?: string;
  evidence: string | string[];
  why_it_matters?: string;
  potential_direction?: string;
  potentialResearchOpportunity: string;
  domain?: string;
  frequencyScore: number; // 1 - 10
  priority?: number;
}

export interface ResearchGapAnalysisReport {
  id: number;
  project_id: number;
  papers_analyzed: number;
  gaps_identified: number;
  overall_summary: string;
  major_categories: string[];
  most_important_gap?: string | null;
  warning?: string | null;
  gaps: ResearchGap[];
  created_at?: string;
  updated_at?: string;
}

export interface ResearchQuestion {
  id: string;
  question_id?: string | number;
  gapId?: string;
  question: string;
  type?: string;
  question_type?: string;
  related_gap_id?: string | number;
  related_gap_title?: string;
  motivation?: string;
  supporting_evidence?: string | string[];
  expected_investigation?: string;
  feasibility?: 'High' | 'Medium' | 'Low' | string;
  priority?: 'High' | 'Medium' | 'Low' | string | number;
  hypothesis?: string;
  rationale?: string;
  suggestedMethodology?: string;
  saved?: boolean;
  difficulty?: 'Feasible' | 'Moderate' | 'High Breakthrough' | string;
  created_at?: string;
}

export interface ResearchQuestionGenerationResult {
  id?: number;
  project_id: string | number;
  topic: string;
  papers_considered: number;
  gaps_considered: number;
  primary_research_question?: ResearchQuestion | null;
  secondary_questions: ResearchQuestion[];
  research_questions: ResearchQuestion[];
  overall_research_direction: string;
  recommended_next_step: string;
  created_at?: string;
  updated_at?: string;
}


export interface LiteratureThemeItem {
  theme_id: string;
  title: string;
  description: string;
  paper_ids: (number | string)[];
  paper_titles?: string[];
  common_methods: string[];
  key_findings: string[];
  differences: string[];
}

export interface LiteraturePaperSummaryItem {
  paper_id?: number | string | null;
  title: string;
  authors: string | string[];
  year?: number | null;
  methodology: string;
  dataset: string;
  algorithms_models: string | string[];
  key_findings: string | string[];
  limitations: string | string[];
  contribution: string;
  relevance_to_topic: string;
}

export interface LiteratureResearchLandscape {
  overview: string;
  major_themes: string[];
  research_period: string;
  dominant_approaches: string[];
}

export interface LiteratureMethodologicalAnalysis {
  common_methods: string[];
  algorithms_models: string[];
  datasets: string[];
  evaluation_methods: string[];
  synthesis: string;
}

export interface LiteratureComparativeSynthesis {
  similarities: (string | any)[];
  differences: (string | any)[];
  strengths: (string | any)[];
  limitations: (string | any)[];
}

export interface LiteratureReviewGenerationResult {
  id?: number;
  project_id: number | string;
  topic: string;
  papers_considered: number;
  papers_with_analysis: number;
  papers_discovered?: number;
  papers_without_analysis?: string[];
  introduction: string;
  research_landscape: LiteratureResearchLandscape;
  themes: LiteratureThemeItem[];
  methodological_analysis: LiteratureMethodologicalAnalysis;
  comparative_synthesis: LiteratureComparativeSynthesis;
  research_trends: (string | any)[];
  limitations_in_literature: (string | any)[];
  research_gaps: any;
  research_question_connection: string;
  conclusion: string;
  paper_summaries: LiteraturePaperSummaryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface LiteratureItem {
  paperId: string;
  paperTitle: string;
  year: number;
  method: string;
  dataset: string;
  keyFinding: string;
  limitation: string;
  researchGap: string;
  citationKey: string;
  authorsShort: string;
}

export interface LiteratureReview {
  topic: string;
  totalPapersAnalyzed: number;
  timeline: {
    year: number;
    count: number;
    landmarkPapers: string[];
    paradigmShift: string;
  }[];
  matrix: LiteratureItem[];
  synthesisSummary: string;
  methodologyBreakdown: {
    method: string;
    percentage: number;
    count: number;
  }[];
}

export interface MethodologyWorkflowStep {
  step: number;
  name: string;
  description: string;
  toolOrTechnique: string;
  input: string;
  output: string;
}

export interface Methodology {
  paperId: string;
  paperTitle: string;
  researchProblem: string;
  dataset: string;
  datasetSize: string;
  preprocessing: string;
  modelAlgorithm: string;
  trainingMethod?: string;
  trainingStrategy?: string;
  evaluationMetrics: string;
  results: string;
  limitations: string;
  workflowSteps: MethodologyWorkflowStep[];
}

// Module 6: Project-Level Research Methodology Types (Sections A through N)
export interface MethodologyResearchOverview {
  topic?: string;
  problem_statement: string;
  research_objective: string;
  primary_research_question: string;
  specific_objectives: string[];
  proposed_research_direction: string;
}

export interface MethodologyResearchDesign {
  design_type: string;
  justification: string;
  alternative_designs_considered?: string[];
}

export interface MethodologyProposedApproachStage {
  stage_number?: number;
  stage_name: string;
  problem_addressed: string;
  proposed_approach: string;
  main_processing_stages: string[];
  expected_inputs: string[] | string;
  expected_outputs: string[] | string;
  relationship_to_gaps?: string;
  distinction_from_existing_work?: string;
}

export interface MethodologyDataCollection {
  required_data: string[];
  potential_sources: string[];
  collection_methods: string[];
  quality_requirements: string[];
  ethical_considerations: string[];
  dataset_selection_criteria?: string[];
}

export interface MethodologyPreprocessingStep {
  step_number?: number;
  name: string;
  purpose: string;
  technique: string;
  target_data_type: string;
}

export interface MethodologyMethodAlgorithm {
  name: string;
  purpose: string;
  reason_for_selection: string;
  strengths: string[];
  limitations: string[];
  relevant_research_question: string;
  status: 'established_in_literature' | 'proposed_for_investigation' | string;
  trade_offs?: string;
}

export interface MethodologySystemDesignComponent {
  name: string;
  responsibility: string;
  inputs: string[];
  outputs: string[];
}

export interface MethodologySystemDesign {
  components: MethodologySystemDesignComponent[];
  data_flow: string[];
  processing_pipeline: string[];
  model_integration?: string;
  expected_outputs: string[];
}

export interface MethodologyExperimentalSetup {
  design: string;
  baselines: string[];
  comparison_conditions: string[];
  training_and_testing_strategy?: string;
  validation_strategy: string[];
  reproducibility: string[];
  hardware_software_requirements?: string[];
}

export interface MethodologyEvaluationMetric {
  name: string;
  category: string;
  purpose: string;
  justification: string;
  formula_or_criteria?: string;
}

export interface MethodologyComparisonStrategy {
  baseline_method: string;
  comparison_purpose: string;
  evaluation_conditions: string;
  metrics: string[];
  fairness_and_reproducibility: string;
}

export interface MethodologyExpectedOutcome {
  hypothesis_or_outcome: string;
  confidence_level?: string;
  supporting_rationale: string;
  validation_criterion: string;
}

export interface MethodologyRiskLimitation {
  category: string;
  risk_description: string;
  mitigation_strategy: string;
}

export interface MethodologyReproducibilityEthics {
  experimental_settings_documentation: string;
  version_control: string;
  dataset_provenance: string;
  data_privacy_and_ethics: string;
  licensing_and_permissions: string;
  responsible_ai: string;
}

export interface MethodologyExecutionStep {
  step_number: number;
  activity: string;
  description: string;
  required_inputs: string[];
  expected_deliverable: string;
  dependencies: string[];
  estimated_effort: string;
}

export interface ProjectMethodologyResult {
  id?: number;
  project_id: string | number;
  topic: string;
  version: number;
  papers_considered: number;
  gaps_considered: number;
  questions_considered: number;
  has_literature_review: boolean;

  research_overview: MethodologyResearchOverview;
  research_design: MethodologyResearchDesign;
  proposed_approach: MethodologyProposedApproachStage[];
  data_collection: MethodologyDataCollection;
  data_preprocessing: MethodologyPreprocessingStep[];
  methods_and_algorithms: MethodologyMethodAlgorithm[];
  system_design: MethodologySystemDesign;
  experimental_setup: MethodologyExperimentalSetup;
  evaluation_metrics: MethodologyEvaluationMetric[];
  comparison_strategy: MethodologyComparisonStrategy[];
  expected_outcomes: MethodologyExpectedOutcome[];
  limitations_and_risks: MethodologyRiskLimitation[];
  reproducibility_and_ethics: MethodologyReproducibilityEthics;
  execution_plan: MethodologyExecutionStep[];
  assumptions_and_open_questions?: string[];

  created_at?: string;
  updated_at?: string;
}

export interface MethodologyStatusResponse {
  project_id: string | number;
  ready: boolean;
  has_papers: boolean;
  papers_count: number;
  has_analyses: boolean;
  analyzed_papers_count: number;
  has_gaps: boolean;
  gaps_count: number;
  has_questions: boolean;
  questions_count: number;
  has_literature_review: boolean;
  missing_modules: string[];
  generated: boolean;
  latest_version?: number | null;
}

export interface ComparisonItem {
  id: string;
  paperId: string;
  paperTitle: string;
  year: number;
  problem: string;
  method: string;
  dataset: string;
  technology: string;
  accuracyOrMetric: string;
  latencyOrComplexity: string;
  results: string;
  limitations: string;
  researchGap: string;
  benchmarkScore: number;
}

export interface DocumentationSection {
  id: string;
  number: number;
  title: string;
  content: string;
  included: boolean;
  wordCount: number;
  section_key?: string;
}

export interface DocumentationConfig {
  id?: number;
  project_id?: string | number;
  template: 'IEEE Conference' | 'ACM Transactions' | 'Nature Scientific Reports' | 'Standard Thesis / Dissertation' | 'ArXiv Preprint' | string;
  paperTitle: string;
  authors: string;
  institution: string;
  targetJournal: string;
  referenceStyle?: string;
  status?: string;
  version?: number;
  sections: DocumentationSection[];
  compiledMarkdown?: string;
  totalWordCount?: number;
  missing_upstream_context?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Slide {
  id: number;
  slideNumber: number;
  slide_number?: number;
  title: string;
  subtitle?: string;
  slideType?: string;
  slide_type?: string;
  mainMessage?: string;
  main_message?: string;
  bulletPoints: string[];
  bullet_points?: string[];
  badge?: string;
  notes?: string;
  visualType: 'title' | 'bullet' | 'architecture' | 'comparison' | 'matrix' | 'conclusion' | string;
  visual_type?: string;
  keyMetric?: { label: string; value: string };
  key_metric?: { label: string; value: string };
  sourcePaperIds?: Array<string | number>;
  source_paper_ids?: Array<string | number>;
}

export interface PresentationConfig {
  id?: number;
  project_id?: string | number;
  title?: string;
  presentationType?: 'Project Proposal' | 'Final-Year Project Review' | 'Research Seminar' | 'Literature Review Presentation' | 'Technical Demonstration' | string;
  presentation_type?: string;
  theme?: 'Professional Academic' | 'Minimal Research' | 'Modern Technical' | string;
  slideCount: number;
  slide_count?: number;
  style: 'Modern Minimal' | 'Academic Formal' | 'Deep Tech Dark' | 'Executive Clean' | string;
  template?: string;
  presenterName?: string;
  presenter_name?: string;
  institution?: string;
  supervisorName?: string;
  supervisor_name?: string;
  includeArchitecture?: boolean;
  includeComparison?: boolean;
  includeResearchGaps?: boolean;
  includeMethodology?: boolean;
  includeSpeakerNotes?: boolean;
  include_speaker_notes?: boolean;
  status?: string;
  version?: number;
  filePath?: string;
  file_path?: string;
  missing_upstream_context?: string[];
  created_at?: string;
  updated_at?: string;
  slides: Slide[];
}


export interface ResearchProject {
  id: string;
  title: string;
  topic: string;
  description?: string;
  domain: string;
  keywords: string[];
  paperCount: number;
  yearRange: [number, number];
  preferredSources: PaperSource[];
  createdAt: string;
  updatedAt: string;
  progress: number; // 0 - 100
  currentStage: ResearchStage;
  papersCount: number;
  analyzedCount: number;
  gapsIdentifiedCount: number;
  starred?: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  isStreaming?: boolean;
}

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    institution: string;
    avatarUrl: string;
    role: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    highContrast: boolean;
  };
  ai: {
    model: 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-1-5-pro' | 'deepseek-r1';
    temperature: number;
    summaryLength: 'concise' | 'balanced' | 'comprehensive';
    autoCite: boolean;
  };
  research: {
    defaultPaperCount: number;
    defaultYearRange: [number, number];
    preferredSources: PaperSource[];
    autoExtractGaps: boolean;
  };
  export: {
    defaultFormat: 'pdf' | 'docx' | 'markdown' | 'latex';
    includeVisuals: boolean;
    citationStyle: 'IEEE' | 'APA' | 'ACM' | 'Harvard';
  };
}

export interface EligiblePaperItem {
  id: number;
  title: string;
  authors: string[];
  publication_year?: number;
  venue?: string;
  abstract?: string;
  has_analysis: boolean;
  methodology?: string;
  dataset?: string;
  algorithms_and_models?: string[];
}

export interface EligiblePapersResponse {
  project_id: string | number;
  total_papers: number;
  eligible_count: number;
  eligible_papers: EligiblePaperItem[];
  unusable_papers: Array<{
    id: number;
    title: string;
    has_analysis: boolean;
    reason: string;
  }>;
  message?: string;
}

export interface MetricComparisonItem {
  metric_name: string;
  reported_value: string;
  dataset: string;
  evaluation_setting: string;
  source_paper_id: string | number;
  source_paper_title: string;
  comparability_notes?: string;
}

export interface GapConnectionItem {
  gap_id?: string | number;
  gap_title: string;
  category?: string;
  supported_papers: Array<string | number>;
  unresolved_status: string;
  evidence_summary: string;
  is_candidate_gap?: boolean;
}

export interface QuestionConnectionItem {
  question_id?: string | number;
  question_text: string;
  relevant_papers: Array<string | number>;
  comparison_findings: string;
  informs_investigation: string;
}

export interface PaperComparisonResult {
  id?: number;
  project_id: string | number;
  comparison_id?: string | number;
  title?: string;
  papers_compared: number;
  paper_ids: Array<string | number>;
  paper_information: Array<{
    paper_id: string | number;
    title: string;
    authors: string[];
    publication_year?: number;
    venue?: string;
    doi?: string;
  }>;
  comparison_dimensions: Array<{
    dimension: string;
    values: Record<string, string>;
  }>;
  comparison_table: {
    columns: string[];
    paper_ids: Array<string | number>;
    rows: Array<{
      dimension: string;
      values: Record<string, string>;
    }>;
  };
  commonalities: string[];
  differences: string[];
  methodological_strengths: Array<{
    strength: string;
    supporting_papers: Array<string | number>;
    evidence?: string;
  }>;
  methodological_limitations: Array<{
    limitation: string;
    supporting_papers: Array<string | number>;
    impact?: string;
  }>;
  dataset_and_evaluation_analysis: Array<{
    aspect: string;
    analysis: string;
    comparability_implications?: string;
  }>;
  reported_metric_comparisons: MetricComparisonItem[];
  research_trends: string[];
  research_gap_connections: GapConnectionItem[];
  research_question_connections: QuestionConnectionItem[];
  overall_synthesis: string;
  research_opportunities: string[];
  data_limitations: string[];
  created_at?: string;
  updated_at?: string;
}

// Module 8: System Architecture Types
export interface ArchitectureComponent {
  component_id: string;
  component_name: string;
  component_type: string;
  purpose: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  technologies: string[];
  dependencies: string[];
  related_research_questions: Array<string | number>;
  related_research_gaps: Array<string | number>;
  implementation_status: 'implemented' | 'proposed' | 'optional';
}

export interface ArchitectureDiagram {
  diagram_type: string;
  source: string;
  description: string;
}

export interface DataFlowStep {
  step_number: number;
  source_component: string;
  destination_component: string;
  data_transferred: string;
  processing_performed: string;
  output_produced: string;
  phase?: string;
}

export interface TechnologyStackItem {
  category: string;
  technology: string;
  role: string;
  reason_for_selection: string;
  alternatives: string[];
  status: 'current' | 'suggested' | 'optional';
}

export interface DataStorageEntity {
  entity_name: string;
  purpose: string;
  fields: string[];
  relationships: string[];
}

export interface DataStorageDesign {
  storage_paradigm: string;
  description: string;
  entities: DataStorageEntity[];
  er_diagram?: {
    diagram_type: string;
    source: string;
  };
}

export interface SecurityReliabilityItem {
  dimension: string;
  description: string;
  mitigation_strategy: string;
}

export interface DeploymentArchitecture {
  deployment_model: string;
  minimum_viable_deployment: string;
  production_enhancements: string;
  hosting_components: string[];
  environment_configuration: string[];
  scaling_considerations: string;
}

export interface ArchitectureJustification {
  objective_or_gap: string;
  architectural_choice: string;
  justification: string;
  trade_offs: string;
  related_question_ids: Array<string | number>;
  related_gap_ids: Array<string | number>;
}

export interface AlternativeArchitecture {
  title: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  complexity: string;
  suitable_conditions: string;
  rejection_reason: string;
}

export interface ImplementationStage {
  stage_number: number;
  stage_name: string;
  tasks: string[];
  dependencies: string[];
  deliverable: string;
  verification_method: string;
}

export interface LimitationAssumption {
  category: string;
  description: string;
}

export interface ArchitectureResult {
  id?: number;
  project_id: string | number;
  topic: string;
  architecture_title: string;
  architecture_type: string;
  architecture_summary: string;
  components: ArchitectureComponent[];
  architecture_diagram: ArchitectureDiagram;
  data_flow: DataFlowStep[];
  technology_stack: TechnologyStackItem[];
  data_storage_design: DataStorageDesign;
  security_and_reliability: SecurityReliabilityItem[];
  deployment_architecture: DeploymentArchitecture;
  architecture_justification: ArchitectureJustification[];
  alternative_architectures: AlternativeArchitecture[];
  implementation_plan: ImplementationStage[];
  limitations_and_assumptions: LimitationAssumption[];
  missing_upstream_context?: string[];
  created_at?: string;
  updated_at?: string;
}

