import React, { useState, useRef, useEffect } from 'react';
import { Job } from '../../types/jobs';
import { ConflictOverlay } from './ConflictOverlay';
import { getJobCardClass } from './JobCardClassUtil';
import { JobDetailsModal } from './JobDetailsModal';
import { DynamicStatusSystem } from '../Performance/DynamicStatusSystem';
import { Clock, User, Package, AlertTriangle, Link, Zap } from 'lucide-react';

interface EnhancedJobCardProps {
  job: Job;
  left: number;
  width: number;
  onDragStart: (jobId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDependencyDragStart?: (jobId: string, e: React.MouseEvent) => void;
  onDependencyDrop?: (jobId: string, e: React.MouseEvent) => void;
}

export const EnhancedJobCard = ({ 
  job, 
  left, 
  width, 
  onDragStart,
  onDependencyDragStart,
  onDependencyDrop
}: EnhancedJobCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHoverSummary, setShowHoverSummary] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Default priority to 'medium' if not defined
  const priority = (job as any).priority || 'medium';

  const getPriorityBorder = () => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-red-500';
      case 'high':
        return 'border-l-4 border-l-orange-500';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      case 'low':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };

  const getUrgencyIcon = () => {
    if (job.conflictType !== 'none') return <AlertTriangle className="w-3 h-3 text-red-500" />;
    if (priority === 'critical') return <Zap className="w-3 h-3 text-red-500" />;
    if (job.hasDependency) return <Link className="w-3 h-3 text-blue-500" />;
    return null;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(job.id.toString(), e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setHoverPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowHoverSummary(true);
      }
    }, 800);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowHoverSummary(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const duration = Math.ceil((new Date(job.endDate).getTime() - new Date(job.startDate).getTime()) / (1000 * 60 * 60));

  return (
    <>
      <div
        ref={cardRef}
        data-job-id={job.id}
        className={`${getJobCardClass({
          conflictType: job.conflictType,
          hasDependency: job.hasDependency,
          isDragging
        })} ${getPriorityBorder()} cursor-pointer hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
        style={{ 
          left: `${left}px`, 
          width: `${width}px` 
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Status and Icon Overlays */}
        <div className="absolute top-1 right-1 flex items-center gap-1 z-20">
          {getUrgencyIcon()}
          <ConflictOverlay job={job} />
        </div>

        {/* Main Content */}
        <div className="p-2 h-full flex flex-col justify-between">
          <div className="truncate font-semibold text-sm mb-1">{job.name}</div>
          <div className="text-xs truncate opacity-75 mb-2">{job.id}</div>
          
          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between text-xs">
            <DynamicStatusSystem job={job} showAnimations={false} />
            <span className="text-muted-foreground">{duration}h</span>
          </div>
        </div>

        {/* Priority Gradient Overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
          priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
          priority === 'medium' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
          'bg-gradient-to-r from-green-500 to-green-600'
        }`} />
      </div>

      {/* Compact Hover Summary */}
      {showHoverSummary && (
        <div 
          className="fixed z-50 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl min-w-[280px] animate-fade-in"
          style={{
            left: `${hoverPosition.x - 140}px`,
            top: `${hoverPosition.y}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{job.name}</h4>
              <DynamicStatusSystem job={job} showAnimations={true} />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>{duration} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-green-500" />
                <span>Operator A</span>
              </div>
              {job.materials && job.materials.length > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-purple-500" />
                  <span>{job.materials.length} materials</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Machine:</span>
                <span className="font-medium">{job.machineId}</span>
              </div>
            </div>

            {job.conflictType !== 'none' && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-medium">Conflict Detected</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <JobDetailsModal 
        job={job}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
