import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health / Status check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'LifePilot AI Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// n8n Chatbot Webhook proxy
const N8N_WEBHOOK_URL = 'https://srivijaya9879.app.n8n.cloud/webhook/c0b03789-a8b9-4ca8-9195-08da74578125/chat';

app.post('/api/n8n-chat', async (req: Request, res: Response) => {
  const { message, sessionId, action } = req.body;

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action || 'sendMessage',
        sessionId: sessionId || `lifepilot-${Date.now()}`,
        chatInput: message || '',
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { output: responseText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || 'Workflow execution error',
        raw: data,
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error forwarding to n8n webhook:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to reach n8n webhook service',
    });
  }
});

// Plan generation endpoint using Gemini when key is present
app.post('/api/plan', async (req: Request, res: Response) => {
  const { goal, inputs } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({
      fallback: true,
      message: 'No GEMINI_API_KEY set, using built-in agent pipeline simulation.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
You are the central coordinator for LifePilot AI, an Agentic AI planning system.
Given the user's goal: "${goal}"
Additional parameters:
Category: ${inputs?.category || 'general'}
Budget: ${inputs?.currency || '₹'}${inputs?.budget || 10000}
Duration: ${inputs?.durationDays || 3} days
People: ${inputs?.numPeople || 1}
Location: ${inputs?.location || 'Target Destination'}

Return a strictly valid JSON object representing the final plan synthesized by the 6 agents:
Planner Agent, Research Agent, Budget Agent, Schedule Agent, Recommendation Agent, Review Agent.

JSON format required:
{
  "title": string,
  "tagline": string,
  "summary": string,
  "totalBudget": number,
  "estimatedSpend": number,
  "remainingBudget": number,
  "currency": string,
  "days": [
    {
      "dayNumber": number,
      "title": string,
      "theme": string,
      "activities": [
        {
          "id": string,
          "time": string,
          "title": string,
          "location": string,
          "description": string,
          "estimatedCost": number,
          "tag": string
        }
      ]
    }
  ],
  "budgetBreakdown": [
    {
      "id": string,
      "category": string,
      "allocated": number,
      "estimated": number,
      "notes": string
    }
  ],
  "tasks": [
    {
      "id": string,
      "title": string,
      "category": string,
      "status": "todo" | "in_progress" | "completed",
      "priority": "high" | "medium" | "low",
      "assignedAgent": "planner" | "researcher" | "budget" | "schedule" | "recommender" | "reviewer"
    }
  ],
  "recommendations": [
    {
      "id": string,
      "category": "places" | "food" | "transport" | "tools" | "resources" | "tips",
      "title": string,
      "subtitle": string,
      "description": string,
      "rating": number,
      "priceHint": string,
      "tags": [string]
    }
  ],
  "checklist": [
    {
      "id": string,
      "text": string,
      "category": string,
      "completed": boolean
    }
  ],
  "importantTips": [string],
  "reviewAudit": {
    "verified": true,
    "conflictCount": 0,
    "optimizationsMade": [string],
    "budgetFit": "under_budget",
    "safetyNotes": [string],
    "verificationHighlights": [string]
  }
}
Do not wrap in markdown quotes if possible, output pure JSON only. Ensure estimatedSpend + remainingBudget == totalBudget.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json({ plan: parsed });
  } catch (error: any) {
    console.warn('Gemini API call failed or timed out, returning fallback indicator:', error?.message);
    return res.status(200).json({
      fallback: true,
      error: error?.message,
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifePilot AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
