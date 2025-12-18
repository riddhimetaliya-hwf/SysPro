import React, { useRef, useEffect, useState, useMemo } from "react";
import { Job, Machine, FilterOptions } from "../../types/jobs";
import { GanttTimeline } from "./GanttTimeline";
import { GanttMachineRow } from "./GanttMachineRow";
import { DependencyManager } from "./DependencyManager";
import { useGanttLogic } from "./useGanttLogic";
import { useResizeObserver } from "./useResizeObserver";
import { addDays, startOfDay, endOfDay, parseISO, isValid, format, isWithinInterval } from "date-fns";
import { useFilters } from "@/contexts/FilterContext";
import { toast } from "sonner";
import { MoveConfirmationPopover } from "./MoveConfirmationPopover";
import { stripLeadingZeros } from "@/lib/utils";

interface GanttChartProps {
  jobs: Job[];
  machines: Machine[];
  startDate: Date;
  days: number;
  onJobUpdate?: (updatedJob: Job) => void;
}

const extractErrorMessage = (error: unknown): string => {
  let errStr = '';
  if (error instanceof Error) {
    errStr = error.message;
  } else if (typeof error === 'string') {
    errStr = error;
  } else if (error && typeof error === 'object') {
    const e = error as any;
    if (e.Message) return e.Message;
    if (e.message) return e.message;
    if (e.error) return e.error;
    errStr = JSON.stringify(error);
  } else {
    return 'An unknown error occurred';
  }

  const jsonMatch = errStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.Message) return parsed.Message;
      if (parsed.message) return parsed.message;
      if (parsed.error) return parsed.error;
    } catch {
      //empty 
    }
  }

  let cleanMsg = errStr
    .replace(/^(External API error:|Client error \d+:|Server error:|Bad request:|Error:|Errors occurred[:.]?\s*)/i, '')
    .trim();

  cleanMsg = cleanMsg.replace(/^Errors?\s*Occurr?ed\s*[:.]?\s*/i, '').trim();

  if (!cleanMsg || cleanMsg.toLowerCase().includes('unknown error')) {
    return 'Job move failed due to validation error';
  }

  return cleanMsg;
};

