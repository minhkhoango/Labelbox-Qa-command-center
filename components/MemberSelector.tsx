//
// FILE: components/MemberSelector.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // MEMBER SELECTION INTERFACE
// PURPOSE: Provides a dropdown selector for individual team member charts
//

"use client";

import React from 'react';
import { MemberPerformanceScore } from '../lib/performanceUtils';

interface MemberSelectorProps {
  selectedMember: string;
  onMemberChange: (member: string) => void;
  memberRankings: MemberPerformanceScore[];
}

const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMember,
  onMemberChange,
  memberRankings
}) => {
  return (
    <div className="flex justify-start mb-6">
      <div className="flex items-center gap-4">
        <label htmlFor="member-select" className="text-sm font-medium text-lb-text-secondary">
          Select Team Member:
        </label>
        <select
          id="member-select"
          value={selectedMember}
          onChange={(e) => onMemberChange(e.target.value)}
          className="bg-lb-bg-secondary border border-lb-border-default text-lb-text-primary text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lb-primary-blue focus:ring-opacity-20 focus:border-lb-border-focus transition-all duration-200 hover:border-lb-text-tertiary min-w-[250px]"
        >
          {memberRankings.map((ranking) => (
            <option key={ranking.member} value={ranking.member}>
              {ranking.member} ({ranking.score.toFixed(3)})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MemberSelector; 