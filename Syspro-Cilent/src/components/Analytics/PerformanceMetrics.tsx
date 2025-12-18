
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Progress } from '@/components/UI/progress';
import { Badge } from '@/components/UI/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Target, Zap } from 'lucide-react';

// Mock data for performance metrics
const utilizationData = [
  { machine: 'Machine A', utilization: 85, target: 80, efficiency: 92 },
  { machine: 'Machine B', utilization: 72, target: 80, efficiency: 88 },
  { machine: 'Machine C', utilization: 91, target: 80, efficiency: 95 },
  { machine: 'Machine D', utilization: 67, target: 80, efficiency: 82 },
];

const throughputData = [
  { hour: '8:00', completed: 12, planned: 15 },
  { hour: '9:00', completed: 18, planned: 15 },
  { hour: '10:00', completed: 14, planned: 15 },
  { hour: '11:00', completed: 22, planned: 20 },
  { hour: '12:00', completed: 16, planned: 20 },
  { hour: '13:00', completed: 25, planned: 20 },
];

const efficiencyData = [
  { name: 'On Time', value: 78, color: '#10B981' },
  { name: 'Delayed', value: 15, color: '#F59E0B' },
  { name: 'Ahead', value: 7, color: '#3B82F6' },
];

export const PerformanceMetrics = () => {
  const overallUtilization = utilizationData.reduce((acc, curr) => acc + curr.utilization, 0) / utilizationData.length;
  const overallEfficiency = utilizationData.reduce((acc, curr) => acc + curr.efficiency, 0) / utilizationData.length;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+2.1% from last week</span>
            </div>
            <Progress value={overallUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallEfficiency.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+1.5% from yesterday</span>
            </div>
            <Progress value={overallEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span>-3 from target</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Target: 130</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cycle Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>0.2h faster</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">vs last period</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="utilization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="utilization">Machine Utilization</TabsTrigger>
          <TabsTrigger value="throughput">Hourly Throughput</TabsTrigger>
          <TabsTrigger value="efficiency">Job Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Utilization vs Target</CardTitle>
              <CardDescription>Real-time utilization compared to target performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="machine" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#3B82F6" name="Current Utilization" />
                  <Bar dataKey="target" fill="#10B981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilizationData.map((machine) => (
              <Card key={machine.machine}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{machine.machine}</CardTitle>
                    <Badge variant={machine.utilization >= machine.target ? "default" : "secondary"}>
                      {machine.utilization >= machine.target ? "On Target" : "Below Target"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span className="font-medium">{machine.utilization}%</span>
                    </div>
                    <Progress value={machine.utilization} />
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span className="font-medium">{machine.efficiency}%</span>
                    </div>
                    <Progress value={machine.efficiency} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="throughput" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Throughput</CardTitle>
              <CardDescription>Jobs completed vs planned by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="planned" stroke="#6B7280" strokeWidth={2} strokeDasharray="5 5" name="Planned" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Completion Status</CardTitle>
                <CardDescription>Distribution of job completion timing</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={efficiencyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key performance indicators and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Strong Performance Areas</span>
                  </div>
                  <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                    <li>• Machine C exceeding efficiency targets</li>
                    <li>• Morning shift productivity up 15%</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm font-medium">Improvement Opportunities</span>
                  </div>
                  <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                    <li>• Machine D requires maintenance attention</li>
                    <li>• Material delays affecting 12% of jobs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
