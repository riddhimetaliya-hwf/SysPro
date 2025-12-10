import React, { useState, useRef } from 'react';
import { Job } from '../../types/jobs';
import { DependencyArrow } from './DependencyArrow';
import { toast } from 'sonner';
import { differenceInHours, isBefore } from 'date-fns';

interface DependencyManagerProps {
  jobs: Job[];
  onUpdateJob: (updatedJob: Job) => void;
  onCreateDependency: (fromJobId: string, toJobId: string) => void;
}

export const DependencyManager = ({ jobs, onUpdateJob, onCreateDependency }: DependencyManagerProps) => {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    fromJobId: string | null;
    mousePosition: { x: number; y: number };
  }>({
    isDragging: false,
    fromJobId: null,
    mousePosition: { x: 0, y: 0 }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const validateDependency = (fromJob: Job, toJob: Job): { valid: boolean; message?: string } => {
    const wouldCreateCycle = (from: Job, to: Job, visited = new Set<string>()): boolean => {
      if (visited.has(from.id)) return true;
      visited.add(from.id);

      if (from.dependencies) {
        for (const depId of from.dependencies) {
          const depJob = jobs.find(j => j.id === depId);
          if (depJob && (depJob.id === to.id || wouldCreateCycle(depJob, to, visited))) {
            return true;
          }
        }
      }
      return false;
    };

    if (wouldCreateCycle(toJob, fromJob)) {
      return { valid: false, message: 'Cannot create dependency: would create a cycle' };
    }

    if (fromJob.endDate && toJob.startDate) {
      const fromEnd = fromJob.endDate;
      const toStart = toJob.startDate;
      const minGap = 2; // 2 hours minimum gap

      if (isBefore(toStart, fromEnd)) {
        return {
          valid: false,
          message: `Job ${toJob.name} must start after ${fromJob.name} ends (minimum ${minGap}h gap required)`
        };
      }

      const hoursDiff = differenceInHours(toStart, fromEnd);
      if (hoursDiff < minGap) {
        return {
          valid: false,
          message: `Insufficient time gap: ${hoursDiff}h (minimum ${minGap}h required)`
        };
      }
    }

    return { valid: true };
  };

  const handleDragStart = (jobId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setDragState({
        isDragging: true,
        fromJobId: jobId,
        mousePosition: { x: event.clientX, y: event.clientY }
      });
      event.preventDefault();
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        mousePosition: { x: event.clientX, y: event.clientY }
      }));
    }
  };

  const handleDrop = (toJobId: string, event: React.MouseEvent) => {
    if (dragState.isDragging && dragState.fromJobId && dragState.fromJobId !== toJobId) {
      const fromJob = jobs.find(j => j.id === dragState.fromJobId);
      const toJob = jobs.find(j => j.id === toJobId);

      if (fromJob && toJob) {
        const validation = validateDependency(fromJob, toJob);

        if (validation.valid) {
          const existingDeps = new Set(toJob.dependencies || []);
          existingDeps.add(fromJob.id);

          const updatedToJob: Job = {
            ...toJob,
            hasDependency: true,
            dependencies: Array.from(existingDeps)
          };

          onUpdateJob(updatedToJob);
          onCreateDependency(dragState.fromJobId, toJobId);

          toast.success('Dependency created', {
            description: `${fromJob.name} → ${toJob.name}`
          });
        } else {
          toast.error('Cannot create dependency', {
            description: validation.message
          });
        }
      }
    }

    setDragState({
      isDragging: false,
      fromJobId: null,
      mousePosition: { x: 0, y: 0 }
    });
  };

  const renderDependencyArrows = () => {
    if (!containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const arrowSet = new Set<string>();
    const arrows: JSX.Element[] = [];

    jobs.forEach(job => {
      if (job.hasDependency && job.dependencies) {
        const uniqueDeps = Array.from(new Set(job.dependencies));

        uniqueDeps.forEach(depId => {
          const arrowKey = `${depId}-${job.id}`;
          if (arrowSet.has(arrowKey)) return; // ✅ skip duplicates
          arrowSet.add(arrowKey);

          const fromElement = document.querySelector(`[data-job-id="${depId}"]`) as HTMLElement;
          const toElement = document.querySelector(`[data-job-id="${job.id}"]`) as HTMLElement;

          if (fromElement && toElement) {
            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();

            arrows.push(
              <DependencyArrow
                key={arrowKey}
                fromRect={fromRect}
                toRect={toRect}
                containerRect={containerRect}
              />
            );
          }
        });
      }
    });

    return arrows;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      style={{ zIndex: 5 }}
    >
      {renderDependencyArrows()}

      {dragState.isDragging && dragState.fromJobId && (
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '100vw',
            height: '100vh',
            zIndex: 50
          }}
        >
          <line
            x1={dragState.mousePosition.x - 50}
            y1={dragState.mousePosition.y}
            x2={dragState.mousePosition.x}
            y2={dragState.mousePosition.y}
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )}

      {dragState.isDragging && (
        <div
          className="fixed bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium z-50 pointer-events-none"
          style={{
            left: dragState.mousePosition.x + 10,
            top: dragState.mousePosition.y - 40
          }}
        >
          Drop on target job to create dependency
        </div>
      )}
    </div>
  );
};
