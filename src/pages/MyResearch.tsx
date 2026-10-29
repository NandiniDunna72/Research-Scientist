import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearch } from '../context/ResearchContext';
import { ResearchProject } from '../types';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit3, 
  ArrowRight, 
  Clock, 
  Files, 
  AlertCircle, 
  LayoutGrid, 
  List,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../lib/utils';


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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              My Research Projects
            </h1>
            <Badge variant="indigo" size="md" className="font-semibold px-2.5 py-0.5 shadow-glow-xs">
              {projects.length} {projects.length === 1 ? 'Workspace' : 'Workspaces'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your autonomous AI-assisted research workspaces, paper corpuses, and architectures
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/research/new')}
            className="text-xs gap-2 shadow-glow-sm hover:shadow-glow-md transition-all font-semibold px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Research</span>
          </Button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 card-premium p-3 rounded-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, topic..."
            icon={<Search className="w-3.5 h-3.5" />}
            className="text-xs h-9 w-full sm:w-72 bg-background/50 border-border/70 focus:border-indigo-500 rounded-xl"
          />

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs h-9 rounded-xl border border-border/70 bg-background/50 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium transition-all"
          >
            <option value="all">All Research Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'grid' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'table' ? 'bg-card text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card-premium card-glow-indigo rounded-2xl p-5 cursor-pointer group flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              onClick={() => handleOpen(project)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.title}
                      </h3>
                      <Badge variant="indigo" size="sm" className="font-semibold shadow-2xs">
                        {project.domain}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.topic}
                    </p>
                  </div>
                </div>

                {/* Meta details & action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
                      <Files className="w-3.5 h-3.5 text-indigo-500" />
                      {project.papersCount} papers
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Updated {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setProjectToRename(project);
                        setNewTitle(project.title);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      title="Rename Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(project)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      title="Duplicate Project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all ml-1">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card-premium rounded-2xl overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/70 border-b border-border/80 text-muted-foreground font-semibold">
                  <th className="p-4 min-w-[220px]">Project Title</th>
                  <th className="p-4 min-w-[140px]">Domain</th>
                  <th className="p-4 text-center w-24">Papers</th>
                  <th className="p-4 min-w-[120px]">Last Updated</th>
                  <th className="p-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border/50">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="p-4 font-bold text-foreground font-heading">
                      <div 
                        onClick={() => handleOpen(project)}
                        className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {project.title}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <Badge variant="indigo" size="sm" className="font-semibold">{project.domain}</Badge>
                    </td>
                    <td className="p-4 text-center font-mono text-muted-foreground font-semibold">
                      {project.papersCount}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground text-[11px]">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpen(project)}
                          className="h-7 text-xs px-2.5 font-medium hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          Open <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
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
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300">
              <strong>{projectToDelete.title}</strong> will be permanently removed along with all ingested papers, research gaps, and drafts.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToDelete(null)}
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
              <label className="font-semibold text-foreground block mb-1">
                Project Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter project title..."
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToRename(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveRename}
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
