import { ChatMessage, ChatContextPayload, ChatResponse, AIStatus } from '../types/chat';

const CHAT_STORAGE_KEY = 'rootify_ai_chat_history';

export const aiChatService = {
  // Load conversation history from localStorage
  getStoredMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save conversation history to localStorage
  saveMessages(messages: ChatMessage[]): void {
    try {
      // Keep only last 50 messages to prevent storage bloat
      const trimmed = messages.slice(-50);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save chat history to localStorage:', e);
    }
  },

  // Clear conversation history
  clearMessages(): void {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear chat history:', e);
    }
  },

  // Check backend AI status
  async checkStatus(): Promise<AIStatus> {
    try {
      const res = await fetch('/api/chat/status', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Unable to query /api/chat/status:', e);
    }
    return {
      status: 'online',
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence',
      hasApiKey: false
    };
  },

  // Send message to backend /api/chat
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    context: ChatContextPayload = {}
  ): Promise<ChatResponse> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty.');
    }

    // Format previous messages for LLM context
    const messagesPayload = history
      .filter(m => m.sender === 'user' || m.sender === 'assistant')
      .map(m => ({
        role: m.sender === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

    // Add latest user query
    messagesPayload.push({
      role: 'user',
      content: trimmed
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesPayload,
          context: context
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server returned ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try asking again.');
      }
      throw error;
    }
  },

  // Generate initial welcome message tailored to current user role and name
  createWelcomeMessage(userName?: string, role = 'customer'): ChatMessage {
    const greeting = userName ? `Hello **${userName}**!` : 'Mog Asum! (Warm Greetings!)';
    let roleSnippet = '';

    if (role === 'vendor') {
      roleSnippet = '\n\nAs a **Rootify Vendor**, I can help you with catalog management, product origin verifications, order fulfillment steps, and settlement eligibility.';
    } else if (role === 'delivery') {
      roleSnippet = '\n\nAs a **Delivery Partner**, I can help you with Goa taluka pickup hubs, route coordination, and order stage transitions.';
    } else if (role === 'admin') {
      roleSnippet = '\n\nAs an **Administrator**, I can assist you with vendor compliance audits (FSSAI/Panchayat NOC), dispute policies, and platform analytics.';
    } else {
      roleSnippet = '\n\nI can recommend authentic delicacies (Bebinca, Dodol, Goan Choriz), share details on village Self-Help Groups like the Divar Island Mahila Mandal, check delivery in your taluka, or track your orders.';
    }

    return {
      id: 'welcome-msg',
      sender: 'assistant',
      content: `${greeting} I am **Rooty**, your authentic Goan marketplace guide on **ROOTIFY**. 🌿${roleSnippet}\n\n*How can I help you today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      provider: 'rootify-engine',
      model: 'Rootify Assistant'
    };
  }
};
