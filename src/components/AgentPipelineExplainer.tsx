import React, { useState } from 'react';
import { Compass, Search, Coins, CalendarClock, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { AGENT_PIPELINE } from '../data/agentDefinitions';
import { AgentType } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  Search,
  Coins,
  CalendarClock,
  Sparkles,
  ShieldCheck,
};

export const AgentPipelineExplainer: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('planner');

  const activeAgent = AGENT_PIPELINE.find((a) => a.type === selectedAgent) || AGENT_PIPELINE[0];
  const ActiveIcon = ICON_MAP[activeAgent.icon] || Sparkles;

  return (
    <section id="pipeline-section" className="py-16 md:py-24 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Beyond Generic Chatbots
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            The Multi-Agent Autonomous Pipeline
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Traditional chatbots generate ungrounded paragraphs with no budget validation or schedule checks. LifePilot AI deploys 6 specialized agents collaborating in a sequential consensus pipeline.
          </p>
        </div>

        {/* Linear Pipeline Flow Graph */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 text-center">
            Linear Agentic Choreography
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">
            {AGENT_PIPELINE.map((agent, index) => {
              const Icon = ICON_MAP[agent.icon] || Sparkles;
              const isSelected = selectedAgent === agent.type;

              return (
                <button
                  key={agent.type}
                  type="button"
                  onClick={() => setSelectedAgent(agent.type)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      0{index + 1}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {agent.name.replace(' Agent', '')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {agent.role.split('&')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Agent Inspector Card */}
          <div className="mt-8 p-6 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <ActiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeAgent.name}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      Autonomous Worker
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Primary Domain: {activeAgent.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Agent Mandate & Strategy
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeAgent.description}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Pipeline Contract
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Input:</span>
                    <span className="font-mono">Standardized State</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Execution:</span>
                    <span className="font-mono">Deterministic + LLM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Review Gate:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Review Agent Audit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: Chatbot vs LifePilot AI */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-red-200/80 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Generic Chatbot Response</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Returns long walls of generic markdown text. Lacks cross-referencing between hotel rates and food costs, omits transit buffers, offers no interactive editing, and cannot verify whether ₹8,000 is physically realistic.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-emerald-950/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>LifePilot Agentic Architecture</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Deconstructs goals into 6 distinct agent duties. Solves mathematical constraints (budgeting), maps geographical sequences (scheduling), checks operating rules (review), and presents a living, editable dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
