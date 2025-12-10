
import React from 'react';
import { Job } from '../../types/jobs';
import { format } from 'date-fns';

interface JobTooltipProps {
  job: Job;
  position: { top: number; left: number };
  tooltipRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
}

export const JobTooltip = ({ job, position, tooltipRef, isVisible }: JobTooltipProps) => {
  // Get conflict explanation text
  const getConflictExplanation = () => {
    if (job.conflictType === 'none') return null;
    
    const conflictTypes = {
      'capacity': 'Machine capacity exceeded',
      'material': 'Material shortage detected',
      'resource': 'Resource unavailable'
    };
    
    const reason = job.conflictDetails?.reason || conflictTypes[job.conflictType as keyof typeof conflictTypes];
    
    return (
      <div className="tooltip-section">
        <div className="tooltip-label">Conflict Detected</div>
        <div className={`tooltip-status error`}>
          {conflictTypes[job.conflictType as keyof typeof conflictTypes]}
        </div>
        <div className="tooltip-value text-xs mt-1">{reason}</div>
        {job.conflictDetails?.recommendation && (
          <div className="tooltip-value text-xs mt-1 italic">
            <span className="font-medium">Recommended:</span> {job.conflictDetails.recommendation}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={tooltipRef} 
      className={`job-tooltip ${isVisible ? 'visible' : ''}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="tooltip-header">
        <div>
          <div className="text-lg font-bold">{job.name}</div>
          <div className="text-xs opacity-75">{job.id}</div>
        </div>
        <div className={`tooltip-status ${
          job.conflictType === 'none' ? 'success' :
          job.conflictType === 'capacity' ? 'error' :
          job.conflictType === 'material' ? 'warning' : 'warning'
        }`}>
          {job.conflictType === 'none' ? 'On Track' : 'Conflict'}
        </div>
      </div>

      <div className="tooltip-section">
        <div className="tooltip-label">Description</div>
        <div className="tooltip-value">{job.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="tooltip-section">
          <div className="tooltip-label">Start Date</div>
          <div className="tooltip-value">{format(new Date(job.startDate), 'MMM d, yyyy')}</div>
        </div>
        <div className="tooltip-section">
          <div className="tooltip-label">End Date</div>
          <div className="tooltip-value">{format(new Date(job.endDate), 'MMM d, yyyy')}</div>
        </div>
      </div>
      
      {job.status && (
        <div className="tooltip-section">
          <div className="tooltip-label">Status</div>
          <div className="tooltip-value capitalize">{job.status}</div>
        </div>
      )}
      
      {/* Conflict information */}
      {job.conflictType !== 'none' && getConflictExplanation()}
      
      {job.hasDependency && job.dependencies && job.dependencies.length > 0 && (
        <div className="tooltip-section">
          <div className="tooltip-label">Dependencies</div>
          <div className="tooltip-value text-primary font-medium">{job.dependencies.join(', ')}</div>
        </div>
      )}
      
      {job.materials && job.materials.length > 0 && (
        <div className="tooltip-section">
          <div className="tooltip-label">Materials Required</div>
          <div className="space-y-1">
            {job.materials.map(material => (
              <div key={material.id} className="flex justify-between items-center">
                <span className="tooltip-value">{material.name}</span>
                <span className={`text-xs font-semibold ${
                  material.required > material.available ? "text-destructive" : "text-success"
                }`}>
                  {material.required}/{material.available} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tooltip-actions">
        <button className="tooltip-action-btn">
          Edit Job
        </button>
        <button className="tooltip-action-btn">
          View Details
        </button>
      </div>
    </div>
  );
};
