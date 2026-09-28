import React from 'react';
import { Sun, Moon, Bookmark, Sparkles, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNewPlanClick: () => void;
  onOpenSavedPlans: () => void;
  savedPlansCount: number;
  currentView: 'home' | 'plan';
  onNavigateHome: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPlanClick,
  onOpenSavedPlans,
  savedPlansCount,
  currentView,
  onNavigateHome,
  onScrollToSection,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onNavigateHome}
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
            LP
          </span>
          <span>LifePilot AI</span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              onNavigateHome();
              setTimeout(() => onScrollToSection('planner-hero'), 50);
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Planner
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              setTimeout(() => onScrollToSection('modes-section'), 50);
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Planning Modes
          </button>
          <button
            onClick={() => {
              onNavigateHome();
              setTimeout(() => onScrollToSection('pipeline-section'), 50);
            }}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Agentic Architecture
          </button>
          <button
            onClick={onOpenSavedPlans}
            className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span>Saved Plans</span>
            {savedPlansCount > 0 && (
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                ({savedPlansCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentView === 'plan' ? (
            <button
              onClick={onNewPlanClick}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          ) : (
            <button
              onClick={() => onScrollToSection('planner-hero')}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Planning</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
