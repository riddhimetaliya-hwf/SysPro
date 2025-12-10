import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download, Calendar, BarChart3 } from 'lucide-react';
import { Job, Machine } from '@/types/jobs';
import { toast } from 'sonner';

interface InteractiveChartsProps {
  jobs: Job[];
  machines: Machine[];
  onDrillDown?: (type: string, data: any) => void;
  className?: string;
}

export const InteractiveCharts = ({ jobs, machines, onDrillDown, className }: InteractiveChartsProps) => {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Prepare data for different chart types
  const statusData = [
    { name: 'Completed', value: jobs.filter(j => j.status === 'Completed').length, color: '#22c55e' },
    { name: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Delayed', value: jobs.filter(j => j.status === 'Delayed').length, color: '#ef4444' },
    { name: 'Pending', value: jobs.filter(j => j.status === 'Pending').length, color: '#f59e0b' }
  ];

  const machineUtilizationData = machines.map(machine => {
    const machineJobs = jobs.filter(job => job.machineId === machine.id);
    const completedJobs = machineJobs.filter(job => job.status === 'Completed').length;
    const totalJobs = machineJobs.length;
    
    return {
      name: machine.name,
      utilization: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      completed: completedJobs,
      total: totalJobs,
      efficiency: Math.round(Math.random() * 20 + 80) // Mock efficiency data
    };
  });

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    completed: Math.floor(Math.random() * 20) + 10,
    planned: Math.floor(Math.random() * 25) + 15,
    trend: Math.random() > 0.5 ? 'up' : 'down'
  }));

  const handleChartClick = (data: any, chartType: string) => {
    toast.success(`Drilling down into ${chartType} data`);
    onDrillDown?.(chartType, data);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Exporting chart data as ${format.toUpperCase()}`);
  };

  return (
    <div className={className}>
      <Tabs value={selectedChart} onValueChange={setSelectedChart}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              {(['week', 'month', 'quarter'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="text-xs"
                >
                  {range}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Job Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      onClick={(data) => handleChartClick(data, 'status')}
                      className="cursor-pointer"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Machine Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Machine Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={machineUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar 
                      dataKey="utilization" 
                      fill="#3b82f6" 
                      onClick={(data) => handleChartClick(data, 'utilization')}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Completion Trends</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% vs last {timeRange}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    onClick={(data) => handleChartClick(data, 'trend')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="#94a3b8" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {machineUtilizationData.map((machine) => (
              <Card key={machine.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{machine.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className="font-medium">{machine.utilization}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${machine.utilization}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Completed: {machine.completed}</div>
                      <div>Total: {machine.total}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {machine.efficiency > 85 ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-warning" />
                      )}
                      <span>Efficiency: {machine.efficiency}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};