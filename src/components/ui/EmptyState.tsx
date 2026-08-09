import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(142,182,155,0.1)' }}
      >
        {icon ?? <FolderOpen size={24} style={{ color: 'var(--color-accent)' }} />}
      </div>
      <h3 className="text-base font-600 mb-1" style={{ color: 'var(--color-highlight)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}