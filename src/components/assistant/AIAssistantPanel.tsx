import React, { useState, useRef, useEffect } from 'react';
import { useResearch } from '../../context/ResearchContext';
import { aiAssistantService } from '../../services/aiAssistantService';
import { AIChatMessage } from '../../types';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Bot, 
  User, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const AIAssistantPanel: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen, addToast } = useResearch();
  const [messages, setMessages] = useState<AIChatMessage[]>(aiAssistantService.getInitialMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIAssistantOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

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
      const response = await aiAssistantService.askQuestion(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      addToast({
        type: 'error',
        title: 'Assistant Error',
        message: 'Failed to process inquiry. Please retry.',
      });
    } finally {
      setIsLoading(false);
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
    setMessages(aiAssistantService.getInitialMessages());
    addToast({
      type: 'info',
      title: 'Chat Cleared',
    });
  };

  const sampleChips = [
    'Summarize these papers',
    'What are the common research gaps?',
    'Which methodology is most effective?',
    'Generate research questions',
    'Compare these approaches',
    'Suggest a research direction',
  ];

  return (
    <AnimatePresence>
      {isAIAssistantOpen && (
        <>
          {/* Backdrop on small screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAIAssistantOpen(false)}
            className="fixed inset-0 bg-background/50 backdrop-blur-xs z-40 lg:hidden"
          />

          {/* Right Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/80 bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                    Ask Research AI
                    <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Claude 3.5
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Context-aware scientific assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAIAssistantOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 border-b border-border/40 bg-secondary/30 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {sampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card border border-border/80 text-foreground hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/60 dark:hover:border-indigo-800 text-left whitespace-nowrap transition-colors shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-1 max-w-[90%]",
                      isAssistant ? "mr-auto" : "ml-auto items-end"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {isAssistant ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>AI Scientist</span>
                        </>
                      ) : (
                        <>
                          <span>You</span>
                          <User className="w-3.5 h-3.5 text-foreground" />
                        </>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs leading-relaxed relative group",
                        isAssistant
                          ? "bg-secondary/60 text-foreground border border-border/60 rounded-tl-xs"
                          : "bg-indigo-600 text-white rounded-tr-xs"
                      )}
                    >
                      {isAssistant ? (
                        <div className="prose-academic text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Message Actions */}
                      {isAssistant && (
                        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleSend('Regenerate analysis with more detail')}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Interactive Follow-up Action Suggestions */}
                    {isAssistant && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSend(action)}
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                          >
                            <span>{action}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 text-xs text-muted-foreground border border-border/40 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Synthesizing multi-paper insights...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about papers, gaps, or methodology..."
                  disabled={isLoading}
                  className="flex-1 bg-secondary/50 border border-input rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-600 transition-all placeholder:text-muted-foreground/60"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-9 px-3 rounded-xl"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
