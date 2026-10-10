import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { authService } from '../services/authService';
import { methodologyService } from '../services/methodologyService';
import {
  ProjectMethodologyResult,
  MethodologyStatusResponse,
} from '../types';
import {
  Workflow,
  Layers,
  Database,
  Cpu,
  BarChart2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  Lightbulb,
  Compass,
  Code2,
  Clock,
  Check,
  AlertCircle,
  Info,
  GitBranch,
  Calendar,
  Sliders,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';

type ViewTab = 'all' | 'overview' | 'approach' | 'data' | 'algorithms' | 'evaluation' | 'execution';

export const MethodologyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast } = useResearch();

  const projectId = id || currentProject?.id || '1';

  // State
  const [methodology, setMethodology] = useState<ProjectMethodologyResult | null>(null);
  const [status, setStatus] = useState<MethodologyStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    design: true,
    approach: true,
    data: true,
    preprocessing: true,
    algorithms: true,
    system: true,
    setup: true,
    metrics: true,
    comparison: true,
    outcomes: true,
    risks: true,
    ethics: true,
    execution: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('Initializing methodology formulation...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Toggle single section expand/collapse
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Expand or collapse all
  const toggleAllSections = (expand: boolean) => {
    setExpandedSections({
      overview: expand,
      design: expand,
      approach: expand,
      data: expand,
      preprocessing: expand,
      algorithms: expand,
      system: expand,
      setup: expand,
      metrics: expand,
      comparison: expand,
      outcomes: expand,
      risks: expand,
      ethics: expand,
      execution: expand,
    });
  };

  // Load existing methodology and readiness status on mount or project change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const isAuth = authService.isAuthenticated();
        if (isAuth) {
          const [savedMethodology, readinessStatus] = await Promise.all([
            methodologyService.getMethodology(projectId),
            methodologyService.getMethodologyStatus(projectId),
          ]);

          if (!isMounted) return;

          setMethodology(savedMethodology);
          setStatus(readinessStatus);
        } else {
          // Unauthenticated fallback preview state
          setStatus({
            project_id: projectId,
            ready: true,
            has_papers: true,
            papers_count: 3,
            has_analyses: true,
            analyzed_papers_count: 3,
            has_gaps: true,
            gaps_count: 3,
            has_questions: true,
            questions_count: 3,
            has_literature_review: true,
            missing_modules: [],
            generated: false,
          });
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load methodology:', err);
        setErrorMsg('Failed to load research methodology data. Please refresh.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Generate Action
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    // Staged progress messages to guide user experience
    const stages = [
      'Retrieving analyzed papers, research gaps, and formulated questions...',
      'Synthesizing empirical findings and defining primary technical objectives...',
      'Architecting multi-stage processing pipeline and system integration...',
      'Formulating experimental protocol, baselines, and evaluation criteria...',
      'Drafting risk mitigation protocols and verifying execution schedule...',
      'Persisting structured research methodology...',
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setGenerationStage(stages[stageIdx]);
    }, 2800);

    try {
      const result = await methodologyService.generateMethodology(projectId);
      setMethodology(result);
      if (status) {
        setStatus({ ...status, generated: true, latest_version: result.version });
      }
      addToast({
        type: 'success',
        title: 'Research Methodology Generated',
        message: 'A complete, structured 14-section research plan has been created and saved.',
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      const msg = err.message || 'Methodology generation failed. Please check upstream inputs.';
      setErrorMsg(msg);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: msg,
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Regenerate Action
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMsg(null);

    try {
      const result = await methodologyService.regenerateMethodology(projectId);
      setMethodology(result);
      if (status) {
        setStatus({ ...status, generated: true, latest_version: result.version });
      }
      addToast({
        type: 'success',
        title: `Methodology Updated (v${result.version})`,
        message: 'Regenerated using latest upstream papers, gaps, questions, and literature context.',
      });
    } catch (err: any) {
      console.error('Regeneration error:', err);
      const msg = err.message || 'Failed to regenerate methodology.';
      setErrorMsg(msg);
      addToast({
        type: 'error',
        title: 'Regeneration Error',
        message: msg,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Copy full plan as Markdown
  const handleCopyMarkdown = () => {
    if (!methodology) return;
    const md = buildMarkdownExport(methodology);
    navigator.clipboard.writeText(md);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Full Research Methodology blueprint copied as Markdown.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    if (!methodology) return;
    const md = buildMarkdownExport(methodology);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research_Methodology_${methodology.topic.replace(/[^a-zA-Z0-9]/g, '_')}_v${methodology.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to build comprehensive markdown export
  const buildMarkdownExport = (m: ProjectMethodologyResult): string => {
    return `# RESEARCH METHODOLOGY BLUEPRINT
**Project Topic:** ${m.topic}
**Version:** v${m.version} | **Analyzed Papers:** ${m.papers_considered} | **Gaps Considered:** ${m.gaps_considered} | **Questions Considered:** ${m.questions_considered}
**Literature Review Context:** ${m.has_literature_review ? 'Included' : 'Independent synthesis'}

---

## SECTION A: RESEARCH OVERVIEW
- **Problem Statement:** ${m.research_overview.problem_statement}
- **Research Objective:** ${m.research_overview.research_objective}
- **Primary Research Question:** ${m.research_overview.primary_research_question}
- **Specific Objectives:**
${m.research_overview.specific_objectives.map((o) => `  * ${o}`).join('\n')}
- **Proposed Research Direction:** ${m.research_overview.proposed_research_direction}

---

## SECTION B: RESEARCH DESIGN
- **Design Type:** ${m.research_design.design_type}
- **Justification:** ${m.research_design.justification}
${m.research_design.alternative_designs_considered?.length ? `- **Alternative Designs Considered:** ${m.research_design.alternative_designs_considered.join(', ')}` : ''}

---

## SECTION C: PROPOSED APPROACH
${m.proposed_approach.map((s) => `### Stage ${s.stage_number || ''}: ${s.stage_name}
- **Problem Addressed:** ${s.problem_addressed}
- **Proposed Approach:** ${s.proposed_approach}
- **Main Processing Stages:** ${s.main_processing_stages.join(' -> ')}
- **Expected Inputs:** ${Array.isArray(s.expected_inputs) ? s.expected_inputs.join(', ') : s.expected_inputs}
- **Expected Outputs:** ${Array.isArray(s.expected_outputs) ? s.expected_outputs.join(', ') : s.expected_outputs}
- **Relationship to Identified Gaps:** ${s.relationship_to_gaps || 'N/A'}
- **Distinction from Existing Work:** ${s.distinction_from_existing_work || 'N/A'}
`).join('\n')}

---

## SECTION D: DATA COLLECTION
- **Required Data:**
${m.data_collection.required_data.map((d) => `  * ${d}`).join('\n')}
- **Potential Sources:** ${m.data_collection.potential_sources.join(', ')}
- **Collection Methods:** ${m.data_collection.collection_methods.join(', ')}
- **Quality Requirements:** ${m.data_collection.quality_requirements.join(', ')}
- **Ethical Considerations:** ${m.data_collection.ethical_considerations.join(', ')}
${m.data_collection.dataset_selection_criteria?.length ? `- **Dataset Selection Criteria:** ${m.data_collection.dataset_selection_criteria.join(', ')}` : ''}

---

## SECTION E: DATA PREPROCESSING
| Step | Name | Technique | Modality | Purpose |
|------|------|-----------|----------|---------|
${m.data_preprocessing.map((p) => `| ${p.step_number || '-'} | ${p.name} | ${p.technique} | ${p.target_data_type} | ${p.purpose} |`).join('\n')}

---

## SECTION F: PROPOSED MODELS, ALGORITHMS, OR TECHNIQUES
${m.methods_and_algorithms.map((alg) => `### ${alg.name} (${alg.status})
- **Purpose:** ${alg.purpose}
- **Reason for Selection:** ${alg.reason_for_selection}
- **Strengths:** ${alg.strengths.join(', ')}
- **Limitations:** ${alg.limitations.join(', ')}
- **Relevant Research Question:** ${alg.relevant_research_question}
${alg.trade_offs ? `- **Trade-offs:** ${alg.trade_offs}` : ''}
`).join('\n')}

---

## SECTION G: SYSTEM DESIGN AND IMPLEMENTATION PLAN
- **System Components:**
${m.system_design.components.map((c) => `  * **${c.name}:** ${c.responsibility}`).join('\n')}
- **Processing Pipeline:** ${m.system_design.processing_pipeline.join(' -> ')}
- **Data Flow:** ${m.system_design.data_flow.join(' -> ')}
- **Model Integration:** ${m.system_design.model_integration || 'N/A'}
- **Expected Outputs:** ${m.system_design.expected_outputs.join(', ')}

---

## SECTION H: EXPERIMENTAL SETUP
- **Experimental Design:** ${m.experimental_setup.design}
- **Baseline Methods:** ${m.experimental_setup.baselines.join(', ')}
- **Comparison Conditions:** ${m.experimental_setup.comparison_conditions.join(', ')}
- **Validation Strategy:** ${m.experimental_setup.validation_strategy.join(', ')}
- **Reproducibility Protocol:** ${m.experimental_setup.reproducibility.join(', ')}
${m.experimental_setup.hardware_software_requirements?.length ? `- **Hardware/Software Requirements:** ${m.experimental_setup.hardware_software_requirements.join(', ')}` : ''}

---

## SECTION I: EVALUATION METRICS
${m.evaluation_metrics.map((em) => `- **${em.name} (${em.category}):** ${em.purpose}. *Justification:* ${em.justification}`).join('\n')}

---

## SECTION J: BASELINES AND COMPARISON STRATEGY
${m.comparison_strategy.map((cs) => `### Baseline: ${cs.baseline_method}
- **Purpose:** ${cs.comparison_purpose}
- **Evaluation Conditions:** ${cs.evaluation_conditions}
- **Metrics:** ${cs.metrics.join(', ')}
- **Fairness & Reproducibility:** ${cs.fairness_and_reproducibility}
`).join('\n')}

---

## SECTION K: EXPECTED OUTCOMES
${m.expected_outcomes.map((eo, idx) => `${idx + 1}. **[${eo.confidence_level || 'Hypothesized'}]** ${eo.hypothesis_or_outcome}
   - *Rationale:* ${eo.supporting_rationale}
   - *Validation Criterion:* ${eo.validation_criterion}
`).join('\n')}

---

## SECTION L: LIMITATIONS AND RISKS
${m.limitations_and_risks.map((r) => `- **[${r.category}]** ${r.risk_description}
  *Mitigation Strategy:* ${r.mitigation_strategy}
`).join('\n')}

---

## SECTION M: REPRODUCIBILITY AND ETHICAL CONSIDERATIONS
- **Experimental Settings Documentation:** ${m.reproducibility_and_ethics.experimental_settings_documentation}
- **Version Control:** ${m.reproducibility_and_ethics.version_control}
- **Dataset Provenance:** ${m.reproducibility_and_ethics.dataset_provenance}
- **Data Privacy & Ethics:** ${m.reproducibility_and_ethics.data_privacy_and_ethics}
- **Licensing & Permissions:** ${m.reproducibility_and_ethics.licensing_and_permissions}
- **Responsible AI:** ${m.reproducibility_and_ethics.responsible_ai}

---

## SECTION N: STEP-BY-STEP EXECUTION PLAN
${m.execution_plan.map((s) => `### Step ${s.step_number}: ${s.activity} (${s.estimated_effort})
- **Description:** ${s.description}
- **Required Inputs:** ${s.required_inputs.join(', ')}
- **Deliverable:** ${s.expected_deliverable}
- **Dependencies:** ${s.dependencies.join(', ')}
`).join('\n')}
`;
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="py-20 animate-fade-in">
        <LoadingState
          title="Loading Research Methodology..."
          subtitle="Retrieving persistent methodology plan, upstream paper analyses, and readiness status."
        />
      </div>
    );
  }

  // 2. Active Generation Loading Overlay
  if (isGenerating) {
    return (
      <div className="py-16 max-w-2xl mx-auto space-y-8 animate-fade-in text-center">
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
          <Workflow className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Generating research methodology...
          </h2>
          <p className="text-sm text-muted-foreground font-mono transition-all duration-300">
            {generationStage}
          </p>
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 p-5 text-left text-xs space-y-2.5">
          <div className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Rigorous Scientific Synthesis in Progress:
          </div>
          <ul className="text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Synthesizing real research gaps from analyzed papers</li>
            <li>Translating primary and secondary questions into actionable technical pipelines</li>
            <li>Formulating data collection, preprocessing, and model architectures</li>
            <li>Constructing baseline comparison strategy, evaluation metrics, and execution timeline</li>
          </ul>
        </Card>
      </div>
    );
  }

  // 3. Not Yet Generated State (Prerequisites & Readiness Checklist)
  if (!methodology) {
    const isReady = status?.ready ?? false;
    const hasPapers = status?.has_analyses ?? false;
    const hasGaps = status?.has_gaps ?? false;
    const hasQuestions = status?.has_questions ?? false;
    const hasLit = status?.has_literature_review ?? false;

    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Research Methodology Generation
            </h1>
            <Badge variant="indigo" size="md">
              Module 6
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            Convert your research questions and identified gaps into a concrete, technically feasible, publishable research plan.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <strong className="block font-semibold">Generation Prerequisite Alert</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Readiness Checklist Card */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                Upstream Prerequisites & Synthesis Readiness
              </span>
              <Badge variant={isReady ? 'success' : 'warning'} size="md">
                {isReady ? 'Ready for Formulation' : 'Prerequisites Incomplete'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Research methodology is grounded directly in the authenticated project&apos;s analyzed papers, empirical gaps, and research questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Prerequisite 1: Analyzed Papers */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  hasPapers
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    {hasPapers ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    1. Analyzed Papers
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                    {status?.analyzed_papers_count ?? 0} papers
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed">
                  Extracts methods, datasets, architectures, and limitations from surveyed papers.
                </p>
                {!hasPapers && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5 text-[11px] h-7 w-full"
                    onClick={() => navigate(`/research/${projectId}/analysis`)}
                  >
                    Go to Paper Analysis
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              {/* Prerequisite 2: Research Gaps */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  hasGaps
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    {hasGaps ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    2. Research Gaps
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                    {status?.gaps_count ?? 0} gaps
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed">
                  Identified empirical, methodological, and scalability blind spots in current state-of-the-art.
                </p>
                {!hasGaps && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5 text-[11px] h-7 w-full"
                    onClick={() => navigate(`/research/${projectId}/gaps`)}
                  >
                    Go to Research Gaps
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              {/* Prerequisite 3: Research Questions */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  hasQuestions
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    {hasQuestions ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    3. Research Questions
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                    {status?.questions_count ?? 0} questions
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed">
                  Primary and secondary research questions defining the core scope of empirical investigation.
                </p>
                {!hasQuestions && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5 text-[11px] h-7 w-full"
                    onClick={() => navigate(`/research/${projectId}/questions`)}
                  >
                    Go to Research Questions
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              {/* Prerequisite 4: Literature Review (Supporting context) */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  hasLit
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    4. Literature Review
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                    {hasLit ? 'Available' : 'Optional Context'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed">
                  {hasLit
                    ? 'Synthesized literature context will be utilized as supporting thematic grounding.'
                    : 'Not required. If absent, methodology synthesizes directly from analyzed papers & questions.'}
                </p>
                {!hasLit && (
                  <div className="mt-2 text-[10px] text-muted-foreground italic">
                    Optional: You can synthesize a Literature Review first or proceed directly.
                  </div>
                )}
              </div>
            </div>

            {/* Action Trigger Banner */}
            <div className="p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/60 via-card to-card dark:from-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-indigo-600" />
                  Generate Comprehensive Research Methodology
                </h3>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Formulates all 14 structured sections: research overview, design rationale, data acquisition, preprocessing, algorithms, experimental protocol, evaluation metrics, and execution schedule.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={!isReady}
                onClick={handleGenerate}
                className="shrink-0 shadow-md font-semibold text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Methodology
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Saved Methodology View (All 14 Sections A through N)
  const ro = methodology.research_overview;
  const rd = methodology.research_design;
  const pa = methodology.proposed_approach;
  const dc = methodology.data_collection;
  const dp = methodology.data_preprocessing;
  const ma = methodology.methods_and_algorithms;
  const sd = methodology.system_design;
  const es = methodology.experimental_setup;
  const em = methodology.evaluation_metrics;
  const cs = methodology.comparison_strategy;
  const eo = methodology.expected_outcomes;
  const lr = methodology.limitations_and_risks;
  const re = methodology.reproducibility_and_ethics;
  const ep = methodology.execution_plan;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Research Methodology Plan
            </h1>
            <Badge variant="indigo" size="md">
              Module 6
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono">
              Version v{methodology.version}
            </Badge>
            {methodology.has_literature_review && (
              <Badge variant="indigo" size="sm">
                Literature Review Linked
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            {methodology.topic}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied' : 'Copy Plan'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Markdown
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={isRegenerating}
            onClick={handleRegenerate}
            className="text-xs shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>

      {/* Upstream Evidence Grounding Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Papers Synthesized
          </span>
          <span className="text-lg font-bold text-foreground font-mono">
            {methodology.papers_considered}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Empirically analyzed</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Research Gaps Addressed
          </span>
          <span className="text-lg font-bold text-foreground font-mono">
            {methodology.gaps_considered}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Literature blind spots</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Questions Grounded
          </span>
          <span className="text-lg font-bold text-foreground font-mono">
            {methodology.questions_considered}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Primary & secondary</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
            Execution Schedule
          </span>
          <span className="text-lg font-bold text-foreground font-mono">
            {ep.length}
          </span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Structured phases</span>
        </div>
      </div>

      {/* View Filter Navigation Tabs & Section Expand All controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { key: 'all', label: 'All 14 Sections' },
            { key: 'overview', label: 'Overview & Design' },
            { key: 'approach', label: 'Approach & System' },
            { key: 'data', label: 'Data & Preprocessing' },
            { key: 'algorithms', label: 'Algorithms & Setup' },
            { key: 'evaluation', label: 'Metrics & Outcomes' },
            { key: 'execution', label: 'Risks & Timeline' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ViewTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleAllSections(true)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Expand All
          </button>
          <span className="text-muted-foreground text-xs">•</span>
          <button
            onClick={() => toggleAllSections(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: RESEARCH OVERVIEW */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('overview')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                SECTION A: Research Overview
              </CardTitle>
              {expandedSections.overview ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Formulation of the technical problem, research objective, and primary research inquiry
            </CardDescription>
          </CardHeader>

          {expandedSections.overview && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Technical Problem Statement
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {ro.problem_statement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Overarching Research Objective
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {ro.research_objective}
                  </p>
                </div>
              </div>

              {/* Primary Question Box */}
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Primary Research Question
                  </span>
                  <Badge variant="indigo" size="sm">
                    Core Focus
                  </Badge>
                </div>
                <p className="text-sm font-bold text-foreground leading-snug">
                  {ro.primary_research_question}
                </p>
              </div>

              {/* Specific Objectives */}
              {ro.specific_objectives && ro.specific_objectives.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-foreground">
                    Specific Technical Objectives:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ro.specific_objectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border bg-card flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-muted-foreground leading-relaxed">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proposed Direction */}
              <div className="pt-1 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Proposed Research Direction
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {ro.proposed_research_direction}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: RESEARCH DESIGN */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('design')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                SECTION B: Research Design
              </CardTitle>
              {expandedSections.design ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Methodological design category and scientific justification
            </CardDescription>
          </CardHeader>

          {expandedSections.design && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground">Selected Paradigm:</span>
                <Badge variant="indigo" size="md" className="font-semibold">
                  {rd.design_type}
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Scientific Justification for Design Selection
                </span>
                <p className="text-foreground leading-relaxed">
                  {rd.justification}
                </p>
              </div>

              {rd.alternative_designs_considered && rd.alternative_designs_considered.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="font-semibold text-muted-foreground">Alternative Designs Considered:</span>
                  {rd.alternative_designs_considered.map((alt, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: PROPOSED APPROACH (Step-by-Step Execution Pipeline) */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'approach') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('approach')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                SECTION C: Proposed Approach (Pipeline Stages)
              </CardTitle>
              {expandedSections.approach ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Step-by-step procedural breakdown with inputs, outputs, and gap resolution
            </CardDescription>
          </CardHeader>

          {expandedSections.approach && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="space-y-3">
                {pa.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-[10px]">
                          Stage {stage.stage_number || idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">
                          {stage.stage_name}
                        </h4>
                      </div>
                      {stage.relationship_to_gaps && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          Gap: {stage.relationship_to_gaps}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                          Problem Addressed
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          {stage.problem_addressed}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                          Proposed Methodological Solution
                        </span>
                        <p className="text-foreground leading-relaxed">
                          {stage.proposed_approach}
                        </p>
                      </div>
                    </div>

                    {/* Inputs & Outputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                          Inputs
                        </span>
                        <span className="font-mono text-[11px] text-foreground">
                          {Array.isArray(stage.expected_inputs)
                            ? stage.expected_inputs.join(', ')
                            : stage.expected_inputs}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/50">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                          Outputs
                        </span>
                        <span className="font-mono text-[11px] text-foreground">
                          {Array.isArray(stage.expected_outputs)
                            ? stage.expected_outputs.join(', ')
                            : stage.expected_outputs}
                        </span>
                      </div>
                    </div>

                    {stage.distinction_from_existing_work && (
                      <div className="p-2.5 rounded-lg bg-amber-50/20 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-[11px]">
                        <strong className="text-amber-700 dark:text-amber-300 font-semibold block mb-0.5">
                          Distinction from Existing Work in Literature:
                        </strong>
                        <span className="text-muted-foreground">
                          {stage.distinction_from_existing_work}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION D: DATA COLLECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'data') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('data')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                SECTION D: Data Collection Protocol
              </CardTitle>
              {expandedSections.data ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Required data modalities, public archives, and quality standards
            </CardDescription>
          </CardHeader>

          {expandedSections.data && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="font-bold text-foreground block">
                    Required Data Modalities & Cohorts:
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                    {dc.required_data.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <strong className="text-foreground">{item}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-foreground block">
                    Potential Public Archives & Data Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dc.potential_sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Quality Requirements
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px]">
                    {dc.quality_requirements.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Collection Protocols
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px]">
                    {dc.collection_methods.map((cm, idx) => (
                      <li key={idx}>{cm}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg border border-border bg-secondary/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Ethical & Privacy Considerations
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside text-[11px]">
                    {dc.ethical_considerations.map((ec, idx) => (
                      <li key={idx}>{ec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {dc.dataset_selection_criteria && dc.dataset_selection_criteria.length > 0 && (
                <div className="p-3 rounded-lg bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-[11px]">
                  <strong className="text-indigo-700 dark:text-indigo-300 font-semibold block mb-1">
                    Dataset Selection Criteria:
                  </strong>
                  <div className="flex flex-wrap gap-2 text-muted-foreground">
                    {dc.dataset_selection_criteria.map((crit, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-indigo-600" />
                        {crit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION E: DATA PREPROCESSING */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'data') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('preprocessing')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-600" />
                SECTION E: Data Preprocessing Pipeline
              </CardTitle>
              {expandedSections.preprocessing ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Filtering, cleaning, normalization, tensor tokenization, and quality assurance
            </CardDescription>
          </CardHeader>

          {expandedSections.preprocessing && (
            <CardContent className="pt-0 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-[11px] font-bold text-muted-foreground">
                      <th className="p-3 w-16">Step</th>
                      <th className="p-3">Stage Name</th>
                      <th className="p-3">Technique / Algorithm</th>
                      <th className="p-3">Target Modality</th>
                      <th className="p-3">Purpose & Implementation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dp.map((step, idx) => (
                      <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          #{step.step_number || idx + 1}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          {step.name}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          {step.technique}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-medium border border-border">
                            {step.target_data_type}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground leading-relaxed">
                          {step.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION F: PROPOSED MODELS & ALGORITHMS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'algorithms') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('algorithms')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                SECTION F: Proposed Models, Algorithms & Techniques
              </CardTitle>
              {expandedSections.algorithms ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Algorithmic recommendations, rationale, strengths, trade-offs, and research question mapping
            </CardDescription>
          </CardHeader>

          {expandedSections.algorithms && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ma.map((alg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <Badge
                          variant={alg.status === 'established_in_literature' ? 'outline' : 'indigo'}
                          size="sm"
                        >
                          {alg.status === 'established_in_literature' ? 'Established' : 'Proposed'}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {alg.relevant_research_question.slice(0, 30)}...
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-foreground">
                        {alg.name}
                      </h4>

                      <p className="text-muted-foreground leading-relaxed text-[11px]">
                        {alg.purpose}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                          Selection Rationale:
                        </span>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          {alg.reason_for_selection}
                        </p>
                      </div>

                      {/* Strengths & Limitations tags */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          Strengths:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {alg.strengths.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                          Limitations:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {alg.limitations.map((l, lIdx) => (
                            <span
                              key={lIdx}
                              className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>

                      {alg.trade_offs && (
                        <div className="text-[10px] text-muted-foreground italic pt-1">
                          <strong>Trade-off:</strong> {alg.trade_offs}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION G: SYSTEM DESIGN & IMPLEMENTATION PLAN */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'approach') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('system')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                SECTION G: System Design & Implementation Plan
              </CardTitle>
              {expandedSections.system ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              System architecture components, responsibilities, data flow, and model integration
            </CardDescription>
          </CardHeader>

          {expandedSections.system && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {sd.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold flex items-center justify-center text-[10px]">
                        C{idx + 1}
                      </span>
                      <h4 className="font-bold text-foreground truncate">
                        {comp.name}
                      </h4>
                    </div>

                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {comp.responsibility}
                    </p>

                    <div className="pt-2 border-t border-border/60 text-[10px] space-y-1">
                      <div>
                        <span className="text-muted-foreground font-semibold">In: </span>
                        <code className="text-foreground">{comp.inputs.join(', ')}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Out: </span>
                        <code className="text-foreground">{comp.outputs.join(', ')}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Flow & Pipeline */}
              <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    System Processing Pipeline Sequence
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {sd.processing_pipeline.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-3 py-1 rounded-md bg-card border border-border font-medium text-foreground text-[11px]">
                          {step}
                        </span>
                        {idx < sd.processing_pipeline.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {sd.model_integration && (
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                      Model Integration Topology
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {sd.model_integration}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION H: EXPERIMENTAL SETUP */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'algorithms') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('setup')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                SECTION H: Experimental Setup & Protocol
              </CardTitle>
              {expandedSections.setup ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Controlled experimental design, splits, validation protocol, and hardware/software specs
            </CardDescription>
          </CardHeader>

          {expandedSections.setup && (
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Experimental Design Protocol
                </span>
                <p className="text-foreground leading-relaxed">
                  {es.design}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Training & Testing Strategy
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {es.training_and_testing_strategy || 'K-fold stratified cross-validation protocol.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Validation Strategy
                  </span>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    {es.validation_strategy.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hardware / Software specs */}
              {es.hardware_software_requirements && es.hardware_software_requirements.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="font-semibold text-muted-foreground">Compute & Environments:</span>
                  {es.hardware_software_requirements.map((req, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded bg-secondary text-foreground border border-border font-mono text-[10px]"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION I: EVALUATION METRICS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'evaluation') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('metrics')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                SECTION I: Evaluation Metrics
              </CardTitle>
              {expandedSections.metrics ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Quantitative benchmark metrics, categorizations, and mathematical justifications
            </CardDescription>
          </CardHeader>

          {expandedSections.metrics && (
            <CardContent className="pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {em.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-card space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">
                          {metric.name}
                        </span>
                        <Badge variant="indigo" size="sm">
                          {metric.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {metric.purpose}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-[10px] space-y-1">
                      <span className="font-semibold text-muted-foreground block">
                        Justification:
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {metric.justification}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION J: BASELINES & COMPARISON STRATEGY */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'algorithms') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('comparison')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                SECTION J: Baselines & Comparison Strategy
              </CardTitle>
              {expandedSections.comparison ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              State-of-the-art benchmarks identified from surveyed literature and controlled comparison criteria
            </CardDescription>
          </CardHeader>

          {expandedSections.comparison && (
            <CardContent className="space-y-3 pt-0 text-xs">
              {cs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm" className="font-mono">
                        Baseline #{idx + 1}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">
                        {item.baseline_method}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.metrics.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Comparison Purpose
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.comparison_purpose}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Evaluation Conditions & Fairness
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.evaluation_conditions} • {item.fairness_and_reproducibility}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION K: EXPECTED OUTCOMES */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'evaluation') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('outcomes')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                SECTION K: Expected Outcomes (Hypothesized)
              </CardTitle>
              {expandedSections.outcomes ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Hypothesized outcomes designed for empirical testing (clearly labeled as unvalidated hypotheses)
            </CardDescription>
          </CardHeader>

          {expandedSections.outcomes && (
            <CardContent className="space-y-3 pt-0 text-xs">
              {eo.map((outcome, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold font-mono text-[10px]">
                      {outcome.confidence_level || 'Hypothesized Outcome'} #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground italic">
                      Awaiting Experimental Validation
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {outcome.hypothesis_or_outcome}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <strong className="text-muted-foreground font-semibold">Supporting Rationale: </strong>
                      <span className="text-muted-foreground">{outcome.supporting_rationale}</span>
                    </div>
                    <div>
                      <strong className="text-muted-foreground font-semibold">Validation Criterion: </strong>
                      <span className="text-muted-foreground">{outcome.validation_criterion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION L: LIMITATIONS & RISKS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'execution') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('risks')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                SECTION L: Limitations, Failure Modes & Risks
              </CardTitle>
              {expandedSections.risks ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Data constraints, computational bottlenecks, validity threats, and proactive mitigations
            </CardDescription>
          </CardHeader>

          {expandedSections.risks && (
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lr.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="warning" size="sm">
                        {risk.category} Risk
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">Risk #{idx + 1}</span>
                    </div>

                    <p className="text-foreground font-medium leading-relaxed">
                      {risk.risk_description}
                    </p>

                    <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/40">
                      <strong className="text-emerald-700 dark:text-emerald-300 font-semibold block mb-0.5">
                        Proactive Mitigation Strategy:
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">
                        {risk.mitigation_strategy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION M: REPRODUCIBILITY & ETHICAL CONSIDERATIONS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'execution') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('ethics')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                SECTION M: Reproducibility & Ethical Safeguards
              </CardTitle>
              {expandedSections.ethics ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Version control, seed determinism, dataset provenance, licensing, and responsible AI auditing
            </CardDescription>
          </CardHeader>

          {expandedSections.ethics && (
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Experimental Settings Documentation
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.experimental_settings_documentation}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Version Control & Code Artefacts
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.version_control}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Dataset Provenance & Lineage
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.dataset_provenance}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Data Privacy & Ethics Compliance
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.data_privacy_and_ethics}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Licensing & Permissions
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.licensing_and_permissions}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Responsible AI & Bias Auditing
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {re.responsible_ai}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION N: STEP-BY-STEP EXECUTION PLAN */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'execution') && (
        <Card className="border-border">
          <CardHeader
            className="cursor-pointer select-none pb-3"
            onClick={() => toggleSection('execution')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                SECTION N: Step-by-Step Execution Plan
              </CardTitle>
              {expandedSections.execution ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            <CardDescription className="text-xs">
              Sequential research activities, required inputs, deliverables, dependencies, and rough planning estimates
            </CardDescription>
          </CardHeader>

          {expandedSections.execution && (
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="space-y-3">
                {ep.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card space-y-2 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
                          {step.step_number || idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">
                          {step.activity}
                        </h4>
                      </div>
                      <Badge variant="outline" size="sm" className="font-mono">
                        Effort: {step.estimated_effort}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground leading-relaxed pt-1">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                      <div className="p-2 rounded bg-secondary/50">
                        <strong className="text-muted-foreground font-semibold block text-[10px] uppercase">
                          Required Inputs:
                        </strong>
                        <span className="text-foreground">{step.required_inputs.join(', ') || 'Initial environment'}</span>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <strong className="text-muted-foreground font-semibold block text-[10px] uppercase">
                          Expected Deliverable:
                        </strong>
                        <span className="text-foreground font-medium">{step.expected_deliverable}</span>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <strong className="text-muted-foreground font-semibold block text-[10px] uppercase">
                          Dependencies:
                        </strong>
                        <span className="text-foreground">{step.dependencies.join(', ') || 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-muted-foreground italic text-center pt-2">
                * Note: Effort estimates are approximate scientific planning estimates, not guaranteed timelines.
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Assumptions & Open Questions Footer Box */}
      {methodology.assumptions_and_open_questions && methodology.assumptions_and_open_questions.length > 0 && (
        <Card className="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/10 dark:bg-indigo-950/10">
          <CardContent className="p-4 space-y-2 text-xs">
            <span className="font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              Assumptions & Open Questions Requiring Empirical Confirmation
            </span>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              {methodology.assumptions_and_open_questions.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
