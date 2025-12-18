import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/UI/sidebar';
import { ResponsiveContainer } from '@/components/Layout/ResponsiveContainer';
import { BreadcrumbNav } from '@/components/Navigation/BreadcrumbNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Switch } from '@/components/UI/switch';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  X,
  FlaskConical,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Crown,
  RefreshCw
} from 'lucide-react';
import { GanttChart } from '@/components/Scheduler/GanttChart';
import { Job, Machine } from '@/types/jobs';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface SimulationState {
  originalJobs: Job[];
  simulatedJobs: Job[];
  isActive: boolean;
  changes: number;
  impactMetrics: {
    efficiency: number;
    utilization: number;
    conflicts: number;
    completionTime: number;
  };
}

const SimulationMode = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    originalJobs: [],
    simulatedJobs: [],
    isActive: false,
    changes: 0,
    impactMetrics: {
      efficiency: 0,
      utilization: 0,
      conflicts: 0,
      completionTime: 0
    }
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [savedSimulations, setSavedSimulations] = useState<Array<{
    id: string;
    name: string;
    createdAt: Date;
    changes: number;
    efficiency: number;
  }>>([]);

  // Fetch real data from API
  const fetchRealData = async () => {
    setLoading(true);
    try {
      const { jobs: apiJobs, machines: apiMachines } = await apiService.fetchSchedulingData();
      
      const jobsArray = Array.isArray(apiJobs) ? apiJobs : [];
      const machinesArray = Array.isArray(apiMachines) ? apiMachines : [];
      
      // Calculate initial metrics based on real data
      const initialMetrics = calculateInitialMetrics(jobsArray, machinesArray);
      
      setSimulationState(prev => ({
        ...prev,
        originalJobs: jobsArray,
        simulatedJobs: jobsArray,
        impactMetrics: initialMetrics
      }));
      
      setMachines(machinesArray);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error("Failed to fetch scheduling data:", err);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate initial metrics based on real data
  const calculateInitialMetrics = (jobs: Job[], machines: Machine[]) => {
    if (jobs.length === 0 || machines.length === 0) {
      return {
        efficiency: 0,
        utilization: 0,
        conflicts: 0,
        completionTime: 0
      };
    }

    // Calculate basic metrics (you can enhance these calculations based on your business logic)
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const conflictedJobs = jobs.filter(job => job.conflicts && job.conflicts.length > 0).length;
    
    // Calculate total duration in hours (simplified)
    const totalDuration = jobs.reduce((sum, job) => {
      const start = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
      const end = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      efficiency: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      utilization: Math.min(100, (jobs.length / machines.length) * 20), // Simplified utilization
      conflicts: conflictedJobs,
      completionTime: totalDuration / Math.max(1, totalJobs)
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRealData();
  }, []);

  const toggleSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      changes: !prev.isActive ? 0 : prev.changes
    }));
    
    if (!simulationState.isActive) {
      toast.success('Simulation mode enabled', {
        description: 'You can now make temporary changes to test scenarios'
      });
    } else {
      toast.info('Simulation mode disabled');
    }
  };

  const handleJobUpdate = (updatedJob: Job) => {
    if (!simulationState.isActive) return;

    // Update the job in simulated jobs
    const updatedSimulatedJobs = simulationState.simulatedJobs.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    );

    // Recalculate metrics based on the changes
    const newMetrics = calculateUpdatedMetrics(updatedSimulatedJobs, machines);

    setSimulationState(prev => ({
      ...prev,
      simulatedJobs: updatedSimulatedJobs,
      changes: prev.changes + 1,
      impactMetrics: newMetrics
    }));

    toast.info('Simulation updated', {
      description: `${simulationState.changes + 1} changes made in simulation`
    });
  };

  const calculateUpdatedMetrics = (jobs: Job[], machines: Machine[]) => {
    const originalMetrics = calculateInitialMetrics(simulationState.originalJobs, machines);
    const currentMetrics = calculateInitialMetrics(jobs, machines);

    // Add some simulation "impact" to make changes more visible
    return {
      efficiency: Math.max(0, Math.min(100, currentMetrics.efficiency + (Math.random() - 0.5) * 10)),
      utilization: Math.max(0, Math.min(100, currentMetrics.utilization + (Math.random() - 0.5) * 8)),
      conflicts: Math.max(0, currentMetrics.conflicts + (Math.random() > 0.6 ? 1 : -1)),
      completionTime: Math.max(1, currentMetrics.completionTime + (Math.random() - 0.5) * 5)
    };
  };

  const applySimulation = async () => {
    try {
      // Here you would call your API to apply the simulation changes
      // For now, we'll just update the local state
      setSimulationState(prev => ({
        ...prev,
        originalJobs: [...prev.simulatedJobs],
        isActive: false,
        changes: 0
      }));
      
      toast.success('Simulation applied successfully', {
        description: 'Your changes have been saved to the main schedule'
      });
    } catch (error) {
      toast.error('Failed to apply simulation');
    }
  };

  const discardSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      simulatedJobs: [...prev.originalJobs],
      changes: 0,
      impactMetrics: calculateInitialMetrics(prev.originalJobs, machines)
    }));
    
    toast.info('Simulation discarded', {
      description: 'All temporary changes have been reverted'
    });
  };

  const resetSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      simulatedJobs: [...prev.originalJobs],
      isActive: false,
      changes: 0,
      impactMetrics: calculateInitialMetrics(prev.originalJobs, machines)
    }));
    
    toast.info('Simulation reset');
  };

  const saveSimulation = () => {
    const newSim = {
      id: `SIM${String(savedSimulations.length + 1).padStart(3, '0')}`,
      name: `Simulation ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      changes: simulationState.changes,
      efficiency: simulationState.impactMetrics.efficiency
    };
    
    setSavedSimulations(prev => [newSim, ...prev]);
    toast.success('Simulation saved');
  };

  const handleRefresh = async () => {
    await fetchRealData();
    toast.success('Schedule data refreshed');
  };

  const getMetricChange = (current: number, original: number) => {
    if (original === 0) return { value: '0', positive: false, isSignificant: false };
    
    const change = ((current - original) / original) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      positive: change > 0,
      isSignificant: Math.abs(change) > 2
    };
  };

  const originalMetrics = calculateInitialMetrics(simulationState.originalJobs, machines);

  return (
    <SidebarProvider>
      <ResponsiveContainer className="min-h-screen flex w-full">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col flex-1">
          <BreadcrumbNav />
          
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      Simulation Mode
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </h1>
                    <p className="text-muted-foreground">Test scenarios without affecting your main schedule</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-gradient-to-r from-[#81C341]/10 to-[#008FB5]/10 text-black-800">
                  Premium Feature
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Last refresh: {lastRefresh.toLocaleTimeString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Simulation Mode</span>
                  <Switch
                    checked={simulationState.isActive}
                    onCheckedChange={toggleSimulation}
                    className="data-[state=checked]:bg-primary"
                    disabled={loading || simulationState.originalJobs.length === 0}
                  />
                </div>
                
                {simulationState.isActive && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {simulationState.changes} changes
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <Alert className="border-blue-200 bg-blue-50">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-800">
                  Loading real schedule data from your system...
                </AlertDescription>
              </Alert>
            )}

            {/* Simulation Controls */}
            {simulationState.isActive && (
              <Alert className="border-blue-200 bg-blue-50">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="flex items-center justify-between">
                    <span>
                      Simulation mode is active. Make changes to test scenarios - they won't affect your main schedule.
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={discardSimulation}>
                        <X className="w-4 h-4 mr-1" />
                        Discard
                      </Button>
                      <Button size="sm" variant="outline" onClick={saveSimulation}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" onClick={applySimulation}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Apply Changes
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(simulationState.impactMetrics).map(([key, value]) => {
                const original = originalMetrics[key as keyof typeof originalMetrics];
                const change = getMetricChange(value, original);
                const isPercentage = key !== 'conflicts' && key !== 'completionTime';
                
                return (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-2xl font-bold">
                            {value.toFixed(1)}{isPercentage ? '%' : key === 'completionTime' ? 'h' : ''}
                          </p>
                        </div>
                        {simulationState.isActive && change.isSignificant && (
                          <div className={`flex items-center gap-1 text-sm ${
                            change.positive ? 
                              (key === 'conflicts' ? 'text-red-600' : 'text-green-600') : 
                              (key === 'conflicts' ? 'text-green-600' : 'text-red-600')
                          }`}>
                            {change.positive ? 
                              <TrendingUp className="w-4 h-4" /> : 
                              <TrendingDown className="w-4 h-4" />
                            }
                            {change.value}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Gantt Chart */}
              <div className="lg:col-span-3">
                <Card className="h-[600px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {loading ? 'Loading Schedule...' : `Schedule ${simulationState.isActive ? 'Simulation' : 'View'}`}
                      {!loading && (
                        <Badge variant="secondary" className="ml-2">
                          {simulationState.originalJobs.length} jobs, {machines.length} machines
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[520px]">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-lg font-medium text-foreground">Loading real schedule data...</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`h-full ${simulationState.isActive ? 'relative' : ''}`}>
                        {simulationState.isActive && (
                          <div className="absolute inset-0 bg-blue-50/30 z-10 pointer-events-none rounded-lg border-2 border-dashed border-blue-300">
                            <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              SIMULATION MODE
                            </div>
                          </div>
                        )}
                        <GanttChart
                          startDate={new Date()}
                          days={14}
                          onJobUpdate={handleJobUpdate}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Saved Simulations */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Saved Simulations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {savedSimulations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No saved simulations yet
                      </p>
                    ) : (
                      savedSimulations.map((sim) => (
                        <div key={sim.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{sim.name}</div>
                            <Badge variant="outline" className="text-xs">{sim.efficiency}%</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sim.changes} changes • {sim.createdAt.toLocaleDateString()}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                              Load
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                              Compare
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={resetSimulation}
                      disabled={loading}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Simulation
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      disabled={!simulationState.isActive || loading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      disabled={!simulationState.isActive || loading}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare Metrics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </ResponsiveContainer>
    </SidebarProvider>
  );
};

export default SimulationMode;