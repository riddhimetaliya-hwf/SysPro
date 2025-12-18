
import React, { useState } from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/UI/dialog';
import { ScrollArea } from '@/components/UI/scroll-area';

// Types for our sync data
type SyncStatus = 'success' | 'warning' | 'error';
type SyncRecord = {
  id: string;
  timestamp: string;
  status: SyncStatus;
  summary: string;
  details?: string;
  payloadPreview?: string;
};

export const SyncStatusView = () => {
  // Mock data for the sync records
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([
    {
      id: '1',
      timestamp: '2025-05-05T08:35:00Z',
      status: 'success',
      summary: 'Synced 120 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 120, "conflicts": 0, "duration_ms": 1245 }'
    },
    {
      id: '2',
      timestamp: '2025-05-05T08:20:00Z',
      status: 'success',
      summary: 'Synced 118 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 118, "conflicts": 0, "duration_ms": 1120 }'
    },
    {
      id: '3',
      timestamp: '2025-05-05T08:05:00Z',
      status: 'warning',
      summary: 'Synced 115 tasks with warnings',
      details: '3 tasks had validation warnings but were synced.',
      payloadPreview: '{ "tasks": 115, "warnings": 3, "conflicts": 0, "duration_ms": 1350 }'
    },
    {
      id: '4',
      timestamp: '2025-05-05T07:50:00Z',
      status: 'success',
      summary: 'Synced 110 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 110, "conflicts": 0, "duration_ms": 980 }'
    },
    {
      id: '5',
      timestamp: '2025-05-05T07:35:00Z',
      status: 'error',
      summary: 'Failed to sync tasks',
      details: 'Network connection error. Connection timeout after 30 seconds.',
      payloadPreview: '{ "error": "ETIMEDOUT", "code": 500 }'
    },
    {
      id: '6',
      timestamp: '2025-05-05T07:20:00Z',
      status: 'success',
      summary: 'Synced 105 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 105, "conflicts": 0, "duration_ms": 950 }'
    },
    {
      id: '7',
      timestamp: '2025-05-05T07:05:00Z',
      status: 'success',
      summary: 'Synced 103 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 103, "conflicts": 0, "duration_ms": 920 }'
    },
    {
      id: '8',
      timestamp: '2025-05-05T06:50:00Z',
      status: 'warning',
      summary: 'Synced 100 tasks with warnings',
      details: '2 tasks had validation warnings but were synced.',
      payloadPreview: '{ "tasks": 100, "warnings": 2, "conflicts": 0, "duration_ms": 1050 }'
    },
    {
      id: '9',
      timestamp: '2025-05-05T06:35:00Z',
      status: 'success',
      summary: 'Synced 98 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 98, "conflicts": 0, "duration_ms": 890 }'
    },
    {
      id: '10',
      timestamp: '2025-05-05T06:20:00Z',
      status: 'success',
      summary: 'Synced 95 tasks successfully',
      details: 'All systems operational. No conflicts detected.',
      payloadPreview: '{ "tasks": 95, "conflicts": 0, "duration_ms": 880 }'
    }
  ]);
  
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SyncRecord | null>(null);
  
  // Calculate current status based on most recent sync
  const latestSync = syncRecords[0];
  const currentStatus = latestSync?.status || 'success';
  
  // Format timestamp for display
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate time ago for the latest sync
  const getTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };
  
  const toggleExpandRecord = (id: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const triggerManualSync = () => {
    setIsSyncing(true);
    
    // Simulate a sync process
    toast.loading('Syncing in progress...', { duration: 2000 });
    
    setTimeout(() => {
      const newRecord: SyncRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'success',
        summary: 'Synced 122 tasks successfully',
        details: 'Manual sync completed successfully. All systems operational.',
        payloadPreview: '{ "tasks": 122, "conflicts": 0, "duration_ms": 1320 }'
      };
      
      setSyncRecords([newRecord, ...syncRecords.slice(0, 9)]);
      setIsSyncing(false);
      toast.success('Sync completed successfully');
    }, 2500);
  };
  
  const retryFailedSync = (id: string) => {
    const failedSync = syncRecords.find(r => r.id === id);
    if (!failedSync) return;
    
    toast.loading('Retrying failed sync...', { duration: 2000 });
    
    setTimeout(() => {
      const updatedRecords = syncRecords.map(record => {
        if (record.id === id) {
          return {
            ...record,
            status: 'success' as SyncStatus,
            summary: 'Retry succeeded - Synced successfully',
            details: 'Retry was successful. All systems operational.',
            timestamp: new Date().toISOString()
          };
        }
        return record;
      });
      
      setSyncRecords(updatedRecords);
      toast.success('Retry completed successfully');
    }, 2000);
  };
  
  const getStatusIcon = (status: SyncStatus, size = 16) => {
    switch(status) {
      case 'success':
        return <CheckCircle2 size={size} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={size} className="text-amber-500" />;
      case 'error':
        return <AlertCircle size={size} className="text-red-500" />;
      default:
        return <Clock size={size} className="text-gray-400" />;
    }
  };
  
  const getStatusText = (status: SyncStatus) => {
    switch(status) {
      case 'success': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };
  
  const getStatusColor = (status: SyncStatus) => {
    switch(status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  
  const getStatusBadge = (status: SyncStatus) => {
    switch(status) {
      case 'success': 
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">{getStatusText(status)}</Badge>;
      case 'warning': 
        return <Badge variant="outline" className="text-amber-500 border-amber-500">{getStatusText(status)}</Badge>;
      case 'error': 
        return <Badge variant="destructive">{getStatusText(status)}</Badge>;
      default: 
        return <Badge variant="outline">{getStatusText(status)}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Current Sync Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <div className="mr-2">Current Sync Status</div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`inline-flex h-3 w-3 rounded-full ${getStatusColor(currentStatus)}`}></span>
              {getStatusBadge(currentStatus)}
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock size={14} />
            Last sync: {latestSync ? getTimeAgo(latestSync.timestamp) : 'No sync data available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="text-sm">
              {latestSync?.summary || 'No sync data available'}
            </div>
            <Button 
              onClick={triggerManualSync} 
              disabled={isSyncing}
              className="w-full md:w-auto"
            >
              <RefreshCw size={16} className={cn("mr-2", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Trigger Sync Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>Sync Logs</span>
            <Badge variant="outline" className="ml-2">
              Last 10 entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md overflow-hidden">
            {syncRecords.length > 0 ? (
              syncRecords.map((record) => (
                <div 
                  key={record.id} 
                  className={cn(
                    "border-b last:border-b-0",
                    expandedRecords[record.id] ? 'bg-muted/50' : ''
                  )}
                >
                  <div 
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-muted/30"
                    onClick={() => toggleExpandRecord(record.id)}
                  >
                    <div className="mr-3">
                      {expandedRecords[record.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div className="mr-3">
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{record.summary}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(record.timestamp)}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                  
                  {expandedRecords[record.id] && (
                    <div className="px-4 py-3 bg-muted/30 text-sm border-t">
                      <div className="mb-2">
                        <span className="font-medium">Details:</span> {record.details}
                      </div>
                      {record.payloadPreview && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Payload Preview:</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View Full Payload</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Sync Payload Details</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[60vh] mt-4">
                                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                                    {JSON.stringify(JSON.parse(record.payloadPreview), null, 2)}
                                  </pre>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto">
                            {record.payloadPreview}
                          </div>
                        </div>
                      )}
                      {record.status === 'error' && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              retryFailedSync(record.id);
                            }}
                          >
                            <RefreshCw size={14} className="mr-2" />
                            Retry Failed Sync
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No sync records available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alert Preferences</CardTitle>
          <CardDescription>Configure how you receive notifications about sync issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive email alerts for sync failures</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Email notifications enabled')}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">In-App Notifications</div>
                <div className="text-sm text-muted-foreground">Show notifications within the application</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('In-app notifications enabled')}
              >
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
