import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { cn } from '@/lib/utils';

interface MiniMapOverviewProps {
  jobs: Job[];
  machines: Machine[];
  viewportStart: Date;
  viewportEnd: Date;
  onViewportChange: (start: Date, end: Date) => void;
  className?: string;
}

export const MiniMapOverview = ({
  jobs,
  machines,
  viewportStart,
  viewportEnd,
  onViewportChange,
  className
}: MiniMapOverviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    drawMiniMap();
  }, [jobs, machines, viewportStart, viewportEnd, zoom]);

  const drawMiniMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Calculate time range
    const allDates = jobs.flatMap(job => [new Date(job.startDate), new Date(job.endDate)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const timeRange = maxDate.getTime() - minDate.getTime();

    // Draw machine lanes
    const laneHeight = height / machines.length;
    machines.forEach((machine, index) => {
      const y = index * laneHeight;
      ctx.fillStyle = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      ctx.fillRect(0, y, width, laneHeight);

      const machineJobs = jobs.filter(job => job.machineId === machine.id);
      machineJobs.forEach(job => {
        const startTime = new Date(job.startDate).getTime();
        const endTime = new Date(job.endDate).getTime();
        const x = ((startTime - minDate.getTime()) / timeRange) * width;
        const jobWidth = ((endTime - startTime) / timeRange) * width;

        switch (job.status) {
          case 'completed':
            ctx.fillStyle = '#22c55e';
            break;
          case 'in-progress':
            ctx.fillStyle = '#3b82f6';
            break;
          case 'delayed':
            ctx.fillStyle = '#ef4444';
            break;
          default:
            ctx.fillStyle = '#64748b';
        }
        ctx.fillRect(x, y + 2, Math.max(2, jobWidth), laneHeight - 4);
      });
    });

    // Draw viewport indicator
    const viewportStartTime = viewportStart.getTime();
    const viewportEndTime = viewportEnd.getTime();
    const viewportX = ((viewportStartTime - minDate.getTime()) / timeRange) * width;
    const viewportWidth = ((viewportEndTime - viewportStartTime) / timeRange) * width;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, 0, viewportWidth, height);
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.fillRect(viewportX, 0, viewportWidth, height);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickRatio = x / canvas.width;

    const allDates = jobs.flatMap(job => [new Date(job.startDate), new Date(job.endDate)]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const timeRange = maxDate.getTime() - minDate.getTime();

    const clickTime = minDate.getTime() + (clickRatio * timeRange);
    const currentViewportDuration = viewportEnd.getTime() - viewportStart.getTime();

    const newStart = new Date(clickTime - currentViewportDuration / 2);
    const newEnd = new Date(clickTime + currentViewportDuration / 2);

    onViewportChange(newStart, newEnd);
  };

  return (
    <Card className={cn("shrink-0", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Schedule Overview</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="h-6 w-6 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="h-6 w-6 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={280}
          height={120}
          onClick={handleCanvasClick}
          className="w-full h-full border border-border rounded cursor-pointer hover:border-primary transition-colors"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Click to navigate</span>
          <div className="flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
