'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import {
  FolderOpen,
  Cpu,
  Target,
  HardDrive,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const JobActivityChart = dynamic(() => import('./JobActivityChart'), { ssr: false });

// Backend integration point: replace with React Query hook fetching /api/v1/cases/stats
const kpiData = [
  {
    id: 'kpi-open-cases',
    label: 'Open Cases',
    value: '23',
    delta: '+3',
    deltaDir: 'up',
    deltaGood: true,
    icon: <FolderOpen size={20} />,
    sub: '7 assigned to you',
    variant: 'default',
  },
  {
    id: 'kpi-pending-jobs',
    label: 'Pending Jobs',
    value: '8',
    delta: '+2',
    deltaDir: 'up',
    deltaGood: false,
    icon: <Cpu size={20} />,
    sub: '2 running now',
    variant: 'default',
  },
  {
    id: 'kpi-high-confidence',
    label: 'High-Confidence Candidates',
    value: '14',
    delta: '+5 today',
    deltaDir: 'up',
    deltaGood: true,
    icon: <Target size={20} />,
    sub: 'Score ≥ 75% — review required',
    variant: 'highlight',
  },
  {
    id: 'kpi-evidence-files',
    label: 'Evidence Files Ingested',
    value: '1,847',
    delta: '+234',
    deltaDir: 'up',
    deltaGood: true,
    icon: <HardDrive size={20} />,
    sub: 'Across 23 active cases',
    variant: 'default',
  },
  {
    id: 'kpi-failed-jobs',
    label: 'Failed Jobs (24h)',
    value: '3',
    delta: '+3',
    deltaDir: 'up',
    deltaGood: false,
    icon: <AlertTriangle size={20} />,
    sub: 'Check ingestion pipeline',
    variant: 'alert',
  },
  {
    id: 'kpi-avg-confidence',
    label: 'Avg Confidence Score',
    value: '67.4%',
    delta: '+2.1%',
    deltaDir: 'up',
    deltaGood: true,
    icon: <TrendingUp size={20} />,
    sub: 'Across all surfaced candidates',
    variant: 'default',
  },
];

export function DashboardBentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero KPI: High-Confidence Candidates — spans 2 cols */}
      {kpiData?.filter((k) => k?.variant === 'highlight')?.map((kpi) => (
        <div
          key={kpi?.id}
          className="md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2 rounded-xl border p-5 relative overflow-hidden bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-950/20"
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-cyan-400"
            style={{ transform: 'translate(30%, -30%)' }}
          />
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
            >
              {kpi?.icon}
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono"
            >
              {kpi?.delta}
            </span>
          </div>
          <div
            className="text-4xl font-bold tabular-nums mb-1 text-white font-mono"
          >
            {kpi?.value}
          </div>
          <div className="text-sm font-semibold mb-0.5 text-gray-200">
            {kpi?.label}
          </div>
          <div className="text-xs text-cyan-300/80">
            {kpi?.sub}
          </div>
        </div>
      ))}
      {/* Alert KPI: Failed Jobs */}
      {kpiData?.filter((k) => k?.variant === 'alert')?.map((kpi) => (
        <div
          key={kpi?.id}
          className="rounded-xl border p-5 relative overflow-hidden bg-rose-950/20 border-rose-500/30"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-500/15 text-rose-400"
            >
              {kpi?.icon}
            </div>
            <ArrowUpRight size={14} className="text-rose-400" />
          </div>
          <div className="text-3xl font-bold tabular-nums mb-1 text-rose-400 font-mono">
            {kpi?.value}
          </div>
          <div className="text-sm font-semibold mb-0.5 text-gray-200">
            {kpi?.label}
          </div>
          <div className="text-xs text-rose-400/80">
            {kpi?.sub}
          </div>
        </div>
      ))}
      {/* Chart card — spans 1 col, sits in the 4th slot */}
      <div
        className="rounded-xl border p-5 overflow-hidden bg-gray-900 border-gray-800"
      >
        <p className="text-xs font-semibold mb-2 text-gray-400 font-mono uppercase">
          Job Activity (14d)
        </p>
        <div className="h-[80px]">
          <JobActivityChart />
        </div>
      </div>
      {/* Remaining default KPIs */}
      {kpiData?.filter((k) => k?.variant === 'default')?.map((kpi) => (
        <div
          key={kpi?.id}
          className="rounded-xl border p-5 bg-gray-900 border-gray-800"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              {kpi?.icon}
            </div>
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold font-mono ${kpi?.deltaGood ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {kpi?.deltaDir === 'up' ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {kpi?.delta}
            </span>
          </div>
          <div
            className="text-2xl font-bold tabular-nums mb-0.5 text-white font-mono"
          >
            {kpi?.value}
          </div>
          <div className="text-xs font-semibold mb-0.5 text-gray-200">
            {kpi?.label}
          </div>
          <div className="text-xs text-gray-400">
            {kpi?.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardBentoGrid;
