'use client';
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Play, MoreHorizontal } from 'lucide-react';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

// Backend integration point: replace with React Query useQuery('/api/v1/cases')
const mockCases = [
  {
    id: 'case-2024-0089',
    name: 'Operation Nightshade',
    status: 'active' as const,
    analyst: 'SA Reyes, Marcus',
    onionAddresses: ['zqktlwiuavvvqqt4ybvgvi7tyo4hjl5xgfuvpdf6otjiycgwqbym26id.onion'],
    evidenceCount: 147,
    jobCount: 3,
    lastJobStatus: 'running' as const,
    topConfidence: 0.87,
    candidateCount: 4,
    createdAt: '2026-07-14',
    priority: 'Critical',
    classification: 'Secret',
  },
  {
    id: 'case-2024-0091',
    name: 'Project Phantom Ledger',
    status: 'active' as const,
    analyst: 'SA Chen, Wei',
    onionAddresses: ['facebookwkhpilnemxj7asber7cyc673qludu6z7akzjy24pjyuvkbyd.onion'],
    evidenceCount: 89,
    jobCount: 2,
    lastJobStatus: 'completed' as const,
    topConfidence: 0.74,
    candidateCount: 7,
    createdAt: '2026-07-22',
    priority: 'High',
    classification: 'Confidential',
  },
  {
    id: 'case-2024-0094',
    name: 'Silk Meridian',
    status: 'pending' as const,
    analyst: 'SA Okonkwo, Adaeze',
    onionAddresses: ['rougmnvswfsmd4dq.onion'],
    evidenceCount: 0,
    jobCount: 0,
    lastJobStatus: 'queued' as const,
    topConfidence: 0,
    candidateCount: 0,
    createdAt: '2026-08-01',
    priority: 'High',
    classification: 'Confidential',
  },
  {
    id: 'case-2024-0083',
    name: 'Darkwater Bazaar',
    status: 'active' as const,
    analyst: 'SA Petrov, Dmitri',
    onionAddresses: ['3g2upl4pq6kufc4m.onion', 'msydqstlz2kzerdg.onion'],
    evidenceCount: 312,
    jobCount: 7,
    lastJobStatus: 'failed' as const,
    topConfidence: 0.61,
    candidateCount: 2,
    createdAt: '2026-06-30',
    priority: 'Critical',
    classification: 'Secret',
  },
  {
    id: 'case-2024-0078',
    name: 'Cascade Serpent',
    status: 'closed' as const,
    analyst: 'SA Hassan, Farah',
    onionAddresses: ['torchdeedp3i2jigzjdmfpn6plzgd2in55njte5vnu4oz5oqpqagdyd.onion'],
    evidenceCount: 521,
    jobCount: 12,
    lastJobStatus: 'completed' as const,
    topConfidence: 0.93,
    candidateCount: 1,
    createdAt: '2026-05-10',
    priority: 'Medium',
    classification: 'Confidential',
  },
  {
    id: 'case-2024-0096',
    name: 'Iron Mirage',
    status: 'active' as const,
    analyst: 'SA Reyes, Marcus',
    onionAddresses: ['expyuzz4wqqyqhjn.onion'],
    evidenceCount: 44,
    jobCount: 1,
    lastJobStatus: 'queued' as const,
    topConfidence: 0.42,
    candidateCount: 3,
    createdAt: '2026-08-06',
    priority: 'Medium',
    classification: 'Unclassified',
  },
  {
    id: 'case-2024-0097',
    name: 'Cobalt Drift',
    status: 'pending' as const,
    analyst: 'SA Chen, Wei',
    onionAddresses: ['juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion'],
    evidenceCount: 12,
    jobCount: 0,
    lastJobStatus: 'queued' as const,
    topConfidence: 0,
    candidateCount: 0,
    createdAt: '2026-08-08',
    priority: 'Low',
    classification: 'Unclassified',
  },
  {
    id: 'case-2024-0072',
    name: 'Amber Protocol',
    status: 'closed' as const,
    analyst: 'SA Okonkwo, Adaeze',
    onionAddresses: ['sik5nlgfc5qylnnsr57qrbm64zbdx6t4lreyhpon3ychmxmiem7tioad.onion'],
    evidenceCount: 784,
    jobCount: 18,
    lastJobStatus: 'completed' as const,
    topConfidence: 0.88,
    candidateCount: 2,
    createdAt: '2026-04-03',
    priority: 'High',
    classification: 'Secret',
  },
];

type SortKey = 'id' | 'name' | 'status' | 'analyst' | 'topConfidence' | 'evidenceCount' | 'createdAt';

const priorityColors: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#60a5fa',
  Low: '#8EB69B',
};

const classificationColors: Record<string, string> = {
  'Top Secret': 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  Secret: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  Confidential: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  Unclassified: 'bg-gray-500/20 text-gray-300 border border-gray-500/40',
};

