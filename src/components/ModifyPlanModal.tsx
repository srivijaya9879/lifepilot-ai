import React, { useState } from 'react';
import { X, RefreshCw, Sliders } from 'lucide-react';
import { Plan, PlanInputs } from '../types';

interface ModifyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  onApplyModifications: (updatedInputs: PlanInputs) => void;
  isRegenerating: boolean;
}

export const ModifyPlanModal: React.FC<ModifyPlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplyModifications,
  isRegenerating,
}) => {
  const [budget, setBudget] = useState(currentPlan.totalBudget.toString());
  const [currency, setCurrency] = useState(currentPlan.currency);
  const [days, setDays] = useState(currentPlan.inputs.durationDays.toString());
  const [people, setPeople] = useState(currentPlan.inputs.numPeople.toString());
  const [location, setLocation] = useState(currentPlan.inputs.location);
  const [priorities, setPriorities] = useState(currentPlan.inputs.priorities);
  const [preferenceText, setPreferenceText] = useState(currentPlan.inputs.preferences.join(', '));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedInputs: PlanInputs = {
      ...currentPlan.inputs,
      budget: parseFloat(budget) || currentPlan.totalBudget,
      currency: currency || currentPlan.currency,
      durationDays: parseInt(days, 10) || currentPlan.inputs.durationDays,
      numPeople: parseInt(people, 10) || currentPlan.inputs.numPeople,
      location: location.trim() || currentPlan.inputs.location,
      priorities: priorities.trim() || currentPlan.inputs.priorities,
      preferences: preferenceText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    };

    onApplyModifications(updatedInputs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Modify Plan Constraints
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust key variables to trigger agentic recalculation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Budget & Currency
              </label>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2.5 py-2 text-xs bg-transparent border-r border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                </select>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-transparent focus:outline-none"
                  placeholder="Budget"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Number of People
              </label>
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Target Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Key Priorities
            </label>
            <input
              type="text"
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              placeholder="e.g. Strict budget, high comfort, scenic views"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Preferences (Comma-separated)
            </label>
            <textarea
              rows={2}
              value={preferenceText}
              onChange={(e) => setPreferenceText(e.target.value)}
              placeholder="e.g. Heritage monuments, Biryani, Metro transit"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegenerating}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Recalculating...' : 'Recalculate & Update Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
