
import React from 'react';
import { Job } from '@/types/jobs';
import { Badge } from '@/components/ui/badge';
import { Clock, RotateCcw, Link, AlertTriangle } from 'lucide-react';

interface DynamicStatusSystemProps {
  job: Job;
  showAnimations?: boolean;
}

export const DynamicStatusSystem = ({ job, showAnimations = true }: DynamicStatusSystemProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: null,
          label: 'Scheduled'
        };
      case 'in-progress':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: null,
          label: 'In Progress'
        };
      case 'delayed':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Clock className="w-3 h-3" />,
          label: 'Delayed'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: null,
          label: 'Completed'
        };
      default:
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <AlertTriangle className="w-3 h-3" />,
          label: 'Blocked'
        };
    }
  };

  const getJobTypeIcon = () => {
    if (job.hasDependency) {
      return <Link className="w-3 h-3 text-blue-500" />;
    }
    return null;
  };

  const statusConfig = getStatusConfig(job.status || 'pending');
  const isUrgent = job.conflictType !== 'none';
  const hasRecurring = false; // This would come from job data
  
  return (
    <div className="flex items-center gap-2">
      {/* Main Status Badge */}
      <Badge 
        className={`
          ${statusConfig.color} 
          border text-xs flex items-center gap-1
          ${showAnimations && isUrgent ? 'animate-pulse' : ''}
        `}
      >
        {statusConfig.icon}
        {statusConfig.label}
      </Badge>

      {/* Job Type Indicators */}
      <div className="flex items-center gap-1">
        {isUrgent && (
          <div className="flex items-center">
            <Clock className="w-3 h-3 text-amber-500" />
          </div>
        )}
        
        {hasRecurring && (
          <RotateCcw className="w-3 h-3 text-purple-500" />
        )}
        
        {getJobTypeIcon()}
        
        {job.conflictType !== 'none' && (
          <AlertTriangle className={`w-3 h-3 text-red-500 ${showAnimations ? 'animate-pulse' : ''}`} />
        )}
      </div>
    </div>
  );
};
