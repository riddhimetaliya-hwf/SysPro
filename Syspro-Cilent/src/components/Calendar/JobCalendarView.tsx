import React, { useState, useEffect, useMemo } from 'react';
import { Job, Machine, FilterOptions } from '@/types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GanttChart } from '@/components/Scheduler/GanttChart';
import { apiService } from '@/services/api';

type ViewMode = 'day' | 'week' | 'month' | 'gantt';

interface JobCalendarViewProps {
  jobs: Job[];
  machines: Machine[];
  filters?: FilterOptions;
  onJobUpdate?: (job: Job) => void;
}

const JobCalendarView: React.FC<JobCalendarViewProps> = ({ jobs: initialJobs = [], machines: initialMachines = [], filters = {}, onJobUpdate }) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ganttDays, setGanttDays] = useState<number>(7); // Default to 1 week view

  // Fetch job dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching job dashboard data...');
        const data = await apiService.fetchJobDashboard();
        console.log('Raw API response:', data);
        setDashboardData(data);
        
        // Get current date for fallback dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Convert dashboard data to jobs format
        const convertedJobs: Job[] = data.map((item: any) => {
          // Parse dates as LOCAL dates to prevent UTC shift
          const startDate = item.jobStartDate 
            ? new Date(item.jobStartDate + 'T00:00:00')
            : new Date(today);
          
          const endDate = item.jobEndDate 
            ? new Date(item.jobEndDate + 'T23:59:59')
            : new Date(tomorrow);
            
          // Ensure dates are valid
          if (isNaN(startDate.getTime())) startDate.setTime(today.getTime());
          if (isNaN(endDate.getTime())) endDate.setTime(tomorrow.getTime());
          
          // Ensure end date is after start date
          if (endDate <= startDate) {
            endDate.setDate(startDate.getDate() + 1);
          }
          
          // Map status to match the Job interface
          const mapStatus = (status: string | null): 'Pending' | 'Completed' | 'OnHold' | 'In Progress' | 'Active' => {
            if (!status) return 'Pending';
            const statusLower = status.toLowerCase();
            if (statusLower.includes('active')) return 'Active';
            if (statusLower.includes('complete')) return 'Completed';
            if (statusLower.includes('progress')) return 'In Progress';
            if (['hold', 'on hold', 'paused'].includes(statusLower)) return 'OnHold';
            return 'Pending';
          };
          
          return {
            id: item.job || `job-${Math.random().toString(36).substr(2, 9)}`,
            name: item.jobDescription || 'Unnamed Job',
            description: item.jobDescription || '',
            machineId: item.machine || 'unassigned',
            startDate,
            endDate,
            conflictType: 'none' as const,
            hasDependency: false,
            status: mapStatus(item.jobStatus),
            progress: 0,
            priority: (['low', 'medium', 'high', 'critical'].includes(item.jobPriority?.toLowerCase()) 
              ? item.jobPriority.toLowerCase() 
              : 'medium') as 'low' | 'medium' | 'high' | 'critical',
            materials: [],
            conflictDetails: undefined,
            dependencies: [],
            product: undefined
          };
        });
        
        console.log('Converted jobs:', convertedJobs);
        setJobs(convertedJobs);
        
      } catch (err) {
        console.error('Failed to fetch job dashboard data:', err);
        setError('Failed to load job dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters?.machine && job.machineId !== filters.machine) return false;
      if (filters?.status && job.status !== filters.status) return false;
      if (filters?.search && !job.name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [jobs, filters]);

  // Get the date range for the current view
  const { startDate, endDate } = useMemo(() => {
    let start: Date, end: Date;
    
    // Create dates in local timezone
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    switch (viewMode) {
      case 'day':
        start = new Date(selected);
        end = new Date(selected);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = startOfWeek(selected, { weekStartsOn: 1 });
        end = endOfWeek(selected, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(selected);
        end = endOfMonth(selected);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date();
        end = new Date();
        end.setDate(end.getDate() + 1);
    }
    
    console.log(`Date range for ${viewMode} view:`, { start, end });
    return { startDate: start, endDate: end };
  }, [selectedDate, viewMode]);

  // Get jobs for the current view period
  const getJobsForPeriod = useMemo(() => {
    console.log('Filtering jobs for period:', { startDate, endDate });
    return filteredJobs.filter(job => {
      const jobStart = job.startDate ? new Date(job.startDate) : null;
      const jobEnd = job.endDate ? new Date(job.endDate) : null;
      
      if (!jobStart || !jobEnd) return false;
      
      const isInRange = (jobStart <= endDate && jobEnd >= startDate);
      console.log(`Job ${job.id} (${jobStart} - ${jobEnd}):`, isInRange ? 'IN RANGE' : 'OUT OF RANGE');
      
      return isInRange;
    });
  }, [filteredJobs, startDate, endDate]);

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
      default:
        return [];
    }
  }, [selectedDate, viewMode]);

  // Get jobs for a specific day
  const getJobsForDay = (day: Date) => {
    return getJobsForPeriod.filter(job => {
      const jobStart = job.startDate ? new Date(job.startDate) : null;
      
      if (!jobStart) return false;
      
      return isSameDay(jobStart, day);
    });
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
      default:
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
      default:
        return '';
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset to current date when switching modes
    setSelectedDate(new Date());
  };

  const renderView = () => {
    switch (viewMode) {
      case 'gantt':
        return (
          <div className="mt-4">
              <GanttChart 
              startDate={startDate}
              days={ganttDays}
              onJobUpdate={onJobUpdate}
            />
            <div className="flex justify-end mt-2">
              <Select 
                value={ganttDays.toString()} 
                onValueChange={(value) => setGanttDays(Number(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="14">2 Weeks</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'day':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
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
                        <Badge className={getStatusColor(job.status)}>
                          {job.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format((job.startDate as Date), 'HH:mm')} - {format((job.endDate as Date), 'HH:mm')}
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
        );
      case 'week':
        return (
          <div className="grid grid-cols-7 gap-2">
            {getDaysInView.map(day => {
              const dayJobs = getJobsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={day.toISOString()} className={cn("min-h-32", isToday && "ring-2 ring-primary")}>
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
                  <CardContent className="space-y-1 pt-0">
                    {dayJobs.slice(0, 3).map(job => (
                      <div
                        key={job.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate cursor-pointer",
                          getStatusColor(job.status)
                        )}
                        onClick={() => onJobUpdate?.(job)}
                        title={job.name}
                      >
                        {job.name}
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayJobs.length - 3} more
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      case 'month':
        return (
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
                    "min-h-16 p-1 border rounded hover:bg-accent/50 cursor-pointer",
                    isToday && "bg-primary/10 border-primary"
                  )}
                >
                  <div className={cn("text-sm font-medium mb-1", isToday && "text-primary")}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayJobs.slice(0, 2).map(job => (
                      <div
                        key={job.id}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(job.status)
                        )}
                        title={job.name}
                      />
                    ))}
                    {dayJobs.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayJobs.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      default:
        return <div />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
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
            <PopoverContent className="w-auto p-0" align="end">
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
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Select value={viewMode} onValueChange={(value: ViewMode) => handleViewModeChange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="gantt">Gantt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-4">
        {renderView()}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
};

export default JobCalendarView;