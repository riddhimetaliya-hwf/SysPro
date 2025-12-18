
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { Job, Machine } from '@/types/jobs';

interface UtilizationAnalyticsProps {
  jobs: Job[];
  machines: Machine[];
}

export const UtilizationAnalytics = ({ jobs, machines }: UtilizationAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Mock data - in real app this would be calculated from actual job data
  const utilizationData = {
    daily: [
      { name: 'Mon', Machine_A: 85, Machine_B: 72, Machine_C: 95, idle: 15 },
      { name: 'Tue', Machine_A: 78, Machine_B: 88, Machine_C: 82, idle: 20 },
      { name: 'Wed', Machine_A: 92, Machine_B: 65, Machine_C: 88, idle: 12 },
      { name: 'Thu', Machine_A: 88, Machine_B: 90, Machine_C: 75, idle: 18 },
      { name: 'Fri', Machine_A: 95, Machine_B: 85, Machine_C: 92, idle: 8 }
    ],
    weekly: [
      { name: 'Week 1', Machine_A: 85, Machine_B: 78, Machine_C: 88, idle: 15 },
      { name: 'Week 2', Machine_A: 92, Machine_B: 85, Machine_C: 82, idle: 12 },
      { name: 'Week 3', Machine_A: 88, Machine_B: 92, Machine_C: 95, idle: 10 },
      { name: 'Week 4', Machine_A: 90, Machine_B: 88, Machine_C: 85, idle: 13 }
    ],
    monthly: [
      { name: 'Jan', Machine_A: 88, Machine_B: 85, Machine_C: 90, idle: 12 },
      { name: 'Feb', Machine_A: 92, Machine_B: 88, Machine_C: 85, idle: 10 },
      { name: 'Mar', Machine_A: 85, Machine_B: 92, Machine_C: 88, idle: 15 }
    ]
  };

  const bottleneckData = [
    { machine: 'Machine A', shift: 'Morning', utilization: 95, status: 'critical' },
    { machine: 'Machine A', shift: 'Afternoon', utilization: 88, status: 'warning' },
    { machine: 'Machine B', shift: 'Morning', utilization: 78, status: 'normal' },
    { machine: 'Machine B', shift: 'Afternoon', utilization: 92, status: 'warning' },
    { machine: 'Machine C', shift: 'Morning', utilization: 85, status: 'normal' },
    { machine: 'Machine C', shift: 'Afternoon', utilization: 75, status: 'normal' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Utilization Analytics</h3>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="utilization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="idle">Idle Time</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Machine Utilization - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationData[timeRange]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Machine_A" fill="#3b82f6" />
                  <Bar dataKey="Machine_B" fill="#10b981" />
                  <Bar dataKey="Machine_C" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Idle Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={utilizationData[timeRange]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="idle" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Bottleneck Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {bottleneckData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.machine}</div>
                      <div className="text-sm text-muted-foreground">{item.shift} Shift</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{item.utilization}%</div>
                      <Badge variant={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
