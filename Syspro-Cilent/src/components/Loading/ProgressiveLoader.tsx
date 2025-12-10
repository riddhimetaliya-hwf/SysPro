import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Database, Users, Settings, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  duration: number;
  critical: boolean;
}

interface ProgressiveLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  className?: string;
}

const loadingStages: LoadingStage[] = [
  {
    id: 'data',
    label: 'Loading job data',
    icon: <Database className="w-4 h-4" />,
    duration: 800,
    critical: true
  },
  {
    id: 'machines',
    label: 'Initializing machines',
    icon: <Settings className="w-4 h-4" />,
    duration: 600,
    critical: true
  },
  {
    id: 'conflicts',
    label: 'Analyzing conflicts',
    icon: <Activity className="w-4 h-4" />,
    duration: 1000,
    critical: false
  },
  {
    id: 'teams',
    label: 'Loading team data',
    icon: <Users className="w-4 h-4" />,
    duration: 400,
    critical: false
  }
];

export const ProgressiveLoader = ({ isLoading, onComplete, className }: ProgressiveLoaderProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0);
      setCompletedStages([]);
      setProgress(0);
      return;
    }

    // Load critical stages first
    const criticalStages = loadingStages.filter(stage => stage.critical);
    const nonCriticalStages = loadingStages.filter(stage => !stage.critical);
    const orderedStages = [...criticalStages, ...nonCriticalStages];

    let stageIndex = 0;
    const processStage = () => {
      if (stageIndex >= orderedStages.length) {
        onComplete?.();
        return;
      }

      const stage = orderedStages[stageIndex];
      setCurrentStage(stageIndex);
      
      // Update progress
      const stageProgress = ((stageIndex + 1) / orderedStages.length) * 100;
      setProgress(stageProgress);

      setTimeout(() => {
        setCompletedStages(prev => [...prev, stage.id]);
        stageIndex++;
        
        if (stageIndex < orderedStages.length) {
          processStage();
        } else {
          setTimeout(() => {
            onComplete?.();
          }, 200);
        }
      }, stage.duration);
    };

    processStage();
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div className={cn("fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center", className)}>
      <Card className="w-96 mx-4">
        <CardContent className="p-6 space-y-6">
          {/* Main Progress */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mx-auto"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Loading Schedule</h3>
              <p className="text-sm text-muted-foreground">Preparing your scheduling environment</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Loading Stages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Loading Status</h4>
            <div className="space-y-2">
              {loadingStages.map((stage, index) => {
                const isCompleted = completedStages.includes(stage.id);
                const isCurrent = currentStage === index;
                const isUpcoming = index > currentStage;

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-all",
                      isCurrent && "bg-primary/10 border border-primary/20",
                      isCompleted && "bg-success/10",
                      isUpcoming && "opacity-50"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {stage.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm", isCurrent && "font-medium")}>
                          {stage.label}
                        </span>
                        {stage.critical && (
                          <Badge variant="outline" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isCompleted && (
                        <Badge variant="default" className="text-xs">
                          Done
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Loading...
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Critical data loads first for faster interaction
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook to manage progressive loading state
export const useProgressiveLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  const startLoading = () => {
    setIsLoading(true);
    setLoadingStage('');
  };

  const completeLoading = () => {
    setIsLoading(false);
    setLoadingStage('');
  };

  const updateStage = (stage: string) => {
    setLoadingStage(stage);
  };

  return {
    isLoading,
    loadingStage,
    startLoading,
    completeLoading,
    updateStage,
  };
};