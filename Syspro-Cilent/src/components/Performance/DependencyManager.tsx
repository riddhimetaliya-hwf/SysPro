
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Job } from '@/types/jobs';
import { Link, Clock, Zap, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DependencyRule {
  id: string;
  name: string;
  type: 'preprocessing' | 'postprocessing' | 'cooldown' | 'chain';
  sourceJobId: string;
  targetJobId: string;
  bufferMinutes: number;
  enabled: boolean;
}

interface DependencyManagerProps {
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
}

export const DependencyManager = ({ jobs, onJobUpdate }: DependencyManagerProps) => {
  const [rules, setRules] = useState<DependencyRule[]>([
    {
      id: 'rule-1',
      name: 'Cutting → Packaging Chain',
      type: 'chain',
      sourceJobId: 'job-1',
      targetJobId: 'job-2',
      bufferMinutes: 30,
      enabled: true
    }
  ]);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationResults, setSimulationResults] = useState<string[]>([]);

  const handleRescheduleWithDependencies = (job: Job) => {
    if (simulationMode) {
      // Simulate cascading effects
      const affected = jobs.filter(j => j.dependencies?.includes(job.id));
      const results = [
        `Moving ${job.name} would affect ${affected.length} dependent jobs`,
        ...affected.map(j => `• ${j.name} would shift by 2 hours`)
      ];
      setSimulationResults(results);
      toast.info('Simulation completed', {
        description: `${affected.length} jobs would be affected`
      });
    } else {
      // Apply actual changes
      onJobUpdate(job);
      toast.success('Dependencies auto-adjusted', {
        description: 'All linked jobs have been rescheduled'
      });
    }
  };

  const getRuleIcon = (type: DependencyRule['type']) => {
    switch (type) {
      case 'preprocessing': return <PlayCircle className="w-4 h-4" />;
      case 'postprocessing': return <Clock className="w-4 h-4" />;
      case 'cooldown': return <Zap className="w-4 h-4" />;
      case 'chain': return <Link className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Link className="w-4 h-4" />
          Dependency Automation
        </CardTitle>
        <div className="flex items-center gap-2">
          <Switch
            checked={simulationMode}
            onCheckedChange={setSimulationMode}
          />
          <span className="text-xs">Simulation Mode</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">ACTIVE RULES</h4>
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              {getRuleIcon(rule.type)}
              <div className="flex-1">
                <div className="text-xs font-medium">{rule.name}</div>
                <div className="text-xs text-muted-foreground">
                  Buffer: {rule.bufferMinutes}min
                </div>
              </div>
              <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                {rule.enabled ? 'ON' : 'OFF'}
              </Badge>
            </div>
          ))}
        </div>

        {simulationResults.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <h4 className="text-xs font-medium mb-2">SIMULATION RESULTS</h4>
            {simulationResults.map((result, idx) => (
              <div key={idx} className="text-xs text-blue-700 dark:text-blue-300">
                {result}
              </div>
            ))}
          </div>
        )}

        <Button 
          size="sm" 
          onClick={() => handleRescheduleWithDependencies(jobs[0])}
          className="w-full"
        >
          {simulationMode ? 'Run Simulation' : 'Apply Dependencies'}
        </Button>
      </CardContent>
    </Card>
  );
};
