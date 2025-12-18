import React, { useMemo, forwardRef } from "react";
import { format, addDays, isToday, isWeekend } from "date-fns";
import { Calendar } from "lucide-react";

interface GanttTimelineProps {
  startDate: Date;
  days: number;
  cellWidth: number;
  viewType: 'week' | 'month';
}

export const GanttTimeline = forwardRef<HTMLDivElement, GanttTimelineProps>(
  ({ startDate, days, cellWidth, viewType }, ref) => {
    const dates = useMemo(() => Array.from({ length: days }, (_, i) => addDays(startDate, i)), [startDate, days]);

    return (
      <div
        className="gantt-timeline flex border-b top-0 z-30 backdrop-blur-md overflow-y-hidden"
        role="rowgroup"
        aria-label="Timeline"
        style={{
          width: "100%",
          minWidth: "100%",
        }}
      >
        {/* Machines Header */}
        <div
          className="gantt-row-header flex items-center justify-center border-r bg-gradient-to-r from-primary/95 to-primary/90 text-primary-foreground font-semibold shadow-lg sticky left-0 z-40 flex-shrink-0"
          role="rowheader"
          style={{
            width: '240px',
            minWidth: '240px',
            maxWidth: '240px',
          }}
        >
          <div className="flex items-center gap-2.5 px-4">
            <div className="p-1.5 rounded-md bg-primary-foreground/15">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <span className="font-bold text-blue-500 tracking-wide">Machines</span>
          </div>
        </div>

        {/* Date Cells Container */}
        <div 
          ref={ref}
          className="flex"
          style={{
            flex: 1,
            width: viewType === 'week' ? "100%" : `${days * cellWidth}px`,
          }}
        >
          {dates.map((date, index) => {
            const isWeekendDay = isWeekend(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={`gantt-timeline-cell flex flex-col items-center justify-center border-r border-border/30 transition-all duration-200 hover:bg-primary/5
                  ${isWeekendDay ? "bg-muted/30" : ""}
                  ${isTodayDate ? "bg-accent/20 border-l-4 border-accent" : ""}
                `}
                style={{
                  flex: viewType === 'week' ? "1 1 0%" : "0 0 auto",
                  width: viewType === 'month' ? `${cellWidth}px` : undefined,
                  minWidth: viewType === 'month' ? `${cellWidth}px` : undefined,
                }}
              >
                <div className={`font-semibold text-sm ${isTodayDate ? "text-accent-foreground" : "text-foreground/90"}`}>
                  {format(date, "EEE")}
                </div>
                <div className={`text-xs mt-0.5 font-medium ${isTodayDate ? "text-accent-foreground" : "text-muted-foreground"}`}>
                  {format(date, "MMM d")}
                </div>
                {isTodayDate && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-accent-foreground font-semibold">Today</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

GanttTimeline.displayName = 'GanttTimeline';