import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Trash2,
  Maximize2,
  Minimize2,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { ChatMessage, sendChatMessage } from '../services/n8nChatService';

interface ChatbotWidgetProps {
  onLoadGoalIntoPlanner?: (goal: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  text: `Hello! I am **LifePilot AI**, your intelligent personal planning assistant.

I am powered by a network of specialized agents designed to transform your goals into actionable, data-driven plans. Whether you are looking to travel, study, shop, or organize an event, I follow a rigorous workflow to ensure your plan is realistic and optimized.

**How can I help you today?** To get started, please share a goal with your budget, timeline, and location.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  'Plan a 4-day trip to Udaipur under ₹15,000',
  'Create a 2-week revision schedule for Physics',
  'Build a roadmap to become a Data Scientist in 6 months',
  'Organize a surprise birthday dinner for 10 people',
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  onLoadGoalIntoPlanner,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lifepilot_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved chat history', e);
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMode, setChatMode] = useState<'n8n' | 'builtin'>('n8n');
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('lifepilot_chat_session_id');
    if (saved) return saved;
    const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('lifepilot_chat_session_id', newId);
    return newId;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('lifepilot_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleResetSession = () => {
    const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newId);
    localStorage.setItem('lifepilot_chat_session_id', newId);
    const systemNotice: ChatMessage = {
      id: `sys_${Date.now()}`,
      sender: 'assistant',
      text: '🔄 **Session memory refreshed.** A new conversation session has been initialized with the n8n agent.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, systemNotice]);
  };

  const handleSendMessage = async (textToSend?: string, forceFreshSession = false) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    let activeSession = sessionId;
    if (forceFreshSession) {
      activeSession = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setSessionId(activeSession);
      localStorage.setItem('lifepilot_chat_session_id', activeSession);
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (chatMode === 'builtin') {
        // Built-in intelligent response
        await new Promise((res) => setTimeout(res, 800));
        const botResponse = `I have analyzed your goal: **"${text}"** using the LifePilot Agentic System.

Here is the strategic decomposition:
*   **Target Scope:** Deconstructed into execution milestones.
*   **Budget & Feasibility:** Ready to verify against constraints.
*   **Timeline:** Ready to sequence into an hour-by-hour itinerary.

Would you like to generate the complete 6-Agent interactive dashboard plan for this now?`;

        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // n8n Webhook mode
        const botResponse = await sendChatMessage(text, activeSession, forceFreshSession);
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: err?.message || 'Could not communicate with the n8n webhook.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        canRetry: true,
        userPrompt: text,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history?')) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      localStorage.removeItem('lifepilot_chat_history');
    }
  };

  // Helper to parse markdown-like bold and bullet text simply
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Check headers
      if (line.startsWith('# ')) {
        return (
          <h3 key={idx} className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">
            {line.replace('# ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h4 key={idx} className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
            {line.replace('## ', '')}
          </h4>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemText = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 ml-1">
            <span className="text-indigo-500 font-bold">•</span>
            <span>{parseInlineStyles(itemText)}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label="Open LifePilot AI Chatbot"
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">Chat with LifePilot AI</span>
            <span className="text-[10px] text-indigo-200 leading-tight">n8n Agent Online</span>
          </div>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-8 rounded-2xl max-w-4xl max-h-[90vh] mx-auto my-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
                    LifePilot AI Chatbot
                  </h3>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    chatMode === 'n8n'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {chatMode === 'n8n' ? 'n8n Cloud' : 'Built-in Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  Live Agentic Workflow Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetSession}
                title="Reset session memory"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggle}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connection Status & Mode Switcher */}
          <div className="px-4 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-900 dark:text-indigo-200">
            <span className="flex items-center gap-1.5 truncate font-mono text-[10.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">srivijaya9879.app.n8n.cloud</span>
            </span>

            {/* Mode switch */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 rounded-md p-0.5 border border-indigo-200/50 dark:border-indigo-800/50">
              <button
                onClick={() => setChatMode('n8n')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  chatMode === 'n8n'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                n8n Webhook
              </button>
              <button
                onClick={() => setChatMode('builtin')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  chatMode === 'builtin'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Built-in AI
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                        : msg.isError
                        ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {msg.isError ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>n8n Workflow Execution Issue</span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          Your n8n webhook returned <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded text-[11px] font-mono text-amber-800 dark:text-amber-200 font-semibold">Error in workflow</code>.
                        </p>

                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Quick Fixes:</span>
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                            <li>Check the <strong>Executions tab</strong> in your n8n cloud dashboard to see which node failed (e.g. OpenAI/Gemini rate limit or API key).</li>
                            <li>The chat memory buffer in n8n might need a clean reset.</li>
                          </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-wrap gap-2">
                          {msg.userPrompt && (
                            <button
                              onClick={() => handleSendMessage(msg.userPrompt, true)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reset Session & Retry</span>
                            </button>
                          )}

                          {msg.userPrompt && onLoadGoalIntoPlanner && (
                            <button
                              onClick={() => {
                                onLoadGoalIntoPlanner(msg.userPrompt!);
                                onToggle();
                              }}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>Generate in LifePilot Dashboard</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs sm:text-[13px]">
                          {renderFormattedText(msg.text)}
                        </div>

                        {/* Quick action button to load plan into main dashboard if relevant */}
                        {!isUser && onLoadGoalIntoPlanner && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                            <button
                              onClick={() => {
                                const match = msg.text.match(/"([^"]+)"/);
                                const goalToPlan = match ? match[1] : 'Plan a trip to Goa under 20000';
                                onLoadGoalIntoPlanner(goalToPlan);
                                onToggle();
                              }}
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Open in 6-Agent Dashboard</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Thinking / Typing state */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>Agent is analyzing & executing workflow...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap bg-white dark:bg-slate-900">
            <div className="flex items-center gap-1.5 pb-1">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                ref={inputRef as any}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LifePilot AI anything or describe a goal..."
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none max-h-24 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 sm:px-3 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press Enter to send, Shift+Enter for newline</span>
              <button
                onClick={handleResetSession}
                className="hover:underline text-indigo-500 dark:text-indigo-400 flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>New Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
