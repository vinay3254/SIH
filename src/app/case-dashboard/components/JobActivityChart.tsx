'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Backend integration point: replace with React Query fetching /api/v1/analysis/jobs/activity
const data = [
  { day: 'Jul 27', jobs: 4 },
  { day: 'Jul 28', jobs: 7 },
  { day: 'Jul 29', jobs: 3 },
  { day: 'Jul 30', jobs: 9 },
  { day: 'Jul 31', jobs: 5 },
  { day: 'Aug 01', jobs: 11 },
  { day: 'Aug 02', jobs: 6 },
  { day: 'Aug 03', jobs: 8 },
  { day: 'Aug 04', jobs: 2 },
  { day: 'Aug 05', jobs: 13 },
  { day: 'Aug 06', jobs: 7 },
  { day: 'Aug 07', jobs: 10 },
  { day: 'Aug 08', jobs: 4 },
  { day: 'Aug 09', jobs: 8 },
];

export function JobActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="jobGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div
                className="px-2 py-1 rounded text-xs font-mono bg-gray-950 border border-cyan-500/30 text-cyan-300"
              >
                {payload?.[0]?.payload?.day}: {payload?.[0]?.value} jobs
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="jobs"
          stroke="#06b6d4"
          strokeWidth={1.5}
          fill="url(#jobGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default JobActivityChart;
