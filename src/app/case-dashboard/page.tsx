'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardBentoGrid from './components/DashboardBentoGrid';
import DashboardFilters from './components/DashboardFilters';
import CaseListingSection from './components/CaseListingSection';
import ActivityFeedPanel from './components/ActivityFeedPanel';

export default function CaseDashboardPage() {
  return (
    <AppLayout currentPath="/case-dashboard">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">
              Case Dashboard
            </h1>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Active investigations · Last synced 2 min ago
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono px-2.5 py-1 rounded-[980px] bg-[rgba(40,205,65,0.1)] text-[#28CD41]"
            >
              ● Analysis Engine Online
            </span>
            <a
              href="/new-case-evidence-intake"
              className="flex items-center gap-2 px-4 py-2 rounded-[980px] text-xs font-bold bg-[#0071E3] hover:opacity-90 text-white transition-all"
            >
              + New Case
            </a>
          </div>
        </div>

        {/* KPI Bento Grid */}
        <DashboardBentoGrid />

        {/* Filters + Content + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 2xl:col-span-3 space-y-4">
            <DashboardFilters />
            <CaseListingSection />
          </div>
          <div className="xl:col-span-1 2xl:col-span-1">
            <ActivityFeedPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
