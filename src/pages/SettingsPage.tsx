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
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  Square,
  Mic,
  Radio
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { voiceService, VOICE_ENGINES, VOICE_PERSONAS } from '../services/voiceService';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, theme, setTheme } = useResearch();
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingVoiceTest, setIsPlayingVoiceTest] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        voice: settings.voice || {
          enabled: true,
          engine: 'gemini-live-audio',
          voiceId: 'aoede',
          speechRate: 1.0,
          pitch: 1.0,
          autoReadResponses: false,
        },
      });
    }
  }, [settings]);

  useEffect(() => {
    const unsub = voiceService.subscribeSpeaking(setIsPlayingVoiceTest);
    return () => unsub();
  }, []);

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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2245]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a0d26] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <Settings className="w-5 h-5 animate-neon-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading gradient-heading">
              Platform Configuration Studio
            </h1>
            <Badge variant="indigo" size="md" className="border-cyan-400/40 text-cyan-300 font-mono">
              Preferences & Systems
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Configure researcher identity, model parameters, ingestion defaults, and neural voice engines.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving Preferences...' : 'Save Preferences'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Researcher Identity Profile</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Academic metadata attached to generated documents and citations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">Full Name</label>
                <Input
                  value={formData.profile.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, name: e.target.value },
                    })
                  }
                  className="text-xs h-9 bg-[#060919] border-[#1b2245] focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Academic Email</label>
                <Input
                  value={formData.profile.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, email: e.target.value },
                    })
                  }
                  className="text-xs h-9 bg-[#060919] border-[#1b2245] focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Institution / Department</label>
                <Input
                  value={formData.profile.institution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, institution: e.target.value },
                    })
                  }
                  className="text-xs h-9 bg-[#060919] border-[#1b2245] focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">Academic Title / Role</label>
                <Input
                  value={formData.profile.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, role: e.target.value },
                    })
                  }
                  className="text-xs h-9 bg-[#060919] border-[#1b2245] focus:border-cyan-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span>Appearance & HUD Theme</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Tailor color contrast and sci-fi aesthetic palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Light Mode', icon: Sun },
                { key: 'dark', label: 'Cyber Dark Mode', icon: Moon },
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
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-cyan-400/80 bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-cyan-500/25 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.35)] font-semibold'
                        : 'border-[#1b2245] bg-[#070a20] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Intelligence Settings */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Intelligence Engine</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Foundation model configuration for literature review, synthesis, and rationale generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
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
                  className="w-full text-xs rounded-xl border border-[#1b2245] bg-[#060919] px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended for Academic Synthesis)</option>
                  <option value="gpt-4o">GPT-4o (Multimodal & Vision Tasks)</option>
                  <option value="gemini-1-5-pro">Gemini 1.5 Pro (Long Context Literature)</option>
                  <option value="deepseek-r1">DeepSeek-R1 (Mathematical & Algorithmic Rigor)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
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
                  className="w-full text-xs rounded-xl border border-[#1b2245] bg-[#060919] px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="concise">Concise (Executive Summaries & Bullets)</option>
                  <option value="balanced">Balanced (Standard Academic Sections)</option>
                  <option value="comprehensive">Comprehensive (In-Depth Technical Critique)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-200">Sampling Temperature</label>
                <span className="font-mono text-cyan-400 font-bold">{formData.ai.temperature}</span>
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
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 (Deterministic / Strict Factual)</span>
                <span>1.0 (Creative Exploration)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice & Speech Synthesis Models */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Voice & Speech Synthesis Models</span>
              </CardTitle>
              <Badge variant="indigo" size="sm" className="font-semibold border-cyan-400/40 text-cyan-300 font-mono">
                Multimodal Audio Engine
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Select high-fidelity neural voice models for academic paper narration, oral slide rehearsal, and AI assistant speech.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 text-xs">
            {/* Engine Selection */}
            <div>
              <label className="font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-500" />
                <span>Speech Synthesis Foundation Engine</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {VOICE_ENGINES.map((eng) => {
                  const isSelected = (formData.voice?.engine || 'gemini-live-audio') === eng.id;
                  return (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => {
                        const personas = voiceService.getPersonasForEngine(eng.id);
                        setFormData({
                          ...formData,
                          voice: {
                            ...formData.voice,
                            engine: eng.id,
                            voiceId: personas[0]?.id || 'aoede',
                          },
                        });
                      }}
                      className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-600/30'
                          : 'border-border bg-card hover:bg-secondary/70 text-muted-foreground'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`font-bold text-xs ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-foreground'}`}>
                            {eng.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary font-mono font-medium text-foreground">
                            {eng.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {eng.description}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{eng.latency}</span>
                        <span>{eng.provider}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Selection & Audio Test Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Voice Persona / Speaker Timbre
                </label>
                <select
                  value={formData.voice?.voiceId || 'aoede'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      voice: { ...formData.voice, voiceId: e.target.value },
                    })
                  }
                  className="w-full text-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1.5 focus:ring-indigo-600 font-medium"
                >
                  {voiceService.getPersonasForEngine(formData.voice?.engine || 'gemini-live-audio').map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name} ({persona.gender}) — {persona.tone}
                    </option>
                  ))}
                </select>

                {/* Persona preview summary */}
                {(() => {
                  const persona = voiceService.getPersonaById(formData.voice?.voiceId || 'aoede');
                  if (!persona) return null;
                  return (
                    <div className="mt-2 p-2.5 rounded-lg bg-secondary/50 border border-border/60 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-medium text-foreground">
                        <span>Character: {persona.tone}</span>
                        <Badge variant="secondary" size="sm">{persona.gender}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {persona.description}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Speech Controls & Live Test */}
              <div className="space-y-3.5 bg-secondary/30 p-3.5 rounded-xl border border-border/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Voice Model Testing & Audition</span>
                  <Button
                    type="button"
                    variant={isPlayingVoiceTest ? "subtle" : "primary"}
                    size="sm"
                    onClick={() => {
                      if (isPlayingVoiceTest) {
                        voiceService.stop();
                      } else {
                        const persona = voiceService.getPersonaById(formData.voice?.voiceId || 'aoede');
                        voiceService.speak(
                          persona?.sampleText || "Welcome to your AI research workspace. The literature review and benchmark matrix are ready for analysis.",
                          formData.voice
                        );
                      }
                    }}
                    className="text-xs gap-1.5 h-8 font-semibold shadow-xs"
                  >
                    {isPlayingVoiceTest ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Audition Voice</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Speech Rate Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Speech Cadence Rate</span>
                    <span className="font-mono text-foreground font-semibold">{(formData.voice?.speechRate || 1.0).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={formData.voice?.speechRate ?? 1.0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        voice: { ...formData.voice, speechRate: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0.75x (Deliberate)</span>
                    <span>1.0x (Normal)</span>
                    <span>1.5x (Fast)</span>
                  </div>
                </div>

                {/* Auto Read Checkbox */}
                <div className="pt-1 border-t border-border/50">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!formData.voice?.autoReadResponses}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice: { ...formData.voice, autoReadResponses: e.target.checked },
                        })
                      }
                      className="rounded border-input text-indigo-600 focus:ring-indigo-600 w-3.5 h-3.5"
                    />
                    <span className="text-foreground font-medium">
                      Auto-narrate AI research assistant responses aloud
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Defaults & Repositories */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Research Defaults & Repositories</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Default ingestion batch sizes and supported academic publication hubs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div>
              <label className="font-semibold text-slate-200 block mb-1.5">
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
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      formData.research.defaultPaperCount === count
                        ? 'bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-[#060919] text-slate-400 border-[#1b2245] hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {count} Papers
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-2">
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
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-cyan-400/80 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold'
                          : 'border-[#1b2245] bg-[#060919] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <span>{source}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card className="neon-card-project rounded-2xl">
          <CardHeader className="pb-3 border-b border-[#1b2245]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-cyan-100">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export & Dissemination Defaults</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Configure global document formats and citation engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
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
                  className="w-full text-xs rounded-xl border border-[#1b2245] bg-[#060919] px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Microsoft Word (.docx)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="latex">LaTeX Archive (.tex)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
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
                  className="w-full text-xs rounded-xl border border-[#1b2245] bg-[#060919] px-3 py-2 text-cyan-200 focus:outline-none focus:border-cyan-400 font-medium"
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
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-semibold text-white btn-ai-glow-cyan-magenta shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Preferences...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
