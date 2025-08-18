//
// FILE: components/MainDashboardChart.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // STATIC SUMMARY VIEW
// PURPOSE: Displays the main, high-level summary of the project.
//
"use client";

import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ProjectDataPoint } from '@/app/page';

interface MainChartProps {
  data: ProjectDataPoint[];
}

const MainDashboardChart: React.FC<MainChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        return data.map((d, i) => ({
            name: `W${i + 1}`,
            "Weekly Throughput": d["Weekly Throughput"],
            "Rework Rate (%)": d["Rework Rate (%)"],
        }));
    }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
        <YAxis yAxisId="left" orientation="left" stroke="#6b7280" fontSize={12} domain={[0, 'dataMax']} />
        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value.toFixed(1)}%`} domain={[0, 10]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Legend wrapperStyle={{ bottom: 0 }} />
        <Bar dataKey="Weekly Throughput" yAxisId="left" fill="url(#colorThroughput)" barSize={20} />
        <Line yAxisId="right" type="monotone" dataKey="Rework Rate (%)" stroke="#F87171" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default MainDashboardChart;