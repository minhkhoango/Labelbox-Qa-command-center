//
// FILE: components/PrecisionDiagnostics.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // ANOMALY DETECTION MODULE
// PURPOSE: Allows the user to drill down into a specific annotator's performance.
//
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Interface matching the CSV data structure
interface CSVDataPoint {
  Week: string;
  Member: string;
  Throughput: number;
  "Reworked Annotations": number;
  "Rework Rate": number;
  "Mean IoU": number;
}

// Interface for the component's internal data structure
interface AnnotationDataPoint {
  week: string;
  annotatorId: string;
  annotatorName: string;
  meanIoU: number;
}

interface Annotator {
  id: string;
  name: string;
}

// --- Helper component to simulate a "Sloppy Box". Part of the Minimum Viable Illusion.
const SloppyBoxExample: React.FC<{ iou: number }> = ({ iou }) => (
  <div className="border border-gray-700 p-2 rounded-md bg-[#111827]">
    <div className="relative w-full h-24 bg-gray-300 rounded-sm overflow-hidden">
      {/* The "Correct" Box (Green) */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-green-500" />
      {/* The "Annotator" Box (Red) - its size and position reflect the low IoU */}
      <div 
        className="absolute border-2 border-red-500"
        style={{
          top: `${25 - (1 - iou) * 20}%`,
          left: `${25 - (1 - iou) * 20}%`,
          width: `${50 + (1 - iou) * 40}%`,
          height: `${50 + (1 - iou) * 40}%`,
        }}
       />
    </div>
    <p className="text-xs text-center mt-2 text-gray-400">IoU: <span className="font-semibold text-red-400">{iou.toFixed(3)}</span></p>
  </div>
);

const PrecisionDiagnostics: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/individual_performance.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const result = Papa.parse<CSVDataPoint>(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        if (result.errors && result.errors.length > 0) {
          console.error('CSV parsing errors:', result.errors);
        }
        setCsvData(result.data);
      } catch (error) {
        console.error('Error fetching CSV data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transform CSV data to the format expected by the component
  const data: AnnotationDataPoint[] = useMemo(() => {
    if (!csvData || csvData.length === 0) {
      return [];
    }
    
    const transformed = csvData.map((row, index) => {
      const transformedRow = {
        week: `W${row.Week}`,
        annotatorId: row.Member.toLowerCase(),
        annotatorName: row.Member,
        meanIoU: row["Mean IoU"]
      };
      return transformedRow;
    });
    return transformed;
  }, [csvData]);

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

  if (loading) {
    return (
      <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6 mt-6">
        <div className="text-center text-gray-400">Loading individual performance data...</div>
      </div>
    );
  }

  if (!csvData || csvData.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6 mt-6">
        <div className="text-center text-gray-400">No individual performance data available.</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6 mt-6">
        <div className="text-center text-gray-400">Failed to process individual performance data.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-300 mb-4">
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {annotator.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium text-gray-300 mb-2">
            IoU Score Distribution ({annotators.find(a => a.id === selectedAnnotatorId)?.name})
          </h3>
          <p className="text-sm text-gray-400 mb-4">Distribution of annotation precision scores over the entire project.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={iouDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={60} />
                <Tooltip cursor={{ fill: '#1F2937' }} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F9FAFB' }} />
                <Bar dataKey="count" fill="#4F6AFB" background={{ fill: '#1F2937' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-300 mb-2">
            Lowest-Scoring Examples
          </h3>
           <p className="text-sm text-gray-400 mb-4">Visual proof of systematic errors for targeted retraining.</p>
          <div className="grid grid-cols-2 gap-4">
            {worstExamples.map((example) => (
              <SloppyBoxExample key={`${example.week}-${example.annotatorId}`} iou={example.meanIoU} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrecisionDiagnostics;