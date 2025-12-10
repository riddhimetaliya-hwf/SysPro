import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Progress } from '@/components/UI/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/UI/collapsible';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  status?: 'success' | 'warning' | 'critical' | 'info';
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  }[];
  details?: {
    label: string;
    value: string | number;
    status?: 'success' | 'warning' | 'critical' | 'info';
  }[];
  quickStats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
}

interface SmartDashboardCardProps {
  data: SmartCardData;
  className?: string;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export const SmartDashboardCard = ({ 
  data, 
  className, 
  expandable = true,
  defaultExpanded = false 
}: SmartDashboardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-success border-success/20 bg-success/5';
      case 'warning': return 'text-warning border-warning/20 bg-warning/5';
      case 'critical': return 'text-critical border-critical/20 bg-critical/5';
      case 'info': return 'text-info border-info/20 bg-info/5';
      default: return 'text-foreground border-border bg-card';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-success" />
    ) : (
      <TrendingDown className="w-4 h-4 text-critical" />
    );
  };

  return (
    <Card className={cn(
      "interactive-card border transition-all duration-200",
      getStatusColor(data.status),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {getStatusIcon(data.status)}
              {data.title}
            </CardTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-metric-secondary">{data.value}</span>
              {data.trend && (
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(data.trend.isPositive)}
                  <span className={data.trend.isPositive ? 'text-success' : 'text-critical'}>
                    {data.trend.value}% {data.trend.label}
                  </span>
                </div>
              )}
            </div>
            {data.subtitle && (
              <p className="text-sm text-muted-foreground">{data.subtitle}</p>
            )}
          </div>
          
          {expandable && (data.details || data.quickStats) && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>

        {data.progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{data.progress.label || 'Progress'}</span>
              <span>{data.progress.value}/{data.progress.max}</span>
            </div>
            <Progress 
              value={(data.progress.value / data.progress.max) * 100} 
              className="h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Quick Stats Row */}
        {data.quickStats && (
          <div className="grid grid-cols-3 gap-4">
            {data.quickStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  {stat.icon}
                  {stat.label}
                </div>
                <div className="text-sm font-semibold">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {data.actions && (
          <div className="flex flex-wrap gap-2">
            {data.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className="text-xs interactive-button"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Expandable Details */}
        {expandable && data.details && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="space-y-3">
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Details</h4>
                <div className="space-y-2">
                  {data.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{detail.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{detail.value}</span>
                        {detail.status && (
                          <Badge variant="secondary" className={cn("text-xs", getStatusColor(detail.status))}>
                            {detail.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

// Preset card configurations for common use cases
export const createJobStatusCard = (completedJobs: number, totalJobs: number, delayedJobs: number): SmartCardData => ({
  id: 'job-status',
  title: 'Job Status',
  value: `${completedJobs}/${totalJobs}`,
  subtitle: 'Jobs Completed',
  status: delayedJobs > 0 ? 'warning' : 'success',
  progress: {
    value: completedJobs,
    max: totalJobs,
    label: 'Completion Progress'
  },
  trend: {
    value: Math.round((completedJobs / totalJobs) * 100),
    isPositive: delayedJobs === 0,
    label: 'efficiency'
  },
  quickStats: [
    { label: 'Completed', value: completedJobs, icon: <CheckCircle className="w-3 h-3" /> },
    { label: 'Delayed', value: delayedJobs, icon: <AlertTriangle className="w-3 h-3" /> },
    { label: 'Total', value: totalJobs, icon: <Zap className="w-3 h-3" /> }
  ],
  actions: [
    { label: 'View Details', onClick: () => {}, variant: 'outline' }
  ]
});

export const createMachineUtilizationCard = (utilizationPercent: number, operationalMachines: number, totalMachines: number): SmartCardData => ({
  id: 'machine-utilization',
  title: 'Machine Utilization',
  value: `${utilizationPercent}%`,
  subtitle: `${operationalMachines}/${totalMachines} machines active`,
  status: utilizationPercent > 80 ? 'success' : utilizationPercent > 60 ? 'warning' : 'critical',
  progress: {
    value: utilizationPercent,
    max: 100,
    label: 'Utilization Rate'
  },
  trend: {
    value: Math.abs(utilizationPercent - 75),
    isPositive: utilizationPercent > 75,
    label: 'vs target'
  },
  details: [
    { label: 'Operational', value: operationalMachines, status: 'success' },
    { label: 'Maintenance', value: Math.max(0, totalMachines - operationalMachines - 1), status: 'warning' },
    { label: 'Offline', value: Math.max(0, totalMachines - operationalMachines), status: 'critical' }
  ],
  actions: [
    { label: 'Optimize', onClick: () => {}, variant: 'default' },
    { label: 'Schedule Maintenance', onClick: () => {}, variant: 'outline' }
  ]
});