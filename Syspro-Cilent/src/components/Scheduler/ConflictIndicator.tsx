import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/UI/tooltip';
import { apiService } from '@/services/api';

export type ConflictType = 'none' | 'capacity' | 'material' | 'resource' | 'scheduling';

interface ConflictIndicatorProps {
  jobId: string;
  conflictType?: ConflictType;
  onConflictDetected?: (jobId: string, hasConflict: ConflictType) => void;
}

export const ConflictIndicator = ({ 
  jobId, 
  conflictType: propConflictType, 
  onConflictDetected 
}: ConflictIndicatorProps) => {
  console.log('🔄 ConflictIndicator rendered with jobId:', jobId, 'propConflictType:', propConflictType);
  
  const [isLoading, setIsLoading] = useState(false);
  const [conflictType, setConflictType] = useState<ConflictType>(propConflictType || 'none');
  const [conflictMessage, setConflictMessage] = useState('');

  const color = conflictType === 'none' ? 'text-gray-400' : 'text-red-500';

  useEffect(() => {
    console.log('🔍 ConflictIndicator useEffect triggered for jobId:', jobId);
    let isMounted = true;
    
    const checkForConflicts = async () => {
      if (!jobId || conflictType === 'none') return;
      
      setIsLoading(true);
      
      try {
        console.log('📡 Checking for conflicts for job ID:', jobId);
        const conflicts = await apiService.fetchJobConflicts([jobId]);
        console.log('📥 Received conflicts:', conflicts);
        
        if (!isMounted) return;
        
        const jobConflicts = conflicts.filter(conflict => conflict.job === jobId);
        
        if (jobConflicts.length > 0) {
          const conflict = jobConflicts[0]; // Get the first conflict
          const conflictType = conflict.conflictFlag?.toLowerCase() as ConflictType || 'none';
          setConflictType(conflictType);
          setConflictMessage(conflict.jobDescription || 'Conflict detected');
          onConflictDetected?.(jobId, conflictType);
        } else {
          setConflictType('none');
          setConflictMessage('');
        }
      } catch (error) {
        console.error('Error checking for conflicts:', error);
        if (isMounted) {
          setConflictType('none');
          setConflictMessage('Error checking for conflicts');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkForConflicts();
    
    return () => {
      isMounted = false;
    };
  }, [jobId, onConflictDetected]);

  console.log('🎨 Rendering ConflictIndicator with:', { 
    jobId, 
    conflictType, 
    isLoading, 
    hasMessage: !!conflictMessage 
  });

  if (conflictType === 'none' || isLoading) {
    console.log('🎯 No conflict or loading, not rendering indicator');
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">
            {isLoading ? (
              <Loader2 className={`h-4 w-4 animate-spin ${color}`} />
            ) : (
              <AlertCircle className={`h-4 w-4 ${color}`} />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">
              {conflictType === 'capacity' && 'Capacity Conflict'}
              {conflictType === 'material' && 'Material Conflict'}
              {conflictType === 'resource' && 'Resource Conflict'}
              {conflictType === 'scheduling' && 'Scheduling Conflict'}
            </div>
            {conflictMessage && <div className="text-sm">{conflictMessage}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
