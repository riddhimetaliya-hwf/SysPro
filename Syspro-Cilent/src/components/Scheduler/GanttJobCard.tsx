import React, { useState } from 'react';
import { Job } from '../../types/jobs';
import { ConflictOverlay } from './ConflictOverlay';
import { getJobCardClass } from './JobCardClassUtil';
import { JobDetailsModal } from './JobDetailsModal';
import { CrewSkillIndicator } from './CrewSkillIndicator';
import { JobCardExplanationOverlay } from './JobCardExplanationOverlay';
import { HelpCircle, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
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

  const getStatusColor = () => {
    const status = job.status.toLowerCase();
    if (status.includes('complete')) {
      return 'bg-secondary/95 text-secondary-foreground shadow-secondary/30';
    } else if (status.includes('progress') || status.includes('active')) {
      return 'bg-primary/95 text-primary-foreground shadow-primary/30';
    } else if (status.includes('delay')) {
      return 'bg-destructive/95 text-destructive-foreground shadow-destructive/30';
    }
    return 'bg-muted/95 text-muted-foreground shadow-muted/30';
  };

  const getStatusIcon = () => {
    const status = job.status.toLowerCase();
    if (status.includes('complete')) {
      return <CheckCircle className="w-3 h-3" />;
    } else if (status.includes('progress') || status.includes('active')) {
      return <Loader className="w-3 h-3 animate-spin" />;
    } else if (status.includes('delay')) {
      return <AlertCircle className="w-3 h-3" />;
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
        } ${isGrouped ? 'animate-slide-down' : 'animate-fade-in'} border border-primary-foreground/10 hover:border-primary-foreground/30 transition-all duration-300 backdrop-blur-sm`}
        style={{
          left: `${left}px`,
          width: `${width - 8}px`,
          top: `${top}px`,
          minWidth: '120px',  
          marginBottom: isGrouped ? '10px' : '0',
        }}
      >
        <div className="text-[11px] opacity-75 font-semibold mb-1.5 tracking-wide uppercase">
          Job ID: {stripLeadingZeros(job.id)}
        </div>
        <div className="font-bold text-sm leading-tight">
          {job.name}
        </div>
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