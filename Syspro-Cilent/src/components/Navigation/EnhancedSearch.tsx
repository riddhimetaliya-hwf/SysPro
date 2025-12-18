import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar, Users, Package, Settings, Clock, AlertTriangle, CheckCircle, Zap, X } from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  type: 'job' | 'machine' | 'material' | 'status' | 'action';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category?: string;
  value: string;
}

interface EnhancedSearchProps {
  jobs: Job[];
  machines: Machine[];
  onSearch: (query: string) => void;
  onJobSelect?: (job: Job) => void;
  onMachineSelect?: (machine: Machine) => void;
  placeholder?: string;
  className?: string;
}

export const EnhancedSearch = ({ 
  jobs, 
  machines, 
  onSearch, 
  onJobSelect,
  onMachineSelect,
  placeholder = "Search jobs, machines, or materials...",
  className 
}: EnhancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'delayed jobs',
    'Machine A',
    'high priority',
    'steel materials'
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate search suggestions based on current data
  const generateSuggestions = (searchQuery: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // If no query, show recent searches and quick actions
    if (!searchQuery.trim()) {
      // Quick Actions
      suggestions.push(
        {
          id: 'action-delayed',
          type: 'action',
          title: 'Show delayed jobs',
          icon: <AlertTriangle className="w-4 h-4 text-critical" />,
          category: 'Quick Actions',
          value: 'status:delayed'
        },
        {
          id: 'action-progress',
          type: 'action',
          title: 'Show jobs in progress',
          icon: <Zap className="w-4 h-4 text-info" />,
          category: 'Quick Actions',
          value: 'status:in-progress'
        },
        {
          id: 'action-completed',
          type: 'action',
          title: 'Show completed jobs',
          icon: <CheckCircle className="w-4 h-4 text-success" />,
          category: 'Quick Actions',
          value: 'status:completed'
        },
        {
          id: 'action-high-priority',
          type: 'action',
          title: 'Show high priority jobs',
          icon: <AlertTriangle className="w-4 h-4 text-warning" />,
          category: 'Quick Actions',
          value: 'priority:high'
        }
      );

      return suggestions;
    }

    // Search in jobs
    const matchingJobs = jobs
      .filter(job => 
        job.name.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery) ||
        job.machineId.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);

    matchingJobs.forEach(job => {
      suggestions.push({
        id: `job-${job.id}`,
        type: 'job',
        title: job.name,
        subtitle: `${job.machineId} • ${job.status}`,
        icon: <Calendar className="w-4 h-4" />,
        category: 'Jobs',
        value: job.name
      });
    });

    // Search in machines
    const matchingMachines = machines
      .filter(machine => 
        machine.name.toLowerCase().includes(lowerQuery) ||
        machine.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 3);

    matchingMachines.forEach(machine => {
      suggestions.push({
        id: `machine-${machine.id}`,
        type: 'machine',
        title: machine.name,
        subtitle: machine.description,
        icon: <Settings className="w-4 h-4" />,
        category: 'Machines',
        value: machine.name
      });
    });

    // Status suggestions
    const statuses = ['pending', 'in-progress', 'completed', 'delayed'];
    const matchingStatuses = statuses.filter(status => 
      status.includes(lowerQuery) || lowerQuery.includes(status)
    );

    matchingStatuses.forEach(status => {
      const statusIcon = {
        'pending': <Clock className="w-4 h-4 text-warning" />,
        'in-progress': <Zap className="w-4 h-4 text-info" />,
        'completed': <CheckCircle className="w-4 h-4 text-success" />,
        'delayed': <AlertTriangle className="w-4 h-4 text-critical" />
      }[status];

      suggestions.push({
        id: `status-${status}`,
        type: 'status',
        title: `${status.charAt(0).toUpperCase() + status.slice(1)} jobs`,
        icon: statusIcon,
        category: 'Status',
        value: `status:${status}`
      });
    });

    // Material suggestions
    const materials = ['steel', 'aluminum', 'plastic', 'electronics'];
    const matchingMaterials = materials.filter(material => 
      material.includes(lowerQuery)
    );

    matchingMaterials.forEach(material => {
      suggestions.push({
        id: `material-${material}`,
        type: 'material',
        title: `${material.charAt(0).toUpperCase() + material.slice(1)} materials`,
        icon: <Package className="w-4 h-4" />,
        category: 'Materials',
        value: `material:${material}`
      });
    });

    return suggestions.slice(0, 12); // Limit total suggestions
  };

  const suggestions = generateSuggestions(query);

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'job') {
      const job = jobs.find(j => j.name === suggestion.title);
      if (job && onJobSelect) {
        onJobSelect(job);
      }
    } else if (suggestion.type === 'machine') {
      const machine = machines.find(m => m.name === suggestion.title);
      if (machine && onMachineSelect) {
        onMachineSelect(machine);
      }
    } else {
      setQuery(suggestion.value);
      onSearch(suggestion.value);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const newRecent = [suggestion.value, ...prev.filter(r => r !== suggestion.value)].slice(0, 5);
        return newRecent;
      });
    }
    
    setIsOpen(false);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    
    if (searchQuery.trim()) {
      setRecentSearches(prev => {
        const newRecent = [searchQuery, ...prev.filter(r => r !== searchQuery)].slice(0, 5);
        return newRecent;
      });
    }
    
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const category = suggestion.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
              placeholder={placeholder}
              className="pl-10 pr-12 h-9"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            <Badge variant="outline" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-1.5 py-0.5 hidden sm:flex">
              ⌘K
            </Badge>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Type to search..." 
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {Object.keys(groupedSuggestions).length === 0 && query && (
                <CommandEmpty>No results found for "{query}"</CommandEmpty>
              )}
              
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={`recent-${index}`}
                      onSelect={() => handleSearch(search)}
                      className="cursor-pointer"
                    >
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Grouped Suggestions */}
              {Object.entries(groupedSuggestions).map(([category, items], index) => (
                <React.Fragment key={category}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={category}>
                    {items.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        onSelect={() => handleSuggestionSelect(suggestion)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {suggestion.icon}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {suggestion.title}
                            </div>
                            {suggestion.subtitle && (
                              <div className="text-sm text-muted-foreground truncate">
                                {suggestion.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};