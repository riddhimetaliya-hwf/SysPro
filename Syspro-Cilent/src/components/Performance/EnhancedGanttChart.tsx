import React, { useState, useRef, useCallback } from 'react';
import { Job, Machine, FilterOptions } from '../../types/jobs';
import { GanttChart } from '../Scheduler/GanttChart';
import { format, addHours, differenceInHours } from 'date-fns';
import { AlertTriangle, TrendingUp, Zap, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/UI/badge';

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
    impactedJobs: Job[];
    efficiencyScore: number;
    suggestions: string[];
    resourceUtilization: { before: number; after: number };
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const analyzeJobImpact = useCallback(
    (job: Job, targetMachine?: string, targetDate?: Date) => {
      const impactedJobs = jobs.filter(
        (j) =>
          j.dependencies?.includes(job.id) ||
          (targetMachine && j.machineId === targetMachine && j.id !== job.id)
      );

      const currentMachineJobs = jobs.filter(
        (j) => j.machineId === job.machineId
      );
      const targetMachineJobs = targetMachine
        ? jobs.filter((j) => j.machineId === targetMachine)
        : [];

      const currentUtilization = (currentMachineJobs.length / 10) * 100;
      const targetUtilization = targetMachine
        ? (targetMachineJobs.length / 10) * 100
        : currentUtilization;

      const efficiencyScore = Math.max(
        0,
        100 - Math.abs(targetUtilization - 75)
      );

      const suggestions = [];
      if (impactedJobs.length > 3) {
        suggestions.push(
          'Consider splitting this move into smaller batches'
        );
      }
      if (targetUtilization > 90) {
        suggestions.push(
          'Target machine is near capacity - consider alternative machines'
        );
      }
      if (efficiencyScore < 60) {
        suggestions.push('This move may decrease overall efficiency');
      }
      if (job.hasDependency) {
        suggestions.push('Check dependent jobs after this move');
      }

      const conflicts = [];
      if (targetUtilization > 100) conflicts.push('Machine capacity exceeded');
      if (impactedJobs.some((j) => j.conflictType !== 'none'))
        conflicts.push('Dependent jobs have conflicts');
      if (targetDate && differenceInHours(targetDate, new Date()) < 2)
        conflicts.push('Very tight timeline');

      return {
        impactedJobs,
        efficiencyScore,
        suggestions,
        conflicts,
        resourceUtilization: {
          before: currentUtilization,
          after: targetUtilization
        }
      };
    },
    [jobs]
  );

  const handleEnhancedJobUpdate = (updatedJob: Job) => {
    const analysis = analyzeJobImpact(updatedJob);

    setIsDragging(false);
    setDragInfo(null);

    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };

  const handleDragStart = useCallback(
    (job: Job, targetMachine?: string, targetDate?: Date) => {
      setIsDragging(true);
      const analysis = analyzeJobImpact(job, targetMachine, targetDate);

      setDragInfo({
        job,
        targetMachine,
        targetDate,
        ...analysis
      });
    },
    [analyzeJobImpact]
  );

  return (
    <div className="relative">
      <GanttChart
        jobs={jobs}
        machines={machines}
        startDate={startDate}
        days={days}
        onJobUpdate={handleEnhancedJobUpdate}
        filters={filters}
      />

      {isDragging && dragInfo && (
        <Card className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-xl z-50 w-80">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">
                  Performance Intelligence
                </span>
              </div>
              <Badge
                variant={
                  dragInfo.efficiencyScore >= 80
                    ? 'default'
                    : dragInfo.efficiencyScore >= 60
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {dragInfo.efficiencyScore}% Efficiency
              </Badge>
            </div>

            <div className="bg-muted/50 rounded-lg p-2">
              <div className="font-medium text-sm">{dragInfo.job.name}</div>
              <div className="text-xs text-muted-foreground">
                {dragInfo.job.id}
              </div>
            </div>

            {dragInfo.targetMachine && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span>
                  Target:{' '}
                  {machines.find((m) => m.id === dragInfo.targetMachine)?.name}
                </span>
              </div>
            )}

            {dragInfo.targetDate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-green-500" />
                <span>
                  New time: {format(dragInfo.targetDate, 'MMM d, HH:mm')}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Impacted Jobs:</span>
                <Badge variant="outline">
                  {dragInfo.impactedJobs.length}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Utilization Change:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">
                    {Math.round(dragInfo.resourceUtilization.before)}%
                  </span>
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">
                    {Math.round(dragInfo.resourceUtilization.after)}%
                  </span>
                </div>
              </div>
            </div>

            {dragInfo.conflicts.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Conflicts Detected</span>
                </div>
                <ul className="text-xs space-y-0.5">
                  {dragInfo.conflicts.map((conflict, idx) => (
                    <li key={idx} className="text-destructive/80">
                      • {conflict}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dragInfo.suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="text-blue-800 text-sm font-medium mb-1">
                  💡 Smart Suggestion
                </div>
                <div className="text-xs text-blue-700">
                  {dragInfo.suggestions[0]}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center pt-2 border-t">
              <div
                className={`flex items-center gap-2 text-sm ${
                  dragInfo.efficiencyScore >= 80
                    ? 'text-green-600'
                    : dragInfo.efficiencyScore >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    dragInfo.efficiencyScore >= 80
                      ? 'bg-green-500'
                      : dragInfo.efficiencyScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                ></div>
                <span>
                  {dragInfo.efficiencyScore >= 80
                    ? 'Excellent Move'
                    : dragInfo.efficiencyScore >= 60
                    ? 'Good Move'
                    : 'Consider Alternative'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
