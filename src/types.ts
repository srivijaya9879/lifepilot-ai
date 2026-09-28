export type AgentType = 
  | 'planner' 
  | 'researcher' 
  | 'budget' 
  | 'schedule' 
  | 'recommender' 
  | 'reviewer';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'verified';

export interface AgentInfo {
  type: AgentType;
  name: string;
  role: string;
  icon: string;
  accentColor: string;
  description: string;
}

export interface AgentLog {
  id: string;
  agent: AgentType;
  agentName: string;
  agentRole: string;
  timestamp: string;
  statusMessage: string;
  detail: string;
  keyOutputSummary: string;
  dataProcessed?: string;
  metrics?: { label: string; value: string }[];
}

export type PlanCategory = 'travel' | 'shopping' | 'event' | 'study' | 'career' | 'general';

export interface PlanInputs {
  goal: string;
  category: PlanCategory;
  budget: number;
  currency: string;
  durationDays: number;
  numPeople: number;
  location: string;
  preferences: string[];
  priorities: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  estimated: number;
  notes: string;
}

export interface TimelineActivity {
  id: string;
  time: string;
  title: string;
  location?: string;
  description: string;
  estimatedCost?: number;
  tag?: string;
}

export interface TimelineDay {
  dayNumber: number;
  title: string;
  theme: string;
  activities: TimelineActivity[];
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignedAgent: AgentType;
}

export interface RecommendationItem {
  id: string;
  category: 'places' | 'food' | 'transport' | 'tools' | 'resources' | 'tips';
  title: string;
  subtitle: string;
  description: string;
  rating?: number;
  priceHint?: string;
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export interface ReviewAudit {
  verified: boolean;
  conflictCount: number;
  optimizationsMade: string[];
  budgetFit: 'under_budget' | 'exact' | 'tight' | 'adjusted';
  safetyNotes: string[];
  verificationHighlights: string[];
}

export interface Plan {
  id: string;
  createdAt: string;
  updatedAt: string;
  inputs: PlanInputs;
  title: string;
  tagline: string;
  summary: string;
  totalBudget: number;
  estimatedSpend: number;
  remainingBudget: number;
  currency: string;
  days: TimelineDay[];
  budgetBreakdown: BudgetItem[];
  tasks: TaskItem[];
  recommendations: RecommendationItem[];
  checklist: ChecklistItem[];
  importantTips: string[];
  reviewAudit: ReviewAudit;
  agentLogs: AgentLog[];
  heroImage?: string;
}
