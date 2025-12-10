import React, { useState, useMemo, useEffect } from 'react';
import { Job, Machine, FilterOptions } from '@/types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import { ScrollArea } from '@/components/UI/scroll-area';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Package, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { ConflictIndicator } from '@/components/Scheduler/ConflictIndicator';

type ViewMode = 'day' | 'week' | 'month';

interface UnifiedCalendarViewProps {
  jobs: Job[];
  machines: Machine[];
  filters?: FilterOptions;
  onJobUpdate?: (job: Job) => void;
}

interface DayDetailsModalProps {
  selectedDay: Date;
  jobs: Job[];
  machines: Machine[];
  shifts: any[];
  onJobUpdate?: (job: Job) => void;
  onClose: () => void;
}

const DayDetailsModal = ({ selectedDay, jobs, machines, shifts, onJobUpdate, onClose }: DayDetailsModalProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      case 'onhold': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-2xl">
          {format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Jobs Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5" />
              Scheduled Jobs
            </h4>
            <Badge variant="secondary" className="text-sm">
              {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
            </Badge>
          </div>
          
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No jobs scheduled for this day</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {jobs.map((job) => {
                  const machine = Array.isArray(machines) ? machines.find(m => m.id === job.machineId) : undefined;
                  return (
                    <div
                      key={job.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onJobUpdate?.(job)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{job.name}</h4>
                        <Badge className={getStatusColor(job.status || 'pending')}>
                          {job.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format((job.startDate), 'h:mm a')} - {format((job.endDate), 'h:mm a')}
                        </div>
                        {machine && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {machine.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

const defaultFilterOptions: FilterOptions = {
  machine: null,
  status: null,
  material: null,
  search: '',
  crewSkill: null,
  job: null,
  product: null
};

const UnifiedCalendarView = ({ 
  jobs: initialJobs = [], 
  machines: initialMachines = [], 
  filters = defaultFilterOptions, 
  onJobUpdate 
}: UnifiedCalendarViewProps) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayJobs, setSelectedDayJobs] = useState<Job[]>([]);
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch job dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
     const data = await apiService.fetchJobDashboard();
      
const convertedJobs: Job[] = data.map((item: any) => {
  const startDate = item.jobStartDate
    ? new Date(item.jobStartDate + 'T00:00:00')
    : new Date();
  const endDate = item.jobEndDate
    ? new Date(item.jobEndDate + 'T23:59:59')
    : new Date();

  if (endDate <= startDate) {
    endDate.setTime(startDate.getTime() + 3600000); // +1hr
  }

  return {
    id: item.job || `job-${Math.random().toString(36).substr(2, 9)}`,
    name: item.jobDescription || 'Unnamed Job',
    description: item.jobDescription || '',
    machineId: item.machine && item.machine !== 'N/A' ? item.machine : 'unassigned',
    startDate,
    endDate,
    conflictType: 'none',
    hasDependency: false,
    status: (item.jobStatus || 'pending').toLowerCase(), 
    progress: 0,
    priority: 'medium',
    materials: [],
    conflictDetails: undefined,
    dependencies: [],
    product: undefined,
  };
});


      console.log('Converted jobs:', convertedJobs);
      setJobs(convertedJobs);
      setDashboardData(data);
      
    } catch (err) {
      console.error('Failed to fetch job dashboard data:', err);
      setError('Failed to load job dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter jobs based on current filters
   const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.machine && job.machineId !== filters.machine) return false;
      if (filters.status && job.status !== filters.status) return false;
      if (filters.search && !job.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.job && job.id !== filters.job) return false;
      if (filters.product && job.product?.id !== filters.product) return false;
      return true;
    });
  }, [jobs, filters]);

   // ✅ Jobs for the current view
  const getJobsForPeriod = useMemo(() => {
    let start: Date, end: Date;
    switch (viewMode) {
      case 'day':
        start = new Date(selectedDate.setHours(0, 0, 0, 0));
        end = new Date(selectedDate.setHours(23, 59, 59, 999));
        break;
      case 'week':
        start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
    }
    
    return filteredJobs.filter(job => {
      const jobStart = job.startDate ? new Date(job.startDate) : null;
      const jobEnd = job.endDate ? new Date(job.endDate) : null;
      
      if (!jobStart || !jobEnd) return false;
      
      return isWithinInterval(jobStart, { start, end }) || 
             isWithinInterval(jobEnd, { start, end }) ||
             (jobStart <= start && jobEnd >= end);
    }).sort((a, b) => (a.startDate).getTime() - (b.startDate).getTime());
  }, [filteredJobs, selectedDate, viewMode]);

  // Get days for the current view
  const getDaysInView = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return [selectedDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        });
    }
  }, [selectedDate, viewMode]);

  const getJobsForDay = (day: Date): Job[] => {
    return filteredJobs.filter(job => {
      const startDate = new Date(job.startDate);
      return isSameDay(startDate, day);
    });
  };

  const handleDayClick = (day: Date, dayJobs: Job[]) => {
    setSelectedDay(day);
    setSelectedDayJobs(dayJobs);
    setIsDayDetailsOpen(true);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  const formatPeriodTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  // Mock shift data - replace with actual shift data from your API
  const shifts = [
    { id: '1', name: 'Morning Shift', startTime: '08:00', endTime: '16:00', total: 10, available: 8 },
    { id: '2', name: 'Afternoon Shift', startTime: '16:00', endTime: '00:00', total: 8, available: 6 },
    { id: '3', name: 'Night Shift', startTime: '00:00', endTime: '08:00', total: 5, available: 4 },
  ];

  return (
    <div className="space-y-4">
      {/* Loading and error states */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{formatPeriodTitle()}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
       <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm">
      <CalendarIcon className="w-4 h-4 mr-2" />
      Jump to Date
    </Button>
  </PopoverTrigger>
  <PopoverContent 
    className="w-auto p-0" 
    align="end"
    onInteractOutside={(e) => {
      setShowDatePicker(false);
    }}
  >
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        if (date) {
          setSelectedDate(date);
          setShowDatePicker(false);
        }
      }}
      initialFocus
    />
  </PopoverContent>
</Popover>

          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-4">
        {viewMode === 'day' ? (
          // Day View - Detailed timeline with shift info
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Jobs for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    <Badge variant="secondary">{getJobsForDay(selectedDate).length} jobs</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getJobsForDay(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No jobs scheduled for this day</p>
                    </div>
                  ) : (
                    getJobsForDay(selectedDate).map(job => {
                      const machine = Array.isArray(machines) ? machines.find(m => m.id === job.machineId) : undefined;
                      return (
                        <div
                          key={job.id}
                          className={cn(
                            "p-4 rounded-lg border-l-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                            getPriorityColor(job.priority)
                          )}
                          onClick={() => onJobUpdate?.(job)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{job.name}</h4>
                            <Badge className={getStatusColor(job.status || 'pending')}>
                              {job.status || 'pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format((job.startDate), 'HH:mm')} - {format((job.endDate), 'HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {machine?.name || job.machineId}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {job.materials?.length ? `${job.materials.length} materials` : 'No materials'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Shift Information Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Shift Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shifts.map((shift, idx) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{shift.name}</div>
                        <Badge variant={shift.available > 0 ? 'default' : 'destructive'}>
                          {shift.available}/{shift.total}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(shift.available / shift.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : viewMode === 'week' ? (
          // Week View - Enhanced grid layout with shift indicators
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-7 gap-2 min-w-[800px]">
            {getDaysInView.map(day => {
              const dayJobs = getJobsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card 
                  key={day.toISOString()} 
                  className={cn(
                    "min-h-40 cursor-pointer hover:shadow-md transition-all", 
                    isToday && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    const dayJobs = getJobsForDay(day);
                    handleDayClick(day, dayJobs);
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className={cn("font-medium", isToday && "text-primary")}>
                          {format(day, 'EEE')}
                        </span>
                        <span className={cn("text-lg", isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm")}>
                          {format(day, 'd')}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {/* Shift availability indicator */}
                    <div className="flex gap-1 mb-2">
                      {shifts.map((shift, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            shift.available > 7 ? "bg-green-500" : 
                            shift.available > 4 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          title={`${shift.name}: ${shift.available}/${shift.total}`}
                        />
                      ))}
                    </div>
                    
                    {/* Jobs */}
                    {dayJobs.slice(0, 3).map(job => (
                      <div
                        key={job.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate relative group",
                          getStatusColor(job.status || 'pending')
                        )}
                        title={job.name}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{job.name}</span>
                          <div className="ml-2">
                            <ConflictIndicator jobId={job.id} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-xs text-center text-primary font-medium">
                        +{dayJobs.length - 3} more jobs
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        ) : (
          // Month View - Compact grid with shift and job indicators
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground border-b">
                {day}
              </div>
            ))}
            {getDaysInView.map(day => {
              const dayJobs = getJobsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-20 p-1 border rounded hover:bg-accent/50 cursor-pointer",
                    isToday && "bg-primary/10 border-primary"
                  )}
                  onClick={() => {
                    const dayJobs = getJobsForDay(day);
                    handleDayClick(day, dayJobs);
                  }}
                >
                  <div 
                    className="text-center cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const dayJobs = getJobsForDay(day);
                      handleDayClick(day, dayJobs);
                    }}
                  >
                    <h3 className="text-lg font-semibold">{format(day, 'EEEE, MMMM d, yyyy')}</h3>
                    <div className="flex justify-center gap-4 mt-2">
                      <Badge variant="secondary">{dayJobs.length} Jobs</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {/* Shift indicators */}
                    <div className="flex gap-0.5">
                      {shifts.map((shift, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            shift.available > 7 ? "bg-green-500" : 
                            shift.available > 4 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          title={`${shift.name}: ${shift.available}/${shift.total}`}
                        />
                      ))}
                    </div>
                    {/* Job indicators */}
                    <div className="flex flex-wrap gap-0.5">
                      {dayJobs.slice(0, 4).map(job => (
                        <div
                          key={job.id}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            getStatusColor(job.status || 'pending')
                          )}
                          title={job.name}
                        />
                      ))}
                    </div>
                     {dayJobs.length > 4 && (
                       <div className="text-xs text-muted-foreground">
                         +{dayJobs.length - 4}
                       </div>
                     )}
                   </div>
                 </div>
                );
              })}
            </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{getJobsForPeriod.length}</div>
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {getJobsForPeriod.filter(j => j.status === 'Completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {getJobsForPeriod.filter(j => j.status === 'In Progress').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {getJobsForPeriod.filter(j => j.status === 'OnHold').length}
            </div>
            <div className="text-sm text-muted-foreground">Delayed</div>
          </CardContent>
        </Card>
      </div> */}

      {/* Day Details Modal */}
      <Dialog open={isDayDetailsOpen} onOpenChange={setIsDayDetailsOpen}>
        {selectedDay && (
          <DayDetailsModal 
            selectedDay={selectedDay}
            jobs={selectedDayJobs}
            machines={machines}
            shifts={shifts}
            onJobUpdate={onJobUpdate}
            onClose={() => setIsDayDetailsOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export { UnifiedCalendarView };