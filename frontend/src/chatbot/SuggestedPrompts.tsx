import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  role?: string;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt, role = 'customer' }) => {
  const getPrompts = () => {
    if (role === 'vendor') {
      return [
        { label: '📦 How to add new Goan products?', query: 'How do I add a new product with origin verification to my catalog?' },
        { label: '💰 How do 5% settlements work?', query: 'Explain how the 5% platform fee and settlement payouts work on Rootify.' },
        { label: '📋 What documents are needed?', query: 'What documents (FSSAI, Panchayat NOC) do I need as a verified vendor?' },
      ];
    }

    if (role === 'delivery') {
      return [
        { label: '🗺️ Serviceable Goa talukas', query: 'Which Goa talukas are currently active for delivery pickups and drops?' },
        { label: '⏱️ What are the 7 order stages?', query: 'Explain the 7 order lifecycle stages from PLACED to DELIVERED.' },
      ];
    }

    if (role === 'admin') {
      return [
        { label: '🛡️ Vendor verification requirements', query: 'What are the verification standards for SHGs and local producers on Rootify?' },
        { label: '⚖️ Dispute and refund guidelines', query: 'Explain the platform dispute resolution and refund policy.' },
      ];
    }

    // Default Customer / Guest Prompts
    return [
      { label: '🍮 What is 7-Layer Bebinca?', query: 'Tell me about traditional 7-layer Goan Bebinca and how it is made.' },
      { label: '🏝️ Divar Island SHG spices', query: 'Which stone-ground spices and balchão are made by the Divar Island Mahila Mandal SHG?' },
      { label: '🚚 Check delivery in my Taluka', query: 'How does delivery work across Goa talukas and how long does it take?' },
      { label: '📦 How do I track my order?', query: 'How do I track my orders and what are the stages?' },
      { label: '🥥 What is pure Dodol?', query: 'What is artisanal Goan Dodol and what jaggery is used in it?' },
    ];
  };

  const prompts = getPrompts();

  return (
    <div className="py-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 mb-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-warmOrange-500 animate-pulse" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(p.query)}
            className="text-left text-xs bg-sand-100 hover:bg-brand-50 border border-sand-300 hover:border-brand-300 text-charcoal-800 hover:text-brand-900 px-2.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
