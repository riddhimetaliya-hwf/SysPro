import React, { useState, useEffect, useMemo } from "react";
import { Job, Machine } from "../../types/jobs";
import { GanttJobCard } from "./GanttJobCard";
import { MachineUtilizationBadge } from "./MachineUtilizationBadge";
import { differenceInDays, addDays, startOfDay, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

interface GanttMachineRowProps {
  machine: Machine;
  jobs: Job[];
  startDate: Date;
  days: number;
  cellWidth: number;
  viewType: 'week' | 'month';
  timelineCellWidths: number[];
  visibleDateRange: { start: Date; end: Date };
  onJobUpdate: (job: Job) => void;
  onDragStart: (jobId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDependencyDragStart?: (jobId: string, e: React.MouseEvent) => void;
  onDependencyDrop?: (jobId: string, e: React.MouseEvent) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, machineId: string, date: Date) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
}

export const GanttMachineRow = ({
  machine,
  jobs,
  startDate,
  days,
  cellWidth,
  viewType,
  timelineCellWidths,
  visibleDateRange,
  onJobUpdate,
  onDragStart,
  onDependencyDragStart,
  onDependencyDrop,
  onDrop,
  onDragOver,
  isDragging = false,
}: GanttMachineRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter jobs to only those within the visible date range and sort by start date
  const machineJobs = useMemo(() => {
    const filteredJobs = jobs.filter(job => {
      if (!job.startDate || !job.endDate) return false;
      
      const jobStart = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
      const jobEnd = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
      
      // Check if job overlaps with visible date range
      return isWithinInterval(jobStart, visibleDateRange) || 
             isWithinInterval(jobEnd, visibleDateRange) ||
             (jobStart <= visibleDateRange.start && jobEnd >= visibleDateRange.end);
    });

    // Sort jobs by start date in ascending order
    return filteredJobs.sort((a, b) => {
      const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate || 0);
      const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate || 0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [jobs, visibleDateRange]);

  const conflicts = machineJobs.filter((job) => job.conflictType !== "none").length;
  const hasMultipleJobs = machineJobs.length > 1;

  const today = startOfDay(new Date());
  const ganttStartDate = startOfDay(startDate);

  const jobsAtCurrentDate = useMemo(() => {
    return machineJobs.filter((job) => {
      const jobStart = job.startDate ? startOfDay(new Date(job.startDate)) : null;
      if (!jobStart) return false;
      
      return jobStart.getTime() === ganttStartDate.getTime();
    });
  }, [machineJobs, ganttStartDate]);

  const displayJobs = useMemo(() => {
    if (isExpanded) {
      return machineJobs;
    }
    
    if (jobsAtCurrentDate.length > 1) {
      return [];
    }
    
    if (jobsAtCurrentDate.length === 1) {
      return jobsAtCurrentDate;
    }
    
    return machineJobs.filter((job) => {
      const jobStart = job.startDate ? startOfDay(new Date(job.startDate)) : null;
      const jobEnd = job.endDate ? startOfDay(new Date(job.endDate)) : null;
      
      if (!jobStart || !jobEnd) return false;
      
      const isInProgress = jobStart <= today && jobEnd >= today;
      const isFuture = jobStart > today;
      
      return isInProgress || isFuture;
    });
  }, [machineJobs, isExpanded, today, jobsAtCurrentDate, ganttStartDate]);

  const utilizationPercentage = Math.min(100, Math.round((machineJobs.length / 5) * 100));

  const HEADER_HEIGHT = 90;
  const JOB_CARD_HEIGHT = 70;
  const JOB_SPACING = 8;
  
  const contentHeight = isExpanded
    ? Math.max(HEADER_HEIGHT, (JOB_CARD_HEIGHT + JOB_SPACING) * displayJobs.length + 20)
    : HEADER_HEIGHT;

  const dayCells = Array.from({ length: days }, (_, index) => {
    const currentDate = addDays(startDate, index);
    return currentDate;
  });

  const getJobPosition = (job: Job) => {
    const jobStart = job.startDate ? new Date(job.startDate) : startDate;
    const jobEnd = job.endDate ? new Date(job.endDate) : addDays(jobStart, 1);
    
    const safeJobStart = isNaN(jobStart.getTime()) ? startDate : jobStart;
    const safeJobEnd = isNaN(jobEnd.getTime()) ? addDays(safeJobStart, 1) : jobEnd;

    const normalizedStart = startOfDay(safeJobStart);
    const normalizedEnd = startOfDay(safeJobEnd);
    const ganttStart = startOfDay(startDate);
    
    const startCellIndex = Math.max(0, differenceInDays(normalizedStart, ganttStart));
    const durationInCells = Math.max(1, differenceInDays(normalizedEnd, normalizedStart) + 1);
    
    const endCellIndex = Math.min(days - 1, startCellIndex + durationInCells - 1);
    const visibleDuration = Math.max(1, endCellIndex - startCellIndex + 1);

    if (timelineCellWidths.length === days) {
      const left = timelineCellWidths.slice(0, startCellIndex).reduce((sum, w) => sum + w, 0);
      const width = timelineCellWidths.slice(startCellIndex, endCellIndex + 1).reduce((sum, w) => sum + w, 0);
      
      return {
        left,
        width,
        startCellIndex,
        endCellIndex,
        cellWidth: width / visibleDuration
      };
    }

    const currentCellWidth = viewType === 'month' ? cellWidth : cellWidth;

    return {
      left: startCellIndex * currentCellWidth,
      width: visibleDuration * currentCellWidth,
      startCellIndex,
      endCellIndex,
      cellWidth: currentCellWidth
    };
  };

  const toggleExpand = () => {
    if (hasMultipleJobs) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    try {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const cellEl = elements.find((el) => (el as HTMLElement).classList?.contains("gantt-cell")) as HTMLElement | undefined;
      
      if (!cellEl) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        let cellIndex = 0;
        if (timelineCellWidths.length === days) {
          let accumulatedWidth = 0;
          for (let i = 0; i < timelineCellWidths.length; i++) {
            accumulatedWidth += timelineCellWidths[i];
            if (x < accumulatedWidth) {
              cellIndex = i;
              break;
            }
          }
        } else {
          cellIndex = Math.max(0, Math.min(days - 1, Math.floor(x / cellWidth)));
        }
        
        const dropDate = addDays(startDate, cellIndex);
        onDrop(e, machine.id.toString(), dropDate);
        return;
      }

      const cellIndexAttr = cellEl.dataset.cellIndex;
      const targetMachineId = cellEl.dataset.machineId;
      
      if (cellIndexAttr == null || !targetMachineId) {
        console.error('❌ Missing cell data:', { cellIndexAttr, targetMachineId });
        return;
      }

      const cellIndex = Number.parseInt(cellIndexAttr, 10);
      if (Number.isNaN(cellIndex)) {
        console.error('❌ Invalid cell index:', cellIndexAttr);
        return;
      }

      const dropDate = addDays(startOfDay(startDate), cellIndex);
      onDrop(e, targetMachineId, dropDate);
      
    } catch (error) {
      console.error('❌ Drop error:', error);
    }
  };

  return (
    <div className="gantt-row flex border-b border-border" style={{ minHeight: `${contentHeight}px` }}>
      {/* Fixed Height Sticky Row Header */}
      <div 
        className="gantt-row-header sticky left-0 px-4 py-3 border-r bg-background z-20 hover:bg-muted/40 transition-colors flex-shrink-0"
        style={{ 
          width: '240px',
          minWidth: '240px',
          maxWidth: '240px',
          height: `${HEADER_HEIGHT}px`
        }}
      >
        <div className="flex items-center gap-3 w-full h-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Package className="w-4 h-4 text-blue" />
              </div>
              <h3 className="font-bold text-sm text-foreground truncate">{machine.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-8">
              {machine.description || "Machine"} •
              <span className="inline-flex items-center ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {machineJobs.length} job{machineJobs.length !== 1 ? "s" : ""} {viewType === 'week' ? 'this week' : 'this month'}
              </span>
            </p>
          </div>

          {hasMultipleJobs && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
              title={isExpanded ? "Collapse jobs" : "Expand jobs"}
            >
              {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Row Content with INDIVIDUAL CELLS */}
      <div
        className="gantt-row-content flex-1 relative transition-all duration-300 ease-in-out"
        style={{
          width: "100%",
          height: `${contentHeight}px`,
          minWidth: "100%",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* INDIVIDUAL CELLS GRID - Uses exact same widths as timeline */}
        <div className="absolute inset-0 flex" style={{ width: "100%" }}>
          {dayCells.map((date, index) => {
            const cellId = `machine-${machine.id}-date-${date.toISOString().split('T')[0]}`;
            
            const cellStyle: React.CSSProperties = {};
            
            if (timelineCellWidths.length === days) {
              cellStyle.width = `${timelineCellWidths[index]}px`;
              cellStyle.minWidth = `${timelineCellWidths[index]}px`;
              cellStyle.maxWidth = `${timelineCellWidths[index]}px`;
              cellStyle.flex = "0 0 auto";
            } else if (viewType === 'week') {
              cellStyle.flex = "1 1 0%";
            } else {
              cellStyle.width = `${cellWidth}px`;
              cellStyle.minWidth = `${cellWidth}px`;
              cellStyle.flex = "0 0 auto";
            }
            
            return (
              <div
                key={cellId}
                className="gantt-cell border-r border-border bg-background hover:bg-muted/20 transition-colors"
                style={{
                  ...cellStyle,
                  height: `${contentHeight}px`,
                }}
                data-cell-id={cellId}
                data-date={date.toISOString()}
                data-machine-id={machine.id}
                data-cell-index={index}
                data-view-type={viewType}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(e, machine.id.toString(), date);
                }}
              />
            );
          })}
        </div>

        {/* Simple Job Count Indicator - Shows when collapsed and multiple jobs at current date */}
        {!isExpanded && jobsAtCurrentDate.length > 1 && (
          <div 
            className="absolute top-3 left-3 z-10 pointer-events-none"
            style={{ 
              width: timelineCellWidths.length > 0 ? `${Math.min(timelineCellWidths[0] - 16, 120)}px` : `${Math.min(cellWidth - 16, 120)}px`,
            }}
          >
            <div
              className="px-3 py-2 rounded-sm
                         bg-gradient-to-r from-[#008FB5]/40 to-[#81C341]/40
                         backdrop-blur-sm border border-[#008FB5]/30 
                         shadow-md flex items-center justify-center"
            >
              <span className="text-sm font-semibold text-gray-600 tracking-wide">
                +{jobsAtCurrentDate.length} Jobs
              </span>
            </div>
          </div>
        )}

        {/* Job Cards - Now respects ascending order from displayJobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            {displayJobs.map((job, index) => {
              const { left, width } = getJobPosition(job);
              const topPosition = isExpanded ? 10 + index * (JOB_CARD_HEIGHT + JOB_SPACING) : 10;
              const isGrouped = machineJobs.length > 1;
              
              const totalWidth = timelineCellWidths.length === days
                ? timelineCellWidths.reduce((sum, w) => sum + w, 0)
                : days * cellWidth;
              const isVisible = width > 0 && left < totalWidth;
              
              return (
                <GanttJobCard
                  key={job.id}
                  job={job}
                  left={left}
                  width={width}
                  top={topPosition}
                  isGrouped={isGrouped}
                  isVisible={isVisible}
                  onDragStart={(jobId, e) => onDragStart(jobId, e)}
                  onDependencyDragStart={
                    onDependencyDragStart ? (jobId, e) => onDependencyDragStart(jobId, e) : undefined
                  }
                  onDependencyDrop={onDependencyDrop ? (jobId, e) => onDependencyDrop(jobId.toString(), e) : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};