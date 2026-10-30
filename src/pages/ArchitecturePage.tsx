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
  Info,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Workflow,
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

  const projectId = id || currentProject?.id || '';

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
              Architecture
            </h1>
            <Badge variant="indigo" size="md">Module 9</Badge>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <Network className="w-5 h-5 animate-neon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              Architecture
            </h1>
            <Badge variant="indigo" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              Module 9
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono text-slate-300 border-slate-700">
              {architecture.architecture_type}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-2 font-heading">
            {architecture.architecture_title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-4xl leading-relaxed">
            {architecture.architecture_summary}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="text-xs gap-2 h-9 font-medium border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Regenerate</span>
          </Button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Upstream Context Alerts */}
      {architecture.missing_upstream_context && architecture.missing_upstream_context.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Contextual Notice: </span>
            <span>
              Generated using available project assets. Some optional upstream modules were not completed:{' '}
              {architecture.missing_upstream_context.join(' ')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Exclusively Architecture & Flow */}
      <div className="flex overflow-x-auto border-b border-[#1b2245] gap-1.5 py-2 scrollbar-none">
        {[
          { id: 'diagram', label: 'Architecture Flow Diagram', icon: Network },
          { id: 'dataflow', label: `Pipeline Flow (${architecture.data_flow.length} Stages)`, icon: Workflow },
          { id: 'components', label: `Architecture Components (${architecture.components.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/40 via-indigo-600/40 to-cyan-500/30 border border-cyan-400/60 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.35)] font-semibold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent font-medium'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="space-y-4">
          <Card className="neon-card-project rounded-2xl overflow-hidden relative cyber-scanline">
            <CardHeader className="pb-3 border-b border-cyan-500/20 bg-[#0c102a]/70">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-heading text-cyan-100 flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span>Visual System Architecture</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Rendered Mermaid flowchart illustrating the multi-stage research solution and components
                  </CardDescription>
                </div>
                <Badge variant="indigo" size="sm" className="font-mono font-semibold border-cyan-400/40 text-cyan-300">
                  {architecture.architecture_diagram.diagram_type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <MermaidViewer
                source={architecture.architecture_diagram.source}
                title="System Architecture Diagram"
              />
              <p className="text-xs text-slate-400 mt-3 italic leading-relaxed font-mono">
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
              <Card key={comp.component_id} className="card-premium card-glow-indigo rounded-2xl hover:-translate-y-1 transition-all duration-300">
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
    </div>
  );
};
