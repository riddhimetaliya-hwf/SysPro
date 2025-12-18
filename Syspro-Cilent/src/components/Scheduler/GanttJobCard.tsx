import React, { useState } from 'react';
import { Job } from '../../types/jobs';
import { ConflictOverlay } from './ConflictOverlay';
import { getJobCardClass } from './JobCardClassUtil';
import { JobDetailsModal } from './JobDetailsModal';
import { CrewSkillIndicator } from './CrewSkillIndicator';
import { JobCardExplanationOverlay } from './JobCardExplanationOverlay';
import { HelpCircle, Clock, AlertCircle, CheckCircle, Loader, PackageX } from 'lucide-react';
import { stripLeadingZeros } from '@/lib/utils';

interface GanttJobCardProps {
  job: Job;
  left: number;
  width: number;
  top: number;
  isGrouped: boolean;
  isVisible: boolean;
  onDragStart: (jobId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDependencyDragStart?: (jobId: string, e: React.MouseEvent) => void;
  onDependencyDrop?: (jobId: string, e: React.MouseEvent) => void;
}

export const GanttJobCard: React.FC<GanttJobCardProps> = ({
  job,
  left,
  width,
  top,
  isGrouped,
  isVisible,
  onDragStart,
  onDependencyDragStart,
  onDependencyDrop
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);

    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ jobId: job.id }));
    e.dataTransfer.effectAllowed = "move";

    onDragStart(job.id, e);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Check if job has missing materials
  const hasMissingMaterials = () => {
    if (!job.materials || job.materials.length === 0) return false;
    
    return job.materials.some((material) => {
      const status = material.status?.toLowerCase();
      return status === 'critical' || status === 'unavailable' || status === 'low';
    });
  };

  const getStatusColor = () => {
    // Priority 1: Check for missing materials first
    if (hasMissingMaterials()) {
      return 'bg-orange-400/95 text-white shadow-orange-400/30 border-orange-500/20';
    }

    // Priority 2: Check job status
    const status = job.status?.toLowerCase() || '';
    
    if (status.includes('progress') || status === 'in progress') {
      // Green for "In Progress"
      return 'bg-green-500/95 text-white shadow-green-500/30 border-green-600/20';
    } else if (status.includes('active') || status === 'active' || status === 'scheduled') {
      // Blue for "Scheduled" or "Active"
      return 'bg-blue-500/95 text-white shadow-blue-500/30 border-blue-600/20';
    } else if (status.includes('complete')) {
      // Keep completed as secondary color
      return 'bg-secondary/95 text-secondary-foreground shadow-secondary/30 border-secondary/20';
    } else if (status.includes('delay') || status.includes('hold')) {
      // Red for delayed or on hold
      return 'bg-destructive/95 text-destructive-foreground shadow-destructive/30 border-destructive/20';
    }
    
    // Default muted color
    return 'bg-muted/95 text-muted-foreground shadow-muted/30 border-muted/20';
  };

  const getStatusIcon = () => {
    // Show material icon if missing materials
    if (hasMissingMaterials()) {
      return <PackageX className="w-3 h-3" />;
    }

    const status = job.status?.toLowerCase() || '';
    
    if (status.includes('complete')) {
      return <CheckCircle className="w-3 h-3" />;
    } else if (status.includes('progress') || status === 'in progress') {
      return <Loader className="w-3 h-3 animate-spin" />;
    } else if (status.includes('delay') || status.includes('hold')) {
      return <AlertCircle className="w-3 h-3" />;
    } else if (status.includes('active') || status === 'active' || status === 'scheduled') {
      return <Clock className="w-3 h-3" />;
    }
    
    return <Clock className="w-3 h-3" />;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onDependencyDragStart?.(stripLeadingZeros(job.id), e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    onDependencyDrop?.(stripLeadingZeros(job.id), e);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowExplanation(true);
  };

  if (!isVisible) return null;

  return (
    <ConflictOverlay job={job}>
      <div
        data-job-id={stripLeadingZeros(job.id)}
        draggable="true"  
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className={`gantt-job absolute rounded-xl p-3.5 cursor-move shadow-xl ${getStatusColor()} ${
          isDragging ? 'opacity-50' : ''
        } ${isGrouped ? 'animate-slide-down' : 'animate-fade-in'} border hover:border-primary-foreground/30 transition-all duration-300 backdrop-blur-sm`}
        style={{
          left: `${left}px`,
          width: `${width - 8}px`,
          top: `${top}px`,
          minWidth: '120px',  
          marginBottom: isGrouped ? '10px' : '0',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] opacity-75 font-semibold tracking-wide uppercase">
            Job ID: {stripLeadingZeros(job.id)}
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
          </div>
        </div>
        <div className="font-bold text-sm leading-tight">
          {job.name}
        </div>
        
        {/* Optional: Add material warning indicator */}
        {hasMissingMaterials() && (
          <div className="text-[10px] mt-1.5 opacity-90 font-medium">
            ⚠️ Missing Materials
          </div>
        )}
      </div>

      <JobDetailsModal
        job={job}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {showExplanation && (
        <JobCardExplanationOverlay
          job={job}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </ConflictOverlay>
  );
};