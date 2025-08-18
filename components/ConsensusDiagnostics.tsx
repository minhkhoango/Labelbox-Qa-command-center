//
// FILE: components/ConsensusDiagnostics.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // TEAM ALIGNMENT ANALYSIS
// PURPOSE: Provides visual evidence for team-level consensus failures.
//
"use client";

import React from 'react';

// --- MOCK DATA ---
// In a real application, this data would be fetched based on an analysis
// of the labeling data to find assets with the highest disagreement scores.
const consensusIssues = [
  {
    assetId: "sparkle_drink_01.jpg",
    imageUrl: "https://www.tcp.com/storage/content/product/energy-drink/red-bull/red-bull-1.png",
    votes: {
      "Soda": 3,
      "Energy Drink": 2,
    },
    analysis: {
      problem: "Category Ambiguity",
      action: "Update guidelines to clarify the difference between 'Soda' and 'Energy Drink'.",
    }
  },
  {
    assetId: "blurry_logo_02.jpg",
    imageUrl: "https://img.fruugo.com/product/8/36/1653837368_0340_0340.jpg",
    votes: {
      "Branded Mug": 3,
      "Unbranded Mug": 2,
    },
    analysis: {
      problem: "Insufficient Data Quality",
      action: "Route this asset for re-capture or flag as unusable.",
    }
  },
  {
    assetId: "side_view_car_03.jpg",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAxD1DkEuwv90_AUjac6RfR5AUHJMXI_K5zw&s",
    votes: {
      "Sedan": 3,
      "Coupe": 2,
    },
    analysis: {
      problem: "Edge Case",
      action: "Establish a clear rule for 2-door vs. 4-door sedans/coupes.",
    }
  },
];

// --- SUB-COMPONENTS ---

interface Vote {
  label: string;
  count: number;
  total: number;
}

const VoteBar: React.FC<Vote> = ({ label, count, total }) => {
  const percentage = (count / total) * 100;
  const colors: { [key: string]: string } = {
    "Energy Drink": "bg-purple-500",
    "Soda": "bg-red-500",
    "Branded Mug": "bg-teal-500",
    "Unbranded Mug": "bg-gray-500",
    "Skip": "bg-yellow-600",
    "Sedan": "bg-blue-500",
    "Coupe": "bg-indigo-500",
  };
  const colorClass = colors[label] || "bg-gray-600";

  return (
    <div className="flex items-center space-x-4">
      <span className="w-32 text-sm font-medium text-gray-300 truncate">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="w-10 text-sm font-semibold text-white">{count} vote{count > 1 ? 's' : ''}</span>
    </div>
  );
};


interface ConsensusIssueProps {
  issue: typeof consensusIssues[0];
}

const ConsensusIssueCard: React.FC<ConsensusIssueProps> = ({ issue }) => {
  const totalVotes = Object.values(issue.votes).reduce((sum, count) => sum + count, 0);

  return (
    // THIS IS THE FIX. `flex-col` for mobile, `md:flex-row` for desktop.
    <div className="bg-[#111827] border border-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
      {/* Left Side: Image */}
      <div className="md:w-1/3 flex-shrink-0">
        <img 
          src={issue.imageUrl} 
          alt={issue.assetId} 
          className="object-cover w-full h-48 md:h-full max-w-[500px] max-h-[500px]"
          style={{ maxWidth: '500px', maxHeight: '500px' }}
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error'; }}
        />
      </div>
      
      {/* Right Side: Analysis */}
      <div className="p-6 flex flex-col justify-between md:w-2/3">
        <div>
          <div className="text-sm font-mono text-gray-400 mb-2">{issue.assetId}</div>
          <h4 className="text-lg font-bold text-white mb-4">Consensus Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(issue.votes).map(([label, count]) => (
              <VoteBar key={label} label={label} count={count} total={totalVotes} />
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-red-400 font-semibold text-md">
            Verdict: <span className="font-bold">Consensus Failure</span>
          </div>
          <div className="text-gray-300 text-sm mt-1">
            <span className="font-semibold text-gray-400">Action Required:</span> {issue.analysis.action}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const ConsensusDiagnostics: React.FC = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">Evidence Locker</h3>
        <p className="text-gray-400">Top 3 assets with the highest label disagreement.</p>
      </div>
      <div className="space-y-8">
        {consensusIssues.map((issue) => (
          <ConsensusIssueCard key={issue.assetId} issue={issue} />
        ))}
      </div>
    </div>
  );
};

export default ConsensusDiagnostics;
