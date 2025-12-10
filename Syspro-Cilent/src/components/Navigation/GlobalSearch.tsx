
import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Settings, BarChart3, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  type: 'job' | 'machine' | 'report' | 'page';
  description?: string;
  url?: string;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Machine A status',
    'Job conflicts',
    'Production report'
  ]);

  // Sample search results
  const searchResults: SearchResult[] = [
    { id: '1', title: 'Job #12345', type: 'job', description: 'Assembly Line A - Priority High', url: '/' },
    { id: '2', title: 'Machine B Status', type: 'machine', description: 'Currently in maintenance mode', url: '/' },
    { id: '3', title: 'Production Reports', type: 'page', description: 'View and generate reports', url: '/reports' },
    { id: '4', title: 'Configuration Settings', type: 'page', description: 'System configuration', url: '/configuration' },
  ];

  const filteredResults = query 
    ? searchResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    toast.success(`Opening ${result.title}`);
    setOpen(false);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      return updated;
    });
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'job': return '📋';
      case 'machine': return '⚙️';
      case 'report': return '📊';
      case 'page': return '📄';
      default: return '📄';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search everything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search jobs, machines, reports..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {query === '' && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search, index) => (
                <CommandItem key={index} onSelect={() => setQuery(search)}>
                  <Clock className="mr-2 h-4 w-4" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {filteredResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Results">
                {filteredResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground">{result.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {result.type}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => toast.success('Opening advanced filters')}>
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </CommandItem>
            <CommandItem onSelect={() => toast.success('Opening settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
