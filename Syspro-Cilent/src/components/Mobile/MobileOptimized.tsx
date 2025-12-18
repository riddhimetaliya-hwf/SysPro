
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Calendar, 
  Settings, 
  User,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface MobileJob {
  id: string;
  name: string;
  machine: string;
  status: 'active' | 'pending' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  startTime: string;
  estimatedCompletion: string;
}

export const MobileOptimized = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  
  const mockJobs: MobileJob[] = [
    {
      id: 'J001',
      name: 'Bracket Assembly',
      machine: 'Machine A',
      status: 'active',
      priority: 'high',
      startTime: '09:00',
      estimatedCompletion: '11:30'
    },
    {
      id: 'J002',
      name: 'Gear Cutting',
      machine: 'Machine B',
      status: 'pending',
      priority: 'medium',
      startTime: '10:30',
      estimatedCompletion: '13:00'
    },
    {
      id: 'J003',
      name: 'Surface Finishing',
      machine: 'Machine C',
      status: 'completed',
      priority: 'low',
      startTime: '08:00',
      estimatedCompletion: '09:45'
    },
    {
      id: 'J004',
      name: 'Quality Check',
      machine: 'QC Station',
      status: 'delayed',
      priority: 'high',
      startTime: '09:30',
      estimatedCompletion: '10:15'
    }
  ];

  const getStatusIcon = (status: MobileJob['status']) => {
    switch (status) {
      case 'active': return <Activity size={16} className="text-blue-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'delayed': return <AlertTriangle size={16} className="text-red-500" />;
    }
  };

  const getStatusColor = (status: MobileJob['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'delayed': return 'destructive';
    }
  };

  const getPriorityColor = (priority: MobileJob['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  return (
    <div className="mobile-container h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Production Scheduler</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold text-lg">Production</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="px-4 pb-20">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3 mt-4">
              {mockJobs.map((job) => (
                <Card key={job.id} className="touch-friendly">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{job.name}</h3>
                          <Badge variant={getPriorityColor(job.priority)} className="text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{job.machine}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusColor(job.status)} className="text-xs">
                        {job.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {job.startTime} - {job.estimatedCompletion}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="machines" className="px-4 pb-20">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3 mt-4">
              {['Machine A', 'Machine B', 'Machine C', 'QC Station'].map((machine, index) => (
                <Card key={machine} className="touch-friendly">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{machine}</h3>
                        <p className="text-xs text-muted-foreground">
                          {index % 2 === 0 ? 'Operational' : 'Maintenance Due'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {index % 2 === 0 ? '85%' : '72%'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="alerts" className="px-4 pb-20">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3 mt-4">
              {[
                { type: 'warning', message: 'Material shortage for Job #J002', time: '5 min ago' },
                { type: 'info', message: 'Machine A maintenance scheduled', time: '1 hour ago' },
                { type: 'error', message: 'Job #J004 delayed due to quality issues', time: '2 hours ago' }
              ].map((alert, index) => (
                <Card key={index} className="touch-friendly">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};
