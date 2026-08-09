import React from 'react';

type CaseStatus = 'active' | 'closed' | 'pending';
type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

interface StatusBadgeProps {
  status: CaseStatus | JobStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { className: string; label: string; dot?: string }> = {
  active: { className: 'badge-active', label: 'Active', dot: '#4ade80' },
  closed: { className: 'badge-closed', label: 'Closed', dot: '#8EB69B' },
  pending: { className: 'badge-pending', label: 'Pending', dot: '#f59e0b' },
  queued: { className: 'badge-pending', label: 'Queued', dot: '#f59e0b' },
  running: { className: 'badge-running', label: 'Running', dot: '#60a5fa' },
  completed: { className: 'badge-active', label: 'Completed', dot: '#4ade80' },
  failed: { className: 'badge-failed', label: 'Failed', dot: '#ef4444' },
  cancelled: { className: 'badge-closed', label: 'Cancelled', dot: '#8EB69B' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { className: 'badge-closed', label: status, dot: '#8EB69B' };
  const sizeClass = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-500 ${config.className} ${sizeClass}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
}