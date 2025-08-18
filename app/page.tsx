//
// FILE: app/page.tsx (Refactored)
// CLASSIFICATION: TOP SECRET // OGM-V2 // MAIN CONTROLLER
//
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import MainDashboardChart from '../components/MainDashboardChart';
import DrillDownChart from '../components/DrillDownChart';
import IndividualTeamMemberChart from '../components/IndividualTeamMemberChart';
import ConsensusDiagnostics from '../components/ConsensusDiagnostics';
import MemberSelector from '../components/MemberSelector';
import { getTeamMemberRankings, getWorstPerformingMember } from '../lib/performanceUtils';

// Define the shape of our parsed data once
export interface ProjectDataPoint {
  Week: string;
  "Weekly Throughput": number;
  "Rework Rate (%)": number;
  "Cumulative Annotations": number;
  "Krippendorff's Alpha": number;
  "Mean IoU": number;
}

// Define the shape for the new chart data
export interface DiagnosticDataPoint {
    name: string;
    [key: string]: string | number | null;
}

// Define the shape for individual performance data
export interface IndividualDataPoint {
  Week: string;
  Member: string;
  Throughput: number;
  "Reworked Annotations": number;
  "Rework Rate": number;
  "Mean IoU": number;
  "Krippendorff's Alpha": number;
}

export default function QADashboardPage(): React.JSX.Element {
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ProjectDataPoint[]>([]);
  const [individualData, setIndividualData] = useState<IndividualDataPoint[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team performance data
        const teamResponse = await fetch('/team_performance.csv');
        if (!teamResponse.ok) {
          throw new Error(`HTTP error! status: ${teamResponse.status}`);
        }
        const teamText = await teamResponse.text();
        const teamResult = Papa.parse<ProjectDataPoint>(teamText, {
          header: true,
          dynamicTyping: false, // Don't auto-convert types
          skipEmptyLines: true,
        });
        if (teamResult.errors && teamResult.errors.length > 0) {
          console.error('Team CSV parsing errors:', teamResult.errors);
        }
        
        // Convert string values to appropriate types
        const processedTeamData = teamResult.data.map(row => ({
          ...row,
          Week: String(row.Week),
          "Weekly Throughput": Number(row["Weekly Throughput"]),
          "Rework Rate (%)": Number(row["Rework Rate (%)"]),
          "Cumulative Annotations": Number(row["Cumulative Annotations"]),
          "Krippendorff's Alpha": Number(row["Krippendorff's Alpha"]),
          "Mean IoU": Number(row["Mean IoU"]),
        }));
        
        setProjectData(processedTeamData);

        // Fetch individual performance data
        const individualResponse = await fetch('/individual_performance.csv');
        if (!individualResponse.ok) {
          throw new Error(`HTTP error! status: ${individualResponse.status}`);
        }
        const individualText = await individualResponse.text();
        const individualResult = Papa.parse<IndividualDataPoint>(individualText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        if (individualResult.errors && individualResult.errors.length > 0) {
          console.error('Individual CSV parsing errors:', individualResult.errors);
        }
        
        setIndividualData(individualResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Memoize all data transformations to prevent re-calculating on every render
  const { kpis, iouChartData } = useMemo(() => {
    if (projectData.length === 0) {
      return { kpis: { totalAnnotations: 0, finalReworkRate: "0.0%", reworkCost: "$0" }, iouChartData: [] };
    }
    const lastEntry = projectData[projectData.length - 1];
    
    const kpiData = {
      totalAnnotations: lastEntry["Cumulative Annotations"].toLocaleString(),
      finalReworkRate: `${lastEntry["Rework Rate (%)"].toFixed(1)}%`,
      reworkCost: "$84,375",
    };

    const diagnosticData = projectData.map((d, i) => {
        const teamAlpha = d["Krippendorff's Alpha"];
        const teamIoU = d["Mean IoU"]; // Use real data instead of hardcoded calculation

        return {
            name: `W${i + 1}`,
            "Team Avg Precision (IoU)": teamIoU,
            "Team Consensus (Alpha)": teamAlpha,
        };
    });

    return { kpis: kpiData, iouChartData: diagnosticData };
  }, [projectData]);

  // Get team member rankings and set default selected member
  const memberRankings = useMemo(() => {
    if (!individualData || individualData.length === 0) return [];
    return getTeamMemberRankings(individualData);
  }, [individualData]);

  // Set default selected member to worst performer when data loads
  useEffect(() => {
    if (memberRankings.length > 0 && !selectedMember) {
      setSelectedMember(getWorstPerformingMember(individualData));
    }
  }, [memberRankings, selectedMember, individualData]);

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
                  Team Precision (IoU) Analysis
                </h3>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={iouChartData}
                    lines={[
                      { dataKey: "Team Avg Precision (IoU)", color: "#34D399" },
                    ]}
                    yAxisFormatter={(value: number) => value.toFixed(3)}
                    yAxisDomain={[0.8, 1.0]}
                  />
                </div>
              </div>
              <div className="w-1/2 bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">
                  Team Consensus (Krippendorff's Alpha)
                </h3>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={iouChartData}
                    lines={[
                      { dataKey: "Team Consensus (Alpha)", color: "#8B5CF6" },
                    ]}
                    yAxisFormatter={(value: number) => value.toFixed(3)}
                    yAxisDomain={[0.8, 1.0]}
                  />
                </div>
              </div>
            </div>
            
            {/* Individual Team Member Analysis */}
            <div style={{ height: '20px' }}></div>
            
            <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg p-6">
              <MemberSelector
                selectedMember={selectedMember}
                onMemberChange={setSelectedMember}
                memberRankings={memberRankings}
              />
              
              {selectedMember && (
                <div className="bg-[#1F2937] border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">
                    {selectedMember} - 24-Week Performance Overview
                  </h3>
                  <div className="h-[400px] w-full">
                    <IndividualTeamMemberChart 
                      data={individualData} 
                      memberName={selectedMember} 
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ height: '20px' }}></div>
            
            <ConsensusDiagnostics />
          </div>
        )}
      </div>
    </main>
  );
}