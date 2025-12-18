
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, Calendar, User, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'schedule_change' | 'conflict' | 'assignment' | 'completion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  author?: string;
  jobId?: string;
}

export const ChangeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'schedule_change',
      title: 'Schedule Updated',
      message: 'Job #12345 moved from Machine A to Machine B',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      priority: 'high',
      author: 'Sarah Chen',
      jobId: 'job-12345'
    },
    {
      id: '2',
      type: 'conflict',
      title: 'Resource Conflict',
      message: 'Material shortage detected for upcoming jobs',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'assignment',
      title: 'New Assignment',
      message: 'You have been assigned to review Job #67890',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      priority: 'medium',
      jobId: 'job-67890'
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'schedule_change',
          title: 'Live Update',
          message: `Machine ${String.fromCharCode(65 + Math.floor(Math.random() * 3))} status changed`,
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        toast.info(newNotification.message, {
          description: 'Click to view details'
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'schedule_change': return <Calendar size={16} />;
      case 'conflict': return <AlertTriangle size={16} />;
      case 'assignment': return <User size={16} />;
      case 'completion': return <CheckCircle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-12 w-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </span>
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{notification.timestamp.toLocaleTimeString()}</span>
                            {notification.author && (
                              <span>• by {notification.author}</span>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
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
