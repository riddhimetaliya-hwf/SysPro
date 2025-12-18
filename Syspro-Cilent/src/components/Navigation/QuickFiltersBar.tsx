import React from 'react';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Filter, Users, Package, AlertTriangle, CheckCircle, Clock, Zap, RotateCcw } from 'lucide-react';
import { FilterOptions, Job, Machine } from '@/types/jobs';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  active: boolean;
  onClick: () => void;
}

interface QuickFiltersBarProps {
  jobs: Job[];
  machines: Machine[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export const QuickFiltersBar = ({ 
  jobs, 
  machines, 
  filters, 
  onFiltersChange, 
  className 
}: QuickFiltersBarProps) => {
  
  // Calculate counts for quick filters
  const getCounts = () => {
    return {
      pending: jobs.filter(job => job.status === 'Pending').length,
      inProgress: jobs.filter(job => job.status === 'In Progress').length,
      completed: jobs.filter(job => job.status === 'Completed').length,
      delayed: jobs.filter(job => job.status === 'Delayed').length,
      conflicts: jobs.filter(job => job.conflictType !== 'none').length,
      highPriority: jobs.filter(job => job.priority === 'high' || job.priority === 'critical').length,
    };
  };

  const counts = getCounts();

  const handleStatusFilter = (status: string) => {
    const newStatus = filters.status === status ? null : status;
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityFilter = () => {
    // Toggle high priority filter
    const isHighPriorityActive = filters.search?.includes('priority:high');
    const newSearch = isHighPriorityActive 
      ? filters.search?.replace('priority:high', '').trim() || ''
      : (filters.search || '') + ' priority:high';
    onFiltersChange({ ...filters, search: newSearch });
  };

  const handleConflictsFilter = () => {
    // Toggle conflicts filter
    const isConflictsActive = filters.search?.includes('conflicts:true');
    const newSearch = isConflictsActive
      ? filters.search?.replace('conflicts:true', '').trim() || ''
      : (filters.search || '') + ' conflicts:true';
    onFiltersChange({ ...filters, search: newSearch });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      machine: null,
      status: null,
      material: null,
      search: '',
      crewSkill: null,
      job: null,
      product: null
    });
  };

  const isHighPriorityActive = filters.search?.includes('priority:high') || false;
  const isConflictsActive = filters.search?.includes('conflicts:true') || false;

  const quickFilters: QuickFilter[] = [
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="w-3 h-3" />,
      count: counts.pending,
      active: filters.status === 'pending',
      onClick: () => handleStatusFilter('pending')
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      icon: <Zap className="w-3 h-3" />,
      count: counts.inProgress,
      active: filters.status === 'in-progress',
      onClick: () => handleStatusFilter('in-progress')
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle className="w-3 h-3" />,
      count: counts.completed,
      active: filters.status === 'completed',
      onClick: () => handleStatusFilter('completed')
    },
    {
      id: 'delayed',
      label: 'Delayed',
      icon: <AlertTriangle className="w-3 h-3" />,
      count: counts.delayed,
      active: filters.status === 'delayed',
      onClick: () => handleStatusFilter('delayed')
    },
    {
      id: 'high-priority',
      label: 'High Priority',
      icon: <AlertTriangle className="w-3 h-3" />,
      count: counts.highPriority,
      active: isHighPriorityActive,
      onClick: handlePriorityFilter
    },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: <AlertTriangle className="w-3 h-3" />,
      count: counts.conflicts,
      active: isConflictsActive,
      onClick: handleConflictsFilter
    }
  ];

  const hasActiveFilters = filters.machine || filters.status || filters.material || 
                          filters.search || filters.crewSkill || filters.product;

  return (
    <div className={`flex items-center gap-4 p-3 bg-background border-b border-border ${className || ''}`}>
      {/* Quick Status Filters */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Quick Filters:</span>
        </div>
        
        {quickFilters.map((filter) => (
          <Button
            key={filter.id}
            variant={filter.active ? 'default' : 'outline'}
            size="sm"
            onClick={filter.onClick}
            className="h-7 px-3 text-xs interactive-button"
          >
            <div className="flex items-center gap-1.5">
              {filter.icon}
              <span>{filter.label}</span>
              <Badge 
                variant={filter.active ? 'secondary' : 'outline'} 
                className="ml-1 h-4 min-w-4 text-xs px-1"
              >
                {filter.count}
              </Badge>
            </div>
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Machine Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Machine:</span>
        <Select value={filters.machine || ''} onValueChange={(value) => 
          onFiltersChange({ ...filters, machine: value || null })
        }>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="All Machines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Machines</SelectItem>
            {machines.map(machine => (
              <SelectItem key={machine.id} value={machine.id}>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {machine.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Material:</span>
        <Select value={filters.material || ''} onValueChange={(value) => 
          onFiltersChange({ ...filters, material: value || null })
        }>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="All Materials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Materials</SelectItem>
            <SelectItem value="steel">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                Steel
              </div>
            </SelectItem>
            <SelectItem value="aluminum">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                Aluminum
              </div>
            </SelectItem>
            <SelectItem value="plastic">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                Plastic
              </div>
            </SelectItem>
            <SelectItem value="electronics">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                Electronics
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-3 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </>
      )}

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <Badge variant="secondary" className="ml-auto">
          {Object.values(filters).filter(v => v !== null && v !== '').length} active
        </Badge>
      )}
    </div>
  );
};