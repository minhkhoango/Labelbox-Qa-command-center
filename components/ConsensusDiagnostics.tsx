//
// FILE: components/ConsensusDiagnostics.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // TEAM ALIGNMENT ANALYSIS
// PURPOSE: Provides visual evidence for team-level consensus failures.
//
"use client";

import React from 'react';

// --- MOCK DATA ---
// In a production environment, this data would be fetched based on an analysis
// of the labeling data to identify assets with the highest disagreement scores.
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
      action: "Update annotation guidelines to clarify the distinction between 'Soda' and 'Energy Drink' categories.",
    }
  },
  {
    assetId: "blurry_logo_02.jpg",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPTr_lD7DP8Z1BwA1UXCe9X9XWrOHR3SUWqg&s",
    votes: {
      "Branded Mug": 2,
      "Unbranded Mug": 2,
      "Skip": 1
    },
    analysis: {
      problem: "Insufficient Data Quality",
      action: "Route this asset for re-capture or flag as unusable for training.",
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
      problem: "Edge Case Classification",
      action: "Establish clear annotation rules for distinguishing 2-door vs. 4-door sedans/coupes.",
    }
  },
];

// --- SUB-COMPONENTS ---

// Function to scale down images if they exceed 500px in any dimension
const getScaledImageDimensions = (originalWidth: number, originalHeight: number, maxDimension: number = 500) => {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalWidth / originalHeight;
  
  if (originalWidth > originalHeight) {
    // Landscape image
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio)
    };
  } else {
    // Portrait or square image
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension
    };
  }
};

interface Vote {
  label: string;
  count: number;
  total: number;
}

const VoteBar: React.FC<Vote> = ({ label, count, total }) => {
  const percentage = (count / total) * 100;
  const colors: { [key: string]: string } = {
    "Energy Drink": "bg-lb-accent-purple",
    "Soda": "bg-lb-accent-red",
    "Branded Mug": "bg-lb-accent-green",
    "Unbranded Mug": "bg-lb-text-tertiary",
    "Skip": "bg-lb-accent-orange",
    "Sedan": "bg-lb-primary-blue",
    "Coupe": "bg-lb-accent-purple",
  };
  const colorClass = colors[label] || "bg-lb-text-tertiary";

  return (
    <div className="flex items-center space-x-4">
      <span className="w-32 text-sm font-medium text-lb-text-secondary truncate">{label}</span>
      <div className="flex-1 bg-lb-border-light rounded-full h-2.5">
        <div 
          className={`${colorClass} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="w-10 text-sm font-semibold text-lb-text-primary">{count} vote{count > 1 ? 's' : ''}</span>
    </div>
  );
};

interface ConsensusIssueProps {
  issue: typeof consensusIssues[0];
}

const ConsensusIssueCard: React.FC<ConsensusIssueProps> = ({ issue }) => {
  const totalVotes = Object.values(issue.votes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="card flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Image */}
      <div className="md:w-1/3 flex-shrink-0">
        <img 
          src={issue.imageUrl} 
          alt={issue.assetId} 
          className="object-cover w-full h-48 md:h-full"
          style={{
            maxWidth: '400px',
            maxHeight: '400px',
            width: 'auto',
            height: 'auto'
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            const { width, height } = getScaledImageDimensions(img.naturalWidth, img.naturalHeight);
            img.style.width = `${width}px`;
            img.style.height = `${height}px`;
          }}
          onError={(e) => { 
            e.currentTarget.src = 'https://placehold.co/600x400/EAEBEF/4A5568?text=Image+Error';
            e.currentTarget.style.width = '500px';
            e.currentTarget.style.height = '400px';
          }} 
        />
      </div>
      
      {/* Right Side: Analysis */}
      <div className="p-6 flex flex-col justify-between md:w-2/3">
        <div>
          <div className="text-sm font-mono text-lb-text-tertiary mb-2">{issue.assetId}</div>
          <h4 className="text-lg font-semibold text-lb-text-primary mb-4">Consensus Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(issue.votes).map(([label, count]) => (
              <VoteBar key={label} label={label} count={count} total={totalVotes} />
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-lb-border-light">
          <div className="accent-red font-semibold text-md">
            Assessment: <span className="font-bold">Consensus Failure</span>
          </div>
          <div className="text-lb-text-secondary text-sm mt-1">
            <span className="font-semibold text-lb-text-primary">Recommended Action:</span> {issue.analysis.action}
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
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-lb-text-primary mb-2">Evidence Locker</h3>
        <p className="text-lb-text-secondary">Top 3 assets with the highest annotation disagreement scores.</p>
      </div>
      <div className="space-y-6">
        {consensusIssues.map((issue, index) => (
          <div 
            key={issue.assetId} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <ConsensusIssueCard issue={issue} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsensusDiagnostics;
