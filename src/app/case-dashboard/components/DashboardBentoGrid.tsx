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
  const cardClasses = "rounded-[16px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] p-5 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_6px_rgba(0,0,0,0.08),_0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {kpiData?.filter((k) => k?.variant === 'highlight')?.map((kpi) => (
        <div
          key={kpi?.id}
          className={`md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2 ${cardClasses}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(0,113,227,0.1)] text-[#0071E3]"
            >
              {kpi?.icon}
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-[980px] bg-[rgba(0,113,227,0.1)] text-[#0071E3] font-mono"
            >
              {kpi?.delta}
            </span>
          </div>
          <div
            className="text-4xl font-bold tabular-nums mb-1 text-[#1D1D1F] tracking-[-0.02em]"
          >
            {kpi?.value}
          </div>
          <div className="text-sm font-semibold mb-0.5 text-[#1D1D1F]">
            {kpi?.label}
          </div>
          <div className="text-xs text-[#6E6E73]">
            {kpi?.sub}
          </div>
        </div>
      ))}
      
      {kpiData?.filter((k) => k?.variant === 'alert')?.map((kpi) => (
        <div
          key={kpi?.id}
          className={cardClasses}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,59,48,0.1)] text-[#FF3B30]"
            >
              {kpi?.icon}
            </div>
            <ArrowUpRight size={14} className="text-[#FF3B30]" />
          </div>
          <div className="text-3xl font-bold tabular-nums mb-1 text-[#1D1D1F] tracking-[-0.02em]">
            {kpi?.value}
          </div>
          <div className="text-sm font-semibold mb-0.5 text-[#1D1D1F]">
            {kpi?.label}
          </div>
          <div className="text-xs text-[#6E6E73]">
            {kpi?.sub}
          </div>
        </div>
      ))}
      
      <div
        className={cardClasses}
      >
        <p className="text-xs font-semibold mb-2 text-[#6E6E73] font-mono uppercase tracking-[0.04em]">
          Job Activity (14d)
        </p>
        <div className="h-[80px]">
          <JobActivityChart />
        </div>
      </div>
      
      {kpiData?.filter((k) => k?.variant === 'default')?.map((kpi) => (
        <div
          key={kpi?.id}
          className={cardClasses}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,113,227,0.1)] text-[#0071E3]"
            >
              {kpi?.icon}
            </div>
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold font-mono ${kpi?.deltaGood ? 'text-[#28CD41]' : 'text-[#FF9F0A]'}`}
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
            className="text-2xl font-bold tabular-nums mb-0.5 text-[#1D1D1F] tracking-[-0.02em]"
          >
            {kpi?.value}
          </div>
          <div className="text-xs font-semibold mb-0.5 text-[#1D1D1F]">
            {kpi?.label}
          </div>
          <div className="text-xs text-[#6E6E73]">
            {kpi?.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardBentoGrid;
