'use client';
import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining?: number;
  onExtend: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({
  isOpen,
  secondsRemaining = 120,
  onExtend,
  onLogout,
}: SessionTimeoutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,31,32,0.85)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div
        className="w-full max-w-sm rounded-xl border p-6 shadow-modal fade-in"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'rgba(245,158,11,0.4)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)' }}
          >
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h2
              id="session-timeout-title"
              className="text-base font-600"
              style={{ color: 'var(--color-highlight)' }}
            >
              Session Expiring
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-accent)' }}>
              Your session will auto-terminate in{' '}
              <span className="font-mono font-700" style={{ color: '#f59e0b' }}>
                {secondsRemaining}s
              </span>{' '}
              due to inactivity.
            </p>
          </div>
        </div>

        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
          All unsaved case data will be discarded. This session will be logged in the chain-of-custody audit trail.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-600 btn-primary"
          >
            <RefreshCw size={14} />
            Extend Session
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-600 btn-ghost"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}