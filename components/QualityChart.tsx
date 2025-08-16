//
// FILE: components/QualityChart.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // VISUALIZATION MODULE
// PURPOSE: Renders the primary time-series chart for the dashboard overview.
//
"use client";

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Line 
} from 'recharts';

// Type definition for the data this chart expects. Strictness prevents errors.
type ChartData = {
  name: string;
  [key: string]: string | number;
};

interface QualityChartProps {
  data: ChartData[];
}

// Decision: Abstracting the chart into its own component is clean architecture.
// It keeps the main dashboard page readable and focused on layout.
const QualityChart: React.FC<QualityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--lb-border-default))" />
        <XAxis dataKey="name" stroke="hsl(var(--lb-text-tertiary))" fontSize={12} />
        <YAxis yAxisId="left" stroke="hsl(var(--lb-text-tertiary))" fontSize={12} domain={[0.6, 1.0]} />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--lb-text-tertiary))" fontSize={12} domain={[0, 0.1]} tickFormatter={(value) => `${(Number(value) * 100).toFixed(0)}%`} />
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--lb-bg-secondary))',
            borderColor: 'hsl(var(--lb-border-default))',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'hsl(var(--lb-text-primary))' }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>

        {/* Decision: Assigning colors from our theme directly to the data series. */}
        <Line yAxisId="left" type="monotone" dataKey="Avg. Agreement (Alpha)" stroke="hsl(var(--lb-primary-blue))" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="Avg. Precision (IoU)" stroke="hsl(var(--lb-accent-green))" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="Rework Rate" stroke="hsl(var(--lb-accent-red))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default QualityChart;