//
// FILE: components/IndividualTeamMemberChart.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // INDIVIDUAL PERFORMANCE ANALYSIS
// PURPOSE: Displays hybrid bar/line charts for individual team member performance metrics.
//
"use client";

import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface IndividualDataPoint {
  Week: string;
  Member: string;
  Throughput: number;
  "Reworked Annotations": number;
  "Rework Rate": number;
  "Mean IoU": number;
  "Krippendorff's Alpha": number;
}

interface IndividualTeamMemberChartProps {
  data: IndividualDataPoint[];
  memberName: string;
}

const IndividualTeamMemberChart: React.FC<IndividualTeamMemberChartProps> = ({ data, memberName }) => {
  const chartData = useMemo(() => {
    // Filter data for the specific member and create 24 weeks of data
    const memberData = data.filter(d => d.Member === memberName);
    
    // Create a complete 24-week dataset
    const completeData = [];
    for (let week = 1; week <= 24; week++) {
      const weekData = memberData.find(d => parseInt(d.Week) === week);
      if (weekData) {
        completeData.push({
          name: `W${week}`,
          "Throughput": weekData.Throughput,
          "Reworked Annotations": weekData["Reworked Annotations"],
          "Mean IoU (%)": (weekData["Mean IoU"] * 100).toFixed(1),
          "Krippendorff's Alpha (%)": (weekData["Krippendorff's Alpha"] * 100).toFixed(1),
        });
      } else {
        // Fill missing weeks with null values to maintain 24-week structure
        completeData.push({
          name: `W${week}`,
          "Throughput": null,
          "Reworked Annotations": null,
          "Mean IoU (%)": null,
          "Krippendorff's Alpha (%)": null,
        });
      }
    }
    return completeData;
  }, [data, memberName]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
        <defs>
          <linearGradient id={`colorThroughput-${memberName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--lb-primary-blue)" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="var(--lb-primary-blue)" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id={`colorReworked-${memberName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--lb-accent-red)" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="var(--lb-accent-red)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <XAxis 
          dataKey="name" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12}
          tick={{ fill: 'var(--lb-text-secondary)' }}
          ticks={chartData.map((_, i) => `W${i + 1}`).filter((_, i) => i % 4 === 0)}
          interval={0}
        />
        
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12} 
          tick={{ fill: 'var(--lb-text-secondary)' }}
          domain={[0, 'dataMax']} 
        />
        
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="var(--lb-text-tertiary)" 
          fontSize={12} 
          tick={{ fill: 'var(--lb-text-secondary)' }}
          tickFormatter={(value) => `${value.toFixed(1)}%`} 
          domain={[85, 100]} 
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
          formatter={(value: any, name: string) => {
            if (name === "Mean IoU (%)" || name === "Krippendorff's Alpha (%)") {
              return [value, name];
            }
            return [value, name];
          }}
        />
        
        <Legend 
          wrapperStyle={{ 
            bottom: 0,
            color: 'var(--lb-text-secondary)'
          }} 
        />
        
        {/* Bar charts for Throughput and Quality Issues */}
        <Bar 
          dataKey="Throughput" 
          yAxisId="left" 
          fill={`url(#colorThroughput-${memberName})`} 
          barSize={15}
          name="Throughput"
        />
        
        <Bar 
          dataKey="Reworked Annotations" 
          yAxisId="left" 
          fill={`url(#colorReworked-${memberName})`} 
          barSize={15}
          name="Quality Issues"
        />
        
        {/* Line charts for Mean IoU and Krippendorff's Alpha */}
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="Mean IoU (%)" 
          stroke="var(--lb-accent-green)" 
          strokeWidth={2} 
          dot={false}
          name="Mean IoU (%)"
          connectNulls={false}
        />
        
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="Krippendorff's Alpha (%)" 
          stroke="var(--lb-accent-purple)" 
          strokeWidth={2} 
          dot={false}
          name="Krippendorff's Alpha (%)"
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default IndividualTeamMemberChart; 