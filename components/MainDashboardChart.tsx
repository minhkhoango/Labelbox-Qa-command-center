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
              <stop offset="5%" stopColor="var(--lb-primary-blue)" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="var(--lb-primary-blue)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        <XAxis 
          dataKey="name" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12}
          tick={{ fill: 'var(--lb-text-secondary)' }}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12} 
          domain={[0, 'dataMax']}
          tick={{ fill: 'var(--lb-text-secondary)' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12} 
          tickFormatter={(value) => `${value.toFixed(1)}%`} 
          domain={[0, 10]}
          tick={{ fill: 'var(--lb-text-secondary)' }}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'var(--lb-bg-secondary)', 
            borderColor: 'var(--lb-border-default)', 
            borderRadius: 'var(--lb-radius-md)',
            boxShadow: 'var(--lb-shadow-md)',
            color: 'var(--lb-text-primary)'
          }}
          labelStyle={{ color: 'var(--lb-text-secondary)' }}
        />
        <Legend 
          wrapperStyle={{ 
            bottom: 0,
            color: 'var(--lb-text-secondary)'
          }} 
        />
        <Bar 
          dataKey="Weekly Throughput" 
          yAxisId="left" 
          fill="url(#colorThroughput)" 
          barSize={20} 
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="Rework Rate (%)" 
          stroke="var(--lb-accent-red)" 
          strokeWidth={2} 
          dot={false} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default MainDashboardChart;