//
// FILE: app/page.tsx (Refactored)
// CLASSIFICATION: TOP SECRET // OGM-V2 // MAIN CONTROLLER
//
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import MainDashboardChart from '../components/MainDashboardChart'; // Renamed from AnimatedDiagnosticChart
import DrillDownChart from '../components/DrillDownChart';
import PrecisionDiagnostics from '../components/PrecisionDiagnostics';
import ConsensusDiagnostics from '../components/ConsensusDiagnostics';

// Define the shape of our parsed data once
export interface ProjectDataPoint {
  Week: string;
  "Weekly Throughput": number;
  "Rework Rate (%)": number;
  "Cumulative Annotations": number;
}

// Define the shape for the new chart data
export interface DiagnosticDataPoint {
    name: string;
    [key: string]: string | number | null;
}

export default function QADashboardPage(): React.JSX.Element {
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectDataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using the user-uploaded CSV file
        const response = await fetch('/team_performance.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const result = Papa.parse<ProjectDataPoint>(text, {
          header: true,
          dynamicTyping: false, // Don't auto-convert types
          skipEmptyLines: true,
        });
        if (result.errors && result.errors.length > 0) {
          console.error('Team CSV parsing errors:', result.errors);
        }
        
        // Convert string values to appropriate types
        const processedData = result.data.map(row => ({
          ...row,
          Week: String(row.Week),
          "Weekly Throughput": Number(row["Weekly Throughput"]),
          "Rework Rate (%)": Number(row["Rework Rate (%)"]),
          "Cumulative Annotations": Number(row["Cumulative Annotations"])
        }));
        
        setProjectData(processedData);
      } catch (error) {
        console.error('Error fetching team performance data:', error);
      }
    };
    fetchData();
  }, []);

  // Memoize all data transformations to prevent re-calculating on every render
  const { kpis, reworkChartData, iouChartData } = useMemo(() => {
    if (projectData.length === 0) {
      return { kpis: { totalAnnotations: 0, finalReworkRate: "0.0%", reworkCost: "$0" }, reworkChartData: [], iouChartData: [] };
    }
    const lastEntry = projectData[projectData.length - 1];
    
    const kpiData = {
      totalAnnotations: lastEntry["Cumulative Annotations"].toLocaleString(),
      finalReworkRate: `${lastEntry["Rework Rate (%)"].toFixed(1)}%`,
      reworkCost: "$84,375",
    };

    const diagnosticData = projectData.map((d, i) => {
        const teamRework = d["Rework Rate (%)"];
        // Logic from your prompt, ensuring Alex's data starts at week 9 (index 8)
        const alexRework = i >= 8 ? teamRework * 1.5 + (Math.random() * 0.02) : null;
        // Your IoU formula, scaled to a 0-1 range for the percentage axis
        const teamIoU = (96 - (i > 8 ? (i - 8) * 0.5 : 0) + (Math.random() - 0.5) * 2) / 100;

        return {
            name: `W${i + 1}`,
            "Team Rework Rate": teamRework,
            "Alex's Rework Rate": alexRework,
            "Team Avg. Precision (IoU)": teamIoU,
        };
    });

    return { kpis: kpiData, reworkChartData: diagnosticData, iouChartData: diagnosticData };
  }, [projectData]);

  if (projectData.length === 0) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Project Data...</div>;
  }
  
  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
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
              <span className="text-sm text-gray-400">Est. Rework Cost</span>
              <p className="text-xl font-bold text-red-400">{kpis.reworkCost}</p>
            </div>
          </div>
        </header>

        <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6 ">
          <h2 className="text-lg font-medium text-gray-300 mb-4 text-center">
            6-Month Throughput & Rework Summary
          </h2>
          <div className="h-[350px] w-full">
            {/* Your original chart, preserved as requested */}
            <MainDashboardChart data={projectData} />
          </div>
        </div>

        <div style={{ height: '20px' }} />

        <div className="flex justify-center py-16">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-8 rounded-2xl font-bold text-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl border-2 border-blue-500/50 min-w-[400px] min-h-[80px] flex items-center justify-center"
          >
            {showDiagnostics ? "Hide Diagnostic Analysis" : "Run Diagnostic Analysis"}
          </button>
        </div>

        {showDiagnostics && (
          <div>
            <div style={{ height: '20px' }}></div>
            <div className="flex flex-row gap-8" style={{ minHeight: '400px' }}>
              <div className="w-1/2 bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">
                  Rework Rate Analysis: Team vs. Alex
                </h3>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={reworkChartData}
                    lines={[
                      { dataKey: "Team Rework Rate", color: "#F87171" },
                      { dataKey: "Alex's Rework Rate", color: "#EF4444", strokeDasharray: "5 5" },
                    ]}
                    yAxisFormatter={(value: number) => `${(value).toFixed(1)}%`}
                    yAxisDomain={[0, 15]}
                  />
                </div>
              </div>
              <div className="w-1/2 bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">
                  Team Precision (IoU) Analysis
                </h3>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={iouChartData}
                    lines={[
                      { dataKey: "Team Avg. Precision (IoU)", color: "#34D399" },
                    ]}
                    yAxisFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                    yAxisDomain={[0.85, 1.0]}
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Diagnostic Components */}
            <div style={{ height: '20px' }}></div>
            
            {/* PrecisionDiagnostics now fetches its own data from CSV */}
            <PrecisionDiagnostics />
            
            <ConsensusDiagnostics />
          </div>
        )}
      </div>
    </main>
  );
}