import React, { useState, useRef, useEffect } from 'react';
import { useResearch } from '../../context/ResearchContext';
import { aiAssistantService, ResearchChatStatus } from '../../services/aiAssistantService';
import { AIChatMessage, ResearchCitation } from '../../types';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  Bot, 
  User, 
  Loader2,
  ChevronRight,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  RotateCcw,
  Database,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { voiceService } from '../../services/voiceService';

export const AIAssistantPanel: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen, addToast, settings, currentProject, papers } = useResearch();
  
  const [messages, setMessages] = useState<AIChatMessage[]>(() => 
    aiAssistantService.getInitialMessages({ currentProject, papers })
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexingStatus, setIndexingStatus] = useState<ResearchChatStatus | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync speaking state from global voice service
  useEffect(() => {
    const unsub = voiceService.subscribeSpeaking((speaking) => {
      if (!speaking) setSpeakingMessageId(null);
    });
    return () => {
      unsub();
      voiceService.stop();
      voiceService.stopListening();
    };
  }, []);

  // Fetch indexing status on open or project change
  useEffect(() => {
    if (isAIAssistantOpen) {
      aiAssistantService.getIndexingStatus(currentProject?.id).then((status) => {
        if (status) setIndexingStatus(status);
      });
    }
  }, [isAIAssistantOpen, currentProject?.id]);

  // Update initial message when project changes if chat hasn't been used yet
  useEffect(() => {
    if (!hasInteracted && currentProject) {
      setMessages(aiAssistantService.getInitialMessages({ currentProject, papers }));
    }
  }, [currentProject?.id, hasInteracted, papers.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIAssistantOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isAIAssistantOpen) {
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
  }, [isAIAssistantOpen]);

  const toggleSpeakMessage = (msgId: string, content: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      voiceService.speak(content, settings?.voice, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      const started = voiceService.startListening(
        (transcript) => {
          setInput(transcript);
        },
        (errorMsg) => {
          addToast({
            type: 'warning',
            title: 'Microphone Input',
            message: errorMsg,
          });
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (!started) {
        setIsListening(false);
      }
    }
  };

  const handleIndexProject = async () => {
    if (isIndexing) return;
    setIsIndexing(true);
    addToast({
      type: 'info',
      title: 'Indexing Corpus',
      message: 'Extracting text and generating ChromaDB embeddings...',
    });

    const res = await aiAssistantService.triggerProjectIndexing(currentProject?.id);
    setIsIndexing(false);

    if (res.success) {
      addToast({
        type: 'success',
        title: 'Corpus Indexed',
        message: res.message,
      });
      const updatedStatus = await aiAssistantService.getIndexingStatus(currentProject?.id);
      if (updatedStatus) setIndexingStatus(updatedStatus);
    } else {
      addToast({
        type: 'warning',
        title: 'Indexing Notice',
        message: res.message,
      });
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setHasInteracted(true);
    setLastFailedQuery(null);

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    }

    const userMsg: AIChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiAssistantService.askQuestion(text, {
        currentProject,
        papers,
      });
      setMessages((prev) => [...prev, response]);

      if (settings?.voice?.autoReadResponses) {
        toggleSpeakMessage(response.id, response.content);
      }
    } catch {
      setLastFailedQuery(text);
      addToast({
        type: 'error',
        title: 'Research Chatbot Error',
        message: 'Failed to process inquiry. You can retry with the retry button.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSend(lastFailedQuery);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
    });
  };

  const handleClear = () => {
    voiceService.stop();
    setMessages(aiAssistantService.getInitialMessages({ currentProject, papers }));
    setHasInteracted(false);
    setLastFailedQuery(null);
    addToast({
      type: 'info',
      title: 'Conversation Cleared',
    });
  };

  const toggleCitationExpand = (key: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeVoicePersona = voiceService.getPersonaById(settings?.voice?.voiceId || 'aoede');

  const suggestedQuestions = [
    'Summarize the main findings of my papers.',
    'Compare the methodologies of two papers.',
    'Identify common research gaps.',
    'What limitations did the authors report?',
    'Generate a literature synthesis from my indexed papers.',
  ];

  const totalIndexedChunks = indexingStatus?.total_indexed_chunks || 0;
  const uniquePapersIndexed = indexingStatus?.unique_papers_indexed || 0;
  const isCorpusIndexed = totalIndexedChunks > 0;

  return (
    <>
      {/* 1. Persistent Floating Chatbot Launcher Button (Bottom-Right Corner on EVERY page) */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <AnimatePresence>
          {!isAIAssistantOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => setIsAIAssistantOpen(true)}
              className="relative group flex items-center justify-center w-14 h-14 rounded-full btn-ai-glow-cyan-magenta text-white shadow-[0_0_25px_rgba(217,70,239,0.55),_0_0_12px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
              title="Open AI Research Assistant (Agentic RAG)"
            >
              {/* Outer Pulsing Ambient Ring */}
              <span className="absolute -inset-1.5 rounded-full bg-cyan-500/30 animate-pulse pointer-events-none" />
              
              {/* Voice Listening Ripple if Mic is Active */}
              {isListening && (
                <span className="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none" />
              )}

              {/* Bot / Sparkles Icon */}
              <div className="relative flex items-center justify-center">
                <Bot className="w-6 h-6 text-white drop-shadow-sm" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-spin-slow" />
              </div>

              {/* Hover Tooltip Pill */}
              <div className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#090d24] text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-cyan-500/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 flex items-center gap-1.5">
                <span>AI Research Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  Agentic RAG
                </span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Professional Academic Research Chatbot Window */}
      <AnimatePresence>
        {isAIAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              "fixed z-50 bg-[#090d24]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden transition-all duration-300",
              isExpanded
                ? "bottom-0 right-0 w-full sm:w-[720px] h-full sm:h-[90vh] sm:bottom-4 sm:right-4 sm:rounded-2xl"
                : "bottom-6 right-6 w-[94vw] sm:w-[500px] h-[660px] max-h-[88vh] rounded-2xl"
            )}
          >
            {/* Header: Cyber Glassmorphic Bar */}
            <div className="p-3.5 border-b border-[#1a2044] bg-[#0c102a]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_12px_rgba(6,182,212,0.35)] shrink-0">
                  <div className="w-full h-full bg-[#080b1e] rounded-[10px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate font-heading">
                      AI Research Assistant
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shrink-0 flex items-center gap-1 shadow-[0_0_6px_rgba(6,182,212,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_#22d3ee]" />
                      Agentic RAG
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 truncate">
                    <span className="truncate">
                      <strong>Project:</strong> {currentProject?.title || 'Active Investigation'}
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300 font-mono font-medium">
                      {isCorpusIndexed ? `${totalIndexedChunks} chunks indexed` : 'Unindexed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                <button
                  type="button"
                  onClick={handleIndexProject}
                  disabled={isIndexing}
                  className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#101436] border border-cyan-500/30 text-cyan-300 hover:bg-[#161c48] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Index all project papers and documents into ChromaDB"
                >
                  <Database className={cn("w-3 h-3", isIndexing && "animate-spin")} />
                  <span>{isIndexing ? 'Indexing...' : 'Index Papers'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:text-foreground hover:bg-secondary rounded-lg transition-colors hidden sm:flex"
                  title={isExpanded ? "Collapse to Widget" : "Expand Window"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAIAssistantOpen(false)}
                  className="p-1.5 hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Status Bar */}
            <div className="px-3.5 py-1.5 bg-secondary/50 border-b border-border/50 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-foreground shrink-0">🎯 Topic:</span>
                <span className="truncate text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentProject?.topic || currentProject?.title || 'Open Exploration'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-card border border-border/60 font-mono">
                  {papers.length || currentProject?.paperCount || 0} papers
                </span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded font-semibold",
                  isCorpusIndexed
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                )}>
                  {isCorpusIndexed ? 'Vector Store Ready' : 'Needs Indexing'}
                </span>
              </div>
            </div>

            {/* Suggested Questions Carousel */}
            <div className="p-2 border-b border-border/40 bg-card/40 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-card border border-border/80 text-foreground hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/60 dark:hover:border-indigo-800 text-left whitespace-nowrap transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                const hasCitations = isAssistant && msg.citations && msg.citations.length > 0;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[94%]",
                      isAssistant ? "mr-auto" : "ml-auto items-end"
                    )}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
                      {isAssistant ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Bot className="w-2.5 h-2.5" />
                          </div>
                          <span className="font-semibold text-foreground">AI Research Assistant</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-foreground">You</span>
                          <User className="w-3 h-3" />
                        </>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs leading-relaxed relative group shadow-2xs transition-all",
                        isAssistant
                          ? "bg-secondary/70 text-foreground border border-border/70 rounded-tl-xs"
                          : "bg-indigo-600 text-white rounded-tr-xs"
                      )}
                    >
                      {isAssistant ? (
                        <div className="prose-academic text-xs space-y-2">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Evidence Citations Panel (Section 6 & 8) */}
                      {hasCitations && (
                        <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Verified Supporting Sources & Citations ({msg.citations?.length})</span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.citations?.map((cit, cIdx) => {
                              const citKey = `${msg.id}-cit-${cIdx}`;
                              const isExpandedCitation = expandedCitations[citKey] ?? false;

                              return (
                                <div
                                  key={cIdx}
                                  className="rounded-xl border border-border/70 bg-card/60 p-2.5 text-[11px] transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-bold text-foreground truncate">
                                        📄 {cit.paper_title}
                                      </p>
                                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                        {cit.authors && <span>Authors: {cit.authors}</span>}
                                        {cit.publication_year && <span>({cit.publication_year})</span>}
                                        {cit.page_number && (
                                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                                            Page {cit.page_number}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleCitationExpand(citKey)}
                                      className="p-1 hover:bg-secondary rounded text-muted-foreground shrink-0 cursor-pointer"
                                      title={isExpandedCitation ? "Collapse excerpt" : "Expand excerpt"}
                                    >
                                      {isExpandedCitation ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>

                                  {/* Supporting Excerpt */}
                                  {cit.excerpt && (
                                    <div className={cn(
                                      "mt-2 text-[10px] text-muted-foreground/90 italic bg-secondary/50 p-2 rounded-lg border-l-2 border-indigo-500",
                                      !isExpandedCitation && "line-clamp-2"
                                    )}>
                                      "{cit.excerpt}"
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Bar for Assistant Messages */}
                      {isAssistant && (
                        <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* Voice Model Read Aloud Button */}
                            <button
                              type="button"
                              onClick={() => toggleSpeakMessage(msg.id, msg.content)}
                              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                              title={speakingMessageId === msg.id ? "Stop voice reading" : "Read aloud with selected voice model"}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                  <span className="text-rose-500 font-semibold">Stop Voice</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Read Aloud</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Follow-up Action Suggestions */}
                    {isAssistant && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1 px-1">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleSend(action)}
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer"
                          >
                            <span>{action}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generating / Multi-Agent Reasoning State */}
              {isLoading && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-secondary/50 text-xs text-muted-foreground border border-border/50 w-fit animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Agentic RAG: Planning query, retrieving evidence & verifying citations...</span>
                </div>
              )}

              {/* Retry Control if request failed */}
              {lastFailedQuery && !isLoading && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Inquiry was interrupted.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500 text-white font-semibold text-[11px] hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Listening Active Waveform Banner */}
            {isListening && (
              <div className="px-4 py-2.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 animate-pulse shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-semibold">🎙️ Listening to voice query... Speak clearly</span>
                </div>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Send Voice Query
                </button>
              </div>
            )}

            {/* Input Area: Conforming to Section 8 */}
            <div className="p-3 border-t border-border bg-card shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2 bg-secondary/50 border border-input rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all"
              >
                {/* Microphone / Voice Note Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={cn(
                    "h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer mb-0.5",
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  title={isListening ? "Listening... click to send" : "Record voice query"}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Multiline Textarea with Enter-to-send */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening to your voice..." : "Ask research questions about methodologies, datasets, or paper findings..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-1 py-1.5 resize-none max-h-24 min-h-[34px]"
                />

                {/* Send Button */}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-8.5 px-3 rounded-xl shrink-0 font-semibold shadow-xs mb-0.5"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 px-1 opacity-75">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Evidence-grounded Agentic RAG</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
