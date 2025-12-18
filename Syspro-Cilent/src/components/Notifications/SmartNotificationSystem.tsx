import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  X,
  Settings,
  Filter
} from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'conflict' | 'delay' | 'completion' | 'material' | 'maintenance' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  jobId?: number;
  machineId?: string;
  actionable: boolean;
  actions?: {
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  dismissed?: boolean;
  read?: boolean;
}

interface SmartNotificationSystemProps {
  jobs: Job[];
  machines: Machine[];
  onJobUpdate?: (job: Job) => void;
  className?: string;
}

export const SmartNotificationSystem = ({
  jobs,
  machines,
  onJobUpdate,
  className
}: SmartNotificationSystemProps) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  // Generate notifications based on job and machine data
  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Check for conflicts
    jobs.forEach(job => {
      if (job.conflictType !== 'none') {
        newNotifications.push({
          id: `conflict-${job.id}`,
          type: 'conflict',
          priority: job.priority === 'critical' ? 'critical' : 'high',
          title: 'Conflict Detected',
          message: `Job ${job.name} has a ${job.conflictType} conflict`,
          timestamp: now,
          jobId: job.id,
          actionable: true,
          actions: [
            {
              label: 'Resolve',
              action: () => handleResolveConflict(job.id),
              variant: 'default'
            },
            {
              label: 'View Details',
              action: () => handleViewJob(job.id),
              variant: 'outline'
            }
          ]
        });
      }
    });

    // Check for delayed jobs
    jobs.forEach(job => {
      if (job.status === 'delayed') {
        newNotifications.push({
          id: `delay-${job.id}`,
          type: 'delay',
          priority: job.priority === 'critical' ? 'critical' : 'high',
          title: 'Job Delayed',
          message: `Job ${job.name} is running behind schedule`,
          timestamp: now,
          jobId: job.id,
          actionable: true,
          actions: [
            {
              label: 'Reschedule',
              action: () => handleReschedule(job.id),
              variant: 'default'
            }
          ]
        });
      }
    });

    // Check for material shortages
    jobs.forEach(job => {
      job.materials?.forEach(material => {
        if (material.status === 'critical' || material.status === 'low') {
          newNotifications.push({
            id: `material-${job.id}-${material.id}`,
            type: 'material',
            priority: material.status === 'critical' ? 'critical' : 'medium',
            title: 'Material Shortage',
            message: `${material.name} is ${material.status} for Job ${job.name}`,
            timestamp: now,
            jobId: job.id,
            actionable: true,
            actions: [
              {
                label: 'Order Material',
                action: () => handleOrderMaterial(material.id),
                variant: 'default'
              }
            ]
          });
        }
      });
    });

    // Check for completed jobs
    jobs.forEach(job => {
      if (job.status === 'completed') {
        const existingNotification = notifications.find(n => n.id === `completion-${job.id}`);
        if (!existingNotification) {
          newNotifications.push({
            id: `completion-${job.id}`,
            type: 'completion',
            priority: 'low',
            title: 'Job Completed',
            message: `Job ${job.name} has been completed successfully`,
            timestamp: now,
            jobId: job.id,
            actionable: false
          });
        }
      }
    });

    // Filter notifications based on user preferences
    const filteredNotifications = newNotifications.filter(notification => {
      if (!preferences.notifications.enabled) return false;
      
      switch (preferences.notifications.priority) {
        case 'critical':
          return notification.priority === 'critical';
        case 'high':
          return ['critical', 'high'].includes(notification.priority);
        case 'all':
        default:
          return true;
      }
    });

    // Update state and show toasts for new high-priority notifications
    const existingIds = new Set(notifications.map(n => n.id));
    const newHighPriorityNotifications = filteredNotifications.filter(
      n => !existingIds.has(n.id) && ['critical', 'high'].includes(n.priority)
    );

    newHighPriorityNotifications.forEach(notification => {
      toast(notification.title, {
        description: notification.message,
        duration: notification.priority === 'critical' ? 0 : 5000, // Critical notifications don't auto-dismiss
        action: notification.actionable ? {
          label: notification.actions?.[0]?.label || 'View',
          onClick: notification.actions?.[0]?.action || (() => {})
        } : undefined
      });
    });

    setNotifications(prev => {
      const combined = [...prev.filter(n => !n.dismissed), ...filteredNotifications];
      return combined.sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    });
  }, [jobs, machines, preferences.notifications, notifications]);

  // Update notifications when data changes
  useEffect(() => {
    generateNotifications();
  }, [generateNotifications]);

  const handleResolveConflict = (jobId: number) => {
    if (onJobUpdate) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        onJobUpdate({ ...job, conflictType: 'none', conflictDetails: undefined });
      }
    }
    dismissNotification(`conflict-${jobId}`);
  };

  const handleReschedule = (jobId: number) => {
    // Placeholder for rescheduling logic
    toast.success('Rescheduling job...', {
      description: `Job ${jobId} has been added to rescheduling queue`
    });
    dismissNotification(`delay-${jobId}`);
  };

  const handleOrderMaterial = (materialId: string) => {
    // Placeholder for material ordering logic
    toast.success('Material order initiated', {
      description: `Order placed for material ${materialId}`
    });
  };

  const handleViewJob = (jobId: number) => {
    // Placeholder for job viewing logic
    toast.info(`Viewing job ${jobId}`);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'conflict': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'delay': return <Clock className="w-4 h-4 text-warning" />;
      case 'completion': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'material': return <Zap className="w-4 h-4 text-warning" />;
      case 'maintenance': return <Settings className="w-4 h-4 text-info" />;
      case 'optimization': return <Zap className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        {preferences.notifications.enabled ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {showPanel && (
        <Card className="absolute top-full right-0 w-80 z-50 mt-2 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updatePreferences({
                    notifications: { 
                      ...preferences.notifications, 
                      enabled: !preferences.notifications.enabled 
                    }
                  })}
                >
                  {preferences.notifications.enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-80">
              {activeNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        !notification.read && "bg-muted/50",
                        notification.read && "bg-background"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{notification.title}</span>
                              <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex gap-2">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.action();
                                }}
                                className="text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};