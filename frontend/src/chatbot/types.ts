export type ChatSender = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  provider?: string;
  model?: string;
  suggestedActions?: Array<{
    label: string;
    path?: string;
    action?: string;
  }>;
}

export interface ChatContextPayload {
  role?: string;
  userName?: string;
  userEmail?: string;
  currentTaluka?: string;
  selectedLocation?: {
    id: string;
    name: string;
    taluka: string;
    district: string;
  };
  cartCount?: number;
  cartSubtotal?: number;
  cartItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    vendorName?: string;
  }>;
  activeOrders?: Array<{
    orderNumber: string;
    status: string;
    total: number;
    items?: string;
  }>;
  currentPath?: string;
}

export interface ChatResponse {
  reply: string;
  provider: 'gemini' | 'openai' | 'rootify-engine';
  model: string;
  actionSuggestions?: Array<{
    label: string;
    path?: string;
    action?: string;
  }>;
}

export interface AIStatus {
  status: string;
  provider: 'gemini' | 'openai' | 'rootify-engine';
  model: string;
  hasApiKey: boolean;
}
