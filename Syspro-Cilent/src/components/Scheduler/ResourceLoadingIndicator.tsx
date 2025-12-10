
import React from 'react';
import { Machine } from '@/types/jobs';
import { Progress } from '@/components/ui/progress';

interface ResourceLoadingIndicatorProps {
  machine: Machine;
  currentLoad: number;
  maxCapacity: number;
}

export const ResourceLoadingIndicator = ({ machine, currentLoad, maxCapacity }: ResourceLoadingIndicatorProps) => {
  const loadPercentage = (currentLoad / maxCapacity) * 100;
  
  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{machine.name}</span>
          <span className="text-xs text-muted-foreground">
            {Math.round(loadPercentage)}%
          </span>
        </div>
        <Progress 
          value={loadPercentage} 
          className="h-2"
        />
      </div>
      <div className={`w-3 h-3 rounded-full ${getLoadColor(loadPercentage)}`} />
    </div>
  );
};
