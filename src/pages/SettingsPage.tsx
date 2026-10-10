import React, { useState, useEffect } from 'react';
import { useResearch } from '../context/ResearchContext';
import { UserSettings, PaperSource } from '../types';
import { 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Laptop, 
  Cpu, 
  BookOpen, 
  Download, 
  Save, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, theme, setTheme } = useResearch();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const availableSources: PaperSource[] = [
    'arXiv',
    'PubMed',
    'IEEE Xplore',
    'Nature',
    'ScienceDirect',
    'ACM Digital Library',
    'Springer',
    'NeurIPS / ICML',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(formData);
    setIsSaving(false);
  };

  const toggleSource = (source: PaperSource) => {
    setFormData((prev) => {
      const exists = prev.research.preferredSources.includes(source);
      return {
        ...prev,
        research: {
          ...prev.research,
          preferredSources: exists
            ? prev.research.preferredSources.filter((s) => s !== source)
            : [...prev.research.preferredSources, source],
        },
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Platform Settings
            </h1>
            <Badge variant="indigo" size="md">
              Preferences & Configuration
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure researcher identity, model parameters, ingestion defaults, and export formats
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Researcher Profile
            </CardTitle>
            <CardDescription>Academic metadata attached to generated documents and citations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1">Full Name</label>
                <Input
                  value={formData.profile.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, name: e.target.value },
                    })
                  }
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Academic Email</label>
                <Input
                  value={formData.profile.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, email: e.target.value },
                    })
                  }
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Institution / Department</label>
                <Input
                  value={formData.profile.institution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, institution: e.target.value },
                    })
                  }
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Academic Title / Role</label>
                <Input
                  value={formData.profile.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, role: e.target.value },
                    })
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sun className="w-4 h-4 text-indigo-600" />
              Appearance & Theme
            </CardTitle>
            <CardDescription>Tailor color contrast and theme palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Light Mode', icon: Sun },
                { key: 'dark', label: 'Dark Mode', icon: Moon },
                { key: 'system', label: 'System Default', icon: Laptop },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = theme === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setTheme(m.key as any);
                      setFormData({
                        ...formData,
                        appearance: { ...formData.appearance, theme: m.key as any },
                      });
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Intelligence Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              AI Intelligence Engine
            </CardTitle>
            <CardDescription>Foundation model configuration for literature review, synthesis, and rationale generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Default Reasoning Model
                </label>
                <select
                  value={formData.ai.model}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, model: e.target.value as any },
                    })
                  }
                  className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended for Academic Synthesis)</option>
                  <option value="gpt-4o">GPT-4o (Multimodal & Vision Tasks)</option>
                  <option value="gemini-1-5-pro">Gemini 1.5 Pro (Long Context Literature)</option>
                  <option value="deepseek-r1">DeepSeek-R1 (Mathematical & Algorithmic Rigor)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Synthesis Detail Level
                </label>
                <select
                  value={formData.ai.summaryLength}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, summaryLength: e.target.value as any },
                    })
                  }
                  className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="concise">Concise (Executive Summaries & Bullets)</option>
                  <option value="balanced">Balanced (Standard Academic Sections)</option>
                  <option value="comprehensive">Comprehensive (In-Depth Technical Critique)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-foreground">Sampling Temperature</label>
                <span className="font-mono text-muted-foreground">{formData.ai.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.ai.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ai: { ...formData.ai, temperature: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0.0 (Deterministic / Strict Factual)</span>
                <span>1.0 (Creative Exploration)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Defaults & Repositories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Research Defaults & Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                Default Paper Ingestion Batch Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        research: { ...formData.research, defaultPaperCount: count },
                      })
                    }
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      formData.research.defaultPaperCount === count
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-card text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {count} Papers
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-2">
                Preferred Academic Repositories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableSources.map((source) => {
                  const isChecked = formData.research.preferredSources.includes(source);
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => toggleSource(source)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <span>{source}</span>
                      {isChecked && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              Export & Dissemination Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Default Document Export Format
                </label>
                <select
                  value={formData.export.defaultFormat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      export: { ...formData.export, defaultFormat: e.target.value as any },
                    })
                  }
                  className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Microsoft Word (.docx)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="latex">LaTeX Archive (.tex)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Citation Reference Style
                </label>
                <select
                  value={formData.export.citationStyle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      export: { ...formData.export, citationStyle: e.target.value as any },
                    })
                  }
                  className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  <option value="IEEE">IEEE Citation Style</option>
                  <option value="ACM">ACM Reference Format</option>
                  <option value="APA">APA 7th Edition</option>
                  <option value="Harvard">Harvard Referencing</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            className="gap-2 px-6 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Preferences...' : 'Save All Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
