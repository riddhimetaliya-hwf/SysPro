
import React, { useState } from 'react';
import { Job, Machine } from '@/types/jobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronDown, 
  AlertTriangle, 
  Clock, 
  User, 
  Settings,
  Filter,
  Activity,
  Calendar,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface RightSidePanelProps {
  jobs: Job[];
  machines: Machine[];
  isCollapsed: boolean;
  onToggle: () => void;
  onFilterChange?: (filters: any) => void;
}

export const RightSidePanel = ({ 
  jobs, 
  machines, 
  isCollapsed, 
  onToggle,
  onFilterChange 
}: RightSidePanelProps) => {
  const [activeTab, setActiveTab] = useState<'conflicts' | 'filters' | 'timeline' | 'activity'>('conflicts');
  const [selectedFilters, setSelectedFilters] = useState({
    status: [] as string[],
    machine: [] as string[],
    jobType: [] as string[]
  });

  const conflictJobs = jobs.filter(job => job.conflictType !== 'none');
  const recentActivity = [
    { id: '1', type: 'job-moved', description: 'Job WO-2024-001 moved to Machine A', time: new Date(), user: 'John Doe' },
    { id: '2', type: 'conflict-resolved', description: 'Material conflict resolved for WO-2024-003', time: new Date(Date.now() - 5 * 60 * 1000), user: 'Jane Smith' },
    { id: '3', type: 'schedule-updated', description: 'Production schedule updated for next week', time: new Date(Date.now() - 15 * 60 * 1000), user: 'Mike Johnson' },
    { id: '4', type: 'machine-maintenance', description: 'Machine B scheduled for maintenance', time: new Date(Date.now() - 30 * 60 * 1000), user: 'System' }
  ];

  const tabs = [
    { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle, count: conflictJobs.length },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Activity, count: recentActivity.length }
  ];

  const handleFilterToggle = (category: keyof typeof selectedFilters, value: string) => {
    const newFilters = {
      ...selectedFilters,
      [category]: selectedFilters[category].includes(value)
        ? selectedFilters[category].filter(item => item !== value)
        : [...selectedFilters[category], value]
    };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="glass-panel shadow-medium hover:shadow-strong transition-all duration-300"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full bg-background/95 backdrop-blur-md border-l border-border shadow-strong z-30 animate-slide-in-right">
      <div className="w-80 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Control Panel</h2>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.count !== undefined && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {activeTab === 'conflicts' && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Active Conflicts ({conflictJobs.length})
              </h3>
              {conflictJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conflicts detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conflictJobs.map(job => (
                    <div key={job.id} className="glass-panel rounded-lg p-3 border border-red-200 bg-red-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{job.name}</h4>
                          <p className="text-xs text-muted-foreground">{job.id}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {job.conflictType}
                        </Badge>
                      </div>
                      <div className="text-xs text-red-700">
                        {job.conflictDetails?.reason || `${job.conflictType} conflict detected`}
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 text-xs h-7">
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="space-y-6">
              {/* Status Filters */}
              <div>
                <h3 className="font-medium text-sm mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in-progress', 'completed', 'delayed'].map(status => (
                    <Badge
                      key={status}
                      variant={selectedFilters.status.includes(status) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleFilterToggle('status', status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Machine Filters */}
              <div>
                <h3 className="font-medium text-sm mb-3">Machines</h3>
                <div className="flex flex-wrap gap-2">
                  {machines.map(machine => (
                    <Badge
                      key={machine.id}
                      variant={selectedFilters.machine.includes(machine.id) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleFilterToggle('machine', machine.id)}
                    >
                      {machine.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Job Type Filters */}
              <div>
                <h3 className="font-medium text-sm mb-3">Job Type</h3>
                <div className="flex flex-wrap gap-2">
                  {['manufacturing', 'assembly', 'packaging', 'quality-check'].map(type => (
                    <Badge
                      key={type}
                      variant={selectedFilters.jobType.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleFilterToggle('jobType', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedFilters({ status: [], machine: [], jobType: [] })}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Quick Navigation
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Today
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  This Week
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Next Week
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  This Month
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="glass-panel rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{format(activity.time, 'HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
