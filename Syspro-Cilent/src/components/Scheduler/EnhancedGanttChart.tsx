import React, { useState, useRef } from 'react';
import { Job, Machine, FilterOptions } from '../../types/jobs';
import { GanttChart } from './GanttChart';
import { ZoomControls, ZoomLevel } from './ZoomControls';
import { SwimlanesControls, SwimlaneGroup } from './SwimlanesControls';
import { ResourceLoadingIndicator } from './ResourceLoadingIndicator';
import { BaselineComparison } from './BaselineComparison';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EnhancedGanttChartProps {
  jobs: Job[];
  machines: Machine[];
  startDate: Date;
  days: number;
  onJobUpdate?: (updatedJob: Job) => void;
  filters?: FilterOptions;
}

export const EnhancedGanttChart = ({ 
  jobs, 
  machines, 
  startDate, 
  days,
  onJobUpdate,
  filters 
}: EnhancedGanttChartProps) => {
  const [dragInfo, setDragInfo] = useState<{
    job: Job;
    targetMachine?: string;
    targetDate?: Date;
    conflicts: string[];
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('days');
  const [swimlaneGrouping, setSwimlaneGrouping] = useState<SwimlaneGroup>('none');

  const handleZoomChange = (zoom: ZoomLevel) => {
    setZoomLevel(zoom);
    toast.info(`Zoom level changed to ${zoom}`);
  };

  const handleZoomIn = () => {
    const levels: ZoomLevel[] = ['months', 'weeks', 'days', 'hours'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const levels: ZoomLevel[] = ['months', 'weeks', 'days', 'hours'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(levels[currentIndex - 1]);
    }
  };

  const handleGroupingChange = (grouping: SwimlaneGroup) => {
    setSwimlaneGrouping(grouping);
    toast.info(`Grouping changed to ${grouping === 'none' ? 'none' : grouping}`);
  };

  const handleEnhancedJobUpdate = (updatedJob: Job) => {
    const impactedJobs = jobs.filter(job => 
      job.dependencies?.includes(updatedJob.id) || 
      (job.machineId === updatedJob.machineId && job.id !== updatedJob.id)
    );

    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }

    if (impactedJobs.length > 0) {
      console.debug(`[EnhancedGanttChart] ${impactedJobs.length} impacted jobs`);
    }
  };

  const getResourceLoading = (machine: Machine) => {
    const machineJobs = jobs.filter(job => job.machineId === machine.id);
    const currentLoad = machineJobs.length * 25; 
    return { currentLoad, maxCapacity: machine.capacity };
  };

  return (
    <div className="relative space-y-4">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-4">
          <ZoomControls
            currentZoom={zoomLevel}
            onZoomChange={handleZoomChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
          <SwimlanesControls
            currentGrouping={swimlaneGrouping}
            onGroupingChange={handleGroupingChange}
          />
        </div>
        
        {/* Resource Loading Panel */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Resource Loading:</span>
          <div className="flex gap-1">
            {machines.slice(0, 3).map(machine => {
              const { currentLoad, maxCapacity } = getResourceLoading(machine);
              const loadPercentage = (currentLoad / maxCapacity) * 100;
              return (
                <div
                  key={machine.id}
                  className={`w-3 h-3 rounded-full ${
                    loadPercentage >= 90 ? 'bg-red-500' :
                    loadPercentage >= 75 ? 'bg-orange-500' :
                    loadPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  title={`${machine.name}: ${Math.round(loadPercentage)}%`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Gantt Chart */}
      <div className="border rounded-lg bg-background overflow-hidden">
        <GanttChart
          jobs={jobs}
          machines={machines}
          startDate={startDate}
          days={days}
          onJobUpdate={handleEnhancedJobUpdate}
          filters={filters}
        />
      </div>
      
      {/* Enhanced drag preview overlay */}
      {dragInfo && (
        <div className="absolute top-4 right-4 bg-popover border rounded-lg p-3 shadow-lg z-50 max-w-xs">
          <h4 className="font-medium text-sm mb-2">Moving: {dragInfo.job.name}</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            {dragInfo.targetDate && (
              <p>📅 New date: {format(dragInfo.targetDate, 'MMM d, yyyy')}</p>
            )}
            {dragInfo.targetMachine && (
              <p>🏭 Target machine: {machines.find(m => m.id === dragInfo.targetMachine)?.name}</p>
            )}
            {dragInfo.conflicts.length > 0 && (
              <div className="text-destructive">
                <p>⚠️ Conflicts detected:</p>
                <ul className="list-disc list-inside ml-2">
                  {dragInfo.conflicts.map((conflict, idx) => (
                    <li key={idx}>{conflict}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Loading Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Machine Capacity</h4>
          <div className="space-y-2">
            {machines.map(machine => {
              const { currentLoad, maxCapacity } = getResourceLoading(machine);
              return (
                <ResourceLoadingIndicator
                  key={machine.id}
                  machine={machine}
                  currentLoad={currentLoad}
                  maxCapacity={maxCapacity}
                />
              );
            })}
          </div>
        </div>

        <BaselineComparison jobs={jobs} />
      </div>
    </div>
  );
};
