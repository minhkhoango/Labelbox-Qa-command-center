//
// FILE: components/ConsensusDiagnostics.tsx
// CLASSIFICATION: TOP SECRET // OGM-V2 // CONCEPT DRIFT MODULE
// PURPOSE: Visualizes consensus breakdown and the root cause of concept drift.
//
"use client";

import React from 'react';

// --- A simple component to simulate a contentious example.
const ContentiousExample: React.FC<{ annotatorA: string, annotatorB: string }> = ({ annotatorA, annotatorB }) => (
  <div className="border border-lb-border-default p-2 rounded-md bg-lb-bg-primary">
    <div className="w-full h-24 bg-gray-300 rounded-sm flex items-center justify-center">
      <span className="text-lb-text-tertiary text-sm font-semibold">SparkleDrink</span>
    </div>
    <div className="text-xs mt-2 space-y-1">
      <p className="text-lb-text-secondary">Annotator A: <span className="font-semibold text-lb-text-primary">{annotatorA}</span></p>
      <p className="text-lb-text-secondary">Annotator B: <span className="font-semibold text-lb-text-primary">{annotatorB}</span></p>
    </div>
  </div>
);


// Decision: The data for this is hardcoded to perfectly match the narrative climax.
// This is a strategic choice to ensure the demo's point is made with maximum clarity.
const confusionData = {
  labels: ["Soda", "Energy Drink", "Juice", "Water"],
  matrix: [
    [1204, 186, 12, 5],   // Actual: Soda
    [210, 1050, 8, 3],    // Actual: Energy Drink
    [8, 5, 1340, 1],     // Actual: Juice
    [2, 1, 0, 1500],     // Actual: Water
  ],
};

const getBgColor = (value: number, max: number): string => {
  if (value === 0) return 'bg-transparent';
  const intensity = Math.min(Math.floor((value / max) * 5), 4);
  const colors = ['bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500'];
  return colors[intensity];
};

const ConsensusDiagnostics: React.FC = () => {
  const maxConfusion = Math.max(...confusionData.matrix.flat().filter((v, i) => i % 5 !== 0));

  return (
    <div className="bg-lb-bg-secondary border border-lb-border-default rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-medium text-lb-text-secondary mb-4">
        Consensus Breakdown (Month 6)
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium text-lb-text-primary mb-2">
            Class Confusion Heatmap
          </h3>
          <p className="text-sm text-lb-text-tertiary mb-4">Highlights systematic disagreement between annotators for specific classes.</p>
          {/* A simple table styled to look like a heatmap. Effective and fast. */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-lb-text-secondary uppercase">
                <tr>
                  <th scope="col" className="py-2 px-2">Actual</th>
                  {confusionData.labels.map(label => (
                    <th key={label} scope="col" className="py-2 px-2 text-center">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionData.matrix.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-lb-border-default">
                    <th scope="row" className="py-2 px-2 font-medium text-lb-text-primary whitespace-nowrap">
                      {confusionData.labels[rowIndex]}
                    </th>
                    {row.map((cell, cellIndex) => {
                      const isDiagonal = rowIndex === cellIndex;
                      const bgColor = isDiagonal ? 'bg-green-100' : getBgColor(cell, maxConfusion);
                      return (
                        <td key={cellIndex} className={`py-2 px-2 text-center ${bgColor} ${isDiagonal ? 'text-green-800' : 'text-red-800'}`}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-base font-medium text-lb-text-primary mb-2">
            Most Contentious Examples
          </h3>
          <p className="text-sm text-lb-text-tertiary mb-4">The ambiguous items causing the "Soda" vs. "Energy Drink" concept drift.</p>
          <div className="grid grid-cols-2 gap-4">
              <ContentiousExample annotatorA="Soda" annotatorB="Energy Drink"/>
              <ContentiousExample annotatorA="Energy Drink" annotatorB="Soda"/>
              <ContentiousExample annotatorA="Soda" annotatorB="Energy Drink"/>
              <ContentiousExample annotatorA="Energy Drink" annotatorB="Soda"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsensusDiagnostics;