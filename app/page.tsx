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
import { getTeamMemberRankings, getWorstPerformingMember, calculateReworkCost } from '../lib/performanceUtils';

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
      return { kpis: { totalAnnotations: 0, finalReworkRate: "0.0%", reworkCost: "$0", downstreamImpact: "$0" }, iouChartData: [] };
    }
    const lastEntry = projectData[projectData.length - 1];
    
    const { totalReworkCost, totalDownstreamImpact } = calculateReworkCost(projectData);
    
    const kpiData = {
      totalAnnotations: lastEntry["Cumulative Annotations"].toLocaleString(),
      finalReworkRate: `${lastEntry["Rework Rate (%)"].toFixed(1)}%`,
      reworkCost: totalReworkCost,
      downstreamImpact: totalDownstreamImpact,
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
    return (
      <div className="min-h-screen bg-lb-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lb-primary-blue mx-auto mb-4"></div>
          <p className="text-lb-text-secondary">Loading Project Data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-lb-bg-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 p-6 bg-lb-bg-secondary rounded-lg border border-lb-border-default shadow-lb-sm">
          <div className="flex items-center space-x-4">
            <img 
              src="https://i0.wp.com/ubiai.tools/wp-content/uploads/2024/01/Labelbox_Logo.jpg?fit=2120%2C1110&ssl=1" 
              alt="Labelbox Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h2 className="text-2xl font-semibold text-lb-text-primary">Quality Command Center</h2>
            </div>
          </div>
          <div className="flex space-x-8">
            <div className="text-right">
              <span className="text-sm text-lb-text-secondary block">Total Annotations</span>
              <p className="text-xl font-bold text-lb-text-primary">{kpis.totalAnnotations}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-lb-text-secondary block">Down Stream Impact</span>
              <p className="text-lg font-bold text-red-500">{kpis.downstreamImpact}</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-lb-text-secondary block">Rework Cost</span>
              <p className="text-lg text-red-500">{kpis.reworkCost}</p>
            </div>
          </div>
        </header>

        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-center text-lb-text-secondary">
              6-Month Throughput & Quality Metrics Summary
            </h3>
          </div>
          <div className="h-[350px] w-full">
            {/* Your original chart, preserved as requested */}
            <MainDashboardChart data={projectData} />
          </div>
        </div>

        <div className="flex justify-center py-8">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="btn-primary px-8 py-4 text-lg font-semibold min-w-[300px] min-h-[50px] flex items-center justify-center"
          >
            {showDiagnostics ? "Hide Quality Analysis" : "Run Quality Analysis"}
          </button>
        </div>

        {showDiagnostics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-center text-lb-text-secondary">
                    Team Precision (IoU) Analysis
                  </h3>
                </div>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={iouChartData}
                    lines={[
                      { dataKey: "Team Avg Precision (IoU)", color: "var(--lb-accent-green)" },
                    ]}
                    yAxisFormatter={(value: number) => value.toFixed(3)}
                    yAxisDomain={[0.8, 1.0]}
                  />
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3 className="text-center text-lb-text-secondary">
                    Team Agreement (Krippendorff's Alpha)
                  </h3>
                </div>
                <div className="h-[320px] w-full">
                  <DrillDownChart 
                    data={iouChartData}
                    lines={[
                      { dataKey: "Team Consensus (Alpha)", color: "var(--lb-accent-purple)" },
                    ]}
                    yAxisFormatter={(value: number) => value.toFixed(3)}
                    yAxisDomain={[0.8, 1.0]}
                  />
                </div>
              </div>
            </div>
            
            {/* Individual Team Member Analysis */}
            <div className="card">
              <MemberSelector
                selectedMember={selectedMember}
                onMemberChange={setSelectedMember}
                memberRankings={memberRankings}
              />
              
              {selectedMember && (
                <div className="mt-6 p-6 bg-lb-bg-tertiary border border-lb-border-light rounded-lg">
                  <h3 className="text-center text-lb-text-secondary mb-4">
                    {selectedMember} - 24-Week Quality Performance Overview
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
            
            <ConsensusDiagnostics />
          </div>
        )}
      </div>
    </main>
  );
}