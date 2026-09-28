import React from 'react';
import { Plane, ShoppingBag, PartyPopper, BookOpen, Briefcase, ArrowUpRight } from 'lucide-react';
import { PlanCategory } from '../types';

interface PlanningModesProps {
  onSelectMode: (mode: PlanCategory, samplePrompt: string) => void;
}

interface ModeCardConfig {
  id: PlanCategory;
  title: string;
  badge: string;
  icon: React.ElementType;
  tagline: string;
  description: string;
  samplePrompt: string;
  highlights: string[];
  imageSrc?: string;
  colorClass: string;
}

const MODES: ModeCardConfig[] = [
  {
    id: 'travel',
    title: 'Travel Planner',
    badge: '✈️ Travel',
    icon: Plane,
    tagline: 'Itineraries, transit routes, and packing essentials',
    description: 'Plan domestic and international journeys, optimize day-by-day stops, track hotel and food costs, and prevent travel fatigue.',
    samplePrompt: 'Plan a 3-day trip to Hyderabad under ₹8,000',
    highlights: ['Metro & transit route mapping', 'Authentic culinary stops', 'Packing & weather checklist'],
    imageSrc: '/src/assets/images/travel_hyderabad_historic_1790598700361.jpg',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  },
  {
    id: 'shopping',
    title: 'Shopping Planner',
    badge: '🛍️ Shopping',
    icon: ShoppingBag,
    tagline: 'Budget ceilings, item comparisons, and gift sourcing',
    description: 'Structure buying lists, compare artisan and online alternatives, balance allocations across recipients, and maintain cost discipline.',
    samplePrompt: 'Help me shop for gifts under ₹5,000',
    highlights: ['Per-item price allocation', 'Vendor dispatch checks', 'Custom wrapping advice'],
    colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
  },
  {
    id: 'event',
    title: 'Event Planner',
    badge: '🎉 Event',
    icon: PartyPopper,
    tagline: 'Guest catering, interactive entertainment, and timelines',
    description: 'Organize birthdays, milestone celebrations, and campus meetups with synchronized catering timelines, playlists, and photo setups.',
    samplePrompt: 'Plan a birthday party for 20 people',
    highlights: ['Headcount & portion math', 'Interactive quiz/games', 'Decor and sound staging'],
    imageSrc: '/src/assets/images/event_party_celebration_1790598717483.jpg',
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  },
  {
    id: 'study',
    title: 'Study Planner',
    badge: '📚 Study',
    icon: BookOpen,
    tagline: 'High-yield exam sprints, active recall, and spaced repetition',
    description: 'Break university and competitive exam syllabi into Pomodoro study blocks, mock paper simulations, and formula syntheses without burnout.',
    samplePrompt: 'Create a 7-day study plan for my exams',
    highlights: ['80/20 syllabus weightage', 'Full mock test simulation', 'Formula review sheets'],
    imageSrc: '/src/assets/images/study_learning_workspace_1790598739636.jpg',
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
  },
  {
    id: 'career',
    title: 'Career Planner',
    badge: '💼 Career',
    icon: Briefcase,
    tagline: 'Skill roadmaps, portfolio milestones, and hiring preparation',
    description: 'Navigate career transitions, learn in-demand technical domains, build verifiable portfolio projects, and rehearse technical interview topics.',
    samplePrompt: 'Create a 30-day roadmap to transition into an AI Agent Engineer',
    highlights: ['Weekly competency tracks', '3 demonstrable projects', 'Evaluation and interview prep'],
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
  },
];

export const PlanningModes: React.FC<PlanningModesProps> = ({ onSelectMode }) => {
  return (
    <section id="modes-section" className="py-16 md:py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Specialized Planning Domains
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for every life milestone
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Select a specialized mode or let our agents auto-detect your goal. Each mode loads domain-specific research criteria and safety constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  {mode.imageSrc && (
                    <div className="mb-4 h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={mode.imageSrc}
                        alt={mode.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white drop-shadow-sm">
                        {mode.badge}
                      </span>
                    </div>
                  )}

                  {!mode.imageSrc && (
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mode.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {mode.badge}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {mode.tagline}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mode.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Key Agent Outputs
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {mode.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelectMode(mode.id, mode.samplePrompt)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all flex items-center justify-between group/btn"
                  >
                    <span>Launch {mode.title}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
