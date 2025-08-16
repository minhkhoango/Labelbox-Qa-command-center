//
// FILE: lib/data-generator.ts
// CLASSIFICATION: TOP SECRET // OGM-V2 // NARRATIVE ENGINE
// PURPOSE: Generates the full 6-month data story for the "Project Chimera" demo.
//

//
// Strict Typing: Define the shape of our data. No ambiguity.
// This is the contract for our components.
//
export interface Annotator {
    id: string;
    name: string;
  }
  
  export interface AnnotationDataPoint {
    week: number;
    annotatorId: string;
    annotatorName: string;
    krippendorffsAlpha: number;
    meanIoU: number;
    reworkRate: number;
  }
  
  //
  // The Cast: Our team of annotators for Project Chimera.
  // Alex joins in Month 3 (Week 9).
  //
  const ANNOTATORS: Annotator[] = [
    { id: "annotator-1", name: "Charles" },
    { id: "annotator-2", name: "Diana" },
    { id: "annotator-3", name: "Edward" },
    { id: "annotator-4", name: "Fiona" },
    { id: "annotator-5", name: "George" },
  ];
  
  const NEW_ANNOTATOR: Annotator = { id: "annotator-6", name: "Alex" };
  
  //
  // The Narrative Logic: Functions that create the story arc.
  //
  const generateStableBaseline = (weeks: number, annotators: Annotator[]): AnnotationDataPoint[] => {
    const data: AnnotationDataPoint[] = [];
    for (let week = 1; week <= weeks; week++) {
      annotators.forEach(annotator => {
        data.push({
          week,
          annotatorId: annotator.id,
          annotatorName: annotator.name,
          // Decision: Keep baseline alpha high and stable, with minor fluctuations.
          krippendorffsAlpha: 0.92 + (Math.random() - 0.5) * 0.04,
          // Decision: Keep IoU near-perfect to establish a strong start.
          meanIoU: 0.96 + (Math.random() - 0.5) * 0.03,
          // Decision: Rework is minimal during the "honeymoon" phase.
          reworkRate: 0.02 + (Math.random() - 0.5) * 0.01,
        });
      });
    }
    return data;
  };
  
  const introduceDriftAndFatigue = (startWeek: number, endWeek: number): AnnotationDataPoint[] => {
    const data: AnnotationDataPoint[] = [];
    const fullTeam = [...ANNOTATORS, NEW_ANNOTATOR];
  
    for (let week = startWeek; week <= endWeek; week++) {
      fullTeam.forEach(annotator => {
        const isNewAnnotator = annotator.id === NEW_ANNOTATOR.id;
        const weeksActive = week - startWeek + 1;
  
        // --- As per your report: Alex's precision decay is immediate and severe.
        const iouDrift = isNewAnnotator ? -0.2 : 0;
        // --- As per your report: Fatigue affects the whole team over time.
        const fatigueDecay = -0.005 * weeksActive;
  
        data.push({
          week,
          annotatorId: annotator.id,
          annotatorName: annotator.name,
          // Decision: Alpha degrades for everyone due to increased complexity and fatigue.
          krippendorffsAlpha: 0.92 + fatigueDecay + (Math.random() - 0.5) * 0.05,
          // Decision: IoU is hit by both Alex's specific issues and general fatigue.
          meanIoU: 0.96 + iouDrift + fatigueDecay + (Math.random() - 0.5) * 0.04,
          // Decision: Rework rate climbs steadily as quality drops. This is the cost.
          reworkRate: 0.02 + 0.01 * weeksActive + (Math.random() - 0.5) * 0.01,
        });
      });
    }
    return data;
  };
  
  
  //
  // The Master Function: Assemble the complete 6-month (24-week) narrative.
  // This is the single function we'll call from our frontend.
  //
  export const getProjectChimeraData = (): AnnotationDataPoint[] => {
    // Month 1-2 (Weeks 1-8): The Baseline of Excellence
    const baselineData = generateStableBaseline(8, ANNOTATORS);
  
    // Month 3-6 (Weeks 9-24): The Slow Decay
    const driftData = introduceDriftAndFatigue(9, 24);
  
    const fullData = [...baselineData, ...driftData];
    
    // Clean up data to be more realistic (e.g., clamp values between 0 and 1)
    return fullData.map(d => ({
      ...d,
      krippendorffsAlpha: Math.max(0.5, Math.min(d.krippendorffsAlpha, 0.98)),
      meanIoU: Math.max(0.6, Math.min(d.meanIoU, 0.99)),
      reworkRate: Math.max(0.01, Math.min(d.reworkRate, 0.08)),
    }));
  };