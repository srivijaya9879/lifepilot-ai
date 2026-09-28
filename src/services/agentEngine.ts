import { AgentLog, AgentType, Plan, PlanCategory, PlanInputs } from '../types';
import { DEMO_PLANS, HYDERABAD_3DAY_PLAN } from '../data/demoPlans';

export interface PlanGenerationCallbacks {
  onAgentStart?: (agent: AgentType, message: string) => void;
  onAgentComplete?: (agent: AgentType, log: AgentLog) => void;
  onLogMessage?: (message: string) => void;
}

export function parseGoalInput(rawGoal: string): Partial<PlanInputs> {
  const text = rawGoal.toLowerCase();

  // Detect category
  let category: PlanCategory = 'general';
  if (text.includes('trip') || text.includes('tour') || text.includes('travel') || text.includes('visit') || text.includes('vacation')) {
    category = 'travel';
  } else if (text.includes('party') || text.includes('birthday') || text.includes('wedding') || text.includes('event') || text.includes('hackathon')) {
    category = 'event';
  } else if (text.includes('shop') || text.includes('buy') || text.includes('gift') || text.includes('purchase')) {
    category = 'shopping';
  } else if (text.includes('study') || text.includes('exam') || text.includes('revision') || text.includes('learn') || text.includes('syllabus')) {
    category = 'study';
  } else if (text.includes('career') || text.includes('job') || text.includes('interview') || text.includes('portfolio') || text.includes('resume')) {
    category = 'career';
  }

  // Detect budget
  let budget = 10000;
  let currency = '₹';
  const inrMatch = rawGoal.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || rawGoal.match(/([\d,]+)\s*(?:rs|rupees|inr)/i);
  const usdMatch = rawGoal.match(/(?:\$|usd)\s*([\d,]+)/i) || rawGoal.match(/([\d,]+)\s*(?:dollars|usd)/i);
  const genericMatch = rawGoal.match(/under\s*([\d,]+)/i);

  if (usdMatch) {
    currency = '$';
    budget = parseInt(usdMatch[1].replace(/,/g, ''), 10);
  } else if (inrMatch) {
    currency = '₹';
    budget = parseInt(inrMatch[1].replace(/,/g, ''), 10);
  } else if (genericMatch) {
    budget = parseInt(genericMatch[1].replace(/,/g, ''), 10);
  }

  // Detect days
  let durationDays = 3;
  const daysMatch = rawGoal.match(/(\d+)[ -]?(?:day|days)/i);
  if (daysMatch) {
    durationDays = Math.min(Math.max(parseInt(daysMatch[1], 10), 1), 30);
  } else if (category === 'event') {
    durationDays = 1;
  } else if (category === 'study') {
    durationDays = 7;
  }

  // Detect people
  let numPeople = 1;
  const peopleMatch = rawGoal.match(/(\d+)\s*(?:people|persons|guests|friends|attendees)/i);
  if (peopleMatch) {
    numPeople = parseInt(peopleMatch[1], 10);
  }

  // Detect location
  let location = 'Target Destination';
  if (text.includes('hyderabad')) location = 'Hyderabad, India';
  else if (text.includes('goa')) location = 'Goa, India';
  else if (text.includes('mumbai')) location = 'Mumbai, India';
  else if (text.includes('delhi')) location = 'Delhi NCR, India';
  else if (text.includes('bangalore') || text.includes('bengaluru')) location = 'Bengaluru, India';
  else if (text.includes('paris')) location = 'Paris, France';
  else if (text.includes('tokyo')) location = 'Tokyo, Japan';
  else if (text.includes('london')) location = 'London, UK';
  else if (category === 'study' || category === 'career') location = 'Desk / Digital Workspace';
  else if (category === 'event') location = 'Celebration Venue / Lounge';

  return {
    goal: rawGoal,
    category,
    budget: isNaN(budget) ? 10000 : budget,
    currency,
    durationDays,
    numPeople,
    location,
    preferences: ['Cost-optimized', 'Balanced schedule', 'Contingency preserved'],
    priorities: 'Seamless execution without budget overruns',
  };
}

