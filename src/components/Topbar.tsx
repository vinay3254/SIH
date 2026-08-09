'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Search, Shield, Clock, LogOut, ChevronDown } from 'lucide-react';


const MOCK_USER = {
  name: 'SA Reyes, Marcus',
  role: 'Analyst',
  unit: 'Cyber Crimes Unit',
  sessionDuration: 3600, // seconds
};

export default function Topbar() {
  const [timeLeft, setTimeLeft] = useState(MOCK_USER.sessionDuration);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Backend integration point: replace with real session timer from auth store
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 300;

  const formatTime = (m: number, s: number) =>
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <header
      className="flex items-center justify-between h-14 px-6 border-b flex-shrink-0 z-10"
      style={{
        background: 'var(--bg-base)',
        borderColor: 'rgba(142,182,155,0.15)',
      }}
    >
      {/* Left: breadcrumb / search */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'rgba(142,182,155,0.2)',
            color: 'var(--muted-foreground)',
          }}
        >
          <Search size={14} />
          <span className="text-xs">Search cases, evidence, jobs…</span>
          <kbd
            className="text-2xs px-1.5 py-0.5 rounded font-mono ml-2"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--color-accent)',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: session timer + notifications + user */}
      <div className="flex items-center gap-3">
        {/* Session timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono font-600 ${isWarning ? 'session-timer-warning' : ''}`}
          style={{
            background: isWarning ? 'rgba(245,158,11,0.1)' : 'var(--surface-1)',
            borderColor: isWarning ? 'rgba(245,158,11,0.3)' : 'rgba(142,182,155,0.2)',
            color: isWarning ? '#f59e0b' : 'var(--color-accent)',
          }}
          title="Session auto-expires after inactivity"
        >
          <Clock size={13} />
          <span>{formatTime(minutes, seconds)}</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md transition-all duration-150"
          style={{ color: 'var(--color-accent)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-1)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-highlight)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#ef4444' }}
          />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-150"
            style={{
              background: 'var(--surface-1)',
              borderColor: 'rgba(142,182,155,0.2)',
            }}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--color-highlight)' }}
            >
              {MOCK_USER.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-600 leading-tight" style={{ color: 'var(--color-highlight)' }}>
                {MOCK_USER.name}
              </p>
              <div className="flex items-center gap-1">
                <Shield size={9} style={{ color: 'var(--color-accent)' }} />
                <p className="text-2xs" style={{ color: 'var(--color-accent)' }}>
                  {MOCK_USER.role} · {MOCK_USER.unit}
                </p>
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--color-accent)' }} />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-modal py-1 z-50 fade-in"
              style={{
                background: 'var(--surface-1)',
                borderColor: 'rgba(142,182,155,0.2)',
              }}
            >
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: 'rgba(142,182,155,0.15)' }}
              >
                <p className="text-xs font-600" style={{ color: 'var(--color-highlight)' }}>
                  {MOCK_USER.name}
                </p>
                <p className="text-2xs" style={{ color: 'var(--color-accent)' }}>
                  {MOCK_USER.unit}
                </p>
              </div>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all duration-150"
                style={{ color: '#ef4444' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}