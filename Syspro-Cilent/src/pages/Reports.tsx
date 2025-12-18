import React, { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { AppSidebar } from '@/components/Layout/AppSidebar';
import { ReportsDashboard } from '@/components/Reports/ReportsDashboard';
import { ReportsFilters } from '@/components/Reports/ReportsFilters';
import { ExportOptions } from '@/components/Reports/ExportOptions';
import { ScheduledReports } from '@/components/Reports/ScheduledReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data for charts
const taskStatusData = [
  { name: 'Not Started', value: 12 },
  { name: 'In Progress', value: 19 },
  { name: 'In Review', value: 8 },
  { name: 'Completed', value: 24 },
  { name: 'Blocked', value: 5 },
];

const progressOverTimeData = [
  { name: 'Week 1', completed: 4, inProgress: 8, notStarted: 15 },
  { name: 'Week 2', completed: 10, inProgress: 10, notStarted: 7 },
  { name: 'Week 3', completed: 16, inProgress: 12, notStarted: 3 },
  { name: 'Week 4', completed: 24, inProgress: 6, notStarted: 1 },
];

const taskByPriorityData = [
  { name: 'High', value: 15 },
  { name: 'Medium', value: 25 },
  { name: 'Low', value: 10 },
];

const delayData = [
  { 
    week: 'Week 1', 
    delayedTasks: 5, 
    resolved: 2,
    criticalPathDelays: 1,
    resourceBlockers: 3
  },
  { 
    week: 'Week 2', 
    delayedTasks: 8, 
    resolved: 5,
    criticalPathDelays: 2,
    resourceBlockers: 4
  },
  { 
    week: 'Week 3', 
    delayedTasks: 12, 
    resolved: 6,
    criticalPathDelays: 5,
    resourceBlockers: 3
  },
  { 
    week: 'Week 4', 
    delayedTasks: 7, 
    resolved: 6,
    criticalPathDelays: 2,
    resourceBlockers: 1
  },
];

const bottleneckData = [
  { name: 'Resource Shortage', value: 35 },
  { name: 'Dependencies', value: 25 },
  { name: 'Technical Issues', value: 20 },
  { name: 'Requirements Changes', value: 15 },
  { name: 'Other', value: 5 },
];

const criticalPathData = [
  { task: 'Task A', delay: 2, impact: 'High' },
  { task: 'Task B', delay: 3, impact: 'Critical' },
  { task: 'Task C', delay: 1, impact: 'Medium' },
  { task: 'Task D', delay: 4, impact: 'Critical' },
  { task: 'Task E', delay: 1, impact: 'Low' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <div className="p-6 h-[calc(100vh-56px)] overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and analyze project data</p>
          </div>
          
          <div className="grid gap-6">
            <ReportsFilters />
            
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="task">Task Progress</TabsTrigger>
                <TabsTrigger value="delay">Delays & Bottlenecks</TabsTrigger>
                <TabsTrigger value="resource">Resource Allocation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-4">
                <ReportsDashboard />
              </TabsContent>
              
              <TabsContent value="task" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Task Progress Report</h2>
                  <p className="text-muted-foreground mb-4">Detailed analysis of task completion rates and progress over time</p>
                </div>
                
                {/* Task Status Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Task Distribution by Status</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Progress Over Time Line Chart */}
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Progress Over Time</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="completed" name="Completed" stroke="#00C49F" strokeWidth={2} />
                          <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="#FFBB28" strokeWidth={2} />
                          <Line type="monotone" dataKey="notStarted" name="Not Started" stroke="#FF8042" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Second Row of Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasks by Priority Bar Chart */}
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Tasks by Priority</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskByPriorityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                          <Legend />
                          <Bar dataKey="value" name="Task Count">
                            {taskByPriorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Task Completion Rate */}
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Task Completion Rate</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#00C49F" />
                          <Bar dataKey="inProgress" name="In Progress" fill="#FFBB28" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="delay" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Delays & Bottlenecks Report</h2>
                  <p className="text-muted-foreground mb-4">Analysis of project delays and identification of bottlenecks</p>
                </div>

                {/* Delays Over Time */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Delays Over Time</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={delayData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="delayedTasks" name="Delayed Tasks" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="criticalPathDelays" name="Critical Path Delays" stroke="#FFA500" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resourceBlockers" name="Resource Blockers" stroke="#9C27B0" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bottlenecks Distribution */}
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Bottlenecks Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bottleneckData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {bottleneckData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Critical Path Delays */}
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Critical Path Delays</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={criticalPathData}
                          layout="vertical"
                          margin={{ left: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="task" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="delay" name="Days Delayed">
                            {criticalPathData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.impact === 'Critical' ? '#FF6B6B' : 
                                  entry.impact === 'High' ? '#FFA500' : 
                                  entry.impact === 'Medium' ? '#FFD166' : '#4CAF50'
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resource" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Resource Allocation Report</h2>
                  <p className="text-muted-foreground">Overview of resource utilization and allocation across projects</p>
                </div>
                
                {/* Resource Allocation Charts will go here */}
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <ExportOptions />
                  <ScheduledReports />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
