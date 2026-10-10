import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-sand-300 shadow-2xs max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4">
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg sm:text-xl text-charcoal-900 mb-1">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm"
        >
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && !actionHref && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
