import React, { useEffect, useState } from 'react';
import { Job } from '../../types/jobs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { ConflictType } from './ConflictIndicator';

interface ConflictOverlayProps {
  job: Job;
  children: React.ReactNode;
  onConflictClick?: (jobId: string, conflictType: ConflictType) => void;
}

export const ConflictOverlay = ({ job, children, onConflictClick }: ConflictOverlayProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadConflicts = async () => {
      if (!job || !isOpen) return; // Only load when popover is actually opened
      
      setIsLoading(true);
      setHasError(false);
      try {
        const conflictData = await apiService.fetchJobConflicts([job.id]);
        if (!isMounted) return;
        
        console.log("Conflict data received:", conflictData);
        
        // Filter conflicts for the current job - fix the filtering logic
        const jobConflicts = conflictData.filter(conflict => 
          conflict.job === job.id || 
          conflict.job === job.name ||
          conflict.jobDescription === job.name
        );
        
        console.log("Filtered job conflicts:", jobConflicts);
        setConflicts(jobConflicts);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch job conflicts:', error);
        setHasError(true);
        setConflicts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Only load conflicts when the popover is opened
    if (isOpen) {
      loadConflicts();
    }
    
    return () => {
      isMounted = false;
    };
  }, [job, isOpen]); // Add isOpen as dependency

  if (!job) return <>{children}</>;

  const hasConflicts = conflicts.length > 0;
  
  // Determine conflict severity based on the actual API data
  const getConflictSeverity = (conflict: any): 'critical' | 'warning' => {
    if (conflict.impactScore >= 7 || conflict.urgency === 'high') {
      return 'critical';
    }
    return 'warning';
  };

  const criticalConflicts = conflicts.filter(c => getConflictSeverity(c) === 'critical');
  const warningConflicts = conflicts.filter(c => getConflictSeverity(c) === 'warning');

  // Don't show overlay if no conflicts and no error
  if (!hasConflicts && !hasError) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {/* Only show indicator if there are conflicts OR if there was an error */}
          {(hasConflicts || hasError) && (
            <div className="absolute -top-1 -right-1">
              <div className="relative">
                <AlertTriangle 
                  className={`h-4 w-4 ${
                    hasError ? 'text-gray-400' :
                    criticalConflicts.length > 0 ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                {hasConflicts && conflicts.length > 1 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {conflicts.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-50" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {hasError ? 'Job Status' : 'Job Conflicts'}
            </h4>
            <span className="text-xs text-muted-foreground">
              {job.name}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Checking for conflicts...</span>
            </div>
          ) : hasError ? (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">
                Unable to load conflict information
              </p>
            </div>
          ) : hasConflicts ? (
            <div className="space-y-3">
              {criticalConflicts.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-500 mb-1">Critical Issues</h5>
                  <div className="space-y-2">
                    {criticalConflicts.map((conflict, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                        <p className="font-medium text-red-800">{conflict.conflictReason}</p>
                        <div className="text-xs text-red-600 mt-1 space-y-1">
                          <p>Impact: {conflict.impactScore}/10</p>
                          <p>Urgency: {conflict.urgency}</p>
                        </div>
                        {onConflictClick && (
                          <button
                            onClick={() => {
                              // Determine conflict type based on reason
                              const conflictType: ConflictType = 
                                conflict.conflictReason?.toLowerCase().includes('material') ? 'material' :
                                conflict.conflictReason?.toLowerCase().includes('capacity') ? 'capacity' :
                                conflict.conflictReason?.toLowerCase().includes('dependency') ? 'dependency' : 'capacity';
                              
                              onConflictClick(job.id, conflictType);
                              setIsOpen(false);
                            }}
                            className="text-xs text-red-600 hover:underline mt-1"
                          >
                            Resolve issue
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {warningConflicts.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-yellow-500 mb-1">Warnings</h5>
                  <div className="space-y-2">
                    {warningConflicts.map((conflict, index) => (
                      <div key={index} className="text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-yellow-800">{conflict.conflictReason}</p>
                        <div className="text-xs text-yellow-600 mt-1">
                          <p>Impact: {conflict.impactScore}/10</p>
                        </div>
                        {onConflictClick && (
                          <button
                            onClick={() => {
                              const conflictType: ConflictType = 'capacity'; // Default
                              onConflictClick(job.id, conflictType);
                              setIsOpen(false);
                            }}
                            className="text-xs text-yellow-600 hover:underline mt-1"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-green-600">No conflicts detected</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};