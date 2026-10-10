import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <EmptyState
        icon={<Compass className="w-10 h-10" />}
        title="404 — Page Not Found"
        description="The marketplace page or dish you were looking for doesn't exist or has moved."
        actionText="Back to Marketplace Home"
        actionHref="/"
      />
    </div>
  );
};
