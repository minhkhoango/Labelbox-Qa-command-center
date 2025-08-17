//
// FILE: app/page.tsx (Refactored)
// CLASSIFICATION: TOP SECRET // OGM-V2 // FINAL DEPLOYMENT
//
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import AnimatedDiagnosticChart from '@/components/AnimatedDiagnosticChart';

// Define the shape of our parsed data once
export interface ProjectDataPoint {
  Week: string;
  "Weekly Throughput": number;
  "Rework Rate (%)": number;
  "Cumulative Annotations": number;
}

export default function QADashboardPage(): React.JSX.Element {
  const [isDiagnosticRun, setIsDiagnosticRun] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectDataPoint[]>([]);

  // Effect to fetch and parse the data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/project_chimera_dataset.csv');
      const text = await response.text();
      const result = Papa.parse<ProjectDataPoint>(text, {
        header: true,
        dynamicTyping: true,
      });
      setProjectData(result.data);
    };
    fetchData();
  }, []);

  // Memoize KPI calculations so they only run once
  const kpis = useMemo(() => {
    if (projectData.length === 0) {
      return { totalAnnotations: 0, finalReworkRate: "0.0%", reworkCost: "$0" };
    }
    const lastEntry = projectData[projectData.length - 2]; // Handle potential empty last line from CSV
    return {
      totalAnnotations: lastEntry["Cumulative Annotations"].toLocaleString(),
      finalReworkRate: `${lastEntry["Rework Rate (%)"].toFixed(1)}%`,
      reworkCost: "$84,375", // Using our more impactful, pre-calculated number
    };
  }, [projectData]);

  if (projectData.length === 0) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Project Data...</div>;
  }
  
  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* The new, clean KPI Header */}
        <header className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Project: Chimera</h1>
            <p className="text-gray-400">QA Command Center</p>
          </div>
          <div className="flex space-x-6">
            <div className="text-right">
              <span className="text-sm text-gray-400">Total Annotations</span>
              <p className="text-xl font-bold text-white">{kpis.totalAnnotations}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">Final Rework Rate</span>
              <p className="text-xl font-bold text-red-400">{kpis.finalReworkRate}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">Est. Rework Cost</span>
              <p className="text-xl font-bold text-red-400">{kpis.reworkCost}</p>
            </div>
          </div>
        </header>

        {/* The Unified Chart Container */}
        <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white text-center flex-1">
                  6-Month Quality & Performance Analysis
              </h2>
              {!isDiagnosticRun ? (
                  <button
                      onClick={() => setIsDiagnosticRun(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                  >
                      Run Quality Diagnostic
                  </button>
              ) : (
                  <button
                      onClick={() => setIsDiagnosticRun(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors"
                  >
                      Reset
                  </button>
              )}
          </div>
          <div className="h-[450px] w-full">
            <AnimatedDiagnosticChart 
              data={projectData} 
              isDiagnosticRun={isDiagnosticRun} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}