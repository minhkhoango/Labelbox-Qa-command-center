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
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id={`colorReworked-${memberName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#DC2626" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          fontSize={12}
          ticks={chartData.map((_, i) => `W${i + 1}`).filter((_, i) => i % 4 === 0)}
          interval={0}
        />
        
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="#6b7280" 
          fontSize={12} 
          domain={[0, 'dataMax']} 
        />
        
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#6b7280" 
          fontSize={12} 
          tickFormatter={(value) => `${value.toFixed(1)}%`} 
          domain={[85, 100]} 
        />
        
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#d1d5db' }}
          formatter={(value: any, name: string) => {
            if (name === "Mean IoU (%)" || name === "Krippendorff's Alpha (%)") {
              return [value, name];
            }
            return [value, name];
          }}
        />
        
        <Legend wrapperStyle={{ bottom: 0 }} />
        
        {/* Bar charts for Throughput and Reworked Annotations */}
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
          name="Reworked Annotations"
        />
        
        {/* Line charts for Mean IoU and Krippendorff's Alpha */}
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="Mean IoU (%)" 
          stroke="#34D399" 
          strokeWidth={2} 
          dot={false}
          name="Mean IoU (%)"
          connectNulls={false}
        />
        
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="Krippendorff's Alpha (%)" 
          stroke="#8B5CF6" 
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