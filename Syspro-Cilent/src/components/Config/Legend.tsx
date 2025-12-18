
import React from 'react';

export const Legend = () => {
  return (
    <div className="bg-card p-3 rounded-md shadow-sm border">
      <h3 className="text-sm font-medium mb-2">Legend</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center text-xs gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
          <span>No Conflict</span>
        </div>
        <div className="flex items-center text-xs gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm" 
               style={{backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)', 
                       backgroundSize: '10px 10px'}}></div>
          <span>Capacity Conflict</span>
        </div>
        <div className="flex items-center text-xs gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded-sm"
               style={{backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)', 
                       backgroundSize: '10px 10px'}}></div>
          <span>Material Conflict</span>
        </div>
        <div className="flex items-center text-xs gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm"
               style={{backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%)', 
                       backgroundSize: '10px 10px'}}></div>
          <span>Resource Conflict</span>
        </div>
        <div className="flex items-center text-xs gap-2">
          <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded-sm"></div>
          <span>Has Dependency</span>
        </div>
      </div>
    </div>
  );
};
