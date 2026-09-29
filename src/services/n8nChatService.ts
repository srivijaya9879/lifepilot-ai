export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const DIRECT_N8N_URL = 'https://srivijaya9879.app.n8n.cloud/webhook/c0b03789-a8b9-4ca8-9195-08da74578125/chat';

export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<string> {
  const payload = {
    action: 'sendMessage',
    sessionId,
    message,
    chatInput: message,
  };

  // Try server proxy first to avoid CORS or network barriers
  try {
    const res = await fetch('/api/n8n-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return extractBotOutput(data);
    }
  } catch (proxyErr) {
    console.warn('Proxy route /api/n8n-chat error, trying direct fetch:', proxyErr);
  }

  // Fallback to direct n8n webhook request
  try {
    const directRes = await fetch(DIRECT_N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId,
        chatInput: message,
      }),
    });

    if (!directRes.ok) {
      const errText = await directRes.text();
      throw new Error(`n8n webhook responded with status ${directRes.status}: ${errText}`);
    }

    const directData = await directRes.json();
    return extractBotOutput(directData);
  } catch (directErr: any) {
    console.error('Direct n8n fetch failed:', directErr);
    throw new Error(directErr?.message || 'Could not communicate with the n8n chatbot.');
  }
}

function extractBotOutput(data: any): string {
  if (!data) return 'Received empty response from assistant.';
  if (typeof data === 'string') return data;
  if (data.output) return data.output;
  if (data.text) return data.text;
  if (data.message) return data.message;
  if (data.response) return data.response;
  if (Array.isArray(data) && data.length > 0) {
    return extractBotOutput(data[0]);
  }
  return JSON.stringify(data);
}
