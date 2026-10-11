import React from 'react';
import { ChatMessage } from './types';
import { FormattedMessage } from './FormattedMessage';
import { Bot, User, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (msg: ChatMessage) => void;
  onLinkClick?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onRetry, onLinkClick }) => {
  const isUser = message.sender === 'user';
  const isError = message.status === 'error';

  return (
    <div className={`flex w-full gap-2.5 my-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-sm mt-0.5 border border-brand-800">
          <Bot className="w-4 h-4 text-emerald-300" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender Name / Provider Tag */}
        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-charcoal-500 font-medium px-1">
          <span>{isUser ? 'You' : 'Rooty (Goan Guide)'}</span>
          {!isUser && message.model && (
            <span className="bg-sand-200/80 text-brand-800 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {message.model.includes('gemini') ? '✨ Gemini' : '🌿 Rootify'}
            </span>
          )}
          <span className="text-gray-400">• {message.timestamp}</span>
        </div>

        {/* Bubble */}
        <div
          className={`p-3.5 rounded-2xl text-sm transition-all duration-200 ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm'
              : isError
              ? 'bg-red-50 border border-red-200 text-red-800 rounded-tl-sm'
              : 'bg-white border border-sand-200 text-charcoal-900 rounded-tl-sm shadow-subtle'
          }`}
        >
          {isError ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{message.content}</p>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 underline mt-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry question
                </button>
              )}
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <FormattedMessage content={message.content} onLinkClick={onLinkClick} />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sand-200 text-brand-800 flex items-center justify-center shadow-sm mt-0.5 border border-sand-300">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
