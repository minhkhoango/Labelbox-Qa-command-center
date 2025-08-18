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
    <div className="flex justify-start mb-6 p-6">
      <div className="flex items-center gap-4">
        
        <select
          id="member-select"
          value={selectedMember}
          onChange={(e) => onMemberChange(e.target.value)}
          className="bg-gray-800 border-2 border-gray-600 text-white text-base rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 min-w-[250px] h-12"
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