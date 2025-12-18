
import React from 'react';
import { Job, Machine } from '@/types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

interface MiniMapNavigatorProps {
  jobs: Job[];
  machines: Machine[];
  startDate: Date;
  days: number;
  viewportStart: number;
  viewportEnd: number;
  onViewportChange: (start: number, end: number) => void;
}

export const MiniMapNavigator = ({ 
  jobs, 
  machines, 
  startDate, 
  days, 
  viewportStart, 
  viewportEnd, 
  onViewportChange 
}: MiniMapNavigatorProps) => {
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newStart = Math.max(0, percentage * days - (viewportEnd - viewportStart) / 2);
    const newEnd = Math.min(days, newStart + (viewportEnd - viewportStart));
    onViewportChange(newStart, newEnd);
  };

  return (
    <Card className="w-full h-32 bg-muted/20">
      <CardHeader className="p-2">
        <CardTitle className="text-xs">Schedule Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-2 h-20 relative">
        <div 
          className="w-full h-full bg-muted rounded cursor-pointer relative overflow-hidden"
          onClick={handleDrag}
        >
          {/* Mini job representations */}
          {jobs.slice(0, 20).map((job, index) => (
            <div
              key={job.id}
              className="absolute h-1 bg-primary/60 rounded"
              style={{
                left: `${(index * 2) % 90}%`,
                top: `${10 + (index % 4) * 15}px`,
                width: '8%'
              }}
            />
          ))}
          
          {/* Viewport indicator */}
          <div
            className="absolute top-0 bottom-0 bg-primary/20 border-2 border-primary rounded"
            style={{
              left: `${(viewportStart / days) * 100}%`,
              width: `${((viewportEnd - viewportStart) / days) * 100}%`
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
