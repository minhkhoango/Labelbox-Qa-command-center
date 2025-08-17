//
// FILE: components/DrillDownChart.tsx (Final Animation Refactor)
// CLASSIFICATION: TOP SECRET // OGM-V2 // DEFINITIVE ENGINE
// PURPOSE: A reusable, animated line chart that draws itself over a fixed time axis.
//
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  const [currentWeek, setCurrentWeek] = useState(0);

  // Animation effect: Runs when the component is mounted or data changes.
  useEffect(() => {
    setCurrentWeek(0); // Reset on change
    const interval = setInterval(() => {
      setCurrentWeek(prev => {
        const next = prev + 1;
        if (next > data.length) {
          clearInterval(interval);
          return data.length;
        }
        return next;
      });
    }, 75); // Your specified 75ms interval for a steady reveal.

    return () => clearInterval(interval);
  }, [data]);

  // The new animation logic. This is the core change.
  // We create a new dataset where future data points are "nulled out".
  // The chart always gets the full 24 weeks, ensuring the X-axis is static.
  const animatedData = useMemo(() => {
    return data.map((point, index) => {
      // If the index is beyond the current animated week...
      if (index >= currentWeek) {
        // ...return a point that has the X-axis value but null for all data lines.
        const nullifiedPoint: { [key: string]: any } = { name: point.name };
        lines.forEach(line => {
          nullifiedPoint[line.dataKey] = null;
        });
        return nullifiedPoint as DiagnosticDataPoint;
      }
      // Otherwise, return the actual data point.
      return point;
    });
  }, [currentWeek, data, lines]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={animatedData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          fontSize={12}
          // The ticks are now based on the full, original dataset, not the animated one.
          ticks={data.map(d => d.name).filter((_, i) => (i) % 4 === 0)}
          interval={0} // Ensure all specified ticks are shown
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={yAxisFormatter}
          // Set a static domain so the Y-axis doesn't rescale during animation
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
            // CRITICAL: This prop tells the line to stop drawing when it hits a null value.
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DrillDownChart;