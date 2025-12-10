
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { ScrollArea } from '@/components/UI/scroll-area';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { addDays, format, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarViewToggle } from './CalendarViewToggle';

interface ShiftCalendarViewProps {
  jobs: Job[];
  machines: Machine[];
  startDate: Date;
  onJobUpdate?: (job: Job) => void;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  capacity: number;
  team: string;
  fatigue: number; // 0-100%
}

interface ShiftBlock {
  shift: Shift;
  date: Date;
  assignedJobs: Job[];
  availableCapacity: number;
}

export const ShiftCalendarView = ({ jobs, machines, startDate, onJobUpdate }: ShiftCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const shifts: Shift[] = [
    {
      id: 'morning',
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00',
      capacity: 10,
      team: 'Team Alpha',
      fatigue: 25
    },
    {
      id: 'afternoon',
      name: 'Afternoon Shift',
      startTime: '14:00',
      endTime: '22:00',
      capacity: 10,
      team: 'Team Beta',
      fatigue: 45
    },
    {
      id: 'night',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      capacity: 8,
      team: 'Team Gamma',
      fatigue: 65
    }
  ];

  // Generate dates based on view
  const getDatesForView = () => {
    switch (calendarView) {
      case 'daily':
        return [selectedDate];
      case 'weekly':
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));
      case 'monthly':
        return eachDayOfInterval({
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        });
      default:
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));
    }
  };

  const viewDates = getDatesForView();

  const getShiftsForDate = (date: Date): ShiftBlock[] => {
    return shifts.map(shift => {
      const assignedJobs = jobs.filter(job => {
        const jobDate = new Date(job.startDate);
        return jobDate.toDateString() === date.toDateString();
      });

      return {
        shift,
        date,
        assignedJobs,
        availableCapacity: Math.max(0, shift.capacity - assignedJobs.length * 2.5) // Mock calculation
      };
    });
  };

  const getFatigueColor = (fatigue: number) => {
    if (fatigue >= 70) return 'text-red-500';
    if (fatigue >= 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const getCapacityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage <= 20) return 'bg-red-100 border-red-300';
    if (percentage <= 50) return 'bg-orange-100 border-orange-300';
    return 'bg-green-100 border-green-300';
  };

  const handleDragStart = (job: Job, e: React.DragEvent) => {
    setDraggedJob(job);
    e.dataTransfer.setData('application/json', JSON.stringify({ jobId: job.id }));
  };

  const handleDrop = (shiftBlock: ShiftBlock, e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedJob && shiftBlock.availableCapacity >= 2.5) {
      const updatedJob = {
        ...draggedJob,
        startDate: format(shiftBlock.date, 'yyyy-MM-dd'),
        shift: shiftBlock.shift.id
      };
      
      onJobUpdate?.(updatedJob);
      setDraggedJob(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shift Calendar View</h3>
        <div className="flex items-center gap-4">
          <CalendarViewToggle 
            currentView={calendarView} 
            onViewChange={setCalendarView} 
          />
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Team Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Fatigue Monitor</span>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${
        calendarView === 'daily' ? 'grid-cols-1' :
        calendarView === 'weekly' ? 'grid-cols-7' :
        'grid-cols-7' // Monthly view uses 7 columns for calendar layout
      }`}>
        {viewDates.map(date => (
          <div key={date.toISOString()} className="space-y-2">
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="font-medium text-sm">{format(date, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">{format(date, 'MMM d')}</div>
            </div>

            <div className="space-y-2">
              {getShiftsForDate(date).map(shiftBlock => (
                <Card
                  key={`${date.toISOString()}-${shiftBlock.shift.id}`}
                  className={`${getCapacityColor(shiftBlock.availableCapacity, shiftBlock.shift.capacity)} transition-colors hover:shadow-md`}
                  onDrop={(e) => handleDrop(shiftBlock, e)}
                  onDragOver={handleDragOver}
                >
                  <CardHeader className="p-2">
                    <CardTitle className="text-xs font-medium flex items-center justify-between">
                      <span>{shiftBlock.shift.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(shiftBlock.availableCapacity)}/{shiftBlock.shift.capacity}
                      </Badge>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {shiftBlock.shift.startTime} - {shiftBlock.shift.endTime}
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 pt-0">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{shiftBlock.shift.team}</span>
                        <span className={`font-medium ${getFatigueColor(shiftBlock.shift.fatigue)}`}>
                          {shiftBlock.shift.fatigue}% fatigue
                        </span>
                      </div>
                      
                      {shiftBlock.assignedJobs.length > 0 && (
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {shiftBlock.assignedJobs.slice(0, 3).map(job => (
                              <div
                                key={job.id}
                                className="text-xs p-1 bg-background rounded border cursor-move"
                                draggable
                                onDragStart={(e) => handleDragStart(job, e)}
                              >
                                <div className="font-medium truncate">{job.name}</div>
                                <div className="text-muted-foreground">{job.id}</div>
                              </div>
                            ))}
                            {shiftBlock.assignedJobs.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{shiftBlock.assignedJobs.length - 3} more
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                      
                      {shiftBlock.availableCapacity <= 2 && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Near capacity</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>High Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Medium Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Low Capacity</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">●</span>
                <span>Low Fatigue (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">●</span>
                <span>Medium Fatigue (50-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">●</span>
                <span>High Fatigue (&gt;70%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
