import React, { useState } from 'react';
import { ArrowRight, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { PlanInputs } from '../types';

interface HeroInputProps {
  onSubmitGoal: (goal: string, customInputs?: Partial<PlanInputs>, speed?: 'fast' | 'normal' | 'instant') => void;
  isGenerating: boolean;
}

const EXAMPLE_PROMPTS = [
  'Plan a 3-day trip to Hyderabad under ₹8,000',
  'Plan a birthday party for 20 people',
  'Help me shop for gifts under ₹5,000',
  'Create a 7-day study plan for my exams',
];

export const HeroInput: React.FC<HeroInputProps> = ({ onSubmitGoal, isGenerating }) => {
  const [goalText, setGoalText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'instant'>('normal');

  // Advanced filters (optional)
  const [budget, setBudget] = useState<string>('');
  const [currency, setCurrency] = useState<string>('₹');
  const [days, setDays] = useState<string>('');
  const [people, setPeople] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = goalText.trim();
    if (!trimmed || isGenerating) return;

    const custom: Partial<PlanInputs> = {};
    if (budget) custom.budget = parseFloat(budget);
    if (currency) custom.currency = currency;
    if (days) custom.durationDays = parseInt(days, 10);
    if (people) custom.numPeople = parseInt(people, 10);
    if (location) custom.location = location;

    onSubmitGoal(trimmed, Object.keys(custom).length > 0 ? custom : undefined, speed);
  };

  const handleSelectExample = (example: string) => {
    setGoalText(example);
    onSubmitGoal(example, undefined, speed);
  };

  return (
    <section id="planner-hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Wordmark and Tagline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
          Give us your goal. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Let AI plan the journey.
          </span>
        </h1>

        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          LifePilot AI turns your goals into smart, practical, step-by-step plans using collaborating AI agents.
        </p>

        {/* Input Card Container */}
        <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-2 sm:p-3 transition-all focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 flex items-center px-3 py-2">
                <input
                  type="text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="What do you want to plan?"
                  disabled={isGenerating}
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base sm:text-lg font-medium focus:outline-none"
                />
                {goalText && (
                  <button
                    type="button"
                    onClick={() => setGoalText('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 justify-end px-2 pb-1 sm:p-0">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    showAdvanced
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Customize constraints (budget, days, travelers)"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Options</span>
                </button>

                <button
                  type="submit"
                  disabled={!goalText.trim() || isGenerating}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[150px]"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Agents Active...</span>
                    </span>
                  ) : (
                    <>
                      <span>Create My Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Constraints Drawer */}
            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-left px-3 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Currency & Budget
                  </label>
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/60">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2 py-1.5 text-xs bg-transparent border-r border-slate-200 dark:border-slate-700 focus:outline-none"
                    >
                      <option value="₹">₹ (INR)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="e.g. 3"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    People / Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Simulation Speed
                  </label>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSpeed('normal')}
                      className={`flex-1 py-1 text-[11px] font-medium rounded ${
                        speed === 'normal'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Demo (3s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeed('instant')}
                      className={`flex-1 py-1 text-[11px] font-medium rounded ${
                        speed === 'instant'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Instant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Example prompts */}
        <div className="mt-5 max-w-2xl mx-auto text-left">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2 text-center sm:text-left">
            Try one of these examples:
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSelectExample(prompt)}
                disabled={isGenerating}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Live Agent Badge banner */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>6 Autonomous Agents Ready</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>Zero Hallucinations Guarantee</span>
          <span aria-hidden="true">·</span>
          <span>Real-time Budget Audit</span>
        </div>
      </div>
    </section>
  );
};
