
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Job } from '@/types/jobs';
import { format } from 'date-fns';
import { Badge } from '@/components/UI/badge';
import { AlertCircle } from 'lucide-react';

interface ConflictsSummaryProps {
  jobs: Job[];
}

export const ConflictsSummary = ({ jobs }: ConflictsSummaryProps) => {
  const conflictJobs = jobs.filter(job => job.conflictType !== 'none');
  
  // Group conflicts by date
  const conflictsByDate: Record<string, Job[]> = {};
  
  conflictJobs.forEach(job => {
    const startDate = format(new Date(job.startDate), 'yyyy-MM-dd');
    if (!conflictsByDate[startDate]) {
      conflictsByDate[startDate] = [];
    }
    conflictsByDate[startDate].push(job);
  });

  const sortedDates = Object.keys(conflictsByDate).sort();
  
  // Get conflict type badge
  const getConflictBadge = (conflictType: string) => {
    switch (conflictType) {
      case 'capacity':
        return <Badge variant="destructive">Capacity</Badge>;
      case 'material':
        return <Badge variant="default" className="bg-orange-400 hover:bg-orange-500">Material</Badge>;
      case 'resource':
        return <Badge variant="outline" className="bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500">Resource</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle size={18} />
          Conflicts Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto">
        {sortedDates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No conflicts detected</p>
        ) : (
          <div className="space-y-3">
            {sortedDates.map(date => (
              <div key={date} className="space-y-2">
                <h4 className="text-sm font-medium">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h4>
                <div className="space-y-2">
                  {conflictsByDate[date].map(job => (
                    <div key={job.id} className="text-xs p-2 rounded-md bg-secondary">
                      <div className="flex items-center gap-2">
                        {getConflictBadge(job.conflictType)}
                        <span className="font-medium">{job.name}</span>
                        <span className="text-muted-foreground ml-auto">{job.id}</span>
                      </div>
                      
                      {job.conflictDetails && (
                        <div className="mt-1 text-xs pl-2 border-l-2 border-muted-foreground">
                          {job.conflictDetails.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
