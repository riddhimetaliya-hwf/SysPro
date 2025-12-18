import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { toast } from 'sonner';
import { Calendar } from '@/components/UI/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/UI/card';

export const ProjectSettings = () => {
  const [projectName, setProjectName] = useState('Production Scheduler');
  const [description, setDescription] = useState('Production scheduling and resource management application');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [timezone, setTimezone] = useState('UTC');
  const [status, setStatus] = useState('Active');

  const handleSave = () => {
    toast.success('Project settings updated successfully');
    console.log({ projectName, description, startDate, endDate, timezone, status });
  };

  const timezones = [
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { label: 'EST (Eastern Standard Time)', value: 'America/New_York' },
    { label: 'CST (Central Standard Time)', value: 'America/Chicago' },
    { label: 'MST (Mountain Standard Time)', value: 'America/Denver' },
    { label: 'PST (Pacific Standard Time)', value: 'America/Los_Angeles' },
    { label: 'BST (British Summer Time)', value: 'Europe/London' },
    { label: 'CET (Central European Time)', value: 'Europe/Paris' },
    { label: 'JST (Japan Standard Time)', value: 'Asia/Tokyo' }
  ];

  const allStatuses = ['Active', 'Completed', 'In Progress', 'On Hold'];

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Project Settings</CardTitle>
          <CardDescription className="text-sm">
            Configure your project settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName" className="mb-1 block">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="mb-1 block">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal hover:bg-background",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <span>{startDate ? format(startDate, "PPP") : <span>Select date</span>}</span>
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal hover:bg-background",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <span>{endDate ? format(endDate, "PPP") : <span>Select date</span>}</span>
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone" className="mb-1 block">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status" className="mb-1 block">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-6">
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-medium">Project Summary</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Project Name: <span className="text-foreground">{projectName}</span></p>
                      <p>Status: <span className="text-foreground">{status}</span></p>
                      <p>Timezone: <span className="text-foreground">{timezones.find(tz => tz.value === timezone)?.label || timezone}</span></p>
                      <p>Duration: <span className="text-foreground">
                        {startDate && endDate 
                          ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                          : 'Not set'}
                      </span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={handleSave}
                className="px-8"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSettings;