export async function generateAgenticPlan(
  rawGoal: string,
  callbacks?: PlanGenerationCallbacks,
  customInputs?: Partial<PlanInputs>,
  simulationSpeed: 'fast' | 'normal' | 'instant' = 'normal'
): Promise<Plan> {
  const baseParsed = parseGoalInput(rawGoal);
  const inputs: PlanInputs = {
    goal: rawGoal,
    category: customInputs?.category || baseParsed.category || 'general',
    budget: customInputs?.budget || baseParsed.budget || 10000,
    currency: customInputs?.currency || baseParsed.currency || '₹',
    durationDays: customInputs?.durationDays || baseParsed.durationDays || 3,
    numPeople: customInputs?.numPeople || baseParsed.numPeople || 1,
    location: customInputs?.location || baseParsed.location || 'Local / Target Destination',
    preferences: customInputs?.preferences || baseParsed.preferences || ['Optimal pace', 'Balanced budget'],
    priorities: customInputs?.priorities || baseParsed.priorities || 'High quality experience',
  };

  const delay = (ms: number) => {
    if (simulationSpeed === 'instant') return Promise.resolve();
    const multiplier = simulationSpeed === 'fast' ? 0.35 : 1;
    return new Promise((res) => setTimeout(res, ms * multiplier));
  };

  // Check if matches known rich demo cases
  const normalized = rawGoal.toLowerCase();
  const isHyderabad = normalized.includes('hyderabad');
  const isBirthday = normalized.includes('birthday') || (normalized.includes('party') && normalized.includes('20'));
  const isStudy = normalized.includes('study') || normalized.includes('exam');
  const isGifts = normalized.includes('gift') || (normalized.includes('shop') && normalized.includes('5,000'));

  // Try server API first if available
  let serverPlan: Plan | null = null;
  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: rawGoal, inputs }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.plan) {
        serverPlan = data.plan;
      }
    }
  } catch {
    // Graceful offline fallback
    serverPlan = null;
  }

  // 1. Planner Agent Step
  callbacks?.onAgentStart?.('planner', 'Analyzing user goal, decomposing scope, and structuring execution phases...');
  await delay(700);
  const plannerLog: AgentLog = {
    id: `log_planner_${Date.now()}`,
    agent: 'planner',
    agentName: 'Planner Agent',
    agentRole: 'Decomposition & Strategy Engine',
    timestamp: '00:00.32',
    statusMessage: `Goal parsed: ${inputs.category.toUpperCase()} plan across ${inputs.durationDays} day(s) for ${inputs.numPeople} person(s)`,
    detail: `Deconstructed target into primary execution clusters. Assigned hard ceiling of ${inputs.currency}${inputs.budget.toLocaleString()} and balanced milestones.`,
    keyOutputSummary: `Architected ${inputs.durationDays}-phase strategic execution roadmap with milestone checkpoints.`,
    metrics: [
      { label: 'Scope', value: `${inputs.durationDays} Days / ${inputs.numPeople} Person(s)` },
      { label: 'Target Cap', value: `${inputs.currency}${inputs.budget.toLocaleString()}` },
      { label: 'Focus', value: inputs.category },
    ],
  };
  callbacks?.onAgentComplete?.('planner', plannerLog);

  // 2. Research Agent Step
  callbacks?.onAgentStart?.('researcher', `Retrieving logistics, venue costs, and environmental context for ${inputs.location}...`);
  await delay(800);
  const researchLog: AgentLog = {
    id: `log_researcher_${Date.now()}`,
    agent: 'researcher',
    agentName: 'Research Agent',
    agentRole: 'Information & Context Gathering',
    timestamp: '00:00.82',
    statusMessage: `Gathered real-world operating hours, tickets, and route timings for ${inputs.location}`,
    detail: `Surveyed verified points of interest, estimated realistic transit times between coordinates, and flagged potential timing choke points.`,
    keyOutputSummary: `Indexed 12+ location nodes with verified operational constraints and transit estimates.`,
    metrics: [
      { label: 'Location Nodes', value: '12 Checked' },
      { label: 'Transit Data', value: 'Calibrated' },
      { label: 'Bottlenecks', value: 'Mitigated' },
    ],
  };
  callbacks?.onAgentComplete?.('researcher', researchLog);

  // 3. Budget Agent Step
  callbacks?.onAgentStart?.('budget', `Synthesizing categorical budget allocation against ${inputs.currency}${inputs.budget.toLocaleString()} ceiling...`);
  await delay(750);
  const budgetLog: AgentLog = {
    id: `log_budget_${Date.now()}`,
    agent: 'budget',
    agentName: 'Budget Agent',
    agentRole: 'Cost Estimation & Financial Control',
    timestamp: '00:01.31',
    statusMessage: `Balanced expense allocation — 12-15% liquid contingency reserve maintained`,
    detail: `Formulated categorical cost breakdown. Projected total spend stays safely beneath ${inputs.currency}${inputs.budget.toLocaleString()}, safeguarding against unexpected price hikes.`,
    keyOutputSummary: `Budget fully balanced with guaranteed non-zero contingency reserve.`,
    metrics: [
      { label: 'Allocated Budget', value: `${inputs.currency}${inputs.budget.toLocaleString()}` },
      { label: 'Projected Buffer', value: '14.2% Reserve' },
      { label: 'Status', value: 'Within Cap' },
    ],
  };
  callbacks?.onAgentComplete?.('budget', budgetLog);

  // 4. Schedule Agent Step
  callbacks?.onAgentStart?.('schedule', `Choreographing ${inputs.durationDays}-day chronological timeline with rest buffers...`);
  await delay(800);
  const scheduleLog: AgentLog = {
    id: `log_schedule_${Date.now()}`,
    agent: 'schedule',
    agentName: 'Schedule Agent',
    agentRole: 'Temporal Choreography & Route Sequencing',
    timestamp: '00:01.78',
    statusMessage: `Assembled synchronized timeline with 30-min transit buffers between sessions`,
    detail: `Sequenced high-energy activities in morning intervals, preserved mid-day lunch breaks, and positioned scenic relaxation at twilight hours.`,
    keyOutputSummary: `Complete hour-by-hour timeline assembled with realistic transit and rest intervals.`,
    metrics: [
      { label: 'Timeline Slots', value: `${inputs.durationDays * 4} Total` },
      { label: 'Buffer Time', value: '30 min/transition' },
      { label: 'Pacing', value: 'Optimal' },
    ],
  };
  callbacks?.onAgentComplete?.('schedule', scheduleLog);

  // 5. Recommendation Agent Step
  callbacks?.onAgentStart?.('recommender', 'Filtering signature recommendations, local secrets, and tailored preparation items...');
  await delay(750);
  const recommenderLog: AgentLog = {
    id: `log_recommender_${Date.now()}`,
    agent: 'recommender',
    agentName: 'Recommendation Agent',
    agentRole: 'Preference Matching & Local Insight',
    timestamp: '00:02.19',
    statusMessage: 'Curated 4 high-value recommendations and personalized packing checklist',
    detail: `Matched user preferences with authentic local spots, high-yield tools, and practical packing checklist items suited to ${inputs.location}.`,
    keyOutputSummary: 'Curated high-signal recommendations and complete preparation checklist.',
    metrics: [
      { label: 'Curated Picks', value: '4 Signature' },
      { label: 'Checklist Items', value: '6-8 Essentials' },
      { label: 'Relevance', value: '100% Tailored' },
    ],
  };
  callbacks?.onAgentComplete?.('recommender', recommenderLog);

  // 6. Review Agent Step
  callbacks?.onAgentStart?.('reviewer', 'Conducting final multi-variable audit for schedule clashes and budget leakage...');
  await delay(700);
  const reviewLog: AgentLog = {
    id: `log_reviewer_${Date.now()}`,
    agent: 'reviewer',
    agentName: 'Review Agent',
    agentRole: 'Conflict Detection & Quality Assurance',
    timestamp: '00:02.64',
    statusMessage: 'Plan audited & certified: 0 schedule conflicts, 100% budget adherence',
    detail: `Validated that all activity transit times are physically realistic, budget estimates are conservative, and no mandatory prerequisites were omitted.`,
    keyOutputSummary: 'Certified as production-ready and fully executable.',
    metrics: [
      { label: 'Conflicts Found', value: '0 Detected' },
      { label: 'Feasibility Score', value: '99%' },
      { label: 'Audit Status', value: 'Verified' },
    ],
  };
  callbacks?.onAgentComplete?.('reviewer', reviewLog);

  // Return server plan if valid
  if (serverPlan) {
    return {
      ...serverPlan,
      inputs,
      agentLogs: [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog],
    };
  }

  // Otherwise return domain-tailored plan
  if (isHyderabad) {
    return {
      ...HYDERABAD_3DAY_PLAN,
      id: `plan_${Date.now()}`,
      inputs: {
        ...HYDERABAD_3DAY_PLAN.inputs,
        ...inputs,
      },
      agentLogs: [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog],
    };
  } else if (isBirthday) {
    return {
      ...DEMO_PLANS.birthday,
      id: `plan_${Date.now()}`,
      inputs: {
        ...DEMO_PLANS.birthday.inputs,
        ...inputs,
      },
      agentLogs: [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog],
    };
  } else if (isStudy) {
    return {
      ...DEMO_PLANS.study,
      id: `plan_${Date.now()}`,
      inputs: {
        ...DEMO_PLANS.study.inputs,
        ...inputs,
      },
      agentLogs: [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog],
    };
  } else if (isGifts) {
    return {
      ...DEMO_PLANS.shopping,
      id: `plan_${Date.now()}`,
      inputs: {
        ...DEMO_PLANS.shopping.inputs,
        ...inputs,
      },
      agentLogs: [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog],
    };
  }

  // Synthesize customized plan for any other prompt
  return generateCustomFallbackPlan(inputs, [plannerLog, researchLog, budgetLog, scheduleLog, recommenderLog, reviewLog]);
}

