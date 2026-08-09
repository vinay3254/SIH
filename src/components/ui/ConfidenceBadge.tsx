import React from 'react';

interface ConfidenceBadgeProps {
  score: number; // 0.0–1.0
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getConfidenceColor(score: number): { bg: string; text: string; border: string; label: string } {
  if (score >= 0.85) {
    return {
      bg: 'rgba(218,241,222,0.18)',
      text: '#DAF1DE',
      border: 'rgba(218,241,222,0.35)',
      label: 'High',
    };
  }
  if (score >= 0.65) {
    return {
      bg: 'rgba(142,182,155,0.18)',
      text: '#8EB69B',
      border: 'rgba(142,182,155,0.35)',
      label: 'Medium',
    };
  }
  if (score >= 0.40) {
    return {
      bg: 'rgba(245,158,11,0.15)',
      text: '#f59e0b',
      border: 'rgba(245,158,11,0.3)',
      label: 'Low',
    };
  }
  return {
    bg: 'rgba(142,182,155,0.08)',
    text: 'rgba(142,182,155,0.6)',
    border: 'rgba(142,182,155,0.15)',
    label: 'Minimal',
  };
}

export default function ConfidenceBadge({ score, size = 'md', showLabel = true }: ConfidenceBadgeProps) {
  const colors = getConfidenceColor(score);
  const pct = Math.round(score * 100);

  const sizeClasses = {
    sm: 'text-2xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-600 font-mono ${sizeClasses[size]}`}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
      title={`Candidate confidence score: ${pct}% — This is a statistical estimate, not a confirmed identity`}
      role="status"
      aria-label={`Confidence score: ${pct} percent — ${colors.label}`}
    >
      <span className="tabular-nums">{pct}%</span>
      {showLabel && <span className="opacity-75">{colors.label}</span>}
    </span>
  );
}