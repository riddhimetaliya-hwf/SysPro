
import React from 'react';
import { Badge } from '@/components/UI/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/UI/tooltip';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface MachineUtilizationBadgeProps {
  utilizationPercentage: number;
  machineName: string;
  conflictCount?: number;
}

export const MachineUtilizationBadge = ({ utilizationPercentage, machineName, conflictCount = 0 }: MachineUtilizationBadgeProps) => {
  const getUtilizationStatus = () => {
    if (utilizationPercentage >= 100) return { color: 'destructive', icon: AlertTriangle, label: 'Overloaded' };
    if (utilizationPercentage >= 85) return { color: 'secondary', icon: AlertCircle, label: 'High Load' };
    return { color: 'default', icon: CheckCircle, label: 'Normal' };
  };

  const status = getUtilizationStatus();
  const StatusIcon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={status.color as any} className="flex items-center gap-1 cursor-help">
            <StatusIcon className="w-3 h-3" />
            {utilizationPercentage}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{machineName} Utilization</div>
            <div className="text-sm">
              <div>Current Load: <span className="font-medium">{utilizationPercentage}%</span></div>
              <div>Status: <span className="font-medium">{status.label}</span></div>
              {conflictCount > 0 && (
                <div className="text-destructive">
                  Conflicts: <span className="font-medium">{conflictCount}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground border-t pt-2">
              {utilizationPercentage >= 100 
                ? "⚠️ Machine is overloaded. Consider redistributing jobs or scheduling maintenance."
                : utilizationPercentage >= 85
                ? "⚡ Machine is running at high capacity. Monitor for potential bottlenecks."
                : "✅ Machine is operating within normal parameters."
              }
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