export function CaseListingSection() {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...mockCases].sort((a, b) => {
    const aVal = a[sortKey as keyof typeof a];
    const bVal = b[sortKey as keyof typeof b];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginated.map((c) => c.id)));
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) {
      return (
        <span className="opacity-30">
          <ChevronUp size={10} />
        </span>
      );
    }
    return sortDir === 'asc' ? (
      <ChevronUp size={11} className="text-cyan-400" />
    ) : (
      <ChevronDown size={11} className="text-cyan-400" />
    );
  };

  const thStyle: React.CSSProperties = {
    color: '#9ca3af',
    fontSize: '0.6875rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '0.625rem 0.75rem',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      className="rounded-xl border overflow-hidden bg-gray-900 border-gray-800"
    >
      {/* Table header bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-800"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">
            Investigation Cases
          </h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono"
          >
            {mockCases.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
            >
              {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th style={{ ...thStyle, width: 36, padding: '0.625rem 0.75rem' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                  className="rounded accent-cyan-500 cursor-pointer"
                  aria-label="Select all cases"
                />
              </th>
              {(
                [
                  { key: 'id', label: 'Case ID' },
                  { key: 'name', label: 'Operation' },
                  { key: 'status', label: 'Status' },
                  { key: 'analyst', label: 'Analyst' },
                  { key: null, label: 'Onion Address' },
                  { key: 'evidenceCount', label: 'Evidence' },
                  { key: null, label: 'Jobs' },
                  { key: 'topConfidence', label: 'Top Candidate' },
                  { key: null, label: 'Classification' },
                  { key: 'createdAt', label: 'Created' },
                  { key: null, label: '' },
                ] as Array<{ key: SortKey | null; label: string }>
              ).map((col, i) => (
                <th
                  key={`th-${col.label || i}`}
                  style={thStyle}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.key && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <EmptyState
                    title="No cases found"
                    description="No investigation cases match your current filters. Adjust the search or status filters to see results."
                    action={
                      <a href="/new-case-evidence-intake" className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors">
                        Create First Case
                      </a>
                    }
                  />
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-800/60 transition-colors ${
                    selectedRows.has(c.id) ? 'bg-cyan-500/10' : 'hover:bg-gray-800/40'
                  }`}
                  onMouseEnter={() => setHoveredRow(c.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(c.id)}
                      onChange={() => toggleRow(c.id)}
                      className="accent-cyan-500 cursor-pointer"
                      aria-label={`Select case ${c.id}`}
                    />
                  </td>

                  {/* Case ID */}
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      className="font-mono text-xs text-cyan-400 font-bold"
                    >
                      {c.id}
                    </span>
                  </td>

                  {/* Operation name */}
                  <td style={{ padding: '0.75rem' }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold text-gray-100"
                      >
                        {c.name}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
                        style={{
                          background: `${priorityColors[c.priority]}1a`,
                          color: priorityColors[c.priority],
                          border: `1px solid ${priorityColors[c.priority]}40`,
                        }}
                      >
                        {c.priority}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.75rem' }}>
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  {/* Analyst */}
                  <td style={{ padding: '0.75rem' }}>
                    <span className="text-xs text-gray-400 font-mono">
                      {c.analyst}
                    </span>
                  </td>

                  {/* Onion address */}
                  <td style={{ padding: '0.75rem', maxWidth: '180px' }}>
                    <span
                      className="font-mono text-[10px] text-cyan-400/80 block truncate"
                      title={c.onionAddresses[0]}
                    >
                      {c.onionAddresses[0].slice(0, 20)}…
                    </span>
                    {c.onionAddresses.length > 1 && (
                      <span className="text-[10px] text-gray-500 font-mono">
                        +{c.onionAddresses.length - 1} more
                      </span>
                    )}
                  </td>

                  {/* Evidence count */}
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      className="text-sm font-semibold text-white font-mono"
                    >
                      {c.evidenceCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Job count + last status */}
                  <td style={{ padding: '0.75rem' }}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-semibold text-white font-mono"
                      >
                        {c.jobCount}
                      </span>
                      <StatusBadge status={c.lastJobStatus} size="sm" />
                    </div>
                  </td>

                  {/* Top candidate confidence */}
                  <td style={{ padding: '0.75rem' }}>
                    {c.topConfidence > 0 ? (
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge score={c.topConfidence} size="sm" showLabel={false} />
                        <span
                          className="text-[10px] text-gray-400 font-mono"
                        >
                          {c.candidateCount} candidates
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-xs text-gray-600"
                      >
                        —
                      </span>
                    )}
                  </td>

                  {/* Classification */}
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${classificationColors[c.classification] ?? 'bg-gray-800 text-gray-400'}`}
                    >
                      {c.classification}
                    </span>
                  </td>

                  {/* Created date */}
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      className="text-xs font-mono text-gray-400"
                    >
                      {c.createdAt}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.75rem' }}>
                    <div
                      className={`flex items-center gap-1 transition-opacity ${
                        hoveredRow === c.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button
                        className="p-1.5 rounded bg-gray-800 hover:bg-cyan-600 hover:text-white text-gray-300 transition-colors"
                        title="View case details"
                        aria-label={`View details for case ${c.id}`}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded bg-gray-800 hover:bg-cyan-600 hover:text-white text-gray-300 transition-colors"
                        title="Run correlation analysis"
                        aria-label={`Run correlation analysis for case ${c.id}`}
                      >
                        <Play size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded bg-gray-800 hover:bg-cyan-600 hover:text-white text-gray-300 transition-colors"
                        title="More options"
                        aria-label={`More options for case ${c.id}`}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-400"
      >
        <span>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, mockCases.length)} of{' '}
          {mockCases.length} cases
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1.5 rounded-md bg-gray-950 border border-gray-800 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`px-2.5 py-1.5 rounded-md font-mono transition-colors ${
                page === p
                  ? 'bg-cyan-600 text-white border border-cyan-500'
                  : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1.5 rounded-md bg-gray-950 border border-gray-800 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaseListingSection;
