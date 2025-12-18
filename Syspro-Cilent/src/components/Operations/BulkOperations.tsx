import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Job } from '@/types/jobs';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useOperationHistory } from '@/components/Operations/OperationHistory';
import { toast } from 'sonner';

interface BulkOperationsProps {
  jobs: Job[];
  onJobsUpdate: (jobs: Job[]) => void;
  className?: string;
}

export const BulkOperations = ({ jobs, onJobsUpdate, className }: BulkOperationsProps) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { addOperation } = useOperationHistory();
  const { selectedJobs } = preferences.bulkOperations;
  
  const [bulkAction, setBulkAction] = useState<string>('');

  const isAllSelected = selectedJobs.length === jobs.length && jobs.length > 0;
  const isPartialSelected = selectedJobs.length > 0 && selectedJobs.length < jobs.length;

  const handleSelectAll = () => {
    const newSelection = isAllSelected ? [] : jobs.map(job => job.id);
    updatePreferences({
      bulkOperations: { ...preferences.bulkOperations, selectedJobs: newSelection }
    });
  };

  const handleJobSelect = (jobId: number, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedJobs, jobId]
      : selectedJobs.filter(id => id !== jobId);
    
    updatePreferences({
      bulkOperations: { ...preferences.bulkOperations, selectedJobs: newSelection }
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedJobs.length === 0) return;

    const oldJobs = [...jobs];
    let newJobs = [...jobs];
    let description = '';

    switch (bulkAction) {
      case 'complete':
        newJobs = jobs.map(job => 
          selectedJobs.includes(job.id) 
            ? { ...job, status: 'completed' as const }
            : job
        );
        description = `Marked ${selectedJobs.length} jobs as completed`;
        break;
      
      case 'delay':
        newJobs = jobs.map(job => 
          selectedJobs.includes(job.id) 
            ? { ...job, status: 'delayed' as const }
            : job
        );
        description = `Marked ${selectedJobs.length} jobs as delayed`;
        break;
      
      case 'high-priority':
        newJobs = jobs.map(job => 
          selectedJobs.includes(job.id) 
            ? { ...job, priority: 'high' as const }
            : job
        );
        description = `Set ${selectedJobs.length} jobs to high priority`;
        break;
      
      case 'delete':
        newJobs = jobs.filter(job => !selectedJobs.includes(job.id));
        description = `Deleted ${selectedJobs.length} jobs`;
        break;
      
      default:
        return;
    }

    onJobsUpdate(newJobs);
    
    // Clear selection
    updatePreferences({
      bulkOperations: { selectedJobs: [], lastAction: bulkAction }
    });

    // Add to operation history
    addOperation({
      type: 'bulk-operation',
      description,
      data: { oldJobs, newJobs, action: bulkAction, affectedJobs: selectedJobs },
      undoAction: () => onJobsUpdate(oldJobs),
      redoAction: () => onJobsUpdate(newJobs),
    });

    toast.success(description);
    setBulkAction('');
  };

  const selectedJobDetails = jobs.filter(job => selectedJobs.includes(job.id));

  return (
    <Card className={`${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected || isPartialSelected}
              onCheckedChange={handleSelectAll}
            />
            <span>Bulk Operations</span>
          </div>
          {selectedJobs.length > 0 && (
            <Badge variant="secondary">
              {selectedJobs.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Selection List */}
        <div className="max-h-40 overflow-y-auto space-y-2">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
              <Checkbox
                checked={selectedJobs.includes(job.id)}
                onCheckedChange={(checked) => handleJobSelect(job.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{job.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {job.status}
                  </Badge>
                  <Badge 
                    variant={job.priority === 'critical' ? 'destructive' : 'secondary'} 
                    className="text-xs"
                  >
                    {job.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{job.description}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedJobs.length > 0 && (
          <>
            <Separator />
            
            {/* Selected Jobs Summary */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{selectedJobs.length}</div>
                <div className="text-xs text-muted-foreground">Jobs Selected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {selectedJobDetails.filter(job => job.priority === 'high' || job.priority === 'critical').length}
                </div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose bulk action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Mark as Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="delay">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning" />
                        Mark as Delayed
                      </div>
                    </SelectItem>
                    <SelectItem value="high-priority">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Set High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="delete">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-destructive" />
                        Delete Jobs
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                  size="sm"
                >
                  Apply
                </Button>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setBulkAction('complete');
                    setTimeout(handleBulkAction, 100);
                  }}
                  disabled={selectedJobs.length === 0}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setBulkAction('high-priority');
                    setTimeout(handleBulkAction, 100);
                  }}
                  disabled={selectedJobs.length === 0}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  High Priority
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};