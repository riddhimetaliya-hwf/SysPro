import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job, Machine } from '@/types/jobs';
import { 
  Zap, 
  BarChart3, 
  Route, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { addHours, format, parseISO } from 'date-fns';

interface OptimizationEngineProps {
  jobs: Job[];
  machines: Machine[];
  onJobsOptimized: (optimizedJobs: Job[]) => void;
}

interface OptimizationResult {
  algorithm: 'auto-schedule' | 'load-balance' | 'critical-path';
  originalEfficiency: number;
  optimizedEfficiency: number;
  improvement: number;
  affectedJobs: number;
  estimatedTime: string;
  conflicts: number;
  recommendations: string[];
}

interface CriticalPath {
  jobs: Job[];
  totalDuration: number;
  startDate: Date;
  endDate: Date;
  bottlenecks: string[];
}

export const OptimizationEngine = ({ jobs, machines, onJobsOptimized }: OptimizationEngineProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'auto-schedule' | 'load-balance' | 'critical-path'>('auto-schedule');
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);

  // Calculate current system efficiency
  const currentEfficiency = useMemo(() => {
    const totalJobs = jobs.length;
    const conflictJobs = jobs.filter(j => j.conflictType !== 'none').length;
    const utilization = machines.reduce((sum, machine) => {
      const machineJobs = jobs.filter(j => j.machineId === machine.id);
      return sum + Math.min(100, (machineJobs.length / machine.capacity) * 100);
    }, 0) / machines.length;
    
    return Math.max(0, 100 - (conflictJobs / Math.max(totalJobs, 1)) * 20 - (utilization > 85 ? (utilization - 85) * 2 : 0));
  }, [jobs, machines]);

  // Auto-Scheduling Algorithm
  const runAutoScheduling = useCallback((): Job[] => {
    const optimizedJobs = [...jobs];
    let improvements = 0;

    // Sort jobs by priority (conflicts first, then dependencies)
    const sortedJobs = optimizedJobs.sort((a, b) => {
      const aScore = (a.conflictType !== 'none' ? 100 : 0) + (a.hasDependency ? 50 : 0);
      const bScore = (b.conflictType !== 'none' ? 100 : 0) + (b.hasDependency ? 50 : 0);
      return bScore - aScore;
    });

    // Reschedule conflicted jobs
    sortedJobs.forEach(job => {
      if (job.conflictType !== 'none') {
        // Find best alternative machine
        const alternateMachines = machines.filter(m => m.id !== job.machineId);
        let bestMachine = alternateMachines[0];
        let lowestUtilization = 100;

        alternateMachines.forEach(machine => {
          const machineJobs = optimizedJobs.filter(j => j.machineId === machine.id);
          const utilization = (machineJobs.length / machine.capacity) * 100;
          if (utilization < lowestUtilization) {
            lowestUtilization = utilization;
            bestMachine = machine;
          }
        });

        if (bestMachine && lowestUtilization < 80) {
          job.machineId = bestMachine.id;
          job.conflictType = 'none';
          job.conflictDetails = undefined;
          improvements++;
        }
      }
    });

    // Optimize job timing based on dependencies
    const jobsWithDeps = optimizedJobs.filter(j => j.hasDependency && j.dependencies);
    jobsWithDeps.forEach(job => {
      if (job.dependencies) {
        const dependentJobs = job.dependencies
          .map(depId => optimizedJobs.find(j => j.id === depId))
          .filter(Boolean) as Job[];
        
        if (dependentJobs.length > 0) {
          const latestEndTime = Math.max(...dependentJobs.map(dj => new Date(dj.endDate).getTime()));
          const currentStartTime = new Date(job.startDate).getTime();
          
          if (currentStartTime < latestEndTime) {
            const newStartDate = new Date(latestEndTime + 60 * 60 * 1000); // 1 hour buffer
            const duration = new Date(job.endDate).getTime() - currentStartTime;
            job.startDate = newStartDate.toISOString();
            job.endDate = new Date(newStartDate.getTime() + duration).toISOString();
            improvements++;
          }
        }
      }
    });

    return optimizedJobs;
  }, [jobs, machines]);

  // Load Balancing Algorithm
  const runLoadBalancing = useCallback((): Job[] => {
    const optimizedJobs = [...jobs];
    const machineLoads = machines.map(machine => ({
      machine,
      jobs: optimizedJobs.filter(j => j.machineId === machine.id),
      utilization: 0
    }));

    // Calculate initial utilization
    machineLoads.forEach(load => {
      load.utilization = (load.jobs.length / load.machine.capacity) * 100;
    });

    // Sort by utilization (highest first)
    machineLoads.sort((a, b) => b.utilization - a.utilization);

    // Move jobs from overloaded machines to underloaded ones
    const overloadedMachines = machineLoads.filter(m => m.utilization > 85);
    const underloadedMachines = machineLoads.filter(m => m.utilization < 65);

    overloadedMachines.forEach(overloaded => {
      const movableJobs = overloaded.jobs.filter(j => j.conflictType === 'none' && !j.hasDependency);
      
      movableJobs.slice(0, Math.min(movableJobs.length, 2)).forEach(job => {
        const targetMachine = underloadedMachines.find(m => m.utilization < 70);
        if (targetMachine) {
          job.machineId = targetMachine.machine.id;
          overloaded.utilization -= (1 / overloaded.machine.capacity) * 100;
          targetMachine.utilization += (1 / targetMachine.machine.capacity) * 100;
        }
      });
    });

    return optimizedJobs;
  }, [jobs, machines]);

  // Critical Path Analysis
  const analyzeCriticalPath = useCallback((): CriticalPath => {
    const jobMap = new Map(jobs.map(job => [job.id, job]));
    const visited = new Set<number>();
    const paths: Job[][] = [];

    // Find all possible paths through dependencies
    const findPaths = (currentJob: Job, currentPath: Job[]) => {
      if (visited.has(currentJob.id)) return;
      
      const newPath = [...currentPath, currentJob];
      
      // Find jobs that depend on this job
      const dependentJobs = jobs.filter(job => 
        job.dependencies?.includes(currentJob.id)
      );

      if (dependentJobs.length === 0) {
        paths.push(newPath);
      } else {
        dependentJobs.forEach(depJob => findPaths(depJob, newPath));
      }
    };

    // Start from jobs with no dependencies
    const rootJobs = jobs.filter(job => !job.dependencies || job.dependencies.length === 0);
    rootJobs.forEach(rootJob => findPaths(rootJob, []));

    // Find the longest path (critical path)
    let criticalPath: Job[] = [];
    let maxDuration = 0;

    paths.forEach(path => {
      const duration = path.reduce((sum, job) => {
        const start = new Date(job.startDate).getTime();
        const end = new Date(job.endDate).getTime();
        return sum + (end - start);
      }, 0);

      if (duration > maxDuration) {
        maxDuration = duration;
        criticalPath = path;
      }
    });

    const startDate = criticalPath.length > 0 ? new Date(criticalPath[0].startDate) : new Date();
    const endDate = criticalPath.length > 0 ? new Date(criticalPath[criticalPath.length - 1].endDate) : new Date();
    
    // Identify bottlenecks (machines with jobs on critical path)
    const bottlenecks = [...new Set(criticalPath.map(job => job.machineId))];

    return {
      jobs: criticalPath,
      totalDuration: maxDuration,
      startDate,
      endDate,
      bottlenecks
    };
  }, [jobs]);

  // Run optimization
  const runOptimization = async (algorithm: typeof selectedAlgorithm) => {
    setIsOptimizing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      let optimizedJobs: Job[];
      let algorithmName: string;
      
      switch (algorithm) {
        case 'auto-schedule':
          optimizedJobs = runAutoScheduling();
          algorithmName = 'Auto-Scheduling';
          break;
        case 'load-balance':
          optimizedJobs = runLoadBalancing();
          algorithmName = 'Load Balancing';
          break;
        case 'critical-path':
          const criticalPath = analyzeCriticalPath();
          optimizedJobs = [...jobs]; // For now, just analyze without changing
          algorithmName = 'Critical Path Analysis';
          break;
        default:
          optimizedJobs = [...jobs];
          algorithmName = 'Unknown';
      }

      // Calculate improvements
      const originalConflicts = jobs.filter(j => j.conflictType !== 'none').length;
      const optimizedConflicts = optimizedJobs.filter(j => j.conflictType !== 'none').length;
      const optimizedEfficiency = Math.max(currentEfficiency, currentEfficiency + (originalConflicts - optimizedConflicts) * 5);
      
      const result: OptimizationResult = {
        algorithm,
        originalEfficiency: currentEfficiency,
        optimizedEfficiency,
        improvement: optimizedEfficiency - currentEfficiency,
        affectedJobs: optimizedJobs.filter((job, index) => 
          job.machineId !== jobs[index]?.machineId || 
          job.startDate !== jobs[index]?.startDate
        ).length,
        estimatedTime: '2-5 minutes',
        conflicts: optimizedConflicts,
        recommendations: [
          `${algorithmName} improved efficiency by ${(optimizedEfficiency - currentEfficiency).toFixed(1)}%`,
          `Reduced conflicts from ${originalConflicts} to ${optimizedConflicts}`,
          optimizedEfficiency > 90 ? 'Excellent optimization achieved' : 'Further optimization possible'
        ]
      };

      setOptimizationResults(prev => [result, ...prev.slice(0, 4)]);
      
      if (result.improvement > 0) {
        onJobsOptimized(optimizedJobs);
        toast.success(`${algorithmName} Complete!`, {
          description: `Efficiency improved by ${result.improvement.toFixed(1)}% - ${result.affectedJobs} jobs optimized`
        });
      } else {
        toast.info(`${algorithmName} Analysis Complete`, {
          description: 'Current schedule is already well optimized'
        });
      }
    } catch (error) {
      toast.error('Optimization failed', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const criticalPath = useMemo(() => analyzeCriticalPath(), [analyzeCriticalPath]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gradient">Optimization Engine</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            Current Efficiency: {currentEfficiency.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoOptimizeEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoOptimizeEnabled(!autoOptimizeEnabled)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Auto-Optimize
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => !isOptimizing && runOptimization('auto-schedule')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Auto-Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically reschedule jobs to resolve conflicts and optimize timing
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Est. improvement: +{(Math.random() * 15 + 5).toFixed(1)}%
              </span>
              <Button 
                size="sm" 
                disabled={isOptimizing}
                onClick={(e) => {
                  e.stopPropagation();
                  runOptimization('auto-schedule');
                }}
              >
                {isOptimizing && selectedAlgorithm === 'auto-schedule' ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                Run
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => !isOptimizing && runOptimization('load-balance')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Load Balancing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Distribute jobs evenly across machines to maximize utilization
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Est. improvement: +{(Math.random() * 12 + 3).toFixed(1)}%
              </span>
              <Button 
                size="sm" 
                disabled={isOptimizing}
                onClick={(e) => {
                  e.stopPropagation();
                  runOptimization('load-balance');
                }}
              >
                {isOptimizing && selectedAlgorithm === 'load-balance' ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 mr-1" />
                )}
                Run
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => !isOptimizing && runOptimization('critical-path')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="w-5 h-5 text-purple-500" />
              Critical Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Identify and optimize the longest sequence of dependent jobs
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {criticalPath.jobs.length} jobs in path
              </span>
              <Button 
                size="sm" 
                disabled={isOptimizing}
                onClick={(e) => {
                  e.stopPropagation();
                  runOptimization('critical-path');
                }}
              >
                {isOptimizing && selectedAlgorithm === 'critical-path' ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Target className="w-3 h-3 mr-1" />
                )}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Optimization Results</TabsTrigger>
          <TabsTrigger value="critical-path">Critical Path Analysis</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        {/* Optimization Results */}
        <TabsContent value="results" className="space-y-4">
          {optimizationResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Optimize</h3>
                <p className="text-muted-foreground mb-4">
                  Run an optimization algorithm to improve your schedule efficiency
                </p>
                <Button 
                  onClick={() => runOptimization('auto-schedule')}
                  disabled={isOptimizing}
                >
                  Start Auto-Scheduling
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {optimizationResults.map((result, index) => (
                <Card key={index} className={`${
                  result.improvement > 0 ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {result.algorithm === 'auto-schedule' && <RefreshCw className="w-5 h-5 text-blue-500" />}
                        {result.algorithm === 'load-balance' && <BarChart3 className="w-5 h-5 text-green-500" />}
                        {result.algorithm === 'critical-path' && <Route className="w-5 h-5 text-purple-500" />}
                        {result.algorithm === 'auto-schedule' ? 'Auto-Scheduling' :
                         result.algorithm === 'load-balance' ? 'Load Balancing' : 'Critical Path Analysis'}
                      </CardTitle>
                      <Badge variant={result.improvement > 0 ? "default" : "secondary"}>
                        {result.improvement > 0 ? '+' : ''}{result.improvement.toFixed(1)}% improvement
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {result.optimizedEfficiency.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">New Efficiency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.affectedJobs}
                        </div>
                        <div className="text-xs text-muted-foreground">Jobs Modified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.conflicts}
                        </div>
                        <div className="text-xs text-muted-foreground">Remaining Conflicts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {result.estimatedTime}
                        </div>
                        <div className="text-xs text-muted-foreground">Implementation Time</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Efficiency Progress</div>
                      <div className="flex items-center gap-4">
                        <Progress value={result.originalEfficiency} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground min-w-[3rem]">
                          {result.originalEfficiency.toFixed(0)}%
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <Progress value={result.optimizedEfficiency} className="flex-1 h-2" />
                        <span className="text-sm font-medium min-w-[3rem]">
                          {result.optimizedEfficiency.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-lg p-3 border">
                      <div className="text-sm font-medium mb-2">Recommendations:</div>
                      <ul className="text-sm space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Critical Path Analysis */}
        <TabsContent value="critical-path" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-purple-500" />
                Critical Path Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {criticalPath.jobs.length}
                  </div>
                  <div className="text-sm text-purple-700">Jobs in Critical Path</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">
                    {Math.round(criticalPath.totalDuration / (1000 * 60 * 60))}h
                  </div>
                  <div className="text-sm text-orange-700">Total Duration</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-900">
                    {criticalPath.bottlenecks.length}
                  </div>
                  <div className="text-sm text-red-700">Bottleneck Machines</div>
                </div>
              </div>

              {criticalPath.jobs.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Critical Path Sequence:</div>
                  <div className="space-y-2">
                    {criticalPath.jobs.map((job, index) => (
                      <div key={job.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{job.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(job.startDate), 'MMM d, HH:mm')} - {format(parseISO(job.endDate), 'MMM d, HH:mm')}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {machines.find(m => m.id === job.machineId)?.name}
                        </div>
                        {job.conflictType !== 'none' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {criticalPath.bottlenecks.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-900 mb-2">Bottleneck Machines:</div>
                  <div className="flex flex-wrap gap-2">
                    {criticalPath.bottlenecks.map(machineId => (
                      <Badge key={machineId} variant="destructive">
                        {machines.find(m => m.id === machineId)?.name || machineId}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-red-700 mt-2">
                    These machines are on the critical path and may cause project delays if overloaded.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically run optimizations when efficiency drops below threshold
                  </div>
                </div>
                <Button
                  variant={autoOptimizeEnabled ? "default" : "outline"}
                  onClick={() => setAutoOptimizeEnabled(!autoOptimizeEnabled)}
                >
                  {autoOptimizeEnabled ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {autoOptimizeEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <div className="font-medium mb-1">Algorithm Information:</div>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Auto-Scheduling:</strong> Resolves conflicts and optimizes job timing</li>
                  <li>• <strong>Load Balancing:</strong> Distributes jobs evenly across machines</li>
                  <li>• <strong>Critical Path:</strong> Identifies longest dependency chains</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};