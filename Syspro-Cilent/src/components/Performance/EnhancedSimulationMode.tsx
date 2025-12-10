import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Machine } from '@/types/jobs';
import { format, addDays, parseISO } from 'date-fns';
import { 
  FlaskConical, 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    rushOrderPercentage: number;
    capacityIncrease: number;
    materialDelayFactor: number;
    priorityWeighting: number;
    costOptimization: boolean;
  };
  results?: SimulationResults;
  createdAt: Date;
}

interface SimulationResults {
  efficiency: number;
  utilization: number;
  totalCost: number;
  completionTime: number;
  conflictCount: number;
  impactAnalysis: {
    affectedJobs: number;
    redistributedJobs: number;
    newConflicts: number;
    resolvedConflicts: number;
  };
  whatIfScenarios: {
    name: string;
    value: number;
    change: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
}

interface WhatIfAnalysis {
  scenario: string;
  baselineValue: number;
  projectedValue: number;
  change: number;
  impact: 'cost' | 'time' | 'efficiency' | 'quality';
  confidence: number;
}

interface EnhancedSimulationModeProps {
  jobs: Job[];
  machines: Machine[];
  onJobUpdate: (job: Job) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const EnhancedSimulationMode = ({
  jobs,
  machines,
  onJobUpdate,
  isActive,
  onToggle
}: EnhancedSimulationModeProps) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: 'scenario-1',
      name: 'Peak Season Optimization',
      description: '30% increase in orders, optimized for cost efficiency',
      parameters: {
        rushOrderPercentage: 25,
        capacityIncrease: 30,
        materialDelayFactor: 1.2,
        priorityWeighting: 0.8,
        costOptimization: true
      },
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'scenario-2',
      name: 'Rush Order Response',
      description: 'High priority rush orders with expedited processing',
      parameters: {
        rushOrderPercentage: 40,
        capacityIncrease: 10,
        materialDelayFactor: 0.8,
        priorityWeighting: 1.5,
        costOptimization: false
      },
      createdAt: new Date('2024-01-12')
    }
  ]);

  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [whatIfAnalyses, setWhatIfAnalyses] = useState<WhatIfAnalysis[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [impactPreview, setImpactPreview] = useState<any>(null);

  const [newScenario, setNewScenario] = useState<Partial<SimulationScenario>>({
    name: '',
    description: '',
    parameters: {
      rushOrderPercentage: 20,
      capacityIncrease: 15,
      materialDelayFactor: 1.0,
      priorityWeighting: 1.0,
      costOptimization: true
    }
  });

  // Real-time impact preview when jobs are moved
  useEffect(() => {
    if (isActive) {
      generateImpactPreview();
    }
  }, [jobs, isActive]);

  const generateImpactPreview = () => {
    const preview = {
      affectedDownstream: calculateDownstreamImpact(),
      resourceReallocation: calculateResourceImpact(),
      costImplications: calculateCostImpact(),
      timelineChanges: calculateTimelineImpact()
    };
    setImpactPreview(preview);
  };

  const calculateDownstreamImpact = () => {
    // Mock calculation - would analyze dependency chains
    const dependentJobs = jobs.filter(job => job.dependencies && job.dependencies.length > 0);
    return {
      totalJobs: dependentJobs.length,
      criticalPath: Math.floor(dependentJobs.length * 0.3),
      estimatedDelay: Math.floor(Math.random() * 4) + 1
    };
  };

  const calculateResourceImpact = () => {
    return {
      machineUtilization: machines.map(machine => ({
        id: machine.id,
        name: machine.name,
        currentLoad: Math.floor(Math.random() * 100),
        projectedLoad: Math.floor(Math.random() * 100)
      })),
      skillReallocation: Math.floor(Math.random() * 5) + 1
    };
  };

  const calculateCostImpact = () => {
    return {
      directCosts: Math.floor(Math.random() * 5000) + 1000,
      opportunityCosts: Math.floor(Math.random() * 3000) + 500,
      savingsOpportunities: Math.floor(Math.random() * 2000) + 200
    };
  };

  const calculateTimelineImpact = () => {
    return {
      earliestCompletion: format(addDays(new Date(), 5), 'MMM d'),
      latestCompletion: format(addDays(new Date(), 12), 'MMM d'),
      criticalMilestones: 3
    };
  };

  const runSimulation = (scenario: SimulationScenario) => {
    setIsRunning(true);
    setActiveScenario(scenario);
    
    toast.info('Running simulation...', {
      description: `Analyzing ${scenario.name} scenario`
    });

    // Simulate processing time
    setTimeout(() => {
      const results: SimulationResults = generateSimulationResults(scenario);
      const whatIf = generateWhatIfAnalyses(scenario);
      
      setSimulationResults(results);
      setWhatIfAnalyses(whatIf);
      setIsRunning(false);
      
      toast.success('Simulation completed', {
        description: `Efficiency: ${results.efficiency}% | Cost: $${results.totalCost.toLocaleString()}`
      });
    }, 3000);
  };

  const generateSimulationResults = (scenario: SimulationScenario): SimulationResults => {
    const baseEfficiency = 85;
    const baseUtilization = 78;
    const baseCost = 50000;
    const baseCompletionTime = 240;

    const rushFactor = scenario.parameters.rushOrderPercentage / 100;
    const capacityFactor = scenario.parameters.capacityIncrease / 100;
    const delayFactor = scenario.parameters.materialDelayFactor;
    const priorityFactor = scenario.parameters.priorityWeighting;

    return {
      efficiency: Math.max(70, Math.min(95, baseEfficiency + (capacityFactor * 10) - (rushFactor * 5))),
      utilization: Math.max(60, Math.min(95, baseUtilization + (capacityFactor * 8) + (rushFactor * 3))),
      totalCost: Math.floor(baseCost * (1 + rushFactor * 0.2 + delayFactor * 0.1 - (scenario.parameters.costOptimization ? 0.05 : 0))),
      completionTime: Math.floor(baseCompletionTime * (delayFactor - capacityFactor * 0.1 + rushFactor * 0.05)),
      conflictCount: Math.max(0, Math.floor((rushFactor * 10) + (delayFactor * 5) - (capacityFactor * 3))),
      impactAnalysis: {
        affectedJobs: Math.floor(jobs.length * (rushFactor + capacityFactor)),
        redistributedJobs: Math.floor(jobs.length * capacityFactor * 0.6),
        newConflicts: Math.floor((rushFactor * 8) + (delayFactor * 3)),
        resolvedConflicts: Math.floor(capacityFactor * 5)
      },
      whatIfScenarios: [
        {
          name: 'Add 20% more capacity',
          value: Math.floor(baseEfficiency + 12),
          change: 12,
          impact: 'positive'
        },
        {
          name: 'Reduce rush orders by 50%',
          value: Math.floor(baseCost * 0.85),
          change: -15,
          impact: 'positive'
        }
      ]
    };
  };

  const generateWhatIfAnalyses = (scenario: SimulationScenario): WhatIfAnalysis[] => {
    return [
      {
        scenario: 'Increase machine capacity by 25%',
        baselineValue: 240,
        projectedValue: 192,
        change: -20,
        impact: 'time',
        confidence: 85
      },
      {
        scenario: 'Implement rush order surcharge',
        baselineValue: 50000,
        projectedValue: 58000,
        change: 16,
        impact: 'cost',
        confidence: 78
      },
      {
        scenario: 'Optimize material procurement',
        baselineValue: 85,
        projectedValue: 91,
        change: 7,
        impact: 'efficiency',
        confidence: 92
      },
      {
        scenario: 'Cross-train operators',
        baselineValue: 78,
        projectedValue: 86,
        change: 10,
        impact: 'efficiency',
        confidence: 88
      }
    ];
  };

  const createScenario = () => {
    if (!newScenario.name) {
      toast.error('Please enter a scenario name');
      return;
    }

    const scenario: SimulationScenario = {
      id: Date.now().toString(),
      name: newScenario.name!,
      description: newScenario.description!,
      parameters: newScenario.parameters!,
      createdAt: new Date()
    };

    setScenarios([...scenarios, scenario]);
    setNewScenario({
      name: '',
      description: '',
      parameters: {
        rushOrderPercentage: 20,
        capacityIncrease: 15,
        materialDelayFactor: 1.0,
        priorityWeighting: 1.0,
        costOptimization: true
      }
    });

    toast.success('Scenario created successfully');
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Enhanced Simulation Mode
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Simulation Active</span>
                <Switch checked={isActive} onCheckedChange={onToggle} />
              </div>
              {isActive && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Live Preview Mode
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Test scenarios, analyze impacts, and preview changes before applying them to your schedule.
          </div>
        </CardContent>
      </Card>

      {/* Real-time Impact Preview */}
      {isActive && impactPreview && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Real-time Impact Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {impactPreview.affectedDownstream.totalJobs}
                </div>
                <div className="text-sm text-muted-foreground">Jobs Affected</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  ${impactPreview.costImplications.directCosts.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Cost Impact</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {impactPreview.timelineChanges.criticalMilestones}
                </div>
                <div className="text-sm text-muted-foreground">Critical Milestones</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {impactPreview.affectedDownstream.estimatedDelay}h
                </div>
                <div className="text-sm text-muted-foreground">Avg Delay</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="whatif">What-If Analysis</TabsTrigger>
          <TabsTrigger value="create">Create Scenario</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4">
            {scenarios.map(scenario => (
              <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{scenario.name}</h3>
                      <p className="text-muted-foreground">{scenario.description}</p>
                    </div>
                    <Button
                      onClick={() => runSimulation(scenario)}
                      disabled={isRunning}
                      size="sm"
                    >
                      {isRunning && activeScenario?.id === scenario.id ? (
                        <Square className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {isRunning && activeScenario?.id === scenario.id ? 'Running...' : 'Run Simulation'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Rush Orders:</span>
                      <div className="text-muted-foreground">{scenario.parameters.rushOrderPercentage}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Capacity:</span>
                      <div className="text-muted-foreground">+{scenario.parameters.capacityIncrease}%</div>
                    </div>
                    <div>
                      <span className="font-medium">Material Delay:</span>
                      <div className="text-muted-foreground">{scenario.parameters.materialDelayFactor}x</div>
                    </div>
                    <div>
                      <span className="font-medium">Priority Weight:</span>
                      <div className="text-muted-foreground">{scenario.parameters.priorityWeighting}x</div>
                    </div>
                    <div>
                      <span className="font-medium">Cost Optimized:</span>
                      <div className="text-muted-foreground">
                        {scenario.parameters.costOptimization ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {simulationResults ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {simulationResults.efficiency}%
                    </div>
                    <div className="text-sm text-muted-foreground">Efficiency</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {simulationResults.utilization}%
                    </div>
                    <div className="text-sm text-muted-foreground">Utilization</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${simulationResults.totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {simulationResults.completionTime}h
                    </div>
                    <div className="text-sm text-muted-foreground">Completion</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {simulationResults.conflictCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Conflicts</div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">
                        {simulationResults.impactAnalysis.affectedJobs}
                      </div>
                      <div className="text-sm text-muted-foreground">Jobs Affected</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">
                        {simulationResults.impactAnalysis.redistributedJobs}
                      </div>
                      <div className="text-sm text-muted-foreground">Redistributed</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {simulationResults.impactAnalysis.newConflicts}
                      </div>
                      <div className="text-sm text-muted-foreground">New Conflicts</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {simulationResults.impactAnalysis.resolvedConflicts}
                      </div>
                      <div className="text-sm text-muted-foreground">Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Simulation Results</h3>
                <p className="text-muted-foreground text-center">
                  Run a simulation scenario to see detailed results and analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatif" className="space-y-4">
          {whatIfAnalyses.length > 0 ? (
            <div className="space-y-4">
              {whatIfAnalyses.map((analysis, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{analysis.scenario}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          Impact on {analysis.impact}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {analysis.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">
                          {analysis.impact === 'cost' ? '$' : ''}{analysis.baselineValue.toLocaleString()}
                          {analysis.impact === 'time' ? 'h' : analysis.impact === 'efficiency' ? '%' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">Current</div>
                      </div>
                      <div>
                        <div className={`text-lg font-semibold ${getImpactColor(analysis.change)}`}>
                          {analysis.change > 0 ? '+' : ''}{analysis.change}%
                        </div>
                        <div className="text-sm text-muted-foreground">Change</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {analysis.impact === 'cost' ? '$' : ''}{analysis.projectedValue.toLocaleString()}
                          {analysis.impact === 'time' ? 'h' : analysis.impact === 'efficiency' ? '%' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">Projected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No What-If Analysis</h3>
                <p className="text-muted-foreground text-center">
                  Run a simulation to generate what-if scenarios and impact analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scenario Name</label>
                  <Input
                    placeholder="Enter scenario name"
                    value={newScenario.name || ''}
                    onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Brief description"
                    value={newScenario.description || ''}
                    onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Rush Order Percentage: {newScenario.parameters?.rushOrderPercentage}%
                    </label>
                    <Slider
                      value={[newScenario.parameters?.rushOrderPercentage || 20]}
                      onValueChange={([value]) => setNewScenario({
                        ...newScenario,
                        parameters: { ...newScenario.parameters!, rushOrderPercentage: value }
                      })}
                      max={50}
                      min={0}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Capacity Increase: +{newScenario.parameters?.capacityIncrease}%
                    </label>
                    <Slider
                      value={[newScenario.parameters?.capacityIncrease || 15]}
                      onValueChange={([value]) => setNewScenario({
                        ...newScenario,
                        parameters: { ...newScenario.parameters!, capacityIncrease: value }
                      })}
                      max={50}
                      min={0}
                      step={5}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Material Delay Factor: {newScenario.parameters?.materialDelayFactor}x
                    </label>
                    <Slider
                      value={[newScenario.parameters?.materialDelayFactor || 1.0]}
                      onValueChange={([value]) => setNewScenario({
                        ...newScenario,
                        parameters: { ...newScenario.parameters!, materialDelayFactor: value }
                      })}
                      max={2.0}
                      min={0.5}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Priority Weighting: {newScenario.parameters?.priorityWeighting}x
                    </label>
                    <Slider
                      value={[newScenario.parameters?.priorityWeighting || 1.0]}
                      onValueChange={([value]) => setNewScenario({
                        ...newScenario,
                        parameters: { ...newScenario.parameters!, priorityWeighting: value }
                      })}
                      max={2.0}
                      min={0.5}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={newScenario.parameters?.costOptimization || false}
                  onCheckedChange={(checked) => setNewScenario({
                    ...newScenario,
                    parameters: { ...newScenario.parameters!, costOptimization: checked }
                  })}
                />
                <label className="text-sm font-medium">Enable Cost Optimization</label>
              </div>

              <Button onClick={createScenario} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Create Scenario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};