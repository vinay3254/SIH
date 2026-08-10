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
      className="flex items-center justify-between h-14 px-6 border-b flex-shrink-0 z-10 glass-topbar"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Left: breadcrumb / search */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 text-sm"
          style={{
            background: 'rgba(118,118,128,0.12)',
            border: 'none',
            borderRadius: '8px',
            color: '#1D1D1F',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Search size={14} style={{ color: '#6E6E73' }} />
          <span className="text-xs" style={{ color: '#6E6E73' }}>Search cases, evidence, jobs…</span>
          <kbd
            className="text-2xs px-1.5 py-0.5 rounded font-mono ml-2"
            style={{
              background: 'rgba(0,0,0,0.06)',
              color: '#6E6E73',
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-600 ${isWarning ? 'session-timer-warning' : ''}`}
          style={{
            background: isWarning ? 'rgba(255,159,10,0.12)' : 'rgba(118,118,128,0.1)',
            border: 'none',
            color: isWarning ? '#FF9F0A' : '#6E6E73',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          title="Session auto-expires after inactivity"
        >
          <Clock size={13} />
          <span>{formatTime(minutes, seconds)}</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-full transition-all duration-150"
          style={{ color: '#1D1D1F', transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'rgba(118,118,128,0.1)',
              border: 'none',
              borderRadius: '10px',
              transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
              style={{ background: '#0071E3', color: 'white' }}
            >
              {MOCK_USER.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-600 leading-tight" style={{ color: '#1D1D1F' }}>
                {MOCK_USER.name}
              </p>
              <div className="flex items-center gap-1">
                <Shield size={9} style={{ color: '#6E6E73' }} />
                <p className="text-2xs" style={{ color: '#6E6E73' }}>
                  {MOCK_USER.role} · {MOCK_USER.unit}
                </p>
              </div>
            </div>
            <ChevronDown size={13} style={{ color: '#6E6E73' }} />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-modal py-1 z-50 fade-in glass-panel"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div
                className="px-3 py-2 border-b"
                style={{ borderColor: 'rgba(0,0,0,0.08)' }}
              >
                <p className="text-xs font-600" style={{ color: '#1D1D1F' }}>
                  {MOCK_USER.name}
                </p>
                <p className="text-2xs" style={{ color: '#6E6E73' }}>
                  {MOCK_USER.unit}
                </p>
              </div>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all duration-150"
                style={{ color: '#FF3B30', transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,48,0.08)';
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