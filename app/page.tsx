//
// FILE: app/page.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // INTERACTIVE DEMO
// PURPOSE: The main dashboard component for the QA Command Center.
//
"use client";
import React, { useMemo } from 'react';
import { getProjectChimeraData } from '@/lib/data-generator';
import QualityChart from '@/components/QualityChart';
import PrecisionDiagnostics from '@/components/PrecisionDiagnostics';
import ConsensusDiagnostics from '@/components/ConsensusDiagnostics';

// This is the core of your "movie set".
export default function QADashboardPage(): React.JSX.Element {
  // Memoize the data generation. In a real app, this would be a fetch call.
  // For a demo, this ensures our story is consistent and the app is fast.
  const allData = useMemo(() => getProjectChimeraData(), []);

  // We'll process the data for our main overview chart here.
  const overviewData = useMemo(() => {
    const weeklyAverages: { [week: number]: { alpha: number[], iou: number[], rework: number[] } } = {};

    allData.forEach(dp => {
      if (!weeklyAverages[dp.week]) {
        weeklyAverages[dp.week] = { alpha: [], iou: [], rework: [] };
      }
      weeklyAverages[dp.week].alpha.push(dp.krippendorffsAlpha);
      weeklyAverages[dp.week].iou.push(dp.meanIoU);
      weeklyAverages[dp.week].rework.push(dp.reworkRate);
    });

    return Object.keys(weeklyAverages).map(weekStr => {
      const week = parseInt(weekStr, 10);
      const data = weeklyAverages[week];
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      
      return {
        name: `Week ${week}`,
        "Avg. Agreement (Alpha)": parseFloat(avg(data.alpha).toFixed(3)),
        "Avg. Precision (IoU)": parseFloat(avg(data.iou).toFixed(3)),
        "Rework Rate": parseFloat(avg(data.rework).toFixed(3)),
      };
    });
  }, [allData]);

  return (
    // Replicating the Labelbox layout structure.
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-lb-text-primary mb-6">
          Project: Chimera - QA Command Center
        </h1>

        {/* This is Mockup 1: The Command Center Overview */}
        <div className="bg-lb-bg-secondary border border-lb-border-default rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-lb-text-secondary mb-4">
            6-Month Quality & Performance Overview
          </h2>
          <div className="h-[400px] w-full">
            <QualityChart data={overviewData} />
          </div>
        </div>

        {/* --- Render the new components here, passing the full dataset --- */}
        <PrecisionDiagnostics data={allData} />
        {/* <ConsensusDiagnostics /> */}
      </div>
    </main>
  );
}