export const GanttChart = ({
  jobs: propJobs,
  machines: propMachines,
  startDate,
  days,
  onJobUpdate,
}: GanttChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const [dependencies, setDependencies] = useState<Array<{ from: string; to: string }>>([]);
  const [timelineCellWidths, setTimelineCellWidths] = useState<number[]>([]);
  const { filters } = useFilters();

  const jobs = useMemo(() => propJobs, [propJobs]);
  const machines = useMemo(() => propMachines, [propMachines]);

  const viewType = useMemo(() => (days <= 7 ? 'week' : 'month'), [days]);

  const cellWidth = useMemo(() => {
    if (viewType === 'week') {
      return 100 / days; 
    }
    return 240; 
  }, [viewType, days]);

  const timelineWidth = useMemo(() => {
    if (days <= 1) return days * 240;
    if (days <= 7) {
      return "100%";
    }
    return days * 240;
  }, [days]);

  const visibleDateRange = useMemo(() => {
    const start = startOfDay(startDate);
    const end = endOfDay(addDays(startDate, days - 1));
    return { start, end };
  }, [startDate, days]);

  useEffect(() => {
    if (viewType === 'week' && timelineContentRef.current) {
      const measureCells = () => {
        const cells = timelineContentRef.current?.querySelectorAll('.gantt-timeline-cell');
        if (cells && cells.length > 0) {
          const widths = Array.from(cells).map(cell => (cell as HTMLElement).offsetWidth);
          setTimelineCellWidths(widths);
        }
      };
      
      const timeout = setTimeout(measureCells, 100);
      window.addEventListener('resize', measureCells);
      
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('resize', measureCells);
      };
    } else if (viewType === 'month') {
      setTimelineCellWidths(Array(days).fill(240));
    }
  }, [viewType, days]);

  useEffect(() => {
    const contentElement = contentRef.current;
    const timelineElement = timelineHeaderRef.current;
    const horizontalScrollElement = horizontalScrollRef.current;
    if (!contentElement || !timelineElement || !horizontalScrollElement) return;

    const handleContentScroll = () => {
      const scrollLeft = contentElement.scrollLeft;
      if (timelineElement.scrollLeft !== scrollLeft) {
        timelineElement.scrollLeft = scrollLeft;
      }
      if (horizontalScrollElement.scrollLeft !== scrollLeft) {
        horizontalScrollElement.scrollLeft = scrollLeft;
      }
    };

    contentElement.addEventListener("scroll", handleContentScroll);
    return () => {
      contentElement.removeEventListener("scroll", handleContentScroll);
    };
  }, []);

  const {
    pendingDrop,
    handleDragStart,
    handleDrop,
    handleDragOver,
    confirmMove,
    cancelMove,
    draggingJob,
  } = useGanttLogic({ 
    jobs, 
    machines, 
    onJobUpdate: async (job) => { 
      if (onJobUpdate) onJobUpdate(job); 
      return job; 
    } 
  });

  const handleConfirmMove = async () => {
    if (!pendingDrop) {
      return;
    }
  
    const expectedUpdate = {
      jobId: pendingDrop.job.id,
      machineId: pendingDrop.newMachineId,
      startDate: pendingDrop.newStartDate,
    };
  
    try {
      const result = await confirmMove();
  
      if (result && result.success) {
        toast.success(
          `Job ${stripLeadingZeros(expectedUpdate.jobId.toString())} moved to ${format(expectedUpdate.startDate, "MMM d, yyyy")} successfully`,
          { duration: 2500 }
        );
  
      } else {
        console.error('❌ Job move failed:', result?.error);
        const errorMessage = extractErrorMessage(result?.error || "Unknown error");
        toast.error(`Failed to move job: ${errorMessage}`, {
          duration: 2500,
        });
      }
    } catch (error) {
      console.error('❌ Error in handleConfirmMove:', error);
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to move job: ${errorMessage}`, {
        duration: 2500,
      });
    }
  };
  
  const handleCancelMove = () => {
    cancelMove();
    toast.info("Job move cancelled");
  };

  const finalFilteredJobs = useMemo(() => {
    if (!jobs) return [];
    let filtered = [...jobs];
    if (filters?.machine) filtered = filtered.filter(job => job.machineId === filters.machine);
    if (filters?.status) filtered = filtered.filter(job => job.status === filters.status);
    if (filters?.material) filtered = filtered.filter(job =>
      job.materials?.some(m => m.id === filters.material || m.name === filters.material)
    );
    if (filters?.crewSkill) {
      if (filters.crewSkill.startsWith("crew:")) {
        filtered = filtered.filter(job => job.crewName === filters.crewSkill.replace("crew:", ""));
      } else if (filters.crewSkill.startsWith("skill:")) {
        filtered = filtered.filter(job => job.skillLevel === filters.crewSkill.replace("skill:", ""));
      }
    }
    if (filters?.job) filtered = filtered.filter(job => job.name === filters.job || job.jobType === filters.job);
    if (filters?.product) filtered = filtered.filter(job => job.product?.category === filters.product);
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => {
        return job.name.toLowerCase().includes(searchLower)
          || job.id.toString().toLowerCase().includes(searchLower)
          || job.description?.toLowerCase().includes(searchLower)
          || job.machineId?.toLowerCase().includes(searchLower)
          || job.materials?.some(m => m.name?.toLowerCase().includes(searchLower))
          || job.crewName?.toLowerCase().includes(searchLower)
          || job.skillLevel?.toLowerCase().includes(searchLower)
          || job.product?.category?.toLowerCase().includes(searchLower)
          || job.jobType?.toLowerCase().includes(searchLower);
      });
    }
    return filtered;
  }, [filters, jobs]);

  const visibleFilteredJobs = useMemo(() => {
    return finalFilteredJobs.filter(job => {
      if (!job.startDate || !job.endDate) return false;
      
      const jobStart = job.startDate instanceof Date ? job.startDate : new Date(job.startDate);
      const jobEnd = job.endDate instanceof Date ? job.endDate : new Date(job.endDate);
      
      return isWithinInterval(jobStart, visibleDateRange) || 
             isWithinInterval(jobEnd, visibleDateRange) ||
             (jobStart <= visibleDateRange.start && jobEnd >= visibleDateRange.end);
    });
  }, [finalFilteredJobs, visibleDateRange]);

  const filteredMachines = useMemo(() => {
    if (!filters || (
      !filters.machine &&
      !filters.status &&
      !filters.material &&
      !filters.crewSkill &&
      !filters.job &&
      !filters.product &&
      !filters.search
    )) return machines;

    const machineIds = new Set(visibleFilteredJobs.map(job => job.machineId));
    return machines.filter(machine => machineIds.has(machine.id));
  }, [filters, machines, visibleFilteredJobs]);

  useResizeObserver(containerRef, days, () => {});

  const handleCreateDependency = (fromJobId: string, toJobId: string) => {
    setDependencies(prev => [...prev, { from: fromJobId.toString(), to: toJobId.toString() }]);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Timeline Header */}
      <div
        ref={timelineHeaderRef}
        className="flex-shrink-0 bg-background border-b border-border sticky top-0 z-20 overflow-hidden"
      >
        <div
          style={{
            width: viewType === 'week' ? "100%" : `${days * 240}px`,
            minWidth: "100%",
          }}
        >
          <GanttTimeline
            ref={timelineContentRef}
            startDate={startDate}
            days={days}
            cellWidth={cellWidth}
            viewType={viewType}
          />
        </div>
      </div>

      {pendingDrop && (
        <MoveConfirmationPopover
          job={pendingDrop.job}
          newMachineId={pendingDrop.newMachineId}
          newStartDate={pendingDrop.newStartDate}
          onConfirm={handleConfirmMove}
          onCancel={handleCancelMove}
        />
      )}

      {/* Main Content Area with Vertical Scroll */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{
          height: "60vh",
          minHeight: "400px",
          maxHeight: "calc(100vh - 280px)",
          paddingBottom: "50px",
        }}
      >
        <div
          className="relative min-h-full flex flex-col overflow-x-hidden"
          style={{ 
            width: viewType === 'week' ? "100%" : `${days * 240}px`, 
            minWidth: "100%" 
          }}
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            if (timelineHeaderRef.current) {
              timelineHeaderRef.current.scrollLeft = scrollLeft;
            }
            if (horizontalScrollRef.current) {
              horizontalScrollRef.current.scrollLeft = scrollLeft;
            }
          }}
        >
          {filteredMachines.map((machine) => {
            const periodStart = startOfDay(startDate);
            const periodEnd = endOfDay(addDays(startDate, days - 1));

            const machineJobs = visibleFilteredJobs
              .filter((job) => job.machineId === machine.id)
              .map((job) => {
                const start =
                  job.startDate instanceof Date
                    ? job.startDate
                    : parseISO(job.startDate as string);
                const end =
                  job.endDate instanceof Date
                    ? job.endDate
                    : parseISO(job.endDate as string);
                const safeStart = isValid(start) ? start : periodStart;
                const safeEnd = isValid(end) ? end : addDays(safeStart, 1);
                return { ...job, startDate: safeStart, endDate: safeEnd };
              })
              .filter((job, index, self) => index === self.findIndex((j) => j.id === job.id));

            return (
              <GanttMachineRow
                key={machine.id}
                machine={machine}
                jobs={machineJobs}
                startDate={startDate}
                days={days}
                cellWidth={cellWidth}
                viewType={viewType}
                timelineCellWidths={timelineCellWidths}
                visibleDateRange={visibleDateRange}
                onJobUpdate={onJobUpdate || (() => {})}
                onDragStart={(jobId, e) => handleDragStart(jobId.toString(), e)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                isDragging={!!draggingJob}
              />
            );
          })}

          <DependencyManager
            jobs={visibleFilteredJobs}
            onUpdateJob={onJobUpdate || (() => {})}
            onCreateDependency={handleCreateDependency}
          />
        </div>

        {visibleFilteredJobs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-muted/40 backdrop-blur-sm">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl opacity-80"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Schedule Ready
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filters
                    ? "No jobs match your current filters"
                    : `No jobs scheduled in this ${viewType === 'week' ? 'week' : 'month'}`}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 <strong>Tip:</strong> Drag a job to another machine to reassign it</p>
                  <p>🎯 Jobs with conflicts will show colored overlays</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Horizontal Scrollbar at Bottom - Only show for views longer than a week */}
      {days > 7 && (
        <div
          ref={horizontalScrollRef}
          className="gantt-fixed-scrollbar gantt-scroll-synced"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            if (contentRef.current) {
              contentRef.current.scrollLeft = scrollLeft;
            }
            if (timelineHeaderRef.current) {
              timelineHeaderRef.current.scrollLeft = scrollLeft;
            }
          }}
        >
          <div
            style={{
              width: `${days * 240}px`,
              minWidth: "100%",
              height: "1px",
            }}
          />
        </div>
      )}
    </div>
  );
};