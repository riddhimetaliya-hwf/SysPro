import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { ScrollArea } from '@/components/UI/scroll-area';
import {
  Info,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Zap,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { cn } from '@/lib/utils';

interface ContextualPanelProps {
  selectedJob?: Job;
  selectedMachine?: Machine;
  relatedJobs?: Job[];
  onClose?: () => void;
  className?: string;
}

export const ContextualPanel = ({
  selectedJob,
  selectedMachine,
  relatedJobs = [],
  onClose,
  className
}: ContextualPanelProps) => {
  const [activeTab, setActiveTab] = useState('details');

  // Reset tab when selection changes
  useEffect(() => {
    setActiveTab('details');
  }, [selectedJob?.id, selectedMachine?.id]);

  if (!selectedJob && !selectedMachine) {
    return (
      <Card className={cn("w-80", className)}>
        <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
          <div className="text-center space-y-2">
            <Info className="w-8 h-8 mx-auto" />
            <p className="text-sm">Select a job or machine to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress': return <Activity className="w-4 h-4 text-primary" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={cn("w-80 h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {selectedJob && (
              <>
                {getStatusIcon(selectedJob.status)}
                {selectedJob.name}
              </>
            )}
            {selectedMachine && (
              <>
                <Settings className="w-4 h-4" />
                {selectedMachine.name}
              </>
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            <TabsTrigger value="related" className="text-xs">Related</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {selectedJob && (
              <>
                {/* Job Status and Priority */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(selectedJob.status)}
                      {selectedJob.status}
                    </Badge>
                    <Badge variant={getPriorityColor(selectedJob.priority)}>
                      {selectedJob.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                </div>

                <Separator />

                {/* Timing Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Start:</span>
                      <div className="font-medium">{new Date(selectedJob.startDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span>
                      <div className="font-medium">{new Date(selectedJob.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Crew Information */}
                {selectedJob.crewName && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Crew Details
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team:</span>
                          <span className="font-medium">{selectedJob.crewName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Skill Level:</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedJob.skillLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Materials */}
                {selectedJob.materials && selectedJob.materials.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Materials
                      </h4>
                      <div className="space-y-2">
                        {selectedJob.materials.map((material, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded-md">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{material.name}</span>
                              <Badge variant={material.status === 'available' ? 'default' : 'destructive'} className="text-xs">
                                {material.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {material.available}/{material.required} {material.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {selectedMachine && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedMachine.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Capacity:</span>
                    <Badge variant="outline">{selectedMachine.capacity}%</Badge>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="related" className="space-y-4">
            <ScrollArea className="h-40">
              {relatedJobs.length > 0 ? (
                <div className="space-y-2">
                  {relatedJobs.map(job => (
                    <div key={job.id} className="p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{job.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <p className="text-sm">No related items found</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {selectedJob && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {selectedJob.hasDependency ? selectedJob.dependencies?.length || 0 : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Dependencies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {selectedJob.conflictType === 'none' ? '0' : '1'}
                  </div>
                  <div className="text-xs text-muted-foreground">Conflicts</div>
                </div>
              </div>
            )}

            {selectedMachine && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedMachine.capacity}%</div>
                  <div className="text-xs text-muted-foreground">Current Utilization</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-lg font-semibold text-success">
                      {relatedJobs.filter(job => job.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-warning">
                      {relatedJobs.filter(job => job.status === 'pending').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};