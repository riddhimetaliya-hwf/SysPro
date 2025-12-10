import React, { useState } from 'react';
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns';
import { Button } from '@/components/UI/button';
import { Calendar } from '@/components/UI/calendar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/UI/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/UI/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/UI/popover';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Filter, Save, ChevronDown, HelpCircle, Menu } from 'lucide-react';
import { Badge } from '@/components/UI/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/UI/sidebar';
// import { HelpButton } from '@/components/Help/HelpSystem';

export const Header = () => {
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const today = startOfDay(new Date());
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  
  const navigatePrevious = () => {
    if (viewType === 'day') {
      setStartDate(prev => subDays(prev, 1));
    } else if (viewType === 'week') {
      setStartDate(prev => subDays(prev, 7));
    } else {
      setStartDate(prev => subDays(prev, 30));
    }
    toast.success(`Navigated to previous ${viewType}`);
  };

  const navigateNext = () => {
    if (viewType === 'day') {
      setStartDate(prev => addDays(prev, 1));
    } else if (viewType === 'week') {
      setStartDate(prev => addDays(prev, 7));
    } else {
      setStartDate(prev => addDays(prev, 30));
    }
    toast.success(`Navigated to next ${viewType}`);
  };

  const goToToday = () => {
    setStartDate(startOfDay(new Date()));
    toast.success("Navigated to today");
  };

  const changeViewType = (type: 'day' | 'week' | 'month') => {
    setViewType(type);
    toast.success(`View changed to ${type} view`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(startOfDay(date));
      setIsDatePickerOpen(false);
      toast.success(`Date changed to ${format(date, 'MMMM d, yyyy')}`);
    }
  };

  const saveChanges = () => {
    toast.success("Changes saved successfully", {
      description: "Your schedule has been updated",
      action: {
        label: "Undo",
        onClick: () => toast.info("Changes reverted")
      }
    });
  };

  let dateRangeText = '';
  if (viewType === 'day') {
    dateRangeText = format(startDate, 'MMMM d, yyyy');
  } else if (viewType === 'week') {
    const endDate = addDays(startDate, 6);
    dateRangeText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  } else {
    const endDate = addDays(startDate, 29);
    dateRangeText = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }

  const isToday = isSameDay(startDate, today);

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden focus-outline"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold hidden md:block">Visual Job Scheduler</h1>
          <h1 className="text-base font-semibold md:hidden">Scheduler</h1>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              disabled={isToday}
              className="focus-outline hidden sm:flex"
              aria-label="Go to today"
            >
              Today
              {isToday && <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>}
            </Button>
            
            {/* Mobile Today Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              disabled={isToday}
              className="focus-outline sm:hidden"
              aria-label="Go to today"
            >
              {isToday ? 'Today' : 'Today'}
            </Button>
            
            <div className="flex shadow-sm rounded-md border overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none border-r focus-outline"
                onClick={navigatePrevious}
                aria-label={`Previous ${viewType}`}
              >
                <ArrowLeft size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none focus-outline"
                onClick={navigateNext}
                aria-label={`Next ${viewType}`}
              >
                <ArrowRight size={16} />
              </Button>
            </div>
            
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 focus-outline"
                  aria-label="Select date"
                  aria-haspopup="true"
                  aria-expanded={isDatePickerOpen}
                >
                  <CalendarIcon size={16} />
                  <span className="hidden sm:inline">{dateRangeText}</span>
                  <span className="sm:hidden text-xs">{format(startDate, 'MMM d')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleDateSelect}
                  className="p-3 pointer-events-auto"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="focus-outline">
                <span className="flex items-center gap-2">
                  <span className="hidden sm:inline">View: {viewType}</span>
                  <span className="sm:hidden">{viewType}</span>
                  <ChevronDown size={14} />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => changeViewType('day')}
                className={viewType === 'day' ? 'bg-secondary' : ''}
              >
                Day View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeViewType('week')}
                className={viewType === 'week' ? 'bg-secondary' : ''}
              >
                Week View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeViewType('month')}
                className={viewType === 'month' ? 'bg-secondary' : ''}
              >
                Month View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFilterDialogOpen(true)}
            className="focus-outline hidden sm:flex"
            aria-label="Filter jobs"
          >
            <Filter size={14} className="mr-2" />
            Filter
          </Button>

          {/* Mobile Filter Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFilterDialogOpen(true)}
            className="focus-outline sm:hidden"
            aria-label="Filter jobs"
          >
            <Filter size={16} />
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={saveChanges}
            className="focus-outline hidden sm:flex"
            aria-label="Save changes"
          >
            <Save size={14} className="mr-2" />
            Save
          </Button>

          {/* Mobile Save Button */}
          <Button 
            variant="default" 
            size="icon"
            onClick={saveChanges}
            className="focus-outline sm:hidden"
            aria-label="Save changes"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>
      
      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Jobs</DialogTitle>
            <DialogDescription>
              Refine job views by status, machine, material, and other attributes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
                <select id="status-filter" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">All statuses</option>
                  <option value="no-conflict">No Conflicts</option>
                  <option value="capacity">Capacity Conflict</option>
                  <option value="material">Material Conflict</option>
                  <option value="resource">Resource Conflict</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="priority-filter" className="text-sm font-medium">Priority</label>
                <select id="priority-filter" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsFilterDialogOpen(false);
              toast.success("Filters applied");
            }}>Apply Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
