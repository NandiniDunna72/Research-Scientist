import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { architectureService } from '../services/architectureService';
import { ArchitectureResult } from '../types';
import {
  Network,
  Sparkles,
  Download,
  RefreshCw,
  Layers,
  Database,
  ShieldCheck,
  Server,
  Compass,
  GitBranch,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Cpu,
  ArrowRight,
  HardDrive,
  Workflow,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { MermaidViewer } from '../components/architecture/MermaidViewer';

export const ArchitecturePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, addToast } = useResearch();

  const projectId = id || currentProject?.id || 'proj-healthcare-ai';

  // State
  const [architecture, setArchitecture] = useState<ArchitectureResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('diagram');

  // Load existing saved architecture on mount or project change
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const saved = await architectureService.getLatestArchitecture(projectId);
        if (isMounted) {
          setArchitecture(saved);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Failed to load saved architecture:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Handle Generate Architecture
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await architectureService.generateArchitecture(projectId);
      setArchitecture(result);
      addToast({
        type: 'success',
        title: 'Architecture Ready',
        message: 'System architecture generated successfully.',
      });
    } catch (err: any) {
      console.error('Architecture generation failure:', err);
      setError(err?.message || 'System architecture generation failed. Please try again.');
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: err?.message || 'Failed to generate system architecture.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Regenerate Architecture
  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await architectureService.regenerateArchitecture(projectId);
      setArchitecture(result);
      addToast({
        type: 'success',
        title: 'Architecture Regenerated',
        message: 'System architecture generated successfully.',
      });
    } catch (err: any) {
      console.error('Regeneration error:', err);
      setError(err?.message || 'Failed to regenerate system architecture.');
      addToast({
        type: 'error',
        title: 'Regeneration Failed',
        message: err?.message || 'Failed to regenerate architecture.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Export JSON specification
  const handleExportJSON = () => {
    if (!architecture) return;
    const blob = new Blob([JSON.stringify(architecture, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_architecture_${projectId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'info',
      title: 'Export Complete',
      message: 'System architecture specification exported as JSON.',
    });
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge variant="success" size="sm">Implemented</Badge>;
      case 'proposed':
        return <Badge variant="indigo" size="sm">Proposed</Badge>;
      case 'optional':
        return <Badge variant="outline" size="sm">Optional</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  // Loading State
  if (isLoading || isGenerating) {
    return (
      <div className="py-12">
        <LoadingState
          title="Generating system architecture..."
          subtitle="Formulating modular components, data flow pipelines, technology stacks, and visual diagrams..."
          steps={[
            'Retrieving research methodology, research questions, and benchmark papers',
            'Structuring component boundaries and separation of concerns',
            'Constructing data flow pipelines and state persistence models',
            'Compiling valid Mermaid architecture flowchart and deployment specifications',
          ]}
        />
      </div>
    );
  }

  // Empty State
  if (!architecture) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              System Architecture Generation
            </h1>
            <Badge variant="indigo" size="md">Module 8</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transform research questions and methodologies into concrete, technically feasible system architectures.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Architecture Generation Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <EmptyState
          icon={Network}
          title="No System Architecture Generated Yet"
          description="Synthesize an end-to-end architecture diagram, component definitions, data flows, and hardware deployment plans grounded in your research methodology."
          actionText="Generate System Architecture"
          onAction={handleGenerate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {architecture.architecture_title}
            </h1>
            <Badge variant="indigo" size="md">
              {architecture.architecture_type}
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono">
              Module 8
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed">
            {architecture.architecture_summary}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5 h-9"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Upstream Context Alerts */}
      {architecture.missing_upstream_context && architecture.missing_upstream_context.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Contextual Notice: </span>
            <span>
              Generated using available project assets. Some optional upstream modules were not completed:{' '}
              {architecture.missing_upstream_context.join(' ')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-border gap-1 py-1 scrollbar-none">
        {[
          { id: 'diagram', label: 'Architecture Diagram', icon: Network },
          { id: 'components', label: `Components (${architecture.components.length})`, icon: Layers },
          { id: 'dataflow', label: `Data Flow (${architecture.data_flow.length})`, icon: Workflow },
          { id: 'techstack', label: 'Technology Stack', icon: Cpu },
          { id: 'storage', label: 'Data Storage', icon: Database },
          { id: 'deployment', label: 'Deployment & Security', icon: Server },
          { id: 'justification', label: 'Justification & Trade-offs', icon: Compass },
          { id: 'alternatives', label: 'Alternatives', icon: GitBranch },
          { id: 'roadmap', label: 'Implementation Plan', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Visual System Architecture
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rendered Mermaid flowchart illustrating the multi-stage research solution and components
                  </CardDescription>
                </div>
                <Badge variant="indigo" size="sm">
                  {architecture.architecture_diagram.diagram_type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MermaidViewer
                source={architecture.architecture_diagram.source}
                title="System Architecture Diagram"
              />
              <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">
                {architecture.architecture_diagram.description}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: COMPONENTS BREAKDOWN */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecture.components.map((comp) => (
              <Card key={comp.component_id} className="border border-border shadow-xs hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {comp.component_id}
                        </span>
                        {getStatusBadge(comp.implementation_status)}
                      </div>
                      <CardTitle className="text-sm font-bold mt-1 text-foreground">
                        {comp.component_name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      {comp.component_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Purpose: </span>
                    <span className="text-muted-foreground">{comp.purpose}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground block mb-1">Responsibilities:</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {comp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                    <div>
                      <span className="font-semibold text-foreground block text-[11px] mb-0.5">Inputs:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.inputs.map((inp, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                            {inp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block text-[11px] mb-0.5">Outputs:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.outputs.map((out, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-primary/10 rounded text-[10px] text-primary">
                            {out}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-muted-foreground">Tech:</span>
                      {comp.technologies.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                    {comp.dependencies.length > 0 && (
                      <div className="text-muted-foreground">
                        <span>Depends on: </span>
                        <span className="font-mono text-[10px]">{comp.dependencies.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATA FLOW */}
      {activeTab === 'dataflow' && (
        <div className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">End-to-End System Data Flow</CardTitle>
              <CardDescription className="text-xs">
                Sequential progression of information, transformations, and artifacts across system boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                {architecture.data_flow.map((step) => (
                  <div key={step.step_number} className="relative group">
                    <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-xs">
                      {step.step_number}
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                          <span className="font-semibold">{step.source_component}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold text-primary">{step.destination_component}</span>
                        </div>
                        {step.phase && (
                          <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                            {step.phase}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-border/50">
                        <div>
                          <span className="font-semibold text-muted-foreground block text-[11px]">Data Transferred:</span>
                          <p className="text-foreground mt-0.5">{step.data_transferred}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block text-[11px]">Processing Executed:</span>
                          <p className="text-foreground mt-0.5">{step.processing_performed}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block text-[11px]">Output Produced:</span>
                          <p className="text-primary font-medium mt-0.5">{step.output_produced}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: TECHNOLOGY STACK */}
      {activeTab === 'techstack' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {architecture.technology_stack.map((tech, idx) => (
              <Card key={idx} className="border border-border shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {tech.category}
                    </span>
                    <Badge variant={tech.status === 'current' ? 'success' : 'outline'} size="sm" className="capitalize text-[10px]">
                      {tech.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground mt-1">
                    {tech.technology}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">Role: </span>
                    <span className="text-muted-foreground">{tech.role}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Justification: </span>
                    <span className="text-muted-foreground">{tech.reason_for_selection}</span>
                  </div>
                  {tech.alternatives && tech.alternatives.length > 0 && (
                    <div className="pt-2 border-t border-border/50 text-[11px]">
                      <span className="text-muted-foreground font-semibold">Alternatives: </span>
                      <span className="font-mono text-muted-foreground">{tech.alternatives.join(', ')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATA STORAGE */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Data Storage Paradigm</CardTitle>
                  <CardDescription className="text-xs">
                    {architecture.data_storage_design.storage_paradigm}
                  </CardDescription>
                </div>
                <Database className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {architecture.data_storage_design.description}
              </p>

              {/* Entities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {architecture.data_storage_design.entities.map((entity, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border bg-card/70 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-foreground">{entity.entity_name}</span>
                    </div>
                    <p className="text-muted-foreground">{entity.purpose}</p>

                    <div>
                      <span className="font-semibold text-foreground block text-[11px] mb-1">Key Fields:</span>
                      <div className="flex flex-wrap gap-1">
                        {entity.fields.map((f, fIdx) => (
                          <span key={fIdx} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {entity.relationships.length > 0 && (
                      <div className="pt-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold">Relations: </span>
                        <span>{entity.relationships.join(' | ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Optional ER Diagram */}
              {architecture.data_storage_design.er_diagram && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Entity-Relationship Diagram</h4>
                  <MermaidViewer
                    source={architecture.data_storage_design.er_diagram.source}
                    title="ER Diagram"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: DEPLOYMENT & RELIABILITY */}
      {activeTab === 'deployment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deployment Architecture */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span>Deployment Architecture</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {architecture.deployment_architecture.deployment_model}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Minimum Viable Hardware:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {architecture.deployment_architecture.minimum_viable_deployment}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Production Enhancements:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {architecture.deployment_architecture.production_enhancements}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-foreground block mb-1">Hosting Components:</span>
                  <div className="flex flex-wrap gap-1">
                    {architecture.deployment_architecture.hosting_components.map((h, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-[11px]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-foreground block mb-1">Environment Variables:</span>
                  <div className="flex flex-wrap gap-1">
                    {architecture.deployment_architecture.environment_configuration.map((e, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-secondary font-mono text-[10px]">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Scaling Considerations:</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {architecture.deployment_architecture.scaling_considerations}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security & Reliability */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Security & Reliability Safeguards</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Mitigation strategies for data privacy, out-of-distribution drift, and access governance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {architecture.security_and_reliability.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-1 text-xs">
                    <span className="font-bold text-foreground block">{sec.dimension}</span>
                    <p className="text-muted-foreground">{sec.description}</p>
                    <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                      <span className="font-semibold">Mitigation: </span>
                      <span>{sec.mitigation_strategy}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 7: JUSTIFICATION & TRADE-OFFS */}
      {activeTab === 'justification' && (
        <div className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Architectural Justification & Trade-offs</CardTitle>
              <CardDescription className="text-xs">
                Scientific and engineering rationales connecting architecture choices to research gaps and questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {architecture.architecture_justification.map((just, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-sm text-foreground">{just.architectural_choice}</span>
                    <div className="flex items-center gap-1">
                      {just.related_question_ids.map((qid, qIdx) => (
                        <Badge key={qIdx} variant="indigo" size="sm">
                          Q{qid}
                        </Badge>
                      ))}
                      {just.related_gap_ids.map((gid, gIdx) => (
                        <Badge key={gIdx} variant="warning" size="sm">
                          Gap {gid}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[11px]">Objective / Gap Addressed:</span>
                    <p className="text-foreground">{just.objective_or_gap}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[11px]">Justification:</span>
                    <p className="text-muted-foreground leading-relaxed">{just.justification}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px]">
                    <span className="font-semibold">Trade-offs & Constraints: </span>
                    <span>{just.trade_offs}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 8: ALTERNATIVE ARCHITECTURES */}
      {activeTab === 'alternatives' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecture.alternative_architectures.map((alt, idx) => (
              <Card key={idx} className="border border-border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {alt.title}
                    </CardTitle>
                    <Badge variant="outline" size="sm">
                      Complexity: {alt.complexity}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {alt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Advantages:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                      {alt.advantages.map((adv, aIdx) => (
                        <li key={aIdx}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">Disadvantages:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                      {alt.disadvantages.map((dis, dIdx) => (
                        <li key={dIdx}>{dis}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground block mb-0.5">Suitable Conditions:</span>
                    <p className="text-muted-foreground">{alt.suitable_conditions}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                    <span className="font-semibold">Why Rejected: </span>
                    <span>{alt.rejection_reason}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: IMPLEMENTATION ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Practical Implementation Roadmap</CardTitle>
              <CardDescription className="text-xs">
                Sequential development stages for building the proposed research architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                {architecture.implementation_plan.map((stage) => (
                  <div key={stage.stage_number} className="relative group">
                    <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {stage.stage_number}
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-foreground">
                          {stage.stage_name}
                        </h4>
                        {stage.dependencies && stage.dependencies.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">
                            <span>Prerequisites: </span>
                            <span className="font-medium text-foreground">{stage.dependencies.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1">
                        <span className="font-semibold text-muted-foreground block text-[11px] mb-1">Engineering Tasks:</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-foreground pl-1">
                          {stage.tasks.map((task, tIdx) => (
                            <li key={tIdx}>{task}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-border/50">
                        <div>
                          <span className="font-semibold text-muted-foreground block text-[11px]">Measurable Deliverable:</span>
                          <p className="text-primary font-medium mt-0.5">{stage.deliverable}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block text-[11px]">Verification Method:</span>
                          <p className="text-foreground mt-0.5">{stage.verification_method}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Limitations and Assumptions */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Assumptions & System Boundaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {architecture.limitations_and_assumptions.map((lim, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
                    <span className="font-bold text-foreground block">{lim.category}</span>
                    <p className="text-muted-foreground leading-relaxed">{lim.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
