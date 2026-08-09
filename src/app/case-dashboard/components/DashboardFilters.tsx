'use client';
import React, { useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

interface DashboardFiltersProps {
  onViewChange?: (view: 'grid' | 'table') => void;
  onFiltersChange?: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  status: string;
  analyst: string;
  confidenceMin: number;
}

// Backend integration point: analyst list from /api/v1/users?role=Analyst
const analysts = [
  { id: 'analyst-all', label: 'All Analysts' },
  { id: 'analyst-reyes', label: 'SA Reyes, Marcus' },
  { id: 'analyst-chen', label: 'SA Chen, Wei' },
  { id: 'analyst-okonkwo', label: 'SA Okonkwo, Adaeze' },
  { id: 'analyst-petrov', label: 'SA Petrov, Dmitri' },
  { id: 'analyst-hassan', label: 'SA Hassan, Farah' },
];

export function DashboardFilters({ onViewChange, onFiltersChange }: DashboardFiltersProps) {
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [analyst, setAnalyst] = useState('analyst-all');
  const [confidenceMin, setConfidenceMin] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleViewChange = (v: 'grid' | 'table') => {
    setView(v);
    onViewChange?.(v);
  };

  return (
    <div
      className="rounded-xl border p-4 bg-gray-900 border-gray-800"
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by case name, onion address, analyst…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>

        {/* Analyst filter */}
        <select
          value={analyst}
          onChange={(e) => setAnalyst(e.target.value)}
          className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          aria-label="Filter by analyst"
        >
          {analysts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>

        {/* Confidence threshold */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">
            Confidence ≥
          </span>
          <select
            value={confidenceMin}
            onChange={(e) => setConfidenceMin(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            aria-label="Minimum confidence threshold"
          >
            <option value={0}>Any</option>
            <option value={40}>40%</option>
            <option value={60}>60%</option>
            <option value={75}>75%</option>
            <option value={85}>85%</option>
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 hover:text-white transition-colors"
        >
          <SlidersHorizontal size={13} />
          Filters
        </button>

        {/* View toggle */}
        <div
          className="flex rounded-xl overflow-hidden border border-gray-800 bg-gray-950"
        >
          <button
            onClick={() => handleViewChange('grid')}
            className={`p-2 transition-all ${
              view === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleViewChange('table')}
            className={`p-2 transition-all ${
              view === 'table' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Table view"
            aria-pressed={view === 'table'}
          >
            <List size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardFilters;
