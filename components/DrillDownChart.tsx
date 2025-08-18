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
          stroke="#6b7280"
          fontSize={12}
          ticks={data.map(d => d.name).filter((_, i) => i % 4 === 0)}
          interval={0}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={yAxisFormatter}
          domain={yAxisDomain || [0, 'dataMax']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#d1d5db' }}
        />
        <Legend wrapperStyle={{ bottom: 0 }} />

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