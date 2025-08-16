//
// FILE: components/PrecisionDiagnostics.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // ANOMALY DETECTION MODULE
// PURPOSE: Allows the user to drill down into a specific annotator's performance.
//
"use client";

import React, { useState, useMemo } from 'react';
import { AnnotationDataPoint, Annotator } from '@/lib/data-generator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Helper component to simulate a "Sloppy Box". Part of the Minimum Viable Illusion.
const SloppyBoxExample: React.FC<{ iou: number }> = ({ iou }) => (
  <div className="border border-lb-border-default p-2 rounded-md bg-lb-bg-primary">
    <div className="relative w-full h-24 bg-gray-300 rounded-sm overflow-hidden">
      {/* The "Correct" Box (Green) */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-lb-accent-green" />
      {/* The "Annotator" Box (Red) - its size and position reflect the low IoU */}
      <div 
        className="absolute border-2 border-lb-accent-red"
        style={{
          top: `${25 - (1 - iou) * 20}%`,
          left: `${25 - (1 - iou) * 20}%`,
          width: `${50 + (1 - iou) * 40}%`,
          height: `${50 + (1 - iou) * 40}%`,
        }}
       />
    </div>
    <p className="text-xs text-center mt-2 text-lb-text-secondary">IoU: <span className="font-semibold text-lb-accent-red">{iou.toFixed(3)}</span></p>
  </div>
);


interface PrecisionDiagnosticsProps {
  data: AnnotationDataPoint[];
}

const PrecisionDiagnostics: React.FC<PrecisionDiagnosticsProps> = ({ data }) => {
  // Derive the list of annotators dynamically from the data.
  const annotators = useMemo(() => {
    const annotatorMap = new Map<string, string>();
    data.forEach(d => annotatorMap.set(d.annotatorId, d.annotatorName));
    return Array.from(annotatorMap, ([id, name]) => ({ id, name }));
  }, [data]);

  const [selectedAnnotatorId, setSelectedAnnotatorId] = useState<string>(annotators[0]?.id || '');

  const annotatorData = useMemo(() => {
    return data.filter(d => d.annotatorId === selectedAnnotatorId);
  }, [data, selectedAnnotatorId]);

  // Logic to create the IoU distribution for the bar chart.
  const iouDistribution = useMemo(() => {
    const buckets: { [key: string]: number } = {
      "0.6-0.7": 0, "0.7-0.8": 0, "0.8-0.9": 0, "0.9-1.0": 0,
    };
    annotatorData.forEach(d => {
      if (d.meanIoU < 0.7) buckets["0.6-0.7"]++;
      else if (d.meanIoU < 0.8) buckets["0.7-0.8"]++;
      else if (d.meanIoU < 0.9) buckets["0.8-0.9"]++;
      else buckets["0.9-1.0"]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [annotatorData]);
  
  // Find the worst examples for the gallery.
  const worstExamples = useMemo(() => {
    return [...annotatorData].sort((a, b) => a.meanIoU - b.meanIoU).slice(0, 4);
  }, [annotatorData]);

  return (
    <div className="bg-lb-bg-secondary border border-lb-border-default rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-medium text-lb-text-secondary mb-4">
        Annotator Precision Diagnostics
      </h2>
      
      {/* Annotator Selection: The primary control for this module. */}
      <div className="flex flex-wrap gap-2 mb-6">
        {annotators.map(annotator => (
          <button
            key={annotator.id}
            onClick={() => setSelectedAnnotatorId(annotator.id)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              selectedAnnotatorId === annotator.id
                ? 'bg-lb-primary-blue text-white'
                : 'bg-lb-bg-primary text-lb-text-secondary hover:bg-gray-200'
            }`}
          >
            {annotator.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium text-lb-text-primary mb-2">
            IoU Score Distribution ({annotators.find(a => a.id === selectedAnnotatorId)?.name})
          </h3>
          <p className="text-sm text-lb-text-tertiary mb-4">Distribution of annotation precision scores over the entire project.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={iouDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--lb-border-default))" />
                <XAxis type="number" stroke="hsl(var(--lb-text-tertiary))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--lb-text-tertiary))" fontSize={12} width={60} />
                <Tooltip cursor={{ fill: 'hsl(var(--lb-bg-primary))' }} contentStyle={{ backgroundColor: 'hsl(var(--lb-bg-secondary))', borderColor: 'hsl(var(--lb-border-default))' }} />
                <Bar dataKey="count" fill="hsl(var(--lb-primary-blue))" background={{ fill: 'hsl(var(--lb-bg-primary))' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* <div>
          <h3 className="text-base font-medium text-lb-text-primary mb-2">
            Lowest-Scoring Examples
          </h3>
           <p className="text-sm text-lb-text-tertiary mb-4">Visual proof of systematic errors for targeted retraining.</p>
          <div className="grid grid-cols-2 gap-4">
            {worstExamples.map((example) => (
              <SloppyBoxExample key={`${example.week}-${example.annotatorId}`} iou={example.meanIoU} />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default PrecisionDiagnostics;