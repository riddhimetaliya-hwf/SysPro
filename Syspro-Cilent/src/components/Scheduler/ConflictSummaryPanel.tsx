import React, { useState, useEffect } from 'react';
import { Job } from '../../types/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/select';
import { AlertTriangle, Package, Clock, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '@/services/api';
import { ConflictType } from './ConflictIndicator';

interface ConflictSummaryPanelProps {
  jobs: Job[];
  onResolveConflict?: (jobId: string, conflictType: ConflictType) => void;
  onRefresh?: () => Promise<void>;
}

export const ConflictSummaryPanel = ({ 
  jobs, 
  onResolveConflict,
  onRefresh 
}: ConflictSummaryPanelProps) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Fetch conflicts when jobs change
  useEffect(() => {
    const fetchConflicts = async () => {
      if (jobs.length === 0) return;
      
      setIsLoading(true);
      try {
        const jobIds = jobs.map(job => job.id);
        const conflictData = await apiService.fetchJobConflicts(jobIds);
        setConflicts(conflictData);
      } catch (error) {
        console.error('Failed to fetch conflicts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConflicts();
  }, [jobs]);

  const getConflictIcon = (type: ConflictType) => {
    switch (type) {
      case 'capacity':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'material':
        return <Package size={16} className="text-orange-500" />;
      case 'resource':
        return <Clock size={16} className="text-yellow-500" />;
      case 'scheduling':
        return <Clock size={16} className="text-purple-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getConflictBadge = (type: ConflictType) => {
    switch (type) {
      case 'capacity':
        return <Badge variant="destructive">Critical</Badge>;
      case 'material':
        return (
          <Badge 
            variant="outline" 
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
          >
            Warning
          </Badge>
        );
      case 'resource':
        return (
          <Badge 
            variant="outline" 
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
          >
            Warning
          </Badge>
        );
      case 'scheduling':
        return <Badge variant="default">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const severityMatch = severityFilter === 'all' || 
      (severityFilter === 'critical' && conflict.severity === 'error') ||
      (severityFilter === 'warning' && conflict.severity === 'warning');
    
    const typeMatch = typeFilter === 'all' || conflict.conflictType === typeFilter;
    
    return severityMatch && typeMatch;
  });

  const handleResolve = async (jobId: string, conflictType: ConflictType) => {
    try {
      await onResolveConflict?.(jobId, conflictType);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading conflicts...</span>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No conflicts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conflicts</h3>
        <div className="flex gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[120px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
              <SelectItem value="scheduling">Scheduling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {filteredConflicts.map((conflict, index) => (
          <Card key={`${conflict.jobId}-${index}`} className="border-l-4 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getConflictIcon(conflict.conflictType)}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Job: {jobs.find(j => j.id === conflict.jobId)?.name || conflict.jobId}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {conflict.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      {getConflictBadge(conflict.conflictType)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conflict.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                {onResolveConflict && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResolve(conflict.jobId, conflict.conflictType)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
