//
// FILE: lib/performanceUtils.ts
// CLASSIFICATION: TOP SECRET // OGM-V2 // PERFORMANCE CALCULATION UTILITIES
// PURPOSE: Calculate weighted performance scores for team members
//

export interface IndividualDataPoint {
  Week: string;
  Member: string;
  Throughput: number;
  "Reworked Annotations": number;
  "Rework Rate": number;
  "Mean IoU": number;
  "Krippendorff's Alpha": number;
}

export interface MemberPerformanceScore {
  member: string;
  score: number;
  avgThroughput: number;
  avgReworkRate: number;
  avgIoU: number;
  avgAlpha: number;
}

export function calculateMemberPerformanceScore(
  data: IndividualDataPoint[],
  member: string
): MemberPerformanceScore {
  const memberData = data.filter(d => d.Member === member);
  
  if (memberData.length === 0) {
    return {
      member,
      score: 0,
      avgThroughput: 0,
      avgReworkRate: 0,
      avgIoU: 0,
      avgAlpha: 0
    };
  }

  // Calculate averages for the member
  const avgThroughput = memberData.reduce((sum, d) => sum + d.Throughput, 0) / memberData.length;
  const avgReworkRate = memberData.reduce((sum, d) => sum + d["Rework Rate"], 0) / memberData.length;
  const avgIoU = memberData.reduce((sum, d) => sum + d["Mean IoU"], 0) / memberData.length;
  const avgAlpha = memberData.reduce((sum, d) => sum + d["Krippendorff's Alpha"], 0) / memberData.length;

  // Normalize values to 0-1 scale for fair comparison
  // Throughput: normalize to 0-1 (assuming max reasonable throughput is 1200)
  const normalizedThroughput = Math.min(avgThroughput / 1200, 1);
  
  // Rework Rate: lower is better, so invert (1 - rate)
  const normalizedReworkRate = Math.max(0, 1 - avgReworkRate);
  
  // IoU and Alpha are already 0-1, but we can apply some scaling if needed
  const normalizedIoU = avgIoU;
  const normalizedAlpha = avgAlpha;

  // Weighted scoring (you can adjust these weights)
  const weights = {
    throughput: 0.25,    // 25% weight
    reworkRate: 0.25,    // 25% weight (lower is better)
    iou: 0.25,           // 25% weight
    alpha: 0.25           // 25% weight
  };

  const score = (
    normalizedThroughput * weights.throughput +
    normalizedReworkRate * weights.reworkRate +
    normalizedIoU * weights.iou +
    normalizedAlpha * weights.alpha
  );

  return {
    member,
    score,
    avgThroughput,
    avgReworkRate,
    avgIoU,
    avgAlpha
  };
}

export function getTeamMemberRankings(data: IndividualDataPoint[]): MemberPerformanceScore[] {
  const members = [...new Set(data.map(d => d.Member))];
  
  const rankings = members.map(member => 
    calculateMemberPerformanceScore(data, member)
  );
  
  // Sort by score (ascending - lowest score is worst performer)
  return rankings.sort((a, b) => a.score - b.score);
}

export function getWorstPerformingMember(data: IndividualDataPoint[]): string {
  const rankings = getTeamMemberRankings(data);
  return rankings[0]?.member || '';
} 

/**
 * Calculate the estimated quality drift cost based on team performance data
 * Formula: Total Rework Cost + Downstream Impact
 * 
 * Rework Cost = Σ[(Rework_count(week_i) - Rework_count(week_1)) * 0.033 * 20]
 * Downstream Impact = Σ[Max(0, (IoU_week_1 - IoU_week_i)) * 10,000,000]
 * 
 * @param projectData - Array of project data points
 * @returns The calculated cost as a formatted currency string
 */
export function calculateReworkCost(projectData: any[]): string {
  if (projectData.length === 0) return "$0";
  
  // Constants from the user's specification
  const TIME_TAKEN_PER_ANNOTATION = 0.033; // hours per annotation
  const ANNOTATOR_SALARY = 20; // dollars per hour
  const SALES_IMPACT = 10000000; // 10 million dollars sales impact per IoU point
  
  // Week 1 is the benchmark (index 0)
  const benchmarkWeek = projectData[0];
  const benchmarkReworkRate = benchmarkWeek["Rework Rate (%)"];
  const benchmarkIoU = benchmarkWeek["Mean IoU"];
  
  let totalReworkCost = 0;
  let totalDownstreamImpact = 0;
  
  // Calculate for each week starting from week 2 (index 1)
  for (let i = 1; i < projectData.length; i++) {
    const weekData = projectData[i];
    const currentReworkRate = weekData["Rework Rate (%)"];
    const currentIoU = weekData["Mean IoU"];
    const weeklyThroughput = weekData["Weekly Throughput"];
    
    // Rework Cost calculation
    const benchmarkReworkCount = weeklyThroughput * (benchmarkReworkRate / 100);
    const currentReworkCount = weeklyThroughput * (currentReworkRate / 100);
    const reworkCostDifference = (currentReworkCount - benchmarkReworkCount) * TIME_TAKEN_PER_ANNOTATION * ANNOTATOR_SALARY;
    
    totalReworkCost += reworkCostDifference;
    
    // Downstream Impact calculation - only count when IoU degrades (positive impact = cost)
    const iouDrop = benchmarkIoU - currentIoU;
    const downstreamImpact = Math.max(0, iouDrop * SALES_IMPACT); // Only count degradation
    
    totalDownstreamImpact += downstreamImpact;
  }
  
  // Total estimated quality drift
  const totalEstimatedDrift = totalReworkCost + totalDownstreamImpact;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Quality Drift Cost Calculation Debug:');
    console.log(`  Total Rework Cost: $${totalReworkCost.toFixed(2)}`);
    console.log(`  Total Downstream Impact: $${totalDownstreamImpact.toFixed(2)}`);
    console.log(`  Total Estimated Quality Drift: $${totalEstimatedDrift.toFixed(2)}`);
  }
  
  // Format the result as currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalEstimatedDrift);
} 