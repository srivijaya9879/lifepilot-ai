import { AgentInfo, AgentType } from '../types';

export const AGENT_PIPELINE: AgentInfo[] = [
  {
    type: 'planner',
    name: 'Planner Agent',
    role: 'Decomposition & Strategy Engine',
    icon: 'Compass',
    accentColor: 'blue',
    description: 'Understands the user’s primary goal, identifies core constraints, breaks the initiative into tactical milestones, and formulates the strategic execution blueprint.',
  },
  {
    type: 'researcher',
    name: 'Research Agent',
    role: 'Information & Context Gathering',
    icon: 'Search',
    accentColor: 'indigo',
    description: 'Identifies contextual variables, operating hours, ticket costs, logistics data, and vendor choices relevant to the target location and timeframe.',
  },
  {
    type: 'budget',
    name: 'Budget Agent',
    role: 'Cost Estimation & Financial Control',
    icon: 'Coins',
    accentColor: 'emerald',
    description: 'Calculates categorical expenditure ceilings, cross-references historical averages, allocates contingency reserves, and balances totals against the user target.',
  },
  {
    type: 'schedule',
    name: 'Schedule Agent',
    role: 'Temporal Choreography & Route Sequencing',
    icon: 'CalendarClock',
    accentColor: 'amber',
    description: 'Synthesizes tasks into logical chronological timelines, calculates transit buffers between venues, and builds realistic day-by-day itineraries.',
  },
  {
    type: 'recommender',
    name: 'Recommendation Agent',
    role: 'Preference Matching & Local Insight',
    icon: 'Sparkles',
    accentColor: 'violet',
    description: 'Curates specific venues, iconic cuisines, transport hacks, and high-value alternatives tailored to user priorities and budget boundaries.',
  },
  {
    type: 'reviewer',
    name: 'Review Agent',
    role: 'Conflict Detection & Quality Assurance',
    icon: 'ShieldCheck',
    accentColor: 'teal',
    description: 'Audits the entire assembled blueprint for scheduling overlaps, cost overflows, missing essentials, or fatigue factors before presenting the verified plan.',
  },
];

export const AGENTS_MAP: Record<AgentType, AgentInfo> = AGENT_PIPELINE.reduce(
  (acc, agent) => ({ ...acc, [agent.type]: agent }),
  {} as Record<AgentType, AgentInfo>
);
