import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Upload, Play } from 'lucide-react';

// Backend integration point: replace with React Query polling /api/v1/cases/activity
const activityItems = [
  {
    id: 'act-001',
    type: 'job_completed',
    icon: <CheckCircle2 size={14} />,
    iconColor: '#4ade80',
    text: 'Correlation job completed for Phantom Ledger',
    detail: '7 candidates surfaced · top score 74%',
    time: '4 min ago',
  },
  {
    id: 'act-002',
    type: 'job_failed',
    icon: <AlertTriangle size={14} />,
    iconColor: '#ef4444',
    text: 'Job CJ-2024-0412 failed — Darkwater Bazaar',
    detail: 'Ingestion pipeline timeout on PCAP-009',
    time: '18 min ago',
  },
  {
    id: 'act-003',
    type: 'evidence_uploaded',
    icon: <Upload size={14} />,
    iconColor: '#60a5fa',
    text: 'Evidence uploaded to Nightshade',
    detail: 'traffic-capture-Aug09-02.pcap · 847 MB',
    time: '41 min ago',
  },
  {
    id: 'act-004',
    type: 'job_started',
    icon: <Play size={14} />,
    iconColor: '#8EB69B',
    text: 'Correlation run started — Iron Mirage',
    detail: 'Job CJ-2024-0416 queued',
    time: '1h ago',
  },
  {
    id: 'act-005',
    type: 'case_created',
    icon: <Activity size={14} />,
    iconColor: '#DAF1DE',
    text: 'New case created: Cobalt Drift',
    detail: 'Assigned to SA Chen, Wei',
    time: '2h ago',
  },
  {
    id: 'act-006',
    type: 'job_completed',
    icon: <CheckCircle2 size={14} />,
    iconColor: '#4ade80',
    text: 'Analysis complete — Amber Protocol',
    detail: 'Candidate CAND-0089 escalated',
    time: '5h ago',
  },
  {
    id: 'act-007',
    type: 'audit_access',
    icon: <Clock size={14} />,
    iconColor: '#f59e0b',
    text: 'Audit log accessed — Cascade Serpent',
    detail: 'SA Hassan, Farah · case export',
    time: '7h ago',
  },
];

export function ActivityFeedPanel() {
  return (
    <div
      className="rounded-xl border h-full"
      style={{
        background: 'var(--card, #111827)',
        borderColor: 'rgba(142,182,155,0.2)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(142,182,155,0.15)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-highlight, #f3f4f6)' }}>
          Recent Activity
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--muted-foreground, #9ca3af)' }}
        >
          Live
          <span
            className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle"
            style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80' }}
          />
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: 'rgba(142,182,155,0.08)' }}>
        {activityItems.map((item) => (
          <div
            key={item.id}
            className="px-4 py-3 transition-all duration-150 hover:bg-gray-800/40"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: `${item.iconColor}1a`,
                  color: item.iconColor,
                  border: `1px solid ${item.iconColor}30`,
                }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium leading-tight"
                  style={{ color: 'var(--color-highlight, #f3f4f6)' }}
                >
                  {item.text}
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: 'var(--muted-foreground, #9ca3af)' }}
                >
                  {item.detail}
                </p>
                <p
                  className="text-[10px] mt-1 font-mono"
                  style={{ color: 'var(--muted-foreground, #9ca3af)', opacity: 0.6 }}
                >
                  {item.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="px-4 py-3 border-t text-center"
        style={{ borderColor: 'rgba(142,182,155,0.12)' }}
      >
        <button
          className="text-xs font-medium transition-all duration-150 text-cyan-400 hover:text-cyan-300"
        >
          View full audit trail →
        </button>
      </div>
    </div>
  );
}

export default ActivityFeedPanel;
