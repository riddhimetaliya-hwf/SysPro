
import React, { useState, useEffect } from 'react';
import { Job, Machine } from '@/types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Grid3X3 } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface TouchOptimizedGanttProps {
  jobs: Job[];
  machines: Machine[];
  startDate: Date;
  onJobSelect?: (job: Job) => void;
}

export const TouchOptimizedGantt = ({ jobs, machines, startDate, onJobSelect }: TouchOptimizedGanttProps) => {
  const [currentDate, setCurrentDate] = useState(startDate);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Touch handlers for swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next day/week
      setCurrentDate(prev => addDays(prev, viewMode === 'day' ? 1 : 7));
    }
    if (isRightSwipe) {
      // Swipe right - go to previous day/week
      setCurrentDate(prev => addDays(prev, viewMode === 'day' ? -1 : -7));
    }
  };

  const handleJobTap = (job: Job) => {
    setSelectedJob(job);
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => isSameDay(new Date(job.startDate), date));
  };

  const getDaysToShow = () => {
    if (viewMode === 'day') return [currentDate];
    return Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));
  };

  return (
    <div 
      className="touch-optimized-gantt h-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(prev => addDays(prev, viewMode === 'day' ? -1 : -7))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <div className="font-semibold">
              {format(currentDate, viewMode === 'day' ? 'EEEE' : 'MMM yyyy')}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(currentDate, viewMode === 'day' ? 'MMM d, yyyy' : `Week of ${format(currentDate, 'MMM d')}`)}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(prev => addDays(prev, viewMode === 'day' ? 1 : 7))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {getDaysToShow().map(date => {
          const dayJobs = getJobsForDate(date);
          
          return (
            <Card key={date.toISOString()} className="touch-friendly">
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{format(date, 'EEE, MMM d')}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayJobs.length} jobs
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {dayJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No jobs scheduled</p>
                  </div>
                ) : (
                  dayJobs.map(job => (
                    <div
                      key={job.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all touch-manipulation ${
                        selectedJob?.id === job.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => handleJobTap(job)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{job.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          job.conflictType === 'none' ? 'bg-green-100 text-green-800' :
                          job.conflictType === 'capacity' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {machines.find(m => m.id === job.machineId)?.name} • {job.id}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Swipe indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        ← Swipe to navigate →
      </div>
    </div>
  );
};
