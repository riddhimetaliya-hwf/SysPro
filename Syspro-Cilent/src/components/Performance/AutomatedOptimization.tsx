
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Job, Machine } from '@/types/jobs';
import { Zap, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationRun {
  id: string;
  type: 'efficiency' | 'cost' | 'time' | 'balanced';
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  improvement: number;
  duration: number;
}

interface AutomatedOptimizationProps {
  jobs: Job[];
  machines: Machine[];
  onOptimizationComplete?: (optimizedJobs: Job[]) => void;
}

export const AutomatedOptimization = ({ jobs, machines, onOptimizationComplete }: AutomatedOptimizationProps) => {
  const [currentRun, setCurrentRun] = useState<OptimizationRun | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationRun[]>([]);

  const startOptimization = (type: OptimizationRun['type']) => {
    const newRun: OptimizationRun = {
      id: Date.now().toString(),
      type,
      status: 'running',
      progress: 0,
      improvement: 0,
      duration: 0
    };

    setCurrentRun(newRun);
    toast.success(`Starting ${type} optimization...`);

    // Simulate optimization process
    const interval = setInterval(() => {
      setCurrentRun(prev => {
        if (!prev || prev.progress >= 100) {
          clearInterval(interval);
          return prev;
        }

        const newProgress = Math.min(prev.progress + Math.random() * 15 + 5, 100);
        const improvement = Math.round((newProgress / 100) * (10 + Math.random() * 25));
        
        if (newProgress >= 100) {
          const completedRun = {
            ...prev,
            status: 'completed' as const,
            progress: 100,
            improvement,
            duration: Math.round(3 + Math.random() * 7)
          };
          
          setOptimizationHistory(history => [completedRun, ...history.slice(0, 4)]);
          toast.success(`Optimization completed! ${improvement}% improvement achieved`);
          
          return completedRun;
        }

        return {
          ...prev,
          progress: newProgress,
          improvement,
          duration: prev.duration + 1
        };
      });
    }, 800);
  };

  const stopOptimization = () => {
    if (currentRun?.status === 'running') {
      setCurrentRun(prev => prev ? { ...prev, status: 'idle' } : null);
      toast.info('Optimization stopped');
    }
  };

  const applyOptimization = () => {
    if (currentRun?.status === 'completed' && onOptimizationComplete) {
      // In a real app, this would return the optimized schedule
      toast.success('Optimization applied to schedule');
      onOptimizationComplete(jobs);
    }
  };

  const getTypeLabel = (type: OptimizationRun['type']) => {
    switch (type) {
      case 'efficiency': return 'Maximize Efficiency';
      case 'cost': return 'Minimize Cost';
      case 'time': return 'Reduce Timeline';
      case 'balanced': return 'Balanced Optimization';
    }
  };

  const getTypeColor = (type: OptimizationRun['type']) => {
    switch (type) {
      case 'efficiency': return 'bg-green-100 text-green-800';
      case 'cost': return 'bg-blue-100 text-blue-800';
      case 'time': return 'bg-purple-100 text-purple-800';
      case 'balanced': return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap size={16} />
          Automated Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optimization Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => startOptimization('efficiency')}
            disabled={currentRun?.status === 'running'}
            size="sm"
            variant="outline"
          >
            Efficiency
          </Button>
          <Button
            onClick={() => startOptimization('cost')}
            disabled={currentRun?.status === 'running'}
            size="sm"
            variant="outline"
          >
            Cost
          </Button>
          <Button
            onClick={() => startOptimization('time')}
            disabled={currentRun?.status === 'running'}
            size="sm"
            variant="outline"
          >
            Time
          </Button>
          <Button
            onClick={() => startOptimization('balanced')}
            disabled={currentRun?.status === 'running'}
            size="sm"
            variant="outline"
          >
            Balanced
          </Button>
        </div>

        {/* Current Optimization */}
        {currentRun && (
          <div className="p-3 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{getTypeLabel(currentRun.type)}</div>
                <Badge className={getTypeColor(currentRun.type)}>
                  {currentRun.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {currentRun.improvement}%
                </div>
                <div className="text-xs text-muted-foreground">improvement</div>
              </div>
            </div>

            {currentRun.status === 'running' && (
              <div className="space-y-2">
                <Progress value={currentRun.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Running for {currentRun.duration}s</span>
                  <span>{Math.round(currentRun.progress)}% complete</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {currentRun.status === 'running' ? (
                <Button onClick={stopOptimization} size="sm" variant="outline" className="flex-1">
                  <Pause size={14} className="mr-1" />
                  Stop
                </Button>
              ) : currentRun.status === 'completed' ? (
                <Button onClick={applyOptimization} size="sm" className="flex-1">
                  Apply Changes
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Optimization History */}
        {optimizationHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Optimizations</h4>
            {optimizationHistory.map(run => (
              <div key={run.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(run.type)}>
                    {run.type.toUpperCase()}
                  </Badge>
                  <span>{run.improvement}% improvement</span>
                </div>
                <span className="text-muted-foreground">{run.duration}s</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
