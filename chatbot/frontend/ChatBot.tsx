import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useGoaLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { aiChatService } from '../../services/aiChatService';
import { ChatMessage, AIStatus } from '../../types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { SuggestedPrompts } from './SuggestedPrompts';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Sparkles,
  Bot,
  Info,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

export const ChatBot: React.FC = () => {
  const { user, role } = useAuth();
  const { currentLocation } = useGoaLocation();
  const { items: cartItems, subtotal: cartSubtotal } = useCart();
  const { orders } = useOrders();
  const routerLocation = useRouterLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    status: 'online',
    provider: 'rootify-engine',
    model: 'Rootify Assistant',
    hasApiKey: false,
  });
  const [showInfo, setShowInfo] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved chat history or create initial welcome message
  useEffect(() => {
    const saved = aiChatService.getStoredMessages();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      const welcome = aiChatService.createWelcomeMessage(user?.name, role);
      setMessages([welcome]);
      aiChatService.saveMessages([welcome]);
    }

    // Check backend AI status
    aiChatService.checkStatus().then(status => {
      setAiStatus(status);
    });
  }, [user?.name, role]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      // Focus textarea on open
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages, isLoading]);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle clicking outside to light-dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target as Node)
      ) {
        // Only close if click wasn't on the launcher button
        const launcher = document.getElementById('rooty-chat-launcher');
        if (!launcher?.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Gather current user context payload
  const buildContextPayload = () => {
    return {
      role: role || 'guest',
      userName: user?.name,
      userEmail: user?.email,
      currentTaluka: currentLocation?.taluka,
      selectedLocation: currentLocation,
      cartCount: cartItems.length,
      cartSubtotal: cartSubtotal,
      cartItems: cartItems.map(i => ({
        id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        vendorName: i.product.vendorName,
      })),
      activeOrders: orders.slice(0, 3).map(o => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.totalAmount,
        items: o.items.map(it => it.productName).join(', '),
      })),
      currentPath: routerLocation.pathname,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    aiChatService.saveMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContextPayload();
      const response = await aiChatService.sendMessage(messageText, updatedMessages, context);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        provider: response.provider,
        model: response.model,
        suggestedActions: response.actionSuggestions,
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      aiChatService.saveMessages(finalMessages);
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: error.message || 'Sorry, I encountered an issue connecting to the assistant. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      aiChatService.saveMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = (failedMsg: ChatMessage) => {
    // Find the previous user message
    const msgIndex = messages.findIndex(m => m.id === failedMsg.id);
    if (msgIndex > 0) {
      const prevUserMsg = messages[msgIndex - 1];
      if (prevUserMsg && prevUserMsg.sender === 'user') {
        // Remove failed message and retry
        const filtered = messages.filter(m => m.id !== failedMsg.id);
        setMessages(filtered);
        handleSendMessage(prevUserMsg.content);
      }
    }
  };

  const handleClearChat = () => {
    aiChatService.clearMessages();
    const welcome = aiChatService.createWelcomeMessage(user?.name, role);
    setMessages([welcome]);
    aiChatService.saveMessages([welcome]);
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {/* Positioned above MobileNav (bottom-20) on mobile, and bottom-6 on md+ */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        {!isOpen && (
          <button
            id="rooty-chat-launcher"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Rooty Goan Marketplace AI Assistant"
            className="group relative flex items-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white pl-3.5 pr-4 py-3 rounded-full shadow-modal hover:shadow-card-hover transition-all duration-300 transform active:scale-95 border-2 border-emerald-400/40"
          >
            {/* Animated Ping Glow */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-terracotta-500 border-2 border-white"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide flex items-center gap-1 font-display">
                Ask Rooty
                <span className="text-emerald-300 text-[10px]">🌿</span>
              </span>
              <span className="text-[10px] text-emerald-100 font-medium hidden sm:inline">
                Goan AI Guide
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Responsive Chat Window Overlay */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          role="dialog"
          aria-label="Rooty Goan Marketplace AI Assistant"
          aria-modal="true"
          className="fixed z-50 bottom-16 md:bottom-6 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[410px] md:w-[430px] h-[82vh] max-h-[640px] min-h-[460px] bg-sand-50 rounded-2xl shadow-modal border border-sand-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-brand-700 text-white px-4 py-3 flex items-center justify-between border-b border-brand-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-200" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-brand-700 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide font-display">Rooty</h3>
                  <span className="bg-emerald-500/20 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
                    AI Guide
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-tight">
                  Authentic Goan Marketplace & Orders
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              {/* Info / Provider badge */}
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                title="AI Model Info"
                className="text-emerald-200 hover:text-white hover:bg-brand-800/80 p-1.5 rounded-lg transition"
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Clear Chat History"
                className="text-emerald-200 hover:text-white hover:bg-brand-800/80 p-1.5 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Minimize / Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat (Esc)"
                className="text-emerald-200 hover:text-white hover:bg-brand-800/80 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Info Dropdown Banner */}
          {showInfo && (
            <div className="bg-brand-50 border-b border-brand-200 px-3.5 py-2.5 text-xs text-charcoal-800 flex flex-col gap-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-semibold text-brand-900">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Provider: {aiStatus.provider === 'gemini' ? 'Google Gemini API' : aiStatus.provider === 'openai' ? 'OpenAI' : 'Rootify Grounded AI'}
                </span>
                <span className="text-[10px] bg-brand-200/70 text-brand-900 px-1.5 py-0.5 rounded">
                  {aiStatus.hasApiKey ? 'Live LLM Active' : 'Marketplace Engine'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                {aiStatus.hasApiKey
                  ? `Connected to ${aiStatus.model}. Rootify catalog and live user context are dynamically injected into prompts.`
                  : 'Currently answering with Rootify verified domain intelligence. To enable Google Gemini streaming, add GEMINI_API_KEY to frontend/.env.'}
              </p>
            </div>
          )}

          {/* Clear Confirmation Modal Bar */}
          {showClearConfirm && (
            <div className="bg-sand-200 border-b border-sand-300 px-3 py-2 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <span className="text-charcoal-800 font-medium">Clear conversation history?</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded font-semibold text-[11px] transition"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="bg-sand-300 hover:bg-sand-400 text-charcoal-800 px-2 py-0.5 rounded font-medium text-[11px] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onRetry={handleRetry}
                onLinkClick={() => {
                  // If on mobile, close chat when navigating to a product/category link
                  if (window.innerWidth < 640) {
                    setIsOpen(false);
                  }
                }}
              />
            ))}

            {/* Suggested Prompts shown below welcome message or at conversation start */}
            {messages.length <= 2 && (
              <SuggestedPrompts
                role={role}
                onSelectPrompt={(text) => handleSendMessage(text)}
              />
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 py-2 px-1 text-charcoal-500 text-xs">
                <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center border border-brand-800">
                  <Bot className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div className="bg-white border border-sand-200 text-charcoal-700 px-3 py-2 rounded-2xl rounded-tl-sm shadow-subtle flex items-center gap-1.5">
                  <span className="text-xs font-medium text-brand-800">Rooty is thinking</span>
                  <span className="flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Chips Bar (Taluka, Cart, Orders) */}
          <div className="px-3.5 py-1.5 bg-sand-100/90 border-t border-sand-200 text-[11px] text-charcoal-600 flex items-center justify-between">
            <span className="truncate">
              📍 <strong>{currentLocation?.taluka || 'Tiswadi'}</strong>
              {cartItems.length > 0 && ` • 🛒 ${cartItems.length} items (₹${cartSubtotal})`}
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage(`Show me recommendations for ${currentLocation?.taluka || 'Goa'}`)}
              className="text-brand-700 hover:text-brand-900 font-semibold hover:underline flex-shrink-0 ml-2"
            >
              Recommend
            </button>
          </div>

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-sand-300">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Bebinca, spices, delivery, orders... (Enter to send)"
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none bg-sand-50 border border-sand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 outline-none max-h-24 transition leading-relaxed"
                style={{ minHeight: '38px' }}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm active:scale-95'
                    : 'bg-sand-200 text-charcoal-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-700" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