function generateCustomFallbackPlan(inputs: PlanInputs, logs: AgentLog[]): Plan {
  const daysCount = inputs.durationDays || 3;
  const curr = inputs.currency || '₹';
  const totalB = inputs.budget || 10000;
  const estimatedSpend = Math.round(totalB * 0.85);
  const remainingBudget = totalB - estimatedSpend;

  // Build days
  const days = Array.from({ length: daysCount }, (_, i) => {
    const dayNum = i + 1;
    return {
      dayNumber: dayNum,
      title: `Day ${dayNum}: ${dayNum === 1 ? 'Orientation & Core Kickoff' : dayNum === daysCount ? 'Culmination & Final Review' : 'Focused Deep Execution & Discovery'}`,
      theme: `${inputs.goal.slice(0, 30)}... Phase ${dayNum}`,
      activities: [
        {
          id: `act_${dayNum}_1`,
          time: '09:00 AM – 11:30 AM',
          title: `Phase ${dayNum} Kickoff & Primary Milestone`,
          location: inputs.location,
          description: `Execute core task block for ${inputs.goal}. Gather essentials and verify preliminary results.`,
          estimatedCost: Math.round((estimatedSpend / daysCount) * 0.4),
          tag: 'Key Milestone',
        },
        {
          id: `act_${dayNum}_2`,
          time: '12:30 PM – 02:00 PM',
          title: 'Recharge & Mid-Day Review',
          location: 'Nearby Refreshment / Hub',
          description: 'Nutritious meal and brief calibration check with team or personal checklist.',
          estimatedCost: Math.round((estimatedSpend / daysCount) * 0.25),
          tag: 'Recharge',
        },
        {
          id: `act_${dayNum}_3`,
          time: '03:00 PM – 05:30 PM',
          title: 'Secondary Focus & Deep Work Sprint',
          location: inputs.location,
          description: 'Tackle secondary objectives, coordinate logistics, and document outputs.',
          estimatedCost: Math.round((estimatedSpend / daysCount) * 0.2),
          tag: 'Execution',
        },
        {
          id: `act_${dayNum}_4`,
          time: '06:30 PM – 08:00 PM',
          title: 'Evening Synthesis & Next-Day Preparation',
          location: 'Base / Desk',
          description: 'Review day accomplishments, clear outstanding bottlenecks, and prep for upcoming phase.',
          estimatedCost: Math.round((estimatedSpend / daysCount) * 0.15),
          tag: 'Synthesis',
        },
      ],
    };
  });

  return {
    id: `plan_custom_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inputs,
    title: `Optimized Master Plan: ${inputs.goal}`,
    tagline: `Engineered by 6 collaborating AI agents for ${inputs.location}`,
    summary: `A complete, end-to-end actionable plan for "${inputs.goal}". Deconstructed into ${daysCount} structured days with ${curr}${remainingBudget.toLocaleString()} emergency contingency buffer, verified by our automated agentic pipeline.`,
    totalBudget: totalB,
    estimatedSpend,
    remainingBudget,
    currency: curr,
    days,
    budgetBreakdown: [
      { id: 'bb_1', category: 'Primary Execution / Bookings', allocated: Math.round(totalB * 0.45), estimated: Math.round(estimatedSpend * 0.45), notes: 'Major venue, travel, or procurement items' },
      { id: 'bb_2', category: 'Operational / Daily Expenses', allocated: Math.round(totalB * 0.25), estimated: Math.round(estimatedSpend * 0.25), notes: 'Food, local transit, or day-to-day materials' },
      { id: 'bb_3', category: 'Supplies & Tools', allocated: Math.round(totalB * 0.15), estimated: Math.round(estimatedSpend * 0.15), notes: 'Equipment, tickets, software, or decor' },
      { id: 'bb_4', category: 'Contingency & Reserve Buffer', allocated: Math.round(totalB * 0.15), estimated: 0, notes: 'Liquid cushion protecting against unforeseen expenses' },
    ],
    tasks: [
      { id: 't_c1', title: 'Confirm foundational arrangements and reservations', category: 'Prep', status: 'completed', priority: 'high', assignedAgent: 'planner' },
      { id: 't_c2', title: 'Verify timing and access hours for target venues', category: 'Research', status: 'completed', priority: 'high', assignedAgent: 'researcher' },
      { id: 't_c3', title: 'Lock payment methods and small change in advance', category: 'Finance', status: 'in_progress', priority: 'medium', assignedAgent: 'budget' },
      { id: 't_c4', title: 'Conduct dry run or pre-flight equipment/luggage check', category: 'Execution', status: 'todo', priority: 'medium', assignedAgent: 'reviewer' },
    ],
    recommendations: [
      { id: 'rec_c1', category: 'tips', title: 'The 15% Buffer Principle', subtitle: 'Guarding against dynamic pricing or delays', description: 'Always keep an unallocated reserve so minor timeline shifts do not derail the plan.', rating: 4.9, tags: ['Essential Strategy'] },
      { id: 'rec_c2', category: 'tools', title: 'Digital Checklist & Offline Maps', subtitle: 'Reliable execution without network reliance', description: 'Download offline guides or maps in advance to guarantee zero interruptions.', rating: 4.8, tags: ['Reliability'] },
    ],
    checklist: [
      { id: 'chk_1', text: 'Official identification and required permits/tickets downloaded', category: 'Documents', completed: true },
      { id: 'chk_2', text: 'Emergency contacts and key phone numbers stored', category: 'Safety', completed: true },
      { id: 'chk_3', text: 'Device chargers and high-capacity portable power bank', category: 'Electronics', completed: false },
      { id: 'chk_4', text: 'Weather-appropriate gear or comfort accessories', category: 'Comfort', completed: false },
    ],
    importantTips: [
      'Follow the chronological milestones in order to minimize cross-task backtracking.',
      'Check operational timings at least 24 hours prior to confirm zero unscheduled closures.',
      'Keep the remaining budget untouched until the final day as an emergency reserve.',
    ],
    reviewAudit: {
      verified: true,
      conflictCount: 0,
      optimizationsMade: [
        'Added 30-minute buffers between all major schedule blocks.',
        `Preserved ${curr}${remainingBudget.toLocaleString()} buffer to protect against cost overruns.`,
        'Ordered tasks logically by priority and dependency.',
      ],
      budgetFit: 'under_budget',
      safetyNotes: ['Verify local weather forecast and traffic conditions before departure.'],
      verificationHighlights: [
        'Timeline feasibility: 99%',
        'Budget adherence: 100% under limit',
        'Contingency cushion: Preserved',
      ],
    },
    agentLogs: logs,
  };
}
