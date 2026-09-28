import React from 'react';
import { CheckCircle2, Loader2, Sparkles, X, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { AgentLog, AgentType } from '../types';
import { AGENT_PIPELINE, AGENTS_MAP } from '../data/agentDefinitions';

interface AgentActivityModalProps {
  isOpen: boolean;
  onClose?: () => void;
  activeAgent: AgentType | null;
  completedAgents: AgentType[];
  agentLogs: AgentLog[];
  currentStatusMessage: string;
  isGenerating: boolean;
  planGoal: string;
}

export const AgentActivityModal: React.FC<AgentActivityModalProps> = ({
  isOpen,
  onClose,
  activeAgent,
  completedAgents,
  agentLogs,
  currentStatusMessage,
  isGenerating,
  planGoal,
}) => {
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Agentic AI System Activity
                </h3>
                {isGenerating && (
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 animate-pulse font-semibold">
                    [Live Collaboration]
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Goal: &ldquo;{planGoal}&rdquo;
              </p>
            </div>
          </div>

          {!isGenerating && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live status ticker banner */}
        {isGenerating && (
          <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 px-5 py-2.5 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-medium truncate">{currentStatusMessage || 'Delegating tasks to specialized agents...'}</span>
          </div>
        )}

        {/* Agent pipeline progress list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {AGENT_PIPELINE.map((agentDef, index) => {
            const isCompleted = completedAgents.includes(agentDef.type);
            const isCurrent = activeAgent === agentDef.type;
            const log = agentLogs.find((l) => l.agent === agentDef.type);

            let statusText = 'Pending in queue';
            if (isCompleted) {
              if (agentDef.type === 'planner') statusText = 'Goal analyzed & decomposed';
              else if (agentDef.type === 'researcher') statusText = 'Information gathered & verified';
              else if (agentDef.type === 'budget') statusText = 'Budget calculated & balanced';
              else if (agentDef.type === 'schedule') statusText = 'Timeline created & sequenced';
              else if (agentDef.type === 'recommender') statusText = 'Options selected & tailored';
              else if (agentDef.type === 'reviewer') statusText = 'Plan verified & certified';
            } else if (isCurrent) {
              statusText = 'Actively executing mandate...';
            }

            return (
              <div
                key={agentDef.type}
                className={`rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20 shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
                    : 'border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                }`}
              >
                <div
                  onClick={() => log && toggleExpand(log.id)}
                  className={`p-3.5 flex items-center justify-between ${log ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {agentDef.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {isCompleted ? '✓ Done' : isCurrent ? 'Working' : `Step 0${index + 1}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {statusText}
                      </p>
                    </div>
                  </div>

                  {log && (
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {expandedLogId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Expanded details & metrics */}
                {log && expandedLogId === log.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5 bg-slate-50/70 dark:bg-slate-950/40 rounded-b-xl">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {log.detail}
                    </p>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                        Delivered Output:
                      </span>
                      {log.keyOutputSummary}
                    </div>

                    {log.metrics && log.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {log.metrics.map((m, idx) => (
                          <div key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 block">{m.label}</span>
                            <span className="font-semibold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono">
            Pipeline: Planner → Research → Budget → Schedule → Recommender → Reviewer
          </span>
          {!isGenerating && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              View Plan Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
