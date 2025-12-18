
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job, Machine } from '@/types/jobs';
import { Lightbulb, Play, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Scenario {
  id: string;
  name: string;
  description: string;
  efficiency: number;
  cost: number;
  timeline: number;
  status: 'draft' | 'running' | 'completed';
}

interface ScenarioPlanningProps {
  jobs: Job[];
  machines: Machine[];
}

export const ScenarioPlanning = ({ jobs, machines }: ScenarioPlanningProps) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Optimized Flow',
      description: 'Maximize throughput with current resources',
      efficiency: 94,
      cost: 12500,
      timeline: 14,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Cost Reduction',
      description: 'Minimize operational costs',
      efficiency: 87,
      cost: 10200,
      timeline: 16,
      status: 'draft'
    },
    {
      id: '3',
      name: 'Rush Orders',
      description: 'Prioritize urgent deliveries',
      efficiency: 91,
      cost: 13800,
      timeline: 12,
      status: 'running'
    }
  ]);

  const [activeScenario, setActiveScenario] = useState<string>('1');

  const runScenario = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, status: 'running' as const } : s
    ));
    
    toast.success('Scenario analysis started', {
      description: 'Running optimization algorithms...'
    });

    // Simulate analysis
    setTimeout(() => {
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { ...s, status: 'completed' as const } : s
      ));
      toast.success('Scenario analysis completed');
    }, 3000);
  };

  const createScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      description: 'Custom optimization scenario',
      efficiency: Math.round(80 + Math.random() * 15),
      cost: Math.round(10000 + Math.random() * 5000),
      timeline: Math.round(12 + Math.random() * 8),
      status: 'draft'
    };
    
    setScenarios(prev => [...prev, newScenario]);
    setActiveScenario(newScenario.id);
    toast.success('New scenario created');
  };

  const getStatusColor = (status: Scenario['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb size={16} />
            Scenario Planning
          </CardTitle>
          <Button onClick={createScenario} size="sm" variant="outline">
            <Copy size={14} className="mr-1" />
            New Scenario
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeScenario} onValueChange={setActiveScenario}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {scenarios.map(scenario => (
              <TabsTrigger key={scenario.id} value={scenario.id} className="text-xs">
                {scenario.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {scenarios.map(scenario => (
            <TabsContent key={scenario.id} value={scenario.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{scenario.name}</h4>
                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                </div>
                <Badge className={getStatusColor(scenario.status)}>
                  {scenario.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold text-green-600">{scenario.efficiency}%</div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold text-blue-600">${scenario.cost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold text-purple-600">{scenario.timeline}d</div>
                  <div className="text-xs text-muted-foreground">Timeline</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => runScenario(scenario.id)}
                  disabled={scenario.status === 'running'}
                  size="sm"
                  className="flex-1"
                >
                  <Play size={14} className="mr-1" />
                  {scenario.status === 'running' ? 'Running...' : 'Run Analysis'}
                </Button>
                <Button size="sm" variant="outline">
                  <Save size={14} className="mr-1" />
                  Apply
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
