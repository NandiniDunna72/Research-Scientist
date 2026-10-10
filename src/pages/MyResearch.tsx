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
import { Progress } from '../components/ui/Progress';
import { Modal } from '../components/ui/Modal';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              My Research Projects
            </h1>
            <Badge variant="indigo" size="md">
              {projects.length} Portfolios
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your ongoing and archived AI-assisted research workspaces
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/research/new')}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research</span>
          </Button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, topic..."
            icon={<Search className="w-3.5 h-3.5" />}
            className="text-xs h-8.5 w-full sm:w-64"
          />

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs h-8.5 rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
          >
            <option value="all">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'table' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => handleOpen(project)}
            >
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.title}
                      </h3>
                      <Badge variant="indigo" size="sm">
                        {project.domain}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.topic}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Stage: <strong className="text-foreground capitalize">{project.currentStage}</strong>
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {project.progress}% Complete
                    </span>
                  </div>
                  <Progress value={project.progress} color="primary" />
                </div>

                {/* Meta details & action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Files className="w-3 h-3 text-muted-foreground" />
                      {project.papersCount} papers
                    </span>
                    <span className="text-[11px] font-mono">
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
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-secondary rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleOpen(project)}
                      className="h-7 text-xs px-2.5 ml-1 gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5 min-w-[220px]">Project Title</th>
                  <th className="p-3.5 min-w-[140px]">Domain</th>
                  <th className="p-3.5 text-center w-24">Papers</th>
                  <th className="p-3.5 min-w-[140px]">Current Stage</th>
                  <th className="p-3.5 min-w-[120px]">Progress</th>
                  <th className="p-3.5 min-w-[120px]">Last Updated</th>
                  <th className="p-3.5 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">
                      <div 
                        onClick={() => handleOpen(project)}
                        className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {project.title}
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      <Badge variant="indigo" size="sm">{project.domain}</Badge>
                    </td>
                    <td className="p-3.5 text-center font-mono text-muted-foreground">
                      {project.papersCount}
                    </td>
                    <td className="p-3.5 capitalize font-medium text-foreground">
                      {project.currentStage}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} color="primary" />
                        <span className="font-mono text-[11px] text-muted-foreground">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground text-[11px]">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpen(project)}
                          className="h-7 text-xs px-2"
                        >
                          Open
                        </Button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 rounded-md"
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
