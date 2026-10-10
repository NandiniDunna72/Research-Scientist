import {
  ProjectMethodologyResult,
  MethodologyStatusResponse,
} from '../types';
import { authService } from './authService';

/**
 * Normalizes backend response ensuring all 14 structured sections are safely typed.
 */
export function normalizeMethodologyResult(raw: any): ProjectMethodologyResult {
  return {
    id: raw.id,
    project_id: raw.project_id,
    topic: raw.topic || 'Academic Research',
    version: raw.version || 1,
    papers_considered: raw.papers_considered || 0,
    gaps_considered: raw.gaps_considered || 0,
    questions_considered: raw.questions_considered || 0,
    has_literature_review: Boolean(raw.has_literature_review),

    // Section A: Research Overview
    research_overview: {
      topic: raw.research_overview?.topic || raw.topic || 'Advanced Academic Investigation',
      problem_statement: raw.research_overview?.problem_statement || 'Problem statement formulating the empirical research focus.',
      research_objective: raw.research_overview?.research_objective || 'Core technical objective of the proposed inquiry.',
      primary_research_question: raw.research_overview?.primary_research_question || 'How can the proposed methodology address identified limitations?',
      specific_objectives: Array.isArray(raw.research_overview?.specific_objectives)
        ? raw.research_overview.specific_objectives
        : [],
      proposed_research_direction: raw.research_overview?.proposed_research_direction || 'Investigate integrated algorithmic solutions.',
    },

    // Section B: Research Design
    research_design: {
      design_type: raw.research_design?.design_type || 'Experimental and Comparative Research',
      justification: raw.research_design?.justification || 'Methodological paradigm justified by objective empirical validation needs.',
      alternative_designs_considered: Array.isArray(raw.research_design?.alternative_designs_considered)
        ? raw.research_design.alternative_designs_considered
        : [],
    },

    // Section C: Proposed Approach
    proposed_approach: Array.isArray(raw.proposed_approach)
      ? raw.proposed_approach.map((stage: any, idx: number) => ({
          stage_number: stage.stage_number || idx + 1,
          stage_name: stage.stage_name || `Execution Stage #${idx + 1}`,
          problem_addressed: stage.problem_addressed || 'Specific technical limitation being resolved.',
          proposed_approach: stage.proposed_approach || 'Architectural and procedural methodology applied in this stage.',
          main_processing_stages: Array.isArray(stage.main_processing_stages) ? stage.main_processing_stages : [],
          expected_inputs: stage.expected_inputs || [],
          expected_outputs: stage.expected_outputs || [],
          relationship_to_gaps: stage.relationship_to_gaps || 'Resolves identified empirical gap.',
          distinction_from_existing_work: stage.distinction_from_existing_work || 'Extends current literature via novel formulation.',
        }))
      : [],

    // Section D: Data Collection
    data_collection: {
      required_data: Array.isArray(raw.data_collection?.required_data) ? raw.data_collection.required_data : [],
      potential_sources: Array.isArray(raw.data_collection?.potential_sources) ? raw.data_collection.potential_sources : [],
      collection_methods: Array.isArray(raw.data_collection?.collection_methods) ? raw.data_collection.collection_methods : [],
      quality_requirements: Array.isArray(raw.data_collection?.quality_requirements) ? raw.data_collection.quality_requirements : [],
      ethical_considerations: Array.isArray(raw.data_collection?.ethical_considerations) ? raw.data_collection.ethical_considerations : [],
      dataset_selection_criteria: Array.isArray(raw.data_collection?.dataset_selection_criteria) ? raw.data_collection.dataset_selection_criteria : [],
    },

    // Section E: Data Preprocessing
    data_preprocessing: Array.isArray(raw.data_preprocessing)
      ? raw.data_preprocessing.map((step: any, idx: number) => ({
          step_number: step.step_number || idx + 1,
          name: step.name || `Preprocessing Stage #${idx + 1}`,
          purpose: step.purpose || 'Condition raw data into model-compatible tensors.',
          technique: step.technique || 'Standardized algorithmic pipeline',
          target_data_type: step.target_data_type || 'Domain features / representations',
        }))
      : [],

    // Section F: Methods and Algorithms
    methods_and_algorithms: Array.isArray(raw.methods_and_algorithms)
      ? raw.methods_and_algorithms.map((method: any) => ({
          name: method.name || 'Proposed Method',
          purpose: method.purpose || 'Specific computational role',
          reason_for_selection: method.reason_for_selection || 'Empirical evidence from literature supports effectiveness.',
          strengths: Array.isArray(method.strengths) ? method.strengths : [],
          limitations: Array.isArray(method.limitations) ? method.limitations : [],
          relevant_research_question: method.relevant_research_question || 'Addresses primary research question.',
          status: method.status || 'proposed_for_investigation',
          trade_offs: method.trade_offs || 'Balance between computational complexity and generalizability.',
        }))
      : [],

    // Section G: System Design
    system_design: {
      components: Array.isArray(raw.system_design?.components)
        ? raw.system_design.components.map((comp: any) => ({
            name: comp.name || 'Component',
            responsibility: comp.responsibility || 'System module responsibility',
            inputs: Array.isArray(comp.inputs) ? comp.inputs : [],
            outputs: Array.isArray(comp.outputs) ? comp.outputs : [],
          }))
        : [],
      data_flow: Array.isArray(raw.system_design?.data_flow) ? raw.system_design.data_flow : [],
      processing_pipeline: Array.isArray(raw.system_design?.processing_pipeline) ? raw.system_design.processing_pipeline : [],
      model_integration: raw.system_design?.model_integration || 'End-to-end component integration topology.',
      expected_outputs: Array.isArray(raw.system_design?.expected_outputs) ? raw.system_design.expected_outputs : [],
    },

    // Section H: Experimental Setup
    experimental_setup: {
      design: raw.experimental_setup?.design || 'Controlled comparative empirical evaluation protocol.',
      baselines: Array.isArray(raw.experimental_setup?.baselines) ? raw.experimental_setup.baselines : [],
      comparison_conditions: Array.isArray(raw.experimental_setup?.comparison_conditions) ? raw.experimental_setup.comparison_conditions : [],
      training_and_testing_strategy: raw.experimental_setup?.training_and_testing_strategy || 'Cross-validation protocol with stratified splits.',
      validation_strategy: Array.isArray(raw.experimental_setup?.validation_strategy) ? raw.experimental_setup.validation_strategy : [],
      reproducibility: Array.isArray(raw.experimental_setup?.reproducibility) ? raw.experimental_setup.reproducibility : [],
      hardware_software_requirements: Array.isArray(raw.experimental_setup?.hardware_software_requirements) ? raw.experimental_setup.hardware_software_requirements : [],
    },

    // Section I: Evaluation Metrics
    evaluation_metrics: Array.isArray(raw.evaluation_metrics)
      ? raw.evaluation_metrics.map((metric: any) => ({
          name: metric.name || 'Evaluation Metric',
          category: metric.category || 'Performance',
          purpose: metric.purpose || 'Quantifies model accuracy and reliability.',
          justification: metric.justification || 'Standardized benchmark criterion in domain literature.',
          formula_or_criteria: metric.formula_or_criteria || 'Empirical formulation',
        }))
      : [],

    // Section J: Comparison Strategy
    comparison_strategy: Array.isArray(raw.comparison_strategy)
      ? raw.comparison_strategy.map((item: any) => ({
          baseline_method: item.baseline_method || 'Literature Baseline',
          comparison_purpose: item.comparison_purpose || 'Benchmarking comparative performance.',
          evaluation_conditions: item.evaluation_conditions || 'Identical data partitioning and resource constraints.',
          metrics: Array.isArray(item.metrics) ? item.metrics : [],
          fairness_and_reproducibility: item.fairness_and_reproducibility || 'Harmonized hyperparameter optimization.',
        }))
      : [],

    // Section K: Expected Outcomes
    expected_outcomes: Array.isArray(raw.expected_outcomes)
      ? raw.expected_outcomes.map((outcome: any) => ({
          hypothesis_or_outcome: outcome.hypothesis_or_outcome || 'Hypothesized empirical improvement.',
          confidence_level: outcome.confidence_level || 'Hypothesized',
          supporting_rationale: outcome.supporting_rationale || 'Derived from analyzed architectural principles.',
          validation_criterion: outcome.validation_criterion || 'Statistically significant improvement on benchmark splits.',
        }))
      : [],

    // Section L: Limitations and Risks
    limitations_and_risks: Array.isArray(raw.limitations_and_risks)
      ? raw.limitations_and_risks.map((item: any) => ({
          category: item.category || 'Methodological',
          risk_description: item.risk_description || 'Potential challenge in experimental execution.',
          mitigation_strategy: item.mitigation_strategy || 'Proactive algorithmic mitigation safeguard.',
        }))
      : [],

    // Section M: Reproducibility and Ethics
    reproducibility_and_ethics: {
      experimental_settings_documentation: raw.reproducibility_and_ethics?.experimental_settings_documentation || 'Comprehensive logging of hyperparameter configurations and environments.',
      version_control: raw.reproducibility_and_ethics?.version_control || 'Deterministic code and model checkpoints tracked via version control.',
      dataset_provenance: raw.reproducibility_and_ethics?.dataset_provenance || 'Documented data licensing, curation records, and lineage.',
      data_privacy_and_ethics: raw.reproducibility_and_ethics?.data_privacy_and_ethics || 'De-identification and compliance with ethical guidelines.',
      licensing_and_permissions: raw.reproducibility_and_ethics?.licensing_and_permissions || 'Permissive academic open-source licensing.',
      responsible_ai: raw.reproducibility_and_ethics?.responsible_ai || 'Auditing for fairness, bias, and failure mode boundaries.',
    },

    // Section N: Execution Plan
    execution_plan: Array.isArray(raw.execution_plan)
      ? raw.execution_plan.map((step: any, idx: number) => ({
          step_number: step.step_number || idx + 1,
          activity: step.activity || `Milestone Phase #${idx + 1}`,
          description: step.description || 'Systematic execution of research task.',
          required_inputs: Array.isArray(step.required_inputs) ? step.required_inputs : [],
          expected_deliverable: step.expected_deliverable || 'Verified milestone deliverable.',
          dependencies: Array.isArray(step.dependencies) ? step.dependencies : [],
          estimated_effort: step.estimated_effort || '2-3 weeks (approximate planning estimate)',
        }))
      : [],

    assumptions_and_open_questions: Array.isArray(raw.assumptions_and_open_questions)
      ? raw.assumptions_and_open_questions
      : [],

    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export const methodologyService = {
  /**
   * Retrieves the latest saved research methodology for a project from PostgreSQL.
   */
  async getMethodology(projectId: string | number): Promise<ProjectMethodologyResult | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/methodology/${encodeURIComponent(String(projectId))}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return normalizeMethodologyResult(data);
    } catch (err) {
      console.warn('Failed to fetch methodology from backend:', err);
      return null;
    }
  },

  /**
   * Checks upstream prerequisites readiness status for a project.
   */
  async getMethodologyStatus(projectId: string | number): Promise<MethodologyStatusResponse | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/methodology/${encodeURIComponent(String(projectId))}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch methodology readiness status:', err);
      return null;
    }
  },

  /**
   * Triggers research methodology generation for the project.
   */
  async generateMethodology(projectId: string | number): Promise<ProjectMethodologyResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to generate research methodology.');
    }

    const res = await fetch('/api/methodology/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Methodology generation failed. Please try again.');
    }

    return normalizeMethodologyResult(data);
  },

  /**
   * Explicitly regenerates the methodology using latest upstream context.
   */
  async regenerateMethodology(projectId: string | number): Promise<ProjectMethodologyResult> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required to regenerate research methodology.');
    }

    const res = await fetch(`/api/methodology/${encodeURIComponent(String(projectId))}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to regenerate research methodology.');
    }

    return normalizeMethodologyResult(data);
  },
};
