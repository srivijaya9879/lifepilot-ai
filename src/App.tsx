import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HeroInput } from './components/HeroInput';
import { PlanningModes } from './components/PlanningModes';
import { AgentPipelineExplainer } from './components/AgentPipelineExplainer';
import { AgentActivityModal } from './components/AgentActivityModal';
import { PlanDashboard } from './components/PlanDashboard';
import { ModifyPlanModal } from './components/ModifyPlanModal';
import { SavedPlansDrawer } from './components/SavedPlansDrawer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AgentLog, AgentType, Plan, PlanCategory, PlanInputs, TaskItem, ChecklistItem } from './types';
import { generateAgenticPlan, parseGoalInput } from './services/agentEngine';
import { HYDERABAD_3DAY_PLAN } from './data/demoPlans';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [savedPlans, setSavedPlans] = useState<Plan[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [completedAgents, setCompletedAgents] = useState<AgentType[]>([]);
  const [currentLogs, setCurrentLogs] = useState<AgentLog[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeGoalText, setActiveGoalText] = useState('');

  // Load saved plans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lifepilot_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      } else {
        // Pre-seed with Hyderabad plan for immediate demonstration
        setSavedPlans([HYDERABAD_3DAY_PLAN]);
        localStorage.setItem('lifepilot_saved_plans', JSON.stringify([HYDERABAD_3DAY_PLAN]));
      }
    } catch (e) {
      console.error('Failed to load saved plans', e);
    }
  }, []);

  const handleStartPlanGeneration = async (
    goal: string,
    customInputs?: Partial<PlanInputs>,
    speed: 'fast' | 'normal' | 'instant' = 'normal'
  ) => {
    setIsGenerating(true);
    setActiveGoalText(goal);
    setActiveAgent('planner');
    setCompletedAgents([]);
    setCurrentLogs([]);
    setStatusMessage('Initiating multi-agent consensus pipeline...');
    setIsActivityModalOpen(true);

    try {
      const plan = await generateAgenticPlan(
        goal,
        {
          onAgentStart: (agent, msg) => {
            setActiveAgent(agent);
            setStatusMessage(msg);
          },
          onAgentComplete: (agent, log) => {
            setCompletedAgents((prev) => [...prev, agent]);
            setCurrentLogs((prev) => [...prev, log]);
          },
        },
        customInputs,
        speed
      );

      setCurrentPlan(plan);
      setActiveAgent(null);
      setIsGenerating(false);

      // Auto-close modal after brief delay so user sees all green checkmarks
      setTimeout(() => {
        setIsActivityModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    } catch (err) {
      console.error('Plan generation failed', err);
      setIsGenerating(false);
      setActiveAgent(null);
    }
  };

  const handleSelectPlanningMode = (category: PlanCategory, samplePrompt: string) => {
    const parsed = parseGoalInput(samplePrompt);
    handleStartPlanGeneration(samplePrompt, { ...parsed, category }, 'normal');
  };

  const handleRegenerateCurrentPlan = () => {
    if (!currentPlan) return;
    handleStartPlanGeneration(currentPlan.inputs.goal, currentPlan.inputs, 'fast');
  };

  const handleApplyModifications = (updatedInputs: PlanInputs) => {
    setIsModifyModalOpen(false);
    handleStartPlanGeneration(updatedInputs.goal, updatedInputs, 'fast');
  };

  const handleSaveCurrentPlan = () => {
    if (!currentPlan) return;
    const exists = savedPlans.some((p) => p.id === currentPlan.id);
    let updated: Plan[];
    if (exists) {
      updated = savedPlans.map((p) => (p.id === currentPlan.id ? currentPlan : p));
    } else {
      updated = [currentPlan, ...savedPlans];
    }
    setSavedPlans(updated);
    localStorage.setItem('lifepilot_saved_plans', JSON.stringify(updated));
  };

  const handleDeleteSavedPlan = (planId: string) => {
    const updated = savedPlans.filter((p) => p.id !== planId);
    setSavedPlans(updated);
    localStorage.setItem('lifepilot_saved_plans', JSON.stringify(updated));
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isCurrentPlanSaved = currentPlan ? savedPlans.some((p) => p.id === currentPlan.id) : false;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-400">
        {/* Top Bar adhering to strict 3-zone contract */}
        <Header
          onNewPlanClick={() => {
            setCurrentPlan(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSavedPlans={() => setIsSavedDrawerOpen(true)}
          savedPlansCount={savedPlans.length}
          currentView={currentPlan ? 'plan' : 'home'}
          onNavigateHome={() => setCurrentPlan(null)}
          onScrollToSection={handleScrollToSection}
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isChatOpen={isChatOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentPlan ? (
            <PlanDashboard
              plan={currentPlan}
              onRegenerate={handleRegenerateCurrentPlan}
              onModify={() => setIsModifyModalOpen(true)}
              onSave={handleSaveCurrentPlan}
              isSaved={isCurrentPlanSaved}
              onViewAgentLogs={() => setIsActivityModalOpen(true)}
              onUpdateTasks={(updatedTasks) =>
                setCurrentPlan({ ...currentPlan, tasks: updatedTasks })
              }
              onUpdateChecklist={(updatedChecklist) =>
                setCurrentPlan({ ...currentPlan, checklist: updatedChecklist })
              }
            />
          ) : (
            <>
              {/* Homepage Hero */}
              <HeroInput
                onSubmitGoal={(goal, customInputs, speed) =>
                  handleStartPlanGeneration(goal, customInputs, speed)
                }
                isGenerating={isGenerating}
              />

              {/* Planning Modes Grid */}
              <PlanningModes onSelectMode={handleSelectPlanningMode} />

              {/* Multi-Agent Architecture Explainer */}
              <AgentPipelineExplainer />
            </>
          )}
        </main>

        {/* Quiet Clean Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">LifePilot AI</span>
              <span aria-hidden="true">·</span>
              <span>Agentic Planning Architecture</span>
            </div>
            <p className="text-center sm:text-right">
              Powered by 6 Autonomous Collaborating AI Agents. Built for college & enterprise planning demonstrations.
            </p>
          </div>
        </footer>

        {/* Agent Activity Live Modal / Inspector */}
        <AgentActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          activeAgent={activeAgent}
          completedAgents={completedAgents}
          agentLogs={currentPlan?.agentLogs && currentPlan.agentLogs.length > 0 ? currentPlan.agentLogs : currentLogs}
          currentStatusMessage={statusMessage}
          isGenerating={isGenerating}
          planGoal={activeGoalText || currentPlan?.inputs.goal || ''}
        />

        {/* Modify Plan Constraints Modal */}
        {currentPlan && (
          <ModifyPlanModal
            isOpen={isModifyModalOpen}
            onClose={() => setIsModifyModalOpen(false)}
            currentPlan={currentPlan}
            onApplyModifications={handleApplyModifications}
            isRegenerating={isGenerating}
          />
        )}

        {/* Saved Plans Archive Drawer */}
        <SavedPlansDrawer
          isOpen={isSavedDrawerOpen}
          onClose={() => setIsSavedDrawerOpen(false)}
          savedPlans={savedPlans}
          onSelectPlan={(plan) => {
            setCurrentPlan(plan);
            setIsSavedDrawerOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDeletePlan={handleDeleteSavedPlan}
        />

        {/* LifePilot AI Chatbot connected to n8n Webhook */}
        <ChatbotWidget
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen((prev) => !prev)}
          onLoadGoalIntoPlanner={(goal) => {
            setCurrentPlan(null);
            handleStartPlanGeneration(goal);
          }}
        />
      </div>
    </ThemeProvider>
  );
}
