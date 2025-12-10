
import React from 'react';
import { Job } from '../../types/jobs';
import { format, addHours } from 'date-fns';
import { AlertTriangle, Clock, Package, Lightbulb } from 'lucide-react';

interface SmartTooltipProps {
  job: Job;
  position: { top: number; left: number };
  tooltipRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
}

export const SmartTooltip = ({ job, position, tooltipRef, isVisible }: SmartTooltipProps) => {
  const getConflictDetails = () => {
    if (job.conflictType === 'none') return null;

    const conflictInfo = {
      capacity: {
        icon: <AlertTriangle size={16} className="text-red-500" />,
        title: 'Machine/Resource Overload',
        description: 'Machine capacity exceeded during this time slot',
        resolution: 'Reschedule to adjacent time slot or use alternative machine',
        severity: 'High',
        eta: '2h'
      },
      material: {
        icon: <Package size={16} className="text-orange-500" />,
        title: 'Material Shortage',
        description: job.conflictDetails?.reason || 'Required materials unavailable',
        resolution: 'Contact procurement or delay job until materials arrive',
        severity: 'Medium',
        eta: '6h'
      },
      resource: {
        icon: <Clock size={16} className="text-yellow-500" />,
        title: 'Resource Conflict',
        description: 'Required resources are allocated elsewhere',
        resolution: 'Coordinate with resource manager or adjust timing',
        severity: 'Medium',
        eta: '4h'
      }
    };

    return conflictInfo[job.conflictType as keyof typeof conflictInfo];
  };

  const conflictDetails = getConflictDetails();

  return (
    <div 
      ref={tooltipRef} 
      className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 transition-all duration-200 ${
        isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Job Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div>
          <h4 className="font-semibold text-gray-900">{job.name}</h4>
          <p className="text-xs text-gray-500">{job.id}</p>
        </div>
        {job.conflictType !== 'none' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.conflictType === 'capacity' ? 'bg-red-100 text-red-800' :
            job.conflictType === 'material' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {job.conflictType === 'capacity' ? 'Critical' : 'Warning'}
          </span>
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
      </div>

      {/* Conflict Information */}
      {conflictDetails && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2">
            {conflictDetails.icon}
            <span className="font-medium text-gray-900">{conflictDetails.title}</span>
          </div>
          
          <p className="text-sm text-gray-700">{conflictDetails.description}</p>
          
          <div className="flex items-start gap-2">
            <Lightbulb size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Resolution Tip:</p>
              <p className="text-sm text-blue-800">{conflictDetails.resolution}</p>
              <p className="text-xs text-blue-600 mt-1">ETA: {conflictDetails.eta}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dependencies */}
      {job.hasDependency && job.dependencies && job.dependencies.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium text-gray-700 mb-1">Dependencies:</p>
          <div className="flex flex-wrap gap-1">
            {job.dependencies.map(dep => (
              <span key={dep} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
