//
// FILE: components/DrillDownChart.tsx (Simplified Static Version)
// CLASSIFICATION: TOP SECRET // OGM-V2 // SIMPLIFIED CHART
// PURPOSE: A simple, static line chart that displays all data at once.
//
"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DiagnosticDataPoint } from '@/app/page';

interface LineConfig {
  dataKey: string;
  color: string;
  strokeDasharray?: string;
}

interface DrillDownChartProps {
  data: DiagnosticDataPoint[];
  lines: LineConfig[];
  yAxisFormatter: (value: any) => string;
  yAxisDomain?: [number, number];
}

const DrillDownChart: React.FC<DrillDownChartProps> = ({ data, lines, yAxisFormatter, yAxisDomain }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="name"
          stroke="var(--lb-text-tertiary)"
          fontSize={12}
          tick={{ fill: 'var(--lb-text-secondary)' }}
          ticks={data.map(d => d.name).filter((_, i) => i % 4 === 0)}
          interval={0}
        />
        <YAxis
          stroke="var(--lb-text-tertiary)"
          fontSize={12}
          tick={{ fill: 'var(--lb-text-secondary)' }}
          tickFormatter={yAxisFormatter}
          domain={yAxisDomain || [0, 'dataMax']}
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

        {lines.map(line => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            strokeDasharray={line.strokeDasharray}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DrillDownChart;