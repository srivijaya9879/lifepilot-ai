export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  canRetry?: boolean;
  userPrompt?: string;
}

const DIRECT_N8N_URL = 'https://srivijaya9879.app.n8n.cloud/webhook/c0b03789-a8b9-4ca8-9195-08da74578125/chat';

export async function sendChatMessage(
  message: string,
  sessionId: string,
  retryWithoutSession = false
): Promise<string> {
  const cleanMessage = message.trim();
  if (!cleanMessage) {
    throw new Error('Message cannot be empty.');
  }

  const effectiveSessionId = retryWithoutSession
    ? `lifepilot-fresh-${Date.now()}`
    : sessionId;

  const payload = {
    action: 'sendMessage',
    sessionId: effectiveSessionId,
    message: cleanMessage,
    chatInput: cleanMessage,
  };

  // 1. Try server proxy route first
  let proxyError: string | null = null;
  try {
    const res = await fetch('/api/n8n-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && !data.error && data.output) {
      return extractBotOutput(data);
    }

    if (data.error || !res.ok) {
      proxyError = data.error || (data.message ? data.message : `Server returned status ${res.status}`);
    }
  } catch (err: any) {
    proxyError = err?.message || 'Proxy fetch failed';
  }

  // 2. Try direct fetch to n8n webhook
  try {
    const directRes = await fetch(DIRECT_N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: effectiveSessionId,
        chatInput: cleanMessage,
      }),
    });

    const directData = await directRes.json().catch(async () => {
      const text = await directRes.text();
      return { output: text };
    });

    if (directRes.ok && directData && !directData.message?.includes('Error in workflow')) {
      return extractBotOutput(directData);
    }

    if (directData?.message === 'Error in workflow' || directRes.status === 500) {
      throw new Error(
        'WORKFLOW_EXECUTION_ERROR: The n8n workflow encountered an execution error. This usually happens when an AI model node in n8n (OpenAI/Gemini/Anthropic key) is rate-limited, times out, or when n8n chat memory buffer overflows.'
      );
    }
  } catch (directErr: any) {
    // If it's our designated workflow error, rethrow it clearly
    if (directErr?.message?.includes('WORKFLOW_EXECUTION_ERROR')) {
      throw directErr;
    }
    console.warn('Direct n8n fetch failed:', directErr);
  }

  // If proxy reported workflow error
  if (proxyError && proxyError.includes('Error in workflow')) {
    throw new Error(
      'WORKFLOW_EXECUTION_ERROR: The n8n workflow encountered an execution error. This usually happens when an AI model node in n8n (OpenAI/Gemini/Anthropic key) is rate-limited, times out, or when n8n chat memory buffer overflows.'
    );
  }

  throw new Error(
    proxyError || 'Could not communicate with n8n chatbot. Please check your network connection.'
  );
}

function extractBotOutput(data: any): string {
  if (!data) return 'Received empty response from assistant.';
  if (typeof data === 'string') return data;
  if (data.output) return data.output;
  if (data.text) return data.text;
  if (data.message && data.message !== 'Error in workflow') return data.message;
  if (data.response) return data.response;
  if (Array.isArray(data) && data.length > 0) {
    return extractBotOutput(data[0]);
  }
  return JSON.stringify(data);
}
