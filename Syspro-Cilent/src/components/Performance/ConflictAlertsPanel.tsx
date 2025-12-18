
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job, Machine } from '@/types/jobs';
import { format } from 'date-fns';
import { AlertTriangle, Clock, Package, Users, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ConflictAlert {
  id: string;
  type: 'overbooked' | 'overlap' | 'material' | 'resource';
  severity: 'critical' | 'warning';
  title: string;
  description: string;
  jobId: number;
  suggestion: string;
  autoResolvable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number; // 1-10 scale
  resolutionTime: string;
  affectedJobs: number[];
}

interface ConflictAlertsPanelProps {
  jobs: Job[];
  machines: Machine[];
  onResolveConflict: (jobId: number) => void;
}

export const ConflictAlertsPanel = ({ jobs, machines, onResolveConflict }: ConflictAlertsPanelProps) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const handleAutoResolve = (alert: ConflictAlert) => {
    toast.success(`Auto-resolving ${alert.title}`, {
      description: alert.suggestion
    });
    dismissAlert(alert.id);
    
    // Trigger the resolution
    if (alert.jobId && onResolveConflict) {
      onResolveConflict(alert.jobId);
    }
  };

  // Generate mock alerts based on jobs
  const generateAlerts = (): ConflictAlert[] => {
    const alerts: ConflictAlert[] = [];
    
    jobs.forEach(job => {
      if (job.conflictType !== 'none') {
        const alertId = `${job.id}-${job.conflictType}`;
        if (dismissedAlerts.has(alertId)) return;

        let alert: ConflictAlert;
        
        switch (job.conflictType) {
          case 'capacity':
            alert = {
              id: alertId,
              type: 'overbooked',
              severity: 'critical',
              title: 'Machine Overbooked',
              description: `${job.name} exceeds machine capacity on ${format(new Date(job.startDate), 'MMM d')}`,
              jobId: job.id,
              suggestion: 'Move to parallel machine or reschedule',
              autoResolvable: true,
              priority: 'critical',
              estimatedImpact: 8,
              resolutionTime: '15-30 min',
              affectedJobs: jobs.filter(j => j.machineId === job.machineId && j.id !== job.id).map(j => j.id)
            };
            break;
          case 'material':
            alert = {
              id: alertId,
              type: 'material',
              severity: 'warning',
              title: 'Material Shortage',
              description: `Required materials unavailable for ${job.name}`,
              jobId: job.id,
              suggestion: 'Expedite material order or delay job',
              autoResolvable: false,
              priority: 'high',
              estimatedImpact: 6,
              resolutionTime: '2-4 hours',
                affectedJobs: jobs.filter(j => j.dependencies?.includes(job.id)).map(j => j.id)
            };
            break;
          case 'resource':
            alert = {
              id: alertId,
              type: 'resource',
              severity: 'warning',
              title: 'Resource Unavailable',
              description: `Required resources not available for ${job.name}`,
              jobId: job.id,
              suggestion: 'Reassign resources or reschedule',
              autoResolvable: true,
              priority: 'medium',
              estimatedImpact: 4,
              resolutionTime: '30-60 min',
              affectedJobs: jobs.filter(j => j.dependencies?.includes(job.id)).map(j => j.id)
            };
            break;
          default:
            return;
        }
        
        alerts.push(alert);
      }
    });

    return alerts;
  };

  const alerts = generateAlerts();
  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.severity === filter
  );

  const getAlertIcon = (type: ConflictAlert['type']) => {
    switch (type) {
      case 'overbooked':
        return <Clock className="w-4 h-4" />;
      case 'overlap':
        return <AlertTriangle className="w-4 h-4" />;
      case 'material':
        return <Package className="w-4 h-4" />;
      case 'resource':
        return <Users className="w-4 h-4" />;
    }
  };


  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Smart Alerts ({filteredAlerts.length})
        </CardTitle>
        <div className="flex gap-2">
          {['all', 'critical', 'warning'].map(filterType => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType as typeof filter)}
              className="text-xs"
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.severity === 'critical' 
                  ? 'bg-destructive/5 border-destructive/20' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
              {/* Add performance metrics */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Impact: {alert.estimatedImpact}/10</span>
                <span>ETA: {alert.resolutionTime}</span>
                {alert.affectedJobs.length > 0 && (
                  <span>{alert.affectedJobs.length} jobs affected</span>
                )}
              </div>
              
              <div className="bg-background/50 p-2 rounded text-xs mb-2">
                <span className="font-medium">Suggestion:</span> {alert.suggestion}
              </div>
              
              <div className="flex gap-2">
                {alert.autoResolvable && (
                  <Button
                    size="sm"
                    onClick={() => handleAutoResolve(alert)}
                    className="text-xs h-7"
                  >
                    Auto Resolve
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    if (alert.jobId && onResolveConflict) {
                      onResolveConflict(alert.jobId);
                      dismissAlert(alert.id);
                    }
                  }}
                >
                  Resolve Job
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
