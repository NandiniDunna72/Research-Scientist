import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { ResearchProject } from '../types';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Edit3, 
  ArrowRight, 
  Files, 
  LayoutGrid, 
  List,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { AmbulanceRouteVisual } from '../components/research/AmbulanceRouteVisual';
import { PlantDiseaseVisual } from '../components/research/PlantDiseaseVisual';
import { HolographicAICore } from '../components/research/HolographicAICore';

export const MyResearch: React.FC = () => {
  const { 
    projects, 
    setCurrentProjectId, 
    deleteProject, 
    updateProject, 
    createProject, 
    addToast 
  } = useResearch();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = useState<ResearchProject | null>(null);

  // Rename modal state
  const [projectToRename, setProjectToRename] = useState<ResearchProject | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const domains = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.domain)));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase()) ||
        p.domain.toLowerCase().includes(search.toLowerCase());

      const matchDomain = selectedDomain === 'all' || p.domain === selectedDomain;

      return matchSearch && matchDomain;
    });
  }, [projects, search, selectedDomain]);

  const handleOpen = (project: ResearchProject) => {
    setCurrentProjectId(project.id);
    navigate(`/research/${project.id}/${project.currentStage}`);
  };

  const handleDuplicate = async (project: ResearchProject) => {
    await createProject({
      ...project,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    addToast({
      type: 'success',
      title: 'Project Duplicated',
      message: `Created duplicate of "${project.title}".`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };

  const handleSaveRename = async () => {
    if (!projectToRename || !newTitle.trim()) return;
    await updateProject(projectToRename.id, { title: newTitle.trim() });
    setProjectToRename(null);
  };

  const renderProjectVisual = (project: ResearchProject) => {
    const text = (project.title + ' ' + project.topic + ' ' + project.domain).toLowerCase();
    if (text.includes('plant') || text.includes('disease') || text.includes('crop') || text.includes('climate')) {
      return <PlantDiseaseVisual />;
    }
    return <AmbulanceRouteVisual />;
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* Background Telemetry Ghost Lines */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-25 hidden xl:block select-none font-mono text-[9px] text-cyan-400 space-y-0.5 leading-tight text-right">
        <div>Cybersecurity Telemetry</div>
        <div>Timestamp: 0x981A4B</div>
        <div>Security Profile: SECURE_ENCLAVE_v4</div>
        <div>Ingestion Pipeline: READY [OK]</div>
        <div>Corpus Nodes: 128,490 active</div>
      </div>

      {/* Page Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1a2044]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
              My Research Projects
            </h1>
            <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[#121636] border border-indigo-500/40 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {projects.length} {projects.length === 1 ? 'Workspace' : 'Workspaces'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your autonomous AI-assisted research workspaces, paper corpuses, and architectures
          </p>

          {/* Active Process 38% Bar */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Active Process</span>
            <div className="w-40 h-1.5 bg-[#0f1430] rounded-full overflow-hidden border border-cyan-500/20">
              <div className="w-[38%] h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">38%</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {/* New Research Button with glowing neon cyan border */}
          <button
            onClick={() => navigate('/research/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0a0f28] border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_22px_rgba(6,182,212,0.55)] hover:border-cyan-300 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>New Research</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0d24]/90 backdrop-blur-xl border border-[#1a2044] p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, topic..."
              className="w-full text-xs h-9 pl-9 pr-3 rounded-xl bg-[#07091a]/95 border border-[#1e2548] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Domain Dropdown */}
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs h-9 pl-3 pr-8 rounded-xl border border-[#1e2548] bg-[#07091a]/95 text-slate-300 focus:outline-none focus:border-cyan-400 font-medium transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Research Domains</option>
              {domains.map((d) => (
                <option key={d} value={d} className="bg-[#090d24] text-white">{d}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#0c102c] p-1 rounded-xl border border-[#1a2044]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#181f4a] text-cyan-300 shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-[#181f4a] text-cyan-300 shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State or Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Research Projects"
          description={
            search || selectedDomain !== 'all'
              ? 'No projects match your current search or domain filter.'
              : 'You have not created any research projects yet. Begin your first academic investigation to discover papers, extract gaps, and author manuscripts.'
          }
          actionText="+ Start New Research"
          onAction={() => navigate('/research/new')}
          className="my-8"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="neon-card-project rounded-2xl p-5 cursor-pointer group flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
              onClick={() => handleOpen(project)}
            >
              <div className="space-y-3.5">
                {/* Header Row: Title and Domain Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#121636] border border-indigo-500/40 text-indigo-300 shadow-2xs">
                        {project.domain}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {project.topic}
                    </p>
                  </div>
                </div>

                {/* Centerpiece Futuristic Visual HUD Preview */}
                <div className="w-full">
                  {renderProjectVisual(project)}
                </div>

                {/* Meta details & action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1a2044] text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                      <Files className="w-3.5 h-3.5 text-purple-400" />
                      {project.papersCount || 5} papers
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Updated Oct 29, 2026
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setProjectToRename(project);
                        setNewTitle(project.title);
                      }}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#131738] rounded-lg transition-colors cursor-pointer"
                      title="Rename Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(project)}
                      className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-[#131738] rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Glowing Circular Blue Button with Right Arrow */}
                    <div 
                      onClick={() => handleOpen(project)}
                      className="w-8 h-8 rounded-full btn-blue-circle text-white flex items-center justify-center ml-2 cursor-pointer transition-transform hover:scale-110"
                      title="Open Workspace"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#0a0d24]/90 backdrop-blur-xl border border-[#1a2044] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0f1435] border-b border-[#1a2044] text-slate-300 font-semibold">
                  <th className="p-4 min-w-[220px]">Project Title</th>
                  <th className="p-4 min-w-[140px]">Domain</th>
                  <th className="p-4 text-center w-24">Papers</th>
                  <th className="p-4 min-w-[120px]">Last Updated</th>
                  <th className="p-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2044]">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#11173d] transition-colors">
                    <td className="p-4 font-bold text-white font-heading">
                      <div 
                        onClick={() => handleOpen(project)}
                        className="cursor-pointer hover:text-cyan-300 transition-colors"
                      >
                        {project.title}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#121636] border border-indigo-500/40 text-indigo-300">
                        {project.domain}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-purple-300 font-semibold">
                      {project.papersCount || 5}
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      Oct 29, 2026
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpen(project)}
                          className="h-7 text-xs px-2.5 font-medium hover:bg-cyan-500/10 hover:text-cyan-300 text-slate-300"
                        >
                          Open <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Area: Telemetry & 3D Holographic AI Core matching screenshot */}
      <div className="pt-8 border-t border-[#1a2044] flex flex-col md:flex-row items-start justify-between gap-6 relative">
        {/* Left Telemetry: Active Process 100% */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Active Process</span>
            <div className="w-44 h-1.5 bg-[#0f1430] rounded-full overflow-hidden border border-cyan-500/20">
              <div className="w-full h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">100%</span>
          </div>

          <div className="font-mono text-[9px] text-cyan-500/70 space-y-0.5 leading-tight select-none">
            <div>core-filter: 749.6q</div>
            <div>environment: SECURE</div>
            <div>latency: 0.0018ms</div>
            <div>system: OPTIMIZED | [EMBEDDED ROUTE RUNNER]</div>
            <div>bound: 0/1</div>
            <div>neural-engine: nominal</div>
          </div>
        </div>

        {/* Center Telemetry: Cybersecurity 350s */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Cybersecurity</span>
            <div className="w-44 h-1.5 bg-[#0f1430] rounded-full overflow-hidden border border-cyan-500/20">
              <div className="w-3/4 h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">350s</span>
          </div>

          <div className="font-mono text-[9px] text-cyan-500/70 space-y-0.5 leading-tight select-none">
            <div>Deployment: Active</div>
            <div>Cert: valid (SHA-256)</div>
            <div>Endpoint: https://academic-ai.internal/v1/orchestration</div>
            <div>Status: RUNNING | Ingestion buffer: OK</div>
          </div>
        </div>

        {/* Right: Floating 3D Holographic AI Core */}
        <div className="self-end md:self-auto flex justify-end">
          <HolographicAICore />
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {projectToDelete && (
        <Modal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          title="Delete Research Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300">
              <strong>{projectToDelete.title}</strong> will be permanently removed along with all ingested papers, research gaps, and drafts.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a2044]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToDelete(null)}
                className="border-[#1e2548] text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rename Dialog Modal */}
      {projectToRename && (
        <Modal
          isOpen={!!projectToRename}
          onClose={() => setProjectToRename(null)}
          title="Rename Project"
          description="Update the display title for this research workspace"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-white block mb-1">
                Project Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter project title..."
                className="text-xs h-9 bg-[#07091a] border-[#1e2548] text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a2044]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToRename(null)}
                className="border-[#1e2548] text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveRename}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
