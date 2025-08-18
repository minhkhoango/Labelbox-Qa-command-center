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