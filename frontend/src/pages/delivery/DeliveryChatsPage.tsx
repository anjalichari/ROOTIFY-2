import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '../../components/portals/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { ChatMessage } from '../../types';
import {
  MessageSquare,
  Send,
  Store,
  User as UserIcon,
  Bike,
  Clock,
} from 'lucide-react';

export const DeliveryChatsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeOrderId = searchParams.get('orderId') || 'ord-1002';

  const [activeTab, setActiveTab] = useState<'vendor' | 'customer'>('vendor');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const conversationId = `${activeOrderId}-${activeTab}`;

  const loadMessages = async () => {
    try {
      const msgs = await chatService.getMessagesByConversation(conversationId);
      setMessages(msgs);
    } catch (e) {
      console.error('Error loading chat:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await chatService.sendMessage({
      conversationId,
      orderId: activeOrderId,
      senderId: user?.id || 'user-delivery-rohan',
      senderRole: 'delivery',
      senderName: user?.name || 'Rohan Naik',
      text: inputText.trim(),
    });

    setInputText('');
    loadMessages();
  };

  return (
    <PortalLayout
      portalType="delivery"
      title="Delivery Messaging Channels"
      subtitle={`Live coordination for Order #${activeOrderId}`}
    >
      <div className="bg-white rounded-3xl border border-sand-300 shadow-2xs overflow-hidden max-w-4xl mx-auto flex flex-col h-[600px]">
        
        {/* Chat Switcher Tabs */}
        <div className="flex border-b border-sand-200 bg-sand-50/70 p-2 gap-2">
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'vendor'
                ? 'bg-white text-terracotta-800 shadow-2xs border border-terracotta-200'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Store className="w-4 h-4 text-terracotta-600" />
            <span>Kitchen / Producer Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-white text-brand-800 shadow-2xs border border-brand-200'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-brand-600" />
            <span>Customer Chat</span>
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#FAF8F3]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-charcoal-400">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50 text-charcoal-400" />
              <span>No messages in this channel yet. Type below to send a message.</span>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderRole === 'delivery';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-charcoal-400 font-semibold mb-0.5 px-1">
                    {m.senderName} ({m.senderRole})
                  </span>
                  <div
                    className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-br-xs'
                        : 'bg-white border border-sand-300 text-charcoal-900 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-charcoal-400 mt-0.5 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-sand-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeTab === 'vendor' ? 'Kitchen Producer' : 'Customer'}...`}
            className="flex-1 px-4 py-2.5 text-xs bg-sand-50 border border-sand-300 rounded-xl outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </PortalLayout>
  );
};
