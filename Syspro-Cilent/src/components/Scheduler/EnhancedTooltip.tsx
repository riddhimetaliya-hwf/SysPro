import React from 'react';
import { Job } from '../../types/jobs';
import { format } from 'date-fns';
import { AlertTriangle, Clock, Package, Info, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedTooltipProps {
  job: Job;
  position: { top: number; left: number };
  tooltipRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
}

export const EnhancedTooltip = ({ job, position, tooltipRef, isVisible }: EnhancedTooltipProps) => {
  const getStatusConfig = () => {
    switch (job.conflictType) {
      case 'none':
        return {
          icon: <CheckCircle size={16} className="text-blue-500" />,
          title: 'Normal Status',
          description: 'Job is running smoothly',
          color: 'border-blue-200 bg-blue-50 text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'capacity':
        return {
          icon: <XCircle size={16} className="text-red-500" />,
          title: 'Critical: Capacity Exceeded',
          description: 'Machine capacity exceeded - immediate action required',
          color: 'border-red-200 bg-red-50 text-red-900',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'material':
        return {
          icon: <AlertTriangle size={16} className="text-yellow-500" />,
          title: 'Warning: Material Issue',
          description: job.conflictDetails?.reason || 'Materials may not be available',
          color: 'border-yellow-200 bg-yellow-50 text-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'resource':
        return {
          icon: <Clock size={16} className="text-yellow-500" />,
          title: 'Warning: Resource Conflict',
          description: 'Resources are allocated elsewhere',
          color: 'border-yellow-200 bg-yellow-50 text-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          icon: <Info size={16} className="text-blue-500" />,
          title: 'Information',
          description: 'Job status unknown',
          color: 'border-blue-200 bg-blue-50 text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      ref={tooltipRef} 
      className={`fixed z-50 bg-white border rounded-lg shadow-lg p-4 w-80 transition-all duration-200 ${
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div>
          <h4 className="font-semibold text-gray-900">{job.name}</h4>
          <p className="text-xs text-gray-500">{job.id}</p>
        </div>
        <Badge className={statusConfig.badgeColor}>
          {job.conflictType === 'none' ? 'Normal' : 
           job.conflictType === 'capacity' ? 'Critical' : 'Warning'}
        </Badge>
      </div>

      {/* Status Information */}
      <div className={`rounded-lg p-3 mb-3 border ${statusConfig.color}`}>
        <div className="flex items-center gap-2 mb-2">
          {statusConfig.icon}
          <span className="font-medium">{statusConfig.title}</span>
        </div>
        <p className="text-sm">{statusConfig.description}</p>
        
        {job.conflictDetails?.recommendation && (
          <div className="mt-2 p-2 bg-white/50 rounded border">
            <p className="text-sm font-medium">Recommendation:</p>
            <p className="text-sm">{job.conflictDetails.recommendation}</p>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start:</span>
          <span className="font-medium">{format(new Date(job.startDate), 'MMM d, HH:mm')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End:</span>
          <span className="font-medium">{format(new Date(job.endDate), 'MMM d, HH:mm')}</span>
        </div>
        {job.status && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{job.status}</span>
          </div>
        )}
      </div>

      {/* Color Code Legend */}
      <div className="pt-3 border-t">
        <p className="text-xs font-medium text-gray-700 mb-2">Color Codes:</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